// ── ClarkPlayer Desktop — Rust Backend ──────────────────────────────────────
// Native filesystem access, real-time folder monitoring, audio metadata
// extraction, SQLite library database, and album artwork caching.

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use chrono::Utc;
use lofty::prelude::*;
use lofty::probe::Probe;
use lofty::tag::Accessor;
use notify::{Event, EventKind, RecursiveMode, Watcher};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, State};
use uuid::Uuid;
use walkdir::WalkDir;

// ── Data Models ──────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MusicFolder {
    pub id: String,
    pub path: String,
    pub label: String,
    pub added_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackMetadata {
    pub path: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub album_artist: String,
    pub genre: String,
    pub year: i32,
    pub track_number: u32,
    pub disc_number: u32,
    pub duration_seconds: f64,
    pub file_size: u64,
    pub file_format: String,
    pub has_embedded_art: bool,
    pub sample_rate: Option<u32>,
    pub bitrate: Option<u32>,
    pub channels: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LibraryTrack {
    pub id: String,
    pub path: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub album_artist: String,
    pub genre: String,
    pub year: i32,
    pub track_number: u32,
    pub disc_number: u32,
    pub duration_seconds: f64,
    pub file_size: u64,
    pub file_format: String,
    pub has_embedded_art: bool,
    pub sample_rate: Option<u32>,
    pub bitrate: Option<u32>,
    pub channels: Option<u8>,
    pub play_count: u32,
    pub is_favorite: bool,
    pub added_at: String,
    pub last_played_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanProgress {
    pub current: usize,
    pub total: usize,
    pub current_file: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlbumArtData {
    pub mime_type: String,
    pub data_base64: String,
}

// ── Application State ────────────────────────────────────────────────────────

pub struct AppState {
    pub db: Mutex<Connection>,
    pub music_folders: Mutex<Vec<MusicFolder>>,
    pub watcher: Mutex<Option<notify::RecommendedWatcher>>,
}

// ── Database Initialization ──────────────────────────────────────────────────

fn init_database(conn: &Connection) {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS music_folders (
            id          TEXT PRIMARY KEY,
            path        TEXT NOT NULL UNIQUE,
            label       TEXT NOT NULL,
            added_at    TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tracks (
            id              TEXT PRIMARY KEY,
            path            TEXT NOT NULL UNIQUE,
            title           TEXT NOT NULL DEFAULT 'Unknown Title',
            artist          TEXT NOT NULL DEFAULT 'Unknown Artist',
            album           TEXT NOT NULL DEFAULT 'Unknown Album',
            album_artist    TEXT NOT NULL DEFAULT '',
            genre           TEXT NOT NULL DEFAULT '',
            year            INTEGER NOT NULL DEFAULT 0,
            track_number    INTEGER NOT NULL DEFAULT 0,
            disc_number     INTEGER NOT NULL DEFAULT 1,
            duration_seconds REAL NOT NULL DEFAULT 0.0,
            file_size       INTEGER NOT NULL DEFAULT 0,
            file_format     TEXT NOT NULL DEFAULT '',
            has_embedded_art INTEGER NOT NULL DEFAULT 0,
            sample_rate     INTEGER,
            bitrate         INTEGER,
            channels        INTEGER,
            play_count      INTEGER NOT NULL DEFAULT 0,
            is_favorite     INTEGER NOT NULL DEFAULT 0,
            added_at        TEXT NOT NULL,
            last_played_at  TEXT
        );

        CREATE TABLE IF NOT EXISTS album_art_cache (
            track_id    TEXT PRIMARY KEY,
            mime_type   TEXT NOT NULL,
            data        BLOB NOT NULL,
            FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_tracks_path ON tracks(path);
        CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
        CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album);
        CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
        CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);
        ",
    )
    .expect("Failed to initialize database schema");
}

// ── Tauri Commands ───────────────────────────────────────────────────────────

#[tauri::command]
fn init_app_db(state: State<AppState>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    init_database(&conn);
    Ok("Database initialized".to_string())
}

#[tauri::command]
fn add_music_folder(state: State<AppState>, path: String, label: String) -> Result<MusicFolder, String> {
    let folder = MusicFolder {
        id: Uuid::new_v4().to_string(),
        path: path.clone(),
        label: label.clone(),
        added_at: Utc::now().to_rfc3339(),
    };

    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO music_folders (id, path, label, added_at) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![folder.id, folder.path, folder.label, folder.added_at],
    )
    .map_err(|e| e.to_string())?;

    let mut folders = state.music_folders.lock().map_err(|e| e.to_string())?;
    folders.push(folder.clone());

    Ok(folder)
}

#[tauri::command]
fn remove_music_folder(state: State<AppState>, folder_id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM music_folders WHERE id = ?1", rusqlite::params![folder_id])
        .map_err(|e| e.to_string())?;
    // Also remove orphaned tracks
    conn.execute(
        "DELETE FROM tracks WHERE id NOT IN (SELECT DISTINCT t.id FROM tracks t CROSS JOIN music_folders mf WHERE t.path LIKE mf.path || '%')",
        [],
    )
    .map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM album_art_cache WHERE track_id NOT IN (SELECT id FROM tracks)",
        [],
    )
    .map_err(|e| e.to_string())?;

    let mut folders = state.music_folders.lock().map_err(|e| e.to_string())?;
    folders.retain(|f| f.id != folder_id);
    Ok(())
}

#[tauri::command]
fn get_music_folders(state: State<AppState>) -> Result<Vec<MusicFolder>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, path, label, added_at FROM music_folders ORDER BY added_at")
        .map_err(|e| e.to_string())?;
    let folders: Vec<MusicFolder> = stmt
        .query_map([], |row| {
            Ok(MusicFolder {
                id: row.get(0)?,
                path: row.get(1)?,
                label: row.get(2)?,
                added_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    let mut state_folders = state.music_folders.lock().map_err(|e| e.to_string())?;
    *state_folders = folders.clone();
    Ok(folders)
}

#[tauri::command]
fn get_library_tracks(
    state: State<AppState>,
    search: Option<String>,
    artist: Option<String>,
    album: Option<String>,
    genre: Option<String>,
    sort_by: Option<String>,
    sort_dir: Option<String>,
    limit: Option<usize>,
    offset: Option<usize>,
) -> Result<Vec<LibraryTrack>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut sql = String::from(
        "SELECT id, path, title, artist, album, album_artist, genre, year, \
         track_number, disc_number, duration_seconds, file_size, file_format, \
         has_embedded_art, sample_rate, bitrate, channels, play_count, \
         is_favorite, added_at, last_played_at FROM tracks WHERE 1=1",
    );
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(ref s) = search {
        if !s.is_empty() {
            sql.push_str(" AND (title LIKE ?1 OR artist LIKE ?1 OR album LIKE ?1)");
            params.push(Box::new(format!("%{}%", s)));
        }
    }
    if let Some(ref a) = artist {
        if !a.is_empty() {
            let idx = params.len() + 1;
            sql.push_str(&format!(" AND artist LIKE ?{}", idx));
            params.push(Box::new(format!("%{}%", a)));
        }
    }
    if let Some(ref a) = album {
        if !a.is_empty() {
            let idx = params.len() + 1;
            sql.push_str(&format!(" AND album LIKE ?{}", idx));
            params.push(Box::new(format!("%{}%", a)));
        }
    }
    if let Some(ref g) = genre {
        if !g.is_empty() {
            let idx = params.len() + 1;
            sql.push_str(&format!(" AND genre LIKE ?{}", idx));
            params.push(Box::new(format!("%{}%", g)));
        }
    }

    let sort_col = sort_by.as_deref().unwrap_or("added_at");
    let valid_cols = [
        "title", "artist", "album", "genre", "year", "duration_seconds",
        "file_size", "play_count", "added_at", "last_played_at",
    ];
    let col = if valid_cols.contains(&sort_col) { sort_col } else { "added_at" };
    let dir = if sort_dir.as_deref() == Some("asc") { "ASC" } else { "DESC" };
    sql.push_str(&format!(" ORDER BY {} {}", col, dir));

    let limit_val = limit.unwrap_or(500);
    let offset_val = offset.unwrap_or(0);
    sql.push_str(&format!(" LIMIT {} OFFSET {}", limit_val, offset_val));

    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let tracks = stmt
        .query_map(param_refs.as_slice(), |row| {
            Ok(LibraryTrack {
                id: row.get(0)?,
                path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                genre: row.get(6)?,
                year: row.get(7)?,
                track_number: row.get(8)?,
                disc_number: row.get(9)?,
                duration_seconds: row.get(10)?,
                file_size: row.get(11)?,
                file_format: row.get(12)?,
                has_embedded_art: row.get::<_, i32>(13)? != 0,
                sample_rate: row.get(14)?,
                bitrate: row.get(15)?,
                channels: row.get(16)?,
                play_count: row.get(17)?,
                is_favorite: row.get::<_, i32>(18)? != 0,
                added_at: row.get(19)?,
                last_played_at: row.get(20)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tracks)
}

#[tauri::command]
fn scan_folders(
    app: tauri::AppHandle,
    state: State<AppState>,
) -> Result<Vec<LibraryTrack>, String> {
    let folders = {
        let guard = state.music_folders.lock().map_err(|e| e.to_string())?;
        guard.clone()
    };

    if folders.is_empty() {
        return Err("No music folders configured. Add a folder first.".to_string());
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Collect all audio files from configured folders
    let mut audio_files: Vec<PathBuf> = Vec::new();
    let extensions: HashMap<&str, &str> = [
        ("mp3", "MP3"), ("flac", "FLAC"), ("wav", "WAV"), ("m4a", "M4A"),
        ("ogg", "OGG"), ("opus", "OPUS"), ("aac", "AAC"), ("wma", "WMA"),
        ("aiff", "AIFF"), ("aif", "AIFF"),
    ]
    .into_iter()
    .collect();

    for folder in &folders {
        let path = Path::new(&folder.path);
        if !path.exists() {
            log::warn!("Folder not found: {}", folder.path);
            continue;
        }
        for entry in WalkDir::new(path).follow_links(true).into_iter().filter_map(|e| e.ok()) {
            if entry.file_type().is_file() {
                if let Some(ext) = entry.path().extension().and_then(|e| e.to_str()) {
                    if extensions.contains_key(&ext.to_lowercase() as &str) {
                        audio_files.push(entry.path().to_path_buf());
                    }
                }
            }
        }
    }

    let total = audio_files.len();
    log::info!("Scanning {} audio files across {} folders", total, folders.len());

    let mut new_tracks: Vec<LibraryTrack> = Vec::new();
    let now = Utc::now().to_rfc3339();

    for (i, file_path) in audio_files.iter().enumerate() {
        let _ = app.emit("scan-progress", ScanProgress {
            current: i + 1,
            total,
            current_file: file_path.display().to_string(),
        });

        let path_str = file_path.display().to_string();

        // Skip if already indexed and unchanged
        let existing: Option<String> = conn
            .query_row(
                "SELECT id FROM tracks WHERE path = ?1",
                rusqlite::params![path_str],
                |row| row.get(0),
            )
            .ok();
        if existing.is_some() {
            continue;
        }

        let meta = extract_metadata(file_path, &extensions);
        let track_id = Uuid::new_v4().to_string();

        let format_str = file_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_uppercase();

        conn.execute(
            "INSERT INTO tracks (id, path, title, artist, album, album_artist, genre, year, \
             track_number, disc_number, duration_seconds, file_size, file_format, \
             has_embedded_art, sample_rate, bitrate, channels, play_count, is_favorite, \
             added_at, last_played_at) \
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, 0, 0, ?18, NULL)",
            rusqlite::params![
                track_id, path_str, meta.title, meta.artist, meta.album, meta.album_artist,
                meta.genre, meta.year, meta.track_number, meta.disc_number,
                meta.duration_seconds, meta.file_size, format_str,
                meta.has_embedded_art as i32, meta.sample_rate, meta.bitrate, meta.channels,
                now,
            ],
        )
        .map_err(|e| format!("Failed to insert track {}: {}", path_str, e))?;

        let track = LibraryTrack {
            id: track_id,
            path: path_str,
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            album_artist: meta.album_artist,
            genre: meta.genre,
            year: meta.year,
            track_number: meta.track_number,
            disc_number: meta.disc_number,
            duration_seconds: meta.duration_seconds,
            file_size: meta.file_size,
            file_format: format_str,
            has_embedded_art: meta.has_embedded_art,
            sample_rate: meta.sample_rate,
            bitrate: meta.bitrate,
            channels: meta.channels,
            play_count: 0,
            is_favorite: false,
            added_at: now.clone(),
            last_played_at: None,
        };
        new_tracks.push(track);
    }

    let _ = app.emit("scan-complete", serde_json::json!({ "new_tracks": new_tracks.len() }));

    Ok(new_tracks)
}

// ── Metadata Extraction ──────────────────────────────────────────────────────

fn extract_metadata(file_path: &Path, extensions: &HashMap<&str, &str>) -> TrackMetadata {
    let file_size = fs::metadata(file_path).map(|m| m.len()).unwrap_or(0);
    let format_str = file_path
        .extension()
        .and_then(|e| e.to_str())
        .and_then(|e| extensions.get(&e.to_lowercase() as &str))
        .unwrap_or(&"Unknown")
        .to_string();

    let tagged_file = match Probe::open(file_path) {
        Ok(f) => match f.read() {
            Ok(tf) => Some(tf),
            Err(_) => None,
        },
        Err(_) => None,
    };

    let default_title = file_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Unknown Title")
        .to_string();

    let mut title = default_title.clone();
    let mut artist = String::from("Unknown Artist");
    let mut album = String::from("Unknown Album");
    let mut album_artist = String::new();
    let mut genre = String::new();
    let mut year: i32 = 0;
    let mut track_number: u32 = 0;
    let mut disc_number: u32 = 1;
    let mut duration_seconds: f64 = 0.0;
    let mut has_embedded_art = false;
    let mut sample_rate: Option<u32> = None;
    let bitrate: Option<u32> = None;
    let mut channels: Option<u8> = None;

    if let Some(ref tf) = tagged_file {
        let props = tf.properties();
        duration_seconds = props.duration().as_secs_f64();
        sample_rate = props.sample_rate();
        channels = props.channels().map(|c| c as u8);

        // Extract tags
        if let Some(tag) = tf.primary_tag() {
            title = tag.title().map(|t| t.to_string()).unwrap_or(default_title);
            artist = tag.artist().map(|a| a.to_string()).unwrap_or_else(|| "Unknown Artist".into());
            album = tag.album().map(|a| a.to_string()).unwrap_or_else(|| "Unknown Album".into());
            album_artist = tag.get_string(&lofty::tag::ItemKey::AlbumArtist).map(|s| s.to_string()).unwrap_or_default();
            genre = tag.genre().map(|g| g.to_string()).unwrap_or_default();
            year = tag.year().unwrap_or(0) as i32;
            track_number = tag.track().unwrap_or(0);
            disc_number = tag.disk().unwrap_or(1);

            // Check for embedded artwork
            has_embedded_art = tag.picture_count() > 0;
        } else if let Some(tag) = tf.first_tag() {
            title = tag.title().map(|t| t.to_string()).unwrap_or(default_title);
            artist = tag.artist().map(|a| a.to_string()).unwrap_or_else(|| "Unknown Artist".into());
            album = tag.album().map(|a| a.to_string()).unwrap_or_else(|| "Unknown Album".into());
        }
    }

    TrackMetadata {
        path: file_path.display().to_string(),
        title,
        artist,
        album,
        album_artist,
        genre,
        year,
        track_number,
        disc_number,
        duration_seconds,
        file_size,
        file_format: format_str,
        has_embedded_art,
        sample_rate,
        bitrate,
        channels,
    }
}

// ── Album Artwork ────────────────────────────────────────────────────────────

#[tauri::command]
fn get_album_art(state: State<AppState>, track_id: String) -> Result<Option<AlbumArtData>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Check cache first
    let cached = conn
        .query_row(
            "SELECT mime_type, data FROM album_art_cache WHERE track_id = ?1",
            rusqlite::params![track_id],
            |row| {
                Ok(AlbumArtData {
                    mime_type: row.get(0)?,
                    data_base64: base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &row.get::<_, Vec<u8>>(1)?),
                })
            },
        );
    if let Ok(art) = cached {
        return Ok(Some(art));
    }

    // Extract from file
    let path: String = conn
        .query_row(
            "SELECT path FROM tracks WHERE id = ?1",
            rusqlite::params![track_id],
            |row| row.get(0),
        )
        .map_err(|_| "Track not found".to_string())?;

    let tagged_file = Probe::open(Path::new(&path))
        .map_err(|e| format!("Failed to open file: {}", e))?
        .read()
        .map_err(|e| format!("Failed to read tags: {}", e))?;

    if let Some(tag) = tagged_file.primary_tag().or_else(|| tagged_file.first_tag()) {
        if let Some(picture) = tag.pictures().first() {
            let mime_type = picture.mime_type().map(|m| m.to_string()).unwrap_or_else(|| "image/jpeg".to_string());
            let data = picture.data().to_vec();
            let b64 = base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &data);

            // Cache the artwork
            let _ = conn.execute(
                "INSERT OR REPLACE INTO album_art_cache (track_id, mime_type, data) VALUES (?1, ?2, ?3)",
                rusqlite::params![track_id, mime_type, data],
            );

            return Ok(Some(AlbumArtData {
                mime_type,
                data_base64: b64,
            }));
        }
    }

    Ok(None)
}

// ── Playback History ─────────────────────────────────────────────────────────

#[tauri::command]
fn record_play(state: State<AppState>, track_id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE tracks SET play_count = play_count + 1, last_played_at = ?1 WHERE id = ?2",
        rusqlite::params![now, track_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn toggle_favorite(state: State<AppState>, track_id: String) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let current: i32 = conn
        .query_row(
            "SELECT is_favorite FROM tracks WHERE id = ?1",
            rusqlite::params![track_id],
            |row| row.get(0),
        )
        .map_err(|_| "Track not found".to_string())?;
    let new_val = if current == 0 { 1 } else { 0 };
    conn.execute(
        "UPDATE tracks SET is_favorite = ?1 WHERE id = ?2",
        rusqlite::params![new_val, track_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(new_val != 0)
}

#[tauri::command]
fn get_recently_played(state: State<AppState>, limit: Option<usize>) -> Result<Vec<LibraryTrack>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let limit_val = limit.unwrap_or(20);
    let mut stmt = conn
        .prepare(
            "SELECT id, path, title, artist, album, album_artist, genre, year, \
             track_number, disc_number, duration_seconds, file_size, file_format, \
             has_embedded_art, sample_rate, bitrate, channels, play_count, \
             is_favorite, added_at, last_played_at \
             FROM tracks WHERE last_played_at IS NOT NULL \
             ORDER BY last_played_at DESC LIMIT ?1",
        )
        .map_err(|e| e.to_string())?;

    let tracks = stmt
        .query_map([limit_val as i64], |row| {
            Ok(LibraryTrack {
                id: row.get(0)?,
                path: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                album_artist: row.get(5)?,
                genre: row.get(6)?,
                year: row.get(7)?,
                track_number: row.get(8)?,
                disc_number: row.get(9)?,
                duration_seconds: row.get(10)?,
                file_size: row.get(11)?,
                file_format: row.get(12)?,
                has_embedded_art: row.get::<_, i32>(13)? != 0,
                sample_rate: row.get(14)?,
                bitrate: row.get(15)?,
                channels: row.get(16)?,
                play_count: row.get(17)?,
                is_favorite: row.get::<_, i32>(18)? != 0,
                added_at: row.get(19)?,
                last_played_at: row.get(20)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tracks)
}

// ── Read Audio File for Playback ─────────────────────────────────────────────

#[tauri::command]
fn read_audio_file(state: State<AppState>, track_id: String) -> Result<Vec<u8>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let path: String = conn
        .query_row(
            "SELECT path FROM tracks WHERE id = ?1",
            rusqlite::params![track_id],
            |row| row.get(0),
        )
        .map_err(|_| "Track not found".to_string())?;

    fs::read(&path).map_err(|e| format!("Failed to read audio file: {}", e))
}

// ── Folder Monitoring (Real-time) ────────────────────────────────────────────

#[tauri::command]
fn start_folder_watching(app: tauri::AppHandle, state: State<AppState>) -> Result<(), String> {
    let folders = {
        let guard = state.music_folders.lock().map_err(|e| e.to_string())?;
        guard.clone()
    };

    if folders.is_empty() {
        return Err("No music folders configured".to_string());
    }

    let app_handle = app.clone();
    let extensions: Vec<String> = ["mp3", "flac", "wav", "m4a", "ogg", "opus", "aac", "wma", "aiff", "aif"]
        .iter()
        .map(|s| s.to_string())
        .collect();

    let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        if let Ok(event) = res {
            let is_audio = event.paths.iter().any(|p| {
                p.extension()
                    .and_then(|e| e.to_str())
                    .map(|ext| extensions.contains(&ext.to_lowercase()))
                    .unwrap_or(false)
            });

            if !is_audio {
                return;
            }

            match event.kind {
                EventKind::Create(_) | EventKind::Modify(_) => {
                    let _ = app_handle.emit("filesystem-change", serde_json::json!({
                        "kind": "created_or_modified",
                        "paths": event.paths.iter().map(|p| p.display().to_string()).collect::<Vec<_>>(),
                    }));
                }
                EventKind::Remove(_) => {
                    let _ = app_handle.emit("filesystem-change", serde_json::json!({
                        "kind": "removed",
                        "paths": event.paths.iter().map(|p| p.display().to_string()).collect::<Vec<_>>(),
                    }));
                }
                _ => {}
            }
        }
    })
    .map_err(|e| e.to_string())?;

    for folder in &folders {
        let path = Path::new(&folder.path);
        if path.exists() {
            watcher
                .watch(path, RecursiveMode::Recursive)
                .map_err(|e| format!("Failed to watch {}: {}", folder.path, e))?;
        }
    }

    let mut watcher_state = state.watcher.lock().map_err(|e| e.to_string())?;
    *watcher_state = Some(watcher);

    log::info!("Started watching {} music folders", folders.len());
    Ok(())
}

#[tauri::command]
fn stop_folder_watching(state: State<AppState>) -> Result<(), String> {
    let mut watcher_state = state.watcher.lock().map_err(|e| e.to_string())?;
    *watcher_state = None;
    log::info!("Stopped folder watching");
    Ok(())
}

// ── App Entry Point ──────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize database before app starts
    let db_path = dirs_next().unwrap_or_else(|| PathBuf::from("."));
    let conn = Connection::open(db_path.join("clarkplayer.db")).expect("Failed to open database");
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;")
        .expect("Failed to set SQLite pragmas");

    init_database(&conn);

    // Load existing folders from DB
    let folders: Vec<MusicFolder> = {
        let mut stmt = conn
            .prepare("SELECT id, path, label, added_at FROM music_folders ORDER BY added_at")
            .unwrap();
        stmt.query_map([], |row| {
            Ok(MusicFolder {
                id: row.get(0)?,
                path: row.get(1)?,
                label: row.get(2)?,
                added_at: row.get(3)?,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect()
    };

    let app_state = AppState {
        db: Mutex::new(conn),
        music_folders: Mutex::new(folders),
        watcher: Mutex::new(None),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Auto-start folder watching
            let state = app.state::<AppState>();
            let folders = state.music_folders.lock().unwrap();
            if !folders.is_empty() {
                log::info!("{} music folders configured — start watching to enable real-time updates", folders.len());
            }

            Ok(())
        })
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            init_app_db,
            add_music_folder,
            remove_music_folder,
            get_music_folders,
            get_library_tracks,
            scan_folders,
            get_album_art,
            record_play,
            toggle_favorite,
            get_recently_played,
            read_audio_file,
            start_folder_watching,
            stop_folder_watching,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ClarkPlayer desktop application");
}

fn dirs_next() -> Option<PathBuf> {
    std::env::current_dir().ok()
}
