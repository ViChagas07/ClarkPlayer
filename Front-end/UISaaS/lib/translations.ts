/**
 * ClarkPlayer i18n translation dictionary.
 *
 * Add new languages by extending the `Translations` record.
 * Every key should exist in ALL languages — if a translation is
 * missing the English fallback is used.
 */

export type LanguageCode = keyof typeof translations

export interface TranslationMap {
  // ── Settings tab labels ──
  settings: string
  appearance: string
  language: string
  libraryFiles: string
  playback: string
  about: string

  // ── Appearance ──
  theme: string
  dark: string
  light: string
  midnight: string
  accentColor: string
  fontSize: string
  small: string
  default: string
  large: string
  boldMode: string
  boldModeDesc: string

  // ── Language / Region ──
  dateTimeFormat: string
  dateFormat: string
  timeFormat: string
  translationContributors: string
  translationThanks: string
  languageLabel: string

  // ── Library / Files ──
  folderScanning: string
  scanNow: string
  hiddenFiles: string
  showHiddenFiles: string
  hiddenFilesDesc: string
  supportedFormats: string
  unsupportedFormat: string
  letUsKnow: string
  storageUsage: string

  // ── Playback / Equalizer ──
  equalizer: string
  preset: string
  playbackOptions: string
  crossfade: string
  crossfadeDesc: string
  gapless: string
  gaplessDesc: string
  normalization: string
  normalizationDesc: string
  sleepTimer: string
  off: string
  min: string
  hour: string
  endOfTrack: string
  cancelTimer: string

  // ── About ──
  version: string
  whatsNew: string
  privacyPolicy: string
  termsOfService: string
  ossLicenses: string
  madeWith: string

  // ── Navigation (sidebar) ──
  browseGenres: string
  yourPlaylists: string
  newPlaylist: string
  sort: string
  tracks: string
  updated: string
  noTracksInQueue: string
  browseTracks: string
  nowPlaying: string
  queue: string
  createPlaylist: string
  publicLabel: string
  privateLabel: string
  nameLabel: string
  descriptionOptional: string
  descriptionPlaceholder: string
  loginAccount: string
  signOut: string
  signIn: string
  home: string
  allTracks: string
  library: string
  playlists: string
  artists: string
  genres: string
  search: string
  settingsNav: string

  // ── AppShell / player bar ARIA ──
  mainNavigation: string
  openSidebar: string
  closeSidebar: string
  closePanel: string
  hidePlayer: string
  showPlayer: string
  toggleFavorite: string
  toggleShuffle: string
  previousTrack: string
  nextTrack: string
  playBtn: string
  pauseBtn: string
  toggleRepeat: string
  volumeLabel: string
  lyricsBtn: string
  sleepBtn: string
  openNowPlayingPanel: string
  closeNowPlayingPanel: string
  closeNavigation: string

  // ── Home / NowPlayingContent ──
  welcomeToClarkPlayer: string
  fortressOfSound: string
  recentlyPlayed: string

  // ── All Tracks (audios) ──
  titleColumn: string
  albumColumn: string
  durationColumn: string
  formatColumn: string
  selectAction: string
  songsLabel: string
  addToPlaylist: string
  deleteAction: string
  cancelAction: string
  dateAdded: string
  artistColumn: string
  sortAction: string
  selectedLabel: string
  trackIndex: string

  // ── Library ──
  totalTracks: string
  favorites: string
  totalDuration: string
  libraryOverview: string
  libraryOverviewBrowse: string
  libraryOverviewOr: string
  signInToViewLibrary: string
  signInToViewLibraryDesc: string
  loadingLibrary: string
  noTracksYet: string
  startUploading: string

  // ── Playlists list ──
  sortLabel: string
  sortAZ: string
  sortRecentlyUpdated: string
  sortMostPlayed: string
  sortDateCreated: string

  // ── Playlist detail ──
  playAction: string
  shuffleAction: string
  shareAction: string
  exportJSON: string
  exportM3U8: string
  collaborativeLabel: string
  addTracks: string
  searchInPlaylist: string
  moreOptions: string

  // ── Artists list ──
  albumSingular: string
  albumPlural: string

  // ── Artist detail ──
  verifiedArtist: string
  followAction: string
  topTracks: string
  discography: string
  filterAll: string
  filterAlbums: string
  filterEPs: string
  filterSingles: string
  similarArtists: string
  showFullLyrics: string
  aboutLabel: string
  keyLabel: string
  valenceLabel: string
  acousticnessLabel: string
  instrumentalnessLabel: string
  livenessLabel: string
  speechinessLabel: string

  // ── Genres ──
  browseByGenre: string

  // ── Search ──
  searchPlaceholder: string
  tracksTab: string
  artistsTab: string
  playlistsTab: string
  startTyping: string
  noTracksFound: string
  noArtistsFound: string
  noPlaylistsFound: string
  searchAcrossWeb: string
  searchAcrossWebDesc: string
  searchGlobalPlaceholder: string
  searchingLabel: string
  searchErrorLabel: string
  popularityLabel: string
  playcountLabel: string
  bpmLabel: string
  energyLabel: string
  danceabilityLabel: string
  previewLabel: string
  noPreviewLabel: string
  playPreview: string
  previewAvailable: string
  discoverNewMusic: string
  popularArtists: string
  newReleases: string
  lyricsLabel: string
  similarTracksLabel: string
  audioFeaturesLabel: string

  // ── Empty / Fallback states ──
  noTrackPlaying: string
  noTracksInPlaylist: string
  noTracksInPlaylistDesc: string
  noPreviewTracksFor: string
  goToSearch: string
  searchUnavailable: string
  noTracksOrAlbums: string
  noTracksFoundForAlbum: string
  albumCover: string
  trackProgress: string
  previewTracks: string
  tracksWithPreview: string
  allRightsReserved: string
  contactLink: string
  agreeTermsPart1: string
  agreeTermsPart2: string
  andLowercase: string

  // ── Privacy Policy Page ──
  legalLabel: string
  privacyTitle: string
  policyAccent: string
  privacySubtitle: string
  ppNavIntro: string
  ppNavData: string
  ppNavUsage: string
  ppNavCookies: string
  ppNavSecurity: string
  ppNavLgpdRights: string
  ppNavTerms: string
  ppS1Title: string
  ppS1Body: string
  ppS2Title: string
  ppS2AccountTitle: string
  ppS2AccountBody: string
  ppS2UsageTitle: string
  ppS2UsageBody: string
  ppS2TechnicalTitle: string
  ppS2TechnicalBody: string
  ppS3Title: string
  ppS3Body: string
  ppS4Title: string
  ppS4NeverSell: string
  ppS4Body: string
  ppS5Title: string
  ppS5Body: string
  ppS5ClearData: string
  ppS6Title: string
  ppS6Body: string
  ppS6Items: string
  ppS7Title: string
  ppS7Intro: string
  ppS7Items: string
  ppS8Title: string
  ppS8Body: string
  ppS8Steps: string
  ppS8DeletePath: string
  ppS9Title: string
  ppS9Body: string
  ppS10Title: string
  ppS10Body: string
  ppS10PermittedUse: string
  ppS10PermittedUseBody: string
  ppS10UserResp: string
  ppS10UserRespBody: string
  ppS10Prohibited: string
  ppS10ProhibitedItems: string
  ppS10IP: string
  ppS10IPBody: string
  ppS10Liability: string
  ppS10LiabilityBody: string
  ppS10Changes: string
  ppS10ChangesBody: string
  ppS11Title: string
  ppS11Body: string
  ppContactEmail: string
  ppLastUpdated: string

  // ── Section titles ──
  trendingNow: string
  topArtists: string
  brazilian: string
  discover: string

  // ── Error messages ──
  couldNotLoadDiscovery: string
  tryRefreshing: string
  couldNotLoadGenres: string
  couldNotLoadAlbum: string
  couldNotLoadArtist: string
  unexpectedErrorGenres: string
  unexpectedErrorAlbum: string
  unexpectedErrorArtist: string
  backendUnreachable: string
  retry: string
  backToArtists: string
  backToGenres: string
  artistNotInCatalog: string

  // ── Account ──
  myAccount: string
  profileInformation: string
  displayName: string
  emailLabel: string
  bioLabel: string
  saveChanges: string
  linkedAccounts: string
  connectedLabel: string
  disconnectAction: string
  dangerZone: string
  dangerZoneDesc: string
  deleteAccount: string
  deleteConfirmTitle: string
  deleteConfirmDesc: string
  typeDeleteConfirm: string
  deleting: string
  free: string
  googleAccountLinked: string
  editPhoto: string

  // ── Auth / Login ──
  welcomeBack: string
  signInToContinue: string
  continueWithGoogle: string
  orDivider: string
  passwordLabel: string
  forgotPassword: string
  signingIn: string
  lockedLabel: string
  noAccount: string
  signUp: string
  accountCreatedBanner: string
  accountLocked: string
  tooManyAttempts: string
  attemptsRemaining: string
  wrongCredentials: string
  accessDeniedGoogle: string
  authFailedGoogle: string
  authFailed: string
  closeLoginPage: string

  // ── Branding / Tagline ──
  clarkTagline: string

  // ── Register ──
  createYourAccount: string
  joinClarkPlayer: string
  fullName: string
  confirmPassword: string
  agreeTerms: string
  createAccount: string
  creatingAccount: string
  alreadyHaveAccount: string
  weak: string
  fair: string
  strong: string
  accountCreated: string
  redirectingSignIn: string

  // ── Forgot Password ──
  forgotPasswordTitle: string
  forgotPasswordDesc: string
  checkInbox: string
  resetLinkSent: string
  clickLinkToReset: string
  backToLogin: string
  sendResetLink: string
  sending: string

  // ── Reset Password ──
  resetPassword: string
  newPassword: string
  resetPasswordBtn: string
  passwordResetComplete: string
  passwordUpdated: string
  invalidResetLink: string
  invalidResetLinkDesc: string
  enterNewPassword: string
  goToSignIn: string

  // ── Verify Email ──
  verifying: string
  emailVerified: string
  verificationFailed: string
  verificationTokenMissing: string
  emailVerifiedMessage: string
  verificationFailedMessage: string

  // ── Google Callback ──
  signingInGoogle: string

  // ── CreatePlaylistModal ──
  dropImageUpload: string
  pngJpgLimit: string
  playlistNamePlaceholder: string
  playlistCoverPreview: string
  togglePrivacy: string
  changeCoverImage: string
  removeCoverImage: string
  chooseFromDrive: string
  loadingDrive: string

  // ── TrackRow ──
  addToFavorites: string
  unfavorite: string
  selectTrack: string
  currentlyPlaying: string
}

const translations = {
  'en-US': {
    // ── Settings tab labels ──
    settings: 'Settings',
    appearance: 'Appearance',
    language: 'Language',
    libraryFiles: 'Library & Files',
    playback: 'Playback',
    about: 'About',
    // ── Appearance ──
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    midnight: 'Midnight',
    accentColor: 'Accent Color',
    fontSize: 'Font Size',
    small: 'Small',
    default: 'Default',
    large: 'Large',
    boldMode: 'Bold Mode',
    boldModeDesc: 'Enable bold text across the entire interface.',
    // ── Language / Region ──
    dateTimeFormat: 'Date & Time Format',
    dateFormat: 'Date format',
    timeFormat: 'Time format',
    translationContributors: 'Translation Contributors',
    translationThanks: 'Thanks to our community translators: Maria S., João P., Yuki T., Ahmed K., and others.',
    languageLabel: 'Language',
    // ── Library / Files ──
    folderScanning: 'Folder Scanning',
    scanNow: 'Scan all folders now',
    hiddenFiles: 'Hidden Files',
    showHiddenFiles: 'Show hidden files',
    hiddenFilesDesc: 'Hidden files typically start with a dot (e.g. .DS_Store). Enable only if needed.',
    supportedFormats: 'Supported Formats',
    unsupportedFormat: 'Unsupported format?',
    letUsKnow: 'Let us know',
    storageUsage: 'Storage Usage',
    // ── Playback / Equalizer ──
    equalizer: 'Equalizer',
    preset: 'Preset',
    playbackOptions: 'Playback Options',
    crossfade: 'Crossfade',
    crossfadeDesc: 'Smooth transition between tracks',
    gapless: 'Gapless playback',
    gaplessDesc: 'No silence between consecutive tracks',
    normalization: 'Normalization',
    normalizationDesc: 'Adjust volume to a consistent level',
    sleepTimer: 'Sleep Timer',
    off: 'Off',
    min: 'min',
    hour: 'hour',
    endOfTrack: 'End of track',
    cancelTimer: 'Cancel timer',
    // ── About ──
    version: 'Version',
    whatsNew: "What's New",
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    ossLicenses: 'Open Source Licenses',
    madeWith: 'Made with ♥ by the ClarkPlayer team',
    // ── Navigation ──
    browseGenres: 'Browse by Genre',
    yourPlaylists: 'Your Playlists',
    newPlaylist: 'New Playlist',
    sort: 'Sort',
    tracks: 'tracks',
    updated: 'Updated',
    noTracksInQueue: 'No tracks in queue',
    browseTracks: 'Browse tracks to start listening',
    nowPlaying: 'Now Playing',
    queue: 'Queue',
    createPlaylist: 'Create Playlist',
    publicLabel: 'Public',
    privateLabel: 'Private',
    nameLabel: 'Name',
    descriptionOptional: 'Description (optional)',
    descriptionPlaceholder: "What's this playlist about?",
    loginAccount: 'Login Account',
    signOut: 'Sign out',
    signIn: 'Sign in',
    home: 'Home',
    allTracks: 'All Tracks',
    library: 'Library',
    playlists: 'Playlists',
    artists: 'Artists',
    genres: 'Genres',
    search: 'Search',
    settingsNav: 'Settings',
    // ── AppShell / player bar ──
    mainNavigation: 'Main navigation',
    openSidebar: 'Open sidebar',
    closeSidebar: 'Close sidebar',
    closePanel: 'Close panel',
    hidePlayer: 'Hide player',
    showPlayer: 'Show player',
    toggleFavorite: 'Toggle favorite',
    toggleShuffle: 'Toggle shuffle',
    previousTrack: 'Previous track',
    nextTrack: 'Next track',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    toggleRepeat: 'Toggle repeat',
    volumeLabel: 'Volume',
    lyricsBtn: 'Lyrics',
    sleepBtn: 'Sleep',
    openNowPlayingPanel: 'Open now playing panel',
    closeNowPlayingPanel: 'Close now playing panel',
    closeNavigation: 'Close navigation',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Welcome to ClarkPlayer',
    fortressOfSound: 'Your Fortress of Sound is ready. Browse your library, create playlists, and let the music fly.',
    recentlyPlayed: 'Recently Played',
    // ── All Tracks ──
    titleColumn: 'Title',
    albumColumn: 'Album',
    durationColumn: 'Duration',
    formatColumn: 'Format',
    selectAction: 'Select',
    songsLabel: 'songs',
    addToPlaylist: 'Add to playlist',
    deleteAction: 'Delete',
    cancelAction: 'Cancel',
    dateAdded: 'Date Added',
    artistColumn: 'Artist',
    sortAction: 'Sort',
    selectedLabel: 'selected',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Total tracks',
    favorites: 'Favorites',
    totalDuration: 'Total duration',
    libraryOverview: 'Library overview coming soon.',
    libraryOverviewBrowse: 'Browse',
    libraryOverviewOr: 'or',
    signInToViewLibrary: 'Sign in to view your library',
    signInToViewLibraryDesc: 'Create an account or sign in to start building your music collection. Your tracks, playlists, and stats live here.',
    loadingLibrary: 'Loading library\u2026',
    noTracksYet: 'No tracks yet',
    startUploading: 'Start uploading music to see your library come to life.',
    // ── Playlists list ──
    sortLabel: 'Sort:',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'Recently Updated',
    sortMostPlayed: 'Most Played',
    sortDateCreated: 'Date Created',
    // ── Playlist detail ──
    playAction: 'Play',
    shuffleAction: 'Shuffle',
    shareAction: 'Share',
    exportJSON: 'Export as JSON',
    exportM3U8: 'Export as M3U8',
    collaborativeLabel: 'Collaborative',
    addTracks: 'Add tracks',
    searchInPlaylist: 'Search tracks in playlist\u2026',
    moreOptions: 'More options',
    // ── Artists list ──
    albumSingular: 'album',
    albumPlural: 'albums',
    // ── Artist detail ──
    verifiedArtist: 'Verified Artist',
    followAction: 'Follow',
    topTracks: 'Top Tracks',
    discography: 'Discography',
    filterAll: 'All',
    filterAlbums: 'Albums',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: 'Similar Artists',
    showFullLyrics: 'Show full lyrics',
    aboutLabel: 'About',
    keyLabel: 'Key',
    valenceLabel: 'Valence',
    acousticnessLabel: 'Acousticness',
    instrumentalnessLabel: 'Instrumentalness',
    livenessLabel: 'Liveness',
    speechinessLabel: 'Speechiness',
    // ── Genres ──
    browseByGenre: 'Browse by Genre',
    // ── Search ──
    searchPlaceholder: 'Search tracks, artists, playlists\u2026',
    tracksTab: 'Tracks',
    artistsTab: 'Artists',
    playlistsTab: 'Playlists',
    startTyping: 'Start typing to search your library',
    noTracksFound: 'No tracks found for',
    noArtistsFound: 'No artists found for',
    noPlaylistsFound: 'No playlists found for',
    searchAcrossWeb: 'Search Across the Web',
    searchAcrossWebDesc: 'Discover music from the world\u2019s largest databases. Powered by MusicBrainz, Spotify, iTunes, Genius & Last.fm.',
    searchGlobalPlaceholder: 'Search for songs, albums, or artists\u2026',
    searchingLabel: 'Searching\u2026',
    searchErrorLabel: 'Search failed. Please try again.',
    popularityLabel: 'Popularity',
    playcountLabel: 'Plays',
    bpmLabel: 'BPM',
    energyLabel: 'Energy',
    danceabilityLabel: 'Danceability',
    previewLabel: 'Preview',
    noPreviewLabel: 'No preview available',
    playPreview: 'Play Preview',
    previewAvailable: 'Preview Available',
    discoverNewMusic: 'Discover New Music',
    popularArtists: 'Popular Artists',
    newReleases: 'New Releases',
    lyricsLabel: 'Lyrics',
    similarTracksLabel: 'Similar Tracks',
    audioFeaturesLabel: 'Audio Features',
    // ── Empty / Fallback states ──
    noTrackPlaying: 'No track playing',
    noTracksInPlaylist: 'No tracks in this playlist yet',
    noTracksInPlaylistDesc: 'Search for tracks and add them to this playlist.',
    noPreviewTracksFor: 'No preview tracks found for',
    goToSearch: 'Go to Search',
    searchUnavailable: 'Search unavailable. Please try again.',
    noTracksOrAlbums: 'No tracks or albums found for this artist in the catalog yet.',
    noTracksFoundForAlbum: 'No tracks found for this album.',
    albumCover: 'Album cover',
    trackProgress: 'Track progress',
    previewTracks: 'Preview Tracks',
    tracksWithPreview: 'tracks with preview',
    allRightsReserved: 'All rights reserved.',
    contactLink: 'Contact',
    agreeTermsPart1: 'I have read the',
    agreeTermsPart2: 'and agree to them.',
    andLowercase: 'and',
    // ── Privacy Policy Page ──
    legalLabel: 'Legal',
    privacyTitle: 'Privacy',
    policyAccent: 'Policy',
    privacySubtitle: 'How ClarkPlayer collects, uses, and protects your data. Full LGPD compliance.',
    ppNavIntro: 'Intro',
    ppNavData: 'Data',
    ppNavUsage: 'Usage',
    ppNavCookies: 'Cookies',
    ppNavSecurity: 'Security',
    ppNavLgpdRights: 'LGPD Rights',
    ppNavTerms: 'Terms',
    ppS1Title: '1. Introduction',
    ppS1Body: 'ClarkPlayer is a music streaming platform that delivers personalized musical experiences, artist discovery, and intelligent recommendations. To provide these features, we process certain personal data with transparency and respect.\n\nThis policy explains what data we collect, why we collect it, how we use it, and your rights under the Brazilian General Data Protection Law (LGPD — Lei 13.709/2018).',
    ppS2Title: '2. Data We Collect',
    ppS2AccountTitle: 'Account Data',
    ppS2AccountBody: 'When you create an account or sign in via Google OAuth, we collect your name, email address, and avatar image to identify you and personalize your experience.',
    ppS2UsageTitle: 'Usage Data',
    ppS2UsageBody: 'We track tracks played, artists and albums visited, searches performed, favorites saved, and playlists created. This data powers our recommendation engine and improves your discovery experience.',
    ppS2TechnicalTitle: 'Technical Data',
    ppS2TechnicalBody: 'Browser type, operating system, device information, access logs, performance metrics, and interface preferences (theme, language, sleep timer) are collected to ensure platform stability and security.',
    ppS3Title: '3. How We Use Your Data',
    ppS3Body: 'Personalization — Tailor music recommendations, genre suggestions, and artist discoveries based on your listening history.\nAuthentication — Securely identify you and protect your account.\nPerformance — Monitor and improve platform speed, stability, and reliability.\nSecurity — Detect and prevent fraud, abuse, and unauthorized access.\nLegal Compliance — Meet regulatory obligations under LGPD and applicable laws.',
    ppS4Title: '4. Data Sharing',
    ppS4NeverSell: 'We never sell your personal data.',
    ppS4Body: 'Authentication Providers — Google OAuth for secure sign-in.\nInfrastructure — Hosting (Vercel, Render), database (Neon PostgreSQL), cache (Redis).\nLegal Obligation — When required by law or court order.',
    ppS5Title: '5. Cookies & Local Storage',
    ppS5Body: 'Authentication — JWT tokens stored securely to keep you signed in.\nPreferences — Theme (dark/light), language, sleep timer settings.\nCache — Music catalog data cached locally for speed and offline resilience.',
    ppS5ClearData: 'You can clear this data anytime through your browser settings or by signing out.',
    ppS6Title: '6. Security',
    ppS6Body: 'We implement industry-standard security measures:',
    ppS6Items: 'HTTPS — All communication is encrypted in transit.\nJWT Authentication — Tokens with short expiration times.\nPassword Hashing — Passwords are never stored in plain text.\nRate Limiting — Protection against brute-force attacks.\nMonitoring — Continuous security monitoring and incident response.',
    ppS7Title: '7. Your LGPD Rights',
    ppS7Intro: 'Under Brazilian law (LGPD), you have the right to:',
    ppS7Items: 'Access — Request a copy of all personal data we hold about you.\nCorrection — Update incomplete or inaccurate data.\nDeletion — Request permanent deletion of your account and data.\nPortability — Export your data in a structured, machine-readable format (JSON).\nConsent Revocation — Withdraw consent at any time.\nInformation — Know which entities your data is shared with.',
    ppS8Title: '8. Account Deletion',
    ppS8Body: 'You may delete your account at any time. This process:',
    ppS8Steps: 'Marks your account for deletion\nRemoves personal identifiers (name, email, avatar)\nAnonymizes listening history and behavioral data\nRetains anonymized data for aggregate analytics only',
    ppS8DeletePath: 'To delete your account, go to Settings → Account → Delete Account or contact us directly.',
    ppS9Title: '9. Data Retention',
    ppS9Body: 'Personal data is retained only while your account is active. Expired sessions, old logs, and stale cache entries are automatically purged. After account deletion, residual data is removed within 30 days.',
    ppS10Title: '10. Terms of Use',
    ppS10Body: 'By using ClarkPlayer, you agree to these terms. If you disagree, please discontinue use immediately.',
    ppS10PermittedUse: 'Permitted Use',
    ppS10PermittedUseBody: 'ClarkPlayer is a personal music streaming and discovery platform. You may browse, search, play previews, create playlists, and manage your music library.',
    ppS10UserResp: 'User Responsibilities',
    ppS10UserRespBody: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You agree to provide accurate registration information.',
    ppS10Prohibited: 'Prohibited Conduct',
    ppS10ProhibitedItems: 'Scraping, crawling, or automated data extraction\nUnauthorized API access or reverse engineering\nAbusing preview URLs or downloading content\nAttempting to circumvent security measures\nUsing the platform for illegal activities\nHarassing or impersonating other users',
    ppS10IP: 'Intellectual Property',
    ppS10IPBody: 'All music content, previews, and artwork are property of their respective rights holders (Apple/iTunes, Spotify, record labels). ClarkPlayer provides discovery and streaming previews only — no content is hosted or redistributed.',
    ppS10Liability: 'Limitation of Liability',
    ppS10LiabilityBody: 'ClarkPlayer is provided "as is" without warranties. We are not liable for damages arising from use or inability to use the platform.',
    ppS10Changes: 'Changes to Terms',
    ppS10ChangesBody: 'We may update these terms. Continued use after changes constitutes acceptance. Material changes will be notified via the platform.',
    ppS11Title: '11. Contact',
    ppS11Body: 'For privacy-related inquiries, data requests, or to exercise your LGPD rights, contact:',
    ppContactEmail: 'privacy@clarkplayer.app',
    ppLastUpdated: 'Last updated: June 18, 2026 — Version 1.0',

    // ── Section titles ──
    trendingNow: 'Trending Now',
    topArtists: 'Top Artists',
    brazilian: 'Brazilian',
    discover: 'Discover',
    // ── Error messages ──
    couldNotLoadDiscovery: 'Could not load discovery data.',
    tryRefreshing: 'Try refreshing the page.',
    couldNotLoadGenres: 'Could not load genres',
    couldNotLoadAlbum: 'Could not load album',
    couldNotLoadArtist: 'Could not load artist',
    unexpectedErrorGenres: 'An unexpected error occurred while loading genres.',
    unexpectedErrorAlbum: 'An unexpected error occurred while loading this album.',
    unexpectedErrorArtist: 'An unexpected error occurred while loading this artist.',
    backendUnreachable: 'The backend is unreachable. Please check your connection and try again.',
    retry: 'Retry',
    backToArtists: 'Back to Artists',
    backToGenres: 'Back to Genres',
    artistNotInCatalog: 'This artist is not in our catalog yet.',
    // ── Account ──
    myAccount: 'My Account',
    profileInformation: 'Profile Information',
    displayName: 'Display name',
    emailLabel: 'Email',
    bioLabel: 'Bio',
    saveChanges: 'Save changes',
    linkedAccounts: 'Linked Accounts',
    connectedLabel: 'Connected',
    disconnectAction: 'Disconnect',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'Once you delete your account, there is no going back. Please be certain.',
    deleteAccount: 'Delete account',
    deleteConfirmTitle: 'Delete Account',
    deleteConfirmDesc: 'This action is permanent. To confirm, type DELETE below.',
    typeDeleteConfirm: 'Type DELETE to confirm',
    deleting: 'Deleting\u2026',
    free: 'Free',
    googleAccountLinked: 'Google account linked',
    editPhoto: 'Edit photo',
    // ── Auth / Login ──
    welcomeBack: 'Welcome back',
    signInToContinue: 'Sign in to continue to your library',
    continueWithGoogle: 'Continue with Google',
    orDivider: 'or',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    signingIn: 'Signing in\u2026',
    lockedLabel: 'Locked',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    accountCreatedBanner: 'Account created successfully! Please sign in.',
    accountLocked: 'Account Temporarily Locked',
    tooManyAttempts: 'Too many failed login attempts. Please try again in',
    attemptsRemaining: 'attempts remaining before temporary lockout',
    wrongCredentials: 'Wrong email or password. Please try again.',
    accessDeniedGoogle: 'You denied the Google sign-in. Please try again.',
    authFailedGoogle: 'Google sign-in failed. Please try again.',
    authFailed: 'Authentication failed. Please try again.',
    closeLoginPage: 'Close login page',
    // ── Branding / Tagline ──
    clarkTagline: 'Clark by Name. Super by Nature.',
    // ── Register ──
    createYourAccount: 'Create your account',
    joinClarkPlayer: 'Join ClarkPlayer and start building your library',
    fullName: 'Full name',
    confirmPassword: 'Confirm password',
    agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
    createAccount: 'Create account',
    creatingAccount: 'Creating account\u2026',
    alreadyHaveAccount: 'Already have an account?',
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
    accountCreated: 'Account created!',
    redirectingSignIn: 'Redirecting you to sign in\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: 'Forgot your password?',
    forgotPasswordDesc: "Enter your email address and we'll send you a link to reset it.",
    checkInbox: 'Check your inbox',
    resetLinkSent: "We've sent a password reset link to",
    clickLinkToReset: 'Click the link in the email to reset your password.',
    backToLogin: 'Back to login',
    sendResetLink: 'Send reset link',
    sending: 'Sending\u2026',
    // ── Reset Password ──
    resetPassword: 'Reset password',
    newPassword: 'New password',
    resetPasswordBtn: 'Reset password',
    passwordResetComplete: 'Password reset complete',
    passwordUpdated: 'Your password has been updated. You can now sign in.',
    invalidResetLink: 'Invalid reset link',
    invalidResetLinkDesc: 'This password reset link is invalid or has expired. Please request a new one.',
    enterNewPassword: 'Enter your new password below.',
    goToSignIn: 'Go to sign in',
    // ── Verify Email ──
    verifying: 'Verifying\u2026',
    emailVerified: 'Email Verified',
    verificationFailed: 'Verification Failed',
    verificationTokenMissing: 'Verification token is missing. Please check the link in your email.',
    emailVerifiedMessage: 'Your email has been verified! You can now sign in.',
    verificationFailedMessage: 'Verification failed. The token may have expired. Please request a new one.',
    // ── Google Callback ──
    signingInGoogle: 'Signing you in with Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'Drop an image or click to upload',
    pngJpgLimit: 'PNG, JPG up to 5MB',
    playlistNamePlaceholder: 'My Playlist',
    playlistCoverPreview: 'Playlist cover preview',
    togglePrivacy: 'Toggle privacy',
    changeCoverImage: 'Change image',
    removeCoverImage: 'Remove image',
    chooseFromDrive: 'Choose from Google Drive',
    loadingDrive: 'Loading Drive\u2026',
    // ── TrackRow ──
    addToFavorites: 'Add to favorites',
    unfavorite: 'Unfavorite',
    selectTrack: 'Select',
    currentlyPlaying: 'Currently playing',
  } satisfies TranslationMap,

  'pt-BR': {
    // ── Settings tab labels ──
    settings: 'Configura\u00e7\u00f5es',
    appearance: 'Apar\u00eancia',
    language: 'Idioma',
    libraryFiles: 'Biblioteca e Arquivos',
    playback: 'Reprodu\u00e7\u00e3o',
    about: 'Sobre',
    // ── Appearance ──
    theme: 'Tema',
    dark: 'Escuro',
    light: 'Claro',
    midnight: 'Meia-noite',
    accentColor: 'Cor de Destaque',
    fontSize: 'Tamanho da Fonte',
    small: 'Pequeno',
    default: 'Padr\u00e3o',
    large: 'Grande',
    boldMode: 'Modo Negrito',
    boldModeDesc: 'Ativar texto em negrito em toda a interface.',
    // ── Language / Region ──
    dateTimeFormat: 'Formato de Data e Hora',
    dateFormat: 'Formato de data',
    timeFormat: 'Formato de hora',
    translationContributors: 'Contribuidores de Tradu\u00e7\u00e3o',
    translationThanks: 'Agradecemos aos nossos tradutores da comunidade: Maria S., Jo\u00e3o P., Yuki T., Ahmed K. e outros.',
    languageLabel: 'Idioma',
    // ── Library / Files ──
    folderScanning: 'Digitaliza\u00e7\u00e3o de Pastas',
    scanNow: 'Digitalizar todas as pastas agora',
    hiddenFiles: 'Arquivos Ocultos',
    showHiddenFiles: 'Mostrar arquivos ocultos',
    hiddenFilesDesc: 'Arquivos ocultos geralmente come\u00e7am com um ponto (ex.: .DS_Store). Ative apenas se necess\u00e1rio.',
    supportedFormats: 'Formatos Suportados',
    unsupportedFormat: 'Formato n\u00e3o suportado?',
    letUsKnow: 'Avise-nos',
    storageUsage: 'Uso de Armazenamento',
    // ── Playback / Equalizer ──
    equalizer: 'Equalizador',
    preset: 'Preset',
    playbackOptions: 'Op\u00e7\u00f5es de Reprodu\u00e7\u00e3o',
    crossfade: 'Crossfade',
    crossfadeDesc: 'Transi\u00e7\u00e3o suave entre faixas',
    gapless: 'Reprodu\u00e7\u00e3o cont\u00ednua',
    gaplessDesc: 'Sem sil\u00eancio entre faixas consecutivas',
    normalization: 'Normaliza\u00e7\u00e3o',
    normalizationDesc: 'Ajustar volume para um n\u00edvel consistente',
    sleepTimer: 'Temporizador',
    off: 'Desligado',
    min: 'min',
    hour: 'hora',
    endOfTrack: 'Final da faixa',
    cancelTimer: 'Cancelar timer',
    // ── About ──
    version: 'Vers\u00e3o',
    whatsNew: 'Novidades',
    privacyPolicy: 'Pol\u00edtica de Privacidade',
    termsOfService: 'Termos de Servi\u00e7o',
    ossLicenses: 'Licen\u00e7as Open Source',
    madeWith: 'Feito com \u2665 pela equipe ClarkPlayer',
    // ── Navigation ──
    browseGenres: 'Navegar por G\u00eanero',
    yourPlaylists: 'Suas Playlists',
    newPlaylist: 'Nova Playlist',
    sort: 'Ordenar',
    tracks: 'faixas',
    updated: 'Atualizado',
    noTracksInQueue: 'Nenhuma faixa na fila',
    browseTracks: 'Navegue pelas faixas para come\u00e7ar a ouvir',
    nowPlaying: 'Tocando Agora',
    queue: 'Fila',
    createPlaylist: 'Criar Playlist',
    publicLabel: 'P\u00fablico',
    privateLabel: 'Privado',
    nameLabel: 'Nome',
    descriptionOptional: 'Descri\u00e7\u00e3o (opcional)',
    descriptionPlaceholder: 'Sobre o que \u00e9 esta playlist?',
    loginAccount: 'Entrar na Conta',
    signOut: 'Sair',
    signIn: 'Entrar',
    home: 'In\u00edcio',
    allTracks: 'Todas as Faixas',
    library: 'Biblioteca',
    playlists: 'Playlists',
    artists: 'Artistas',
    genres: 'G\u00eaneros',
    search: 'Buscar',
    settingsNav: 'Configura\u00e7\u00f5es',
    // ── AppShell / player bar ──
    mainNavigation: 'Navega\u00e7\u00e3o principal',
    openSidebar: 'Abrir barra lateral',
    closeSidebar: 'Fechar barra lateral',
    closePanel: 'Fechar painel',
    hidePlayer: 'Ocultar player',
    showPlayer: 'Mostrar player',
    toggleFavorite: 'Alternar favorito',
    toggleShuffle: 'Alternar aleat\u00f3rio',
    previousTrack: 'Faixa anterior',
    nextTrack: 'Pr\u00f3xima faixa',
    playBtn: 'Reproduzir',
    pauseBtn: 'Pausar',
    toggleRepeat: 'Alternar repeti\u00e7\u00e3o',
    volumeLabel: 'Volume',
    lyricsBtn: 'Letras',
    sleepBtn: 'Dormir',
    openNowPlayingPanel: 'Abrir painel de reprodu\u00e7\u00e3o',
    closeNowPlayingPanel: 'Fechar painel de reprodu\u00e7\u00e3o',
    closeNavigation: 'Fechar navega\u00e7\u00e3o',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Bem-vindo ao ClarkPlayer',
    fortressOfSound: 'Sua Fortaleza Sonora est\u00e1 pronta. Explore sua biblioteca, crie playlists e deixe a m\u00fasica voar.',
    recentlyPlayed: 'Tocados Recentemente',
    // ── All Tracks ──
    titleColumn: 'T\u00edtulo',
    albumColumn: '\u00c1lbum',
    durationColumn: 'Dura\u00e7\u00e3o',
    formatColumn: 'Formato',
    selectAction: 'Selecionar',
    songsLabel: 'm\u00fasicas',
    addToPlaylist: 'Adicionar \u00e0 playlist',
    deleteAction: 'Excluir',
    cancelAction: 'Cancelar',
    dateAdded: 'Data de adi\u00e7\u00e3o',
    artistColumn: 'Artista',
    sortAction: 'Ordenar',
    selectedLabel: 'selecionadas',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Total de faixas',
    favorites: 'Favoritas',
    totalDuration: 'Dura\u00e7\u00e3o total',
    libraryOverview: 'Vis\u00e3o geral da biblioteca em breve.',
    libraryOverviewBrowse: 'Navegar',
    libraryOverviewOr: 'ou',
    signInToViewLibrary: 'Entre para ver sua biblioteca',
    signInToViewLibraryDesc: 'Crie uma conta ou faça login para começar a montar sua coleção musical. Suas faixas, playlists e estatísticas ficam aqui.',
    loadingLibrary: 'Carregando biblioteca\u2026',
    noTracksYet: 'Nenhuma faixa ainda',
    startUploading: 'Comece a enviar músicas para ver sua biblioteca ganhar vida.',
    // ── Playlists list ──
    sortLabel: 'Ordenar:',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'Atualizadas Recentemente',
    sortMostPlayed: 'Mais Tocadas',
    sortDateCreated: 'Data de Cria\u00e7\u00e3o',
    // ── Playlist detail ──
    playAction: 'Reproduzir',
    shuffleAction: 'Aleat\u00f3rio',
    shareAction: 'Compartilhar',
    exportJSON: 'Exportar como JSON',
    exportM3U8: 'Exportar como M3U8',
    collaborativeLabel: 'Colaborativa',
    addTracks: 'Adicionar faixas',
    searchInPlaylist: 'Buscar faixas na playlist\u2026',
    moreOptions: 'Mais op\u00e7\u00f5es',
    // ── Artists list ──
    albumSingular: '\u00e1lbum',
    albumPlural: '\u00e1lbuns',
    // ── Artist detail ──
    verifiedArtist: 'Artista Verificado',
    followAction: 'Seguir',
    topTracks: 'Mais Tocadas',
    discography: 'Discografia',
    filterAll: 'Tudo',
    filterAlbums: '\u00c1lbuns',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: 'Artistas Semelhantes',
    showFullLyrics: 'Mostrar letra completa',
    aboutLabel: 'Sobre',
    keyLabel: 'Tonalidade',
    valenceLabel: 'Val\u00eancia',
    acousticnessLabel: 'Ac\u00fastica',
    instrumentalnessLabel: 'Instrumentalidade',
    livenessLabel: 'Ao Vivo',
    speechinessLabel: 'Falabilidade',
    // ── Genres ──
    browseByGenre: 'Navegar por G\u00eanero',
    // ── Search ──
    searchPlaceholder: 'Buscar faixas, artistas, playlists\u2026',
    tracksTab: 'Faixas',
    artistsTab: 'Artistas',
    playlistsTab: 'Playlists',
    startTyping: 'Comece a digitar para buscar na biblioteca',
    noTracksFound: 'Nenhuma faixa encontrada para',
    noArtistsFound: 'Nenhum artista encontrado para',
    noPlaylistsFound: 'Nenhuma playlist encontrada para',
    searchAcrossWeb: 'Buscar na Internet',
    searchAcrossWebDesc: 'Descubra m\u00fasica dos maiores bancos de dados do mundo. Com MusicBrainz, Spotify, iTunes, Genius e Last.fm.',
    searchGlobalPlaceholder: 'Buscar m\u00fasicas, \u00e1lbuns ou artistas\u2026',
    searchingLabel: 'Buscando\u2026',
    searchErrorLabel: 'Busca falhou. Tente novamente.',
    popularityLabel: 'Popularidade',
    playcountLabel: 'Reprodu\u00e7\u00f5es',
    bpmLabel: 'BPM',
    energyLabel: 'Energia',
    danceabilityLabel: 'Dan\u00e7abilidade',
    previewLabel: 'Pr\u00e9via',
    noPreviewLabel: 'Pr\u00e9via indispon\u00edvel',
    playPreview: 'Ouvir Pr\u00e9via',
    previewAvailable: 'Pr\u00e9via Dispon\u00edvel',
    discoverNewMusic: 'Descubra Novas M\u00fasicas',
    popularArtists: 'Artistas Populares',
    newReleases: 'Novos Lan\u00e7amentos',
    lyricsLabel: 'Letras',
    similarTracksLabel: 'Faixas Semelhantes',
    audioFeaturesLabel: 'Caracter\u00edsticas de \u00c1udio',
    // ── Empty / Fallback states ──
    noTrackPlaying: 'Sem m\u00fasica tocando',
    noTracksInPlaylist: 'Nenhuma faixa nesta playlist ainda',
    noTracksInPlaylistDesc: 'Pesquise faixas e adicione-as a esta playlist.',
    noPreviewTracksFor: 'Nenhuma faixa de pr\u00e9via encontrada para',
    goToSearch: 'Ir para Pesquisa',
    searchUnavailable: 'Pesquisa indispon\u00edvel. Tente novamente.',
    noTracksOrAlbums: 'Nenhuma faixa ou \u00e1lbum encontrado para este artista no cat\u00e1logo ainda.',
    noTracksFoundForAlbum: 'Nenhuma faixa encontrada para este \u00e1lbum.',
    albumCover: 'Capa do \u00e1lbum',
    trackProgress: 'Progresso da faixa',
    previewTracks: 'Pr\u00e9vias de Faixas',
    tracksWithPreview: 'faixas com pr\u00e9via',
    allRightsReserved: 'Todos os direitos reservados.',
    contactLink: 'Contato',
    agreeTermsPart1: 'Eu li os',
    agreeTermsPart2: 'e concordo com eles.',
    andLowercase: 'e',
    // ── Privacy Policy Page ──
    legalLabel: 'Legal',
    privacyTitle: 'Privacidade',
    policyAccent: 'Pol\u00edtica',
    privacySubtitle: 'Como o ClarkPlayer coleta, usa e protege seus dados. Conformidade total com a LGPD.',
    ppNavIntro: 'Introdu\u00e7\u00e3o',
    ppNavData: 'Dados',
    ppNavUsage: 'Uso',
    ppNavCookies: 'Cookies',
    ppNavSecurity: 'Seguran\u00e7a',
    ppNavLgpdRights: 'Direitos LGPD',
    ppNavTerms: 'Termos',
    ppS1Title: '1. Introdu\u00e7\u00e3o',
    ppS1Body: 'O ClarkPlayer \u00e9 uma plataforma de streaming de m\u00fasica que oferece experi\u00eancias musicais personalizadas, descoberta de artistas e recomenda\u00e7\u00f5es inteligentes. Para fornecer esses recursos, processamos certos dados pessoais com transpar\u00eancia e respeito.\n\nEsta pol\u00edtica explica quais dados coletamos, por que coletamos, como os usamos e seus direitos sob a Lei Geral de Prote\u00e7\u00e3o de Dados (LGPD — Lei 13.709/2018).',
    ppS2Title: '2. Dados que Coletamos',
    ppS2AccountTitle: 'Dados da Conta',
    ppS2AccountBody: 'Ao criar uma conta ou entrar via Google OAuth, coletamos seu nome, endere\u00e7o de e-mail e imagem de avatar para identific\u00e1-lo e personalizar sua experi\u00eancia.',
    ppS2UsageTitle: 'Dados de Uso',
    ppS2UsageBody: 'Monitoramos faixas tocadas, artistas e \u00e1lbuns visitados, pesquisas realizadas, favoritos salvos e playlists criadas. Esses dados alimentam nosso mecanismo de recomenda\u00e7\u00e3o e melhoram sua experi\u00eancia de descoberta.',
    ppS2TechnicalTitle: 'Dados T\u00e9cnicos',
    ppS2TechnicalBody: 'Tipo de navegador, sistema operacional, informa\u00e7\u00f5es do dispositivo, logs de acesso, m\u00e9tricas de desempenho e prefer\u00eancias de interface (tema, idioma, temporizador) s\u00e3o coletados para garantir estabilidade e seguran\u00e7a da plataforma.',
    ppS3Title: '3. Como Usamos Seus Dados',
    ppS3Body: 'Personaliza\u00e7\u00e3o — Adaptar recomenda\u00e7\u00f5es musicais, sugest\u00f5es de g\u00eanero e descobertas de artistas com base no seu hist\u00f3rico de audi\u00e7\u00e3o.\nAutentica\u00e7\u00e3o — Identific\u00e1-lo com seguran\u00e7a e proteger sua conta.\nDesempenho — Monitorar e melhorar a velocidade, estabilidade e confiabilidade da plataforma.\nSeguran\u00e7a — Detectar e prevenir fraudes, abusos e acessos n\u00e3o autorizados.\nConformidade Legal — Cumprir obriga\u00e7\u00f5es regulat\u00f3rias sob a LGPD e leis aplic\u00e1veis.',
    ppS4Title: '4. Compartilhamento de Dados',
    ppS4NeverSell: 'N\u00f3s nunca vendemos seus dados pessoais.',
    ppS4Body: 'Provedores de Autentica\u00e7\u00e3o — Google OAuth para login seguro.\nInfraestrutura — Hospedagem (Vercel, Render), banco de dados (Neon PostgreSQL), cache (Redis).\nObriga\u00e7\u00e3o Legal — Quando exigido por lei ou ordem judicial.',
    ppS5Title: '5. Cookies e Armazenamento Local',
    ppS5Body: 'Autentica\u00e7\u00e3o — Tokens JWT armazenados com seguran\u00e7a para manter voc\u00ea conectado.\nPrefer\u00eancias — Tema (escuro/claro), idioma, configura\u00e7\u00f5es do temporizador.\nCache — Dados do cat\u00e1logo de m\u00fasica armazenados em cache localmente para velocidade e resili\u00eancia offline.',
    ppS5ClearData: 'Voc\u00ea pode limpar esses dados a qualquer momento atrav\u00e9s das configura\u00e7\u00f5es do navegador ou saindo da conta.',
    ppS6Title: '6. Seguran\u00e7a',
    ppS6Body: 'Implementamos medidas de seguran\u00e7a de acordo com os padr\u00f5es da ind\u00fastria:',
    ppS6Items: 'HTTPS — Toda comunica\u00e7\u00e3o \u00e9 criptografada em tr\u00e2nsito.\nAutentica\u00e7\u00e3o JWT — Tokens com prazos de expira\u00e7\u00e3o curtos.\nHash de Senhas — Senhas nunca s\u00e3o armazenadas em texto puro.\nLimita\u00e7\u00e3o de Taxa — Prote\u00e7\u00e3o contra ataques de for\u00e7a bruta.\nMonitoramento — Monitoramento cont\u00ednuo de seguran\u00e7a e resposta a incidentes.',
    ppS7Title: '7. Seus Direitos LGPD',
    ppS7Intro: 'De acordo com a lei brasileira (LGPD), voc\u00ea tem o direito de:',
    ppS7Items: 'Acesso — Solicitar uma c\u00f3pia de todos os dados pessoais que temos sobre voc\u00ea.\nCorre\u00e7\u00e3o — Atualizar dados incompletos ou imprecisos.\nExclus\u00e3o — Solicitar a exclus\u00e3o permanente de sua conta e dados.\nPortabilidade — Exportar seus dados em formato estruturado e leg\u00edvel por m\u00e1quina (JSON).\nRevoga\u00e7\u00e3o de Consentimento — Retirar o consentimento a qualquer momento.\nInforma\u00e7\u00e3o — Saber com quais entidades seus dados s\u00e3o compartilhados.',
    ppS8Title: '8. Exclus\u00e3o de Conta',
    ppS8Body: 'Voc\u00ea pode excluir sua conta a qualquer momento. Este processo:',
    ppS8Steps: 'Marca sua conta para exclus\u00e3o\nRemove identificadores pessoais (nome, e-mail, avatar)\nAnonimiza o hist\u00f3rico de audi\u00e7\u00e3o e dados comportamentais\nRet\u00e9m dados anonimizados apenas para an\u00e1lise agregada',
    ppS8DeletePath: 'Para excluir sua conta, v\u00e1 em Configura\u00e7\u00f5es \u2192 Conta \u2192 Excluir Conta ou entre em contato diretamente.',
    ppS9Title: '9. Reten\u00e7\u00e3o de Dados',
    ppS9Body: 'Os dados pessoais s\u00e3o retidos apenas enquanto sua conta estiver ativa. Sess\u00f5es expiradas, logs antigos e entradas de cache obsoletas s\u00e3o purgados automaticamente. Ap\u00f3s a exclus\u00e3o da conta, os dados residuais s\u00e3o removidos em at\u00e9 30 dias.',
    ppS10Title: '10. Termos de Uso',
    ppS10Body: 'Ao usar o ClarkPlayer, voc\u00ea concorda com estes termos. Se n\u00e3o concordar, pare de usar imediatamente.',
    ppS10PermittedUse: 'Uso Permitido',
    ppS10PermittedUseBody: 'O ClarkPlayer \u00e9 uma plataforma pessoal de streaming e descoberta de m\u00fasica. Voc\u00ea pode navegar, pesquisar, ouvir pr\u00e9vias, criar playlists e gerenciar sua biblioteca musical.',
    ppS10UserResp: 'Responsabilidades do Usu\u00e1rio',
    ppS10UserRespBody: 'Voc\u00ea \u00e9 respons\u00e1vel por manter a confidencialidade de suas credenciais de conta e por toda atividade em sua conta. Voc\u00ea concorda em fornecer informa\u00e7\u00f5es de registro precisas.',
    ppS10Prohibited: 'Condutas Proibidas',
    ppS10ProhibitedItems: 'Extra\u00e7\u00e3o automatizada de dados (scraping, crawling)\nAcesso n\u00e3o autorizado \u00e0 API ou engenharia reversa\nUso abusivo de URLs de pr\u00e9via ou download de conte\u00fado\nTentativa de burlar medidas de seguran\u00e7a\nUso da plataforma para atividades ilegais\nAss\u00e9dio ou falsifica\u00e7\u00e3o de identidade de outros usu\u00e1rios',
    ppS10IP: 'Propriedade Intelectual',
    ppS10IPBody: 'Todo conte\u00fado musical, pr\u00e9vias e artwork s\u00e3o propriedade de seus respectivos detentores (Apple/iTunes, Spotify, gravadoras). O ClarkPlayer fornece apenas descoberta e pr\u00e9vias em streaming — nenhum conte\u00fado \u00e9 hospedado ou redistribu\u00eddo.',
    ppS10Liability: 'Limita\u00e7\u00e3o de Responsabilidade',
    ppS10LiabilityBody: 'O ClarkPlayer \u00e9 fornecido "como est\u00e1", sem garantias. N\u00e3o nos responsabilizamos por danos decorrentes do uso ou da impossibilidade de uso da plataforma.',
    ppS10Changes: 'Altera\u00e7\u00f5es nos Termos',
    ppS10ChangesBody: 'Podemos atualizar estes termos. O uso continuado ap\u00f3s altera\u00e7\u00f5es constitui aceita\u00e7\u00e3o. Altera\u00e7\u00f5es materiais ser\u00e3o notificadas atrav\u00e9s da plataforma.',
    ppS11Title: '11. Contato',
    ppS11Body: 'Para d\u00favidas relacionadas \u00e0 privacidade, solicita\u00e7\u00f5es de dados ou para exercer seus direitos LGPD, entre em contato:',
    ppContactEmail: 'privacy@clarkplayer.app',
    ppLastUpdated: '\u00daltima atualiza\u00e7\u00e3o: 18 de junho de 2026 — Vers\u00e3o 1.0',

    // ── Section titles ──
    trendingNow: 'Em Alta Agora',
    topArtists: 'Artistas Populares',
    brazilian: 'Brasileiros',
    discover: 'Descobrir',
    // ── Error messages ──
    couldNotLoadDiscovery: 'N\u00e3o foi poss\u00edvel carregar dados de descoberta.',
    tryRefreshing: 'Tente atualizar a p\u00e1gina.',
    couldNotLoadGenres: 'N\u00e3o foi poss\u00edvel carregar g\u00eaneros',
    couldNotLoadAlbum: 'N\u00e3o foi poss\u00edvel carregar \u00e1lbum',
    couldNotLoadArtist: 'N\u00e3o foi poss\u00edvel carregar artista',
    unexpectedErrorGenres: 'Ocorreu um erro inesperado ao carregar os g\u00eaneros.',
    unexpectedErrorAlbum: 'Ocorreu um erro inesperado ao carregar este \u00e1lbum.',
    unexpectedErrorArtist: 'Ocorreu um erro inesperado ao carregar este artista.',
    backendUnreachable: 'O servidor est\u00e1 inacess\u00edvel. Verifique sua conex\u00e3o e tente novamente.',
    retry: 'Tentar novamente',
    backToArtists: 'Voltar para Artistas',
    backToGenres: 'Voltar para G\u00eaneros',
    artistNotInCatalog: 'Este artista ainda n\u00e3o est\u00e1 em nosso cat\u00e1logo.',
    // ── Account ──
    myAccount: 'Minha Conta',
    profileInformation: 'Informa\u00e7\u00f5es do Perfil',
    displayName: 'Nome de exibi\u00e7\u00e3o',
    emailLabel: 'E-mail',
    bioLabel: 'Bio',
    saveChanges: 'Salvar altera\u00e7\u00f5es',
    linkedAccounts: 'Contas Vinculadas',
    connectedLabel: 'Conectado',
    disconnectAction: 'Desconectar',
    dangerZone: '\u00c1rea de Risco',
    dangerZoneDesc: 'Depois de excluir sua conta, n\u00e3o h\u00e1 como voltar. Tenha certeza.',
    deleteAccount: 'Excluir conta',
    deleteConfirmTitle: 'Excluir Conta',
    deleteConfirmDesc: 'Esta a\u00e7\u00e3o \u00e9 permanente. Para confirmar, digite EXCLUIR abaixo.',
    typeDeleteConfirm: 'Digite EXCLUIR para confirmar',
    deleting: 'Excluindo\u2026',
    free: 'Gr\u00e1tis',
    googleAccountLinked: 'Conta Google vinculada',
    editPhoto: 'Editar foto',
    // ── Auth / Login ──
    welcomeBack: 'Bem-vindo de volta',
    signInToContinue: 'Entre para continuar em sua biblioteca',
    continueWithGoogle: 'Continuar com Google',
    orDivider: 'ou',
    passwordLabel: 'Senha',
    forgotPassword: 'Esqueceu a senha?',
    signingIn: 'Entrando\u2026',
    lockedLabel: 'Bloqueado',
    noAccount: 'N\u00e3o tem uma conta?',
    signUp: 'Cadastre-se',
    accountCreatedBanner: 'Conta criada com sucesso! Fa\u00e7a login.',
    accountLocked: 'Conta Temporariamente Bloqueada',
    tooManyAttempts: 'Muitas tentativas de login. Tente novamente em',
    attemptsRemaining: 'tentativas restantes antes do bloqueio tempor\u00e1rio',
    wrongCredentials: 'E-mail ou senha incorretos. Tente novamente.',
    accessDeniedGoogle: 'Voc\u00ea negou o login com Google. Tente novamente.',
    authFailedGoogle: 'Falha no login com Google. Tente novamente.',
    authFailed: 'Falha na autentica\u00e7\u00e3o. Tente novamente.',
    closeLoginPage: 'Fechar p\u00e1gina de login',
    // ── Branding / Tagline ──
    clarkTagline: 'Clark por Nome. Super por Natureza.',
    // ── Register ──
    createYourAccount: 'Crie sua conta',
    joinClarkPlayer: 'Entre no ClarkPlayer e comece a montar sua biblioteca',
    fullName: 'Nome completo',
    confirmPassword: 'Confirmar senha',
    agreeTerms: 'Concordo com os Termos de Servi\u00e7o e Pol\u00edtica de Privacidade',
    createAccount: 'Criar conta',
    creatingAccount: 'Criando conta\u2026',
    alreadyHaveAccount: 'J\u00e1 tem uma conta?',
    weak: 'Fraca',
    fair: 'Razo\u00e1vel',
    strong: 'Forte',
    accountCreated: 'Conta criada!',
    redirectingSignIn: 'Redirecionando para o login\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: 'Esqueceu sua senha?',
    forgotPasswordDesc: 'Digite seu e-mail e enviaremos um link para redefini-la.',
    checkInbox: 'Verifique sua caixa de entrada',
    resetLinkSent: 'Enviamos um link de redefini\u00e7\u00e3o para',
    clickLinkToReset: 'Clique no link no e-mail para redefinir sua senha.',
    backToLogin: 'Voltar ao login',
    sendResetLink: 'Enviar link de redefini\u00e7\u00e3o',
    sending: 'Enviando\u2026',
    // ── Reset Password ──
    resetPassword: 'Redefinir senha',
    newPassword: 'Nova senha',
    resetPasswordBtn: 'Redefinir senha',
    passwordResetComplete: 'Senha redefinida',
    passwordUpdated: 'Sua senha foi atualizada. Agora voc\u00ea pode entrar.',
    invalidResetLink: 'Link inv\u00e1lido',
    invalidResetLinkDesc: 'Este link de redefini\u00e7\u00e3o \u00e9 inv\u00e1lido ou expirou. Solicite um novo.',
    enterNewPassword: 'Digite sua nova senha abaixo.',
    goToSignIn: 'Ir para o login',
    // ── Verify Email ──
    verifying: 'Verificando\u2026',
    emailVerified: 'E-mail Verificado',
    verificationFailed: 'Falha na Verifica\u00e7\u00e3o',
    verificationTokenMissing: 'Token de verifica\u00e7\u00e3o ausente. Verifique o link no seu e-mail.',
    emailVerifiedMessage: 'Seu e-mail foi verificado! Agora voc\u00ea pode entrar.',
    verificationFailedMessage: 'Falha na verifica\u00e7\u00e3o. O token pode ter expirado. Solicite um novo.',
    // ── Google Callback ──
    signingInGoogle: 'Entrando com o Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'Solte uma imagem ou clique para enviar',
    pngJpgLimit: 'PNG, JPG at\u00e9 5MB',
    playlistNamePlaceholder: 'Minha Playlist',
    playlistCoverPreview: 'Pr\u00e9-visualiza\u00e7\u00e3o da capa',
    togglePrivacy: 'Alternar privacidade',
    changeCoverImage: 'Alterar imagem',
    removeCoverImage: 'Remover imagem',
    chooseFromDrive: 'Escolher do Google Drive',
    loadingDrive: 'Carregando Drive\u2026',
    // ── TrackRow ──
    addToFavorites: 'Adicionar aos favoritos',
    unfavorite: 'Remover dos favoritos',
    selectTrack: 'Selecionar',
    currentlyPlaying: 'Tocando agora',
  } satisfies TranslationMap,

  es: {
    // ── Settings tab labels ──
    settings: 'Configuraci\u00f3n',
    appearance: 'Apariencia',
    language: 'Idioma',
    libraryFiles: 'Biblioteca y Archivos',
    playback: 'Reproducci\u00f3n',
    about: 'Acerca de',
    // ── Appearance ──
    theme: 'Tema',
    dark: 'Oscuro',
    light: 'Claro',
    midnight: 'Medianoche',
    accentColor: 'Color de Acento',
    fontSize: 'Tama\u00f1o de Fuente',
    small: 'Peque\u00f1o',
    default: 'Predeterminado',
    large: 'Grande',
    boldMode: 'Modo Negrita',
    boldModeDesc: 'Activar texto en negrita en toda la interfaz.',
    // ── Language / Region ──
    dateTimeFormat: 'Formato de Fecha y Hora',
    dateFormat: 'Formato de fecha',
    timeFormat: 'Formato de hora',
    translationContributors: 'Colaboradores de Traducci\u00f3n',
    translationThanks: 'Gracias a nuestros traductores comunitarios: Maria S., Jo\u00e3o P., Yuki T., Ahmed K. y otros.',
    languageLabel: 'Idioma',
    // ── Library / Files ──
    folderScanning: 'Escaneo de Carpetas',
    scanNow: 'Escanear todas las carpetas ahora',
    hiddenFiles: 'Archivos Ocultos',
    showHiddenFiles: 'Mostrar archivos ocultos',
    hiddenFilesDesc: 'Los archivos ocultos generalmente comienzan con un punto (ej.: .DS_Store). Active solo si es necesario.',
    supportedFormats: 'Formatos Soportados',
    unsupportedFormat: '\u00bfFormato no soportado?',
    letUsKnow: 'Av\u00edsenos',
    storageUsage: 'Uso de Almacenamiento',
    // ── Playback / Equalizer ──
    equalizer: 'Ecualizador',
    preset: 'Preajuste',
    playbackOptions: 'Opciones de Reproducci\u00f3n',
    crossfade: 'Crossfade',
    crossfadeDesc: 'Transici\u00f3n suave entre pistas',
    gapless: 'Reproducci\u00f3n sin pausas',
    gaplessDesc: 'Sin silencio entre pistas consecutivas',
    normalization: 'Normalizaci\u00f3n',
    normalizationDesc: 'Ajustar volumen a un nivel consistente',
    sleepTimer: 'Temporizador',
    off: 'Apagado',
    min: 'min',
    hour: 'hora',
    endOfTrack: 'Fin de pista',
    cancelTimer: 'Cancelar temporizador',
    // ── About ──
    version: 'Versi\u00f3n',
    whatsNew: 'Novedades',
    privacyPolicy: 'Pol\u00edtica de Privacidad',
    termsOfService: 'T\u00e9rminos de Servicio',
    ossLicenses: 'Licencias Open Source',
    madeWith: 'Hecho con \u2665 por el equipo ClarkPlayer',
    // ── Navigation ──
    browseGenres: 'Explorar por G\u00e9nero',
    yourPlaylists: 'Tus Playlists',
    newPlaylist: 'Nueva Playlist',
    sort: 'Ordenar',
    tracks: 'pistas',
    updated: 'Actualizado',
    noTracksInQueue: 'Sin pistas en cola',
    browseTracks: 'Explore las pistas para empezar a escuchar',
    nowPlaying: 'Reproduciendo',
    queue: 'Cola',
    createPlaylist: 'Crear Playlist',
    publicLabel: 'P\u00fablico',
    privateLabel: 'Privado',
    nameLabel: 'Nombre',
    descriptionOptional: 'Descripci\u00f3n (opcional)',
    descriptionPlaceholder: '\u00bfDe qu\u00e9 trata esta playlist?',
    loginAccount: 'Iniciar Sesi\u00f3n',
    signOut: 'Cerrar sesi\u00f3n',
    signIn: 'Iniciar sesi\u00f3n',
    home: 'Inicio',
    allTracks: 'Todas las Pistas',
    library: 'Biblioteca',
    playlists: 'Playlists',
    artists: 'Artistas',
    genres: 'G\u00e9neros',
    search: 'Buscar',
    settingsNav: 'Configuraci\u00f3n',
    // ── AppShell / player bar ──
    mainNavigation: 'Navegaci\u00f3n principal',
    openSidebar: 'Abrir barra lateral',
    closeSidebar: 'Cerrar barra lateral',
    closePanel: 'Cerrar panel',
    hidePlayer: 'Ocultar reproductor',
    showPlayer: 'Mostrar reproductor',
    toggleFavorite: 'Alternar favorito',
    toggleShuffle: 'Alternar aleatorio',
    previousTrack: 'Pista anterior',
    nextTrack: 'Pista siguiente',
    playBtn: 'Reproducir',
    pauseBtn: 'Pausar',
    toggleRepeat: 'Alternar repetici\u00f3n',
    volumeLabel: 'Volumen',
    lyricsBtn: 'Letras',
    sleepBtn: 'Dormir',
    openNowPlayingPanel: 'Abrir panel de reproducci\u00f3n',
    closeNowPlayingPanel: 'Cerrar panel de reproducci\u00f3n',
    closeNavigation: 'Cerrar navegaci\u00f3n',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Bienvenido a ClarkPlayer',
    fortressOfSound: 'Tu Fortaleza del Sonido est\u00e1 lista. Explora tu biblioteca, crea playlists y deja volar la m\u00fasica.',
    recentlyPlayed: 'Reproducido Recientemente',
    // ── All Tracks ──
    titleColumn: 'T\u00edtulo',
    albumColumn: '\u00c1lbum',
    durationColumn: 'Duraci\u00f3n',
    formatColumn: 'Formato',
    selectAction: 'Seleccionar',
    songsLabel: 'canciones',
    addToPlaylist: 'A\u00f1adir a playlist',
    deleteAction: 'Eliminar',
    cancelAction: 'Cancelar',
    dateAdded: 'Fecha de adici\u00f3n',
    artistColumn: 'Artista',
    sortAction: 'Ordenar',
    selectedLabel: 'seleccionadas',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Total de pistas',
    favorites: 'Favoritas',
    totalDuration: 'Duraci\u00f3n total',
    libraryOverview: 'Vista general de la biblioteca pronto.',
    libraryOverviewBrowse: 'Explorar',
    libraryOverviewOr: 'o',
    signInToViewLibrary: 'Inicia sesión para ver tu biblioteca',
    signInToViewLibraryDesc: 'Crea una cuenta o inicia sesión para empezar a construir tu colección musical. Tus pistas, playlists y estadísticas viven aquí.',
    loadingLibrary: 'Cargando biblioteca\u2026',
    noTracksYet: 'Sin pistas aún',
    startUploading: 'Comienza a subir música para ver tu biblioteca cobrar vida.',
    // ── Playlists list ──
    sortLabel: 'Ordenar:',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'Actualizadas Recientemente',
    sortMostPlayed: 'M\u00e1s Reproducidas',
    sortDateCreated: 'Fecha de Creaci\u00f3n',
    // ── Playlist detail ──
    playAction: 'Reproducir',
    shuffleAction: 'Aleatorio',
    shareAction: 'Compartir',
    exportJSON: 'Exportar como JSON',
    exportM3U8: 'Exportar como M3U8',
    collaborativeLabel: 'Colaborativa',
    addTracks: 'A\u00f1adir pistas',
    searchInPlaylist: 'Buscar pistas en la playlist\u2026',
    moreOptions: 'M\u00e1s opciones',
    // ── Artists list ──
    albumSingular: '\u00e1lbum',
    albumPlural: '\u00e1lbumes',
    // ── Artist detail ──
    verifiedArtist: 'Artista Verificado',
    followAction: 'Seguir',
    topTracks: 'Canciones Principales',
    discography: 'Discograf\u00eda',
    filterAll: 'Todo',
    filterAlbums: '\u00c1lbumes',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: 'Artistas Similares',
    showFullLyrics: 'Mostrar letra completa',
    aboutLabel: 'Acerca de',
    keyLabel: 'Tonalidad',
    valenceLabel: 'Valencia',
    acousticnessLabel: 'Ac\u00fastica',
    instrumentalnessLabel: 'Instrumentalidad',
    livenessLabel: 'En Vivo',
    speechinessLabel: 'Habla',
    // ── Genres ──
    browseByGenre: 'Explorar por G\u00e9nero',
    // ── Search ──
    searchPlaceholder: 'Buscar pistas, artistas, playlists\u2026',
    tracksTab: 'Pistas',
    artistsTab: 'Artistas',
    playlistsTab: 'Playlists',
    startTyping: 'Empieza a escribir para buscar en tu biblioteca',
    noTracksFound: 'No se encontraron pistas para',
    noArtistsFound: 'No se encontraron artistas para',
    noPlaylistsFound: 'No se encontraron playlists para',
    searchAcrossWeb: 'Buscar en la Web',
    searchAcrossWebDesc: 'Descubre m\u00fasica de las mayores bases de datos del mundo. Con MusicBrainz, Spotify, iTunes, Genius y Last.fm.',
    searchGlobalPlaceholder: 'Buscar canciones, \u00e1lbumes o artistas\u2026',
    searchingLabel: 'Buscando\u2026',
    searchErrorLabel: 'B\u00fasqueda fallida. Int\u00e9ntalo de nuevo.',
    popularityLabel: 'Popularidad',
    playcountLabel: 'Reproducciones',
    bpmLabel: 'BPM',
    energyLabel: 'Energ\u00eda',
    danceabilityLabel: 'Bailabilidad',
    previewLabel: 'Vista previa',
    noPreviewLabel: 'Sin vista previa',
    playPreview: 'Reproducir Vista Previa',
    previewAvailable: 'Vista Previa Disponible',
    discoverNewMusic: 'Descubre Nueva M\u00fasica',
    popularArtists: 'Artistas Populares',
    newReleases: 'Nuevos Lanzamientos',
    lyricsLabel: 'Letras',
    similarTracksLabel: 'Pistas Similares',
    audioFeaturesLabel: 'Caracter\u00edsticas de Audio',
    // ── Empty / Fallback states ──
    noTrackPlaying: 'Sin canci\u00f3n reproduci\u00e9ndose',
    noTracksInPlaylist: 'A\u00fan no hay pistas en esta lista',
    noTracksInPlaylistDesc: 'Busca pistas y agrega a esta lista de reproducci\u00f3n.',
    noPreviewTracksFor: 'No se encontraron pistas de vista previa para',
    goToSearch: 'Ir a B\u00fasqueda',
    searchUnavailable: 'B\u00fasqueda no disponible. Int\u00e9ntalo de nuevo.',
    noTracksOrAlbums: 'A\u00fan no se encontraron pistas o \u00e1lbumes para este artista en el cat\u00e1logo.',
    noTracksFoundForAlbum: 'No se encontraron pistas para este \u00e1lbum.',
    albumCover: 'Portada del \u00e1lbum',
    trackProgress: 'Progreso de la pista',
    previewTracks: 'Vista Previa de Pistas',
    tracksWithPreview: 'pistas con vista previa',
    allRightsReserved: 'Todos los derechos reservados.',
    contactLink: 'Contacto',
    agreeTermsPart1: 'He le\u00eddo los',
    agreeTermsPart2: 'y estoy de acuerdo.',
    andLowercase: 'y',
    // ── Privacy Policy Page ──
    legalLabel: 'Legal',
    privacyTitle: 'Privacidad',
    policyAccent: 'Pol\u00edtica',
    privacySubtitle: 'C\u00f3mo ClarkPlayer recopila, usa y protege tus datos. Cumplimiento total con la LGPD.',
    ppNavIntro: 'Introducci\u00f3n',
    ppNavData: 'Datos',
    ppNavUsage: 'Uso',
    ppNavCookies: 'Cookies',
    ppNavSecurity: 'Seguridad',
    ppNavLgpdRights: 'Derechos LGPD',
    ppNavTerms: 'T\u00e9rminos',
    ppS1Title: '1. Introducci\u00f3n',
    ppS1Body: 'ClarkPlayer es una plataforma de m\u00fasica en streaming que ofrece experiencias musicales personalizadas, descubrimiento de artistas y recomendaciones inteligentes. Para proporcionar estas funciones, procesamos ciertos datos personales con transparencia y respeto.\n\nEsta pol\u00edtica explica qu\u00e9 datos recopilamos, por qu\u00e9 los recopilamos, c\u00f3mo los usamos y tus derechos bajo la Ley General de Protecci\u00f3n de Datos de Brasil (LGPD — Lei 13.709/2018).',
    ppS2Title: '2. Datos que Recopilamos',
    ppS2AccountTitle: 'Datos de la Cuenta',
    ppS2AccountBody: 'Al crear una cuenta o iniciar sesi\u00f3n a trav\u00e9s de Google OAuth, recopilamos tu nombre, direcci\u00f3n de correo electr\u00f3nico e imagen de avatar para identificarte y personalizar tu experiencia.',
    ppS2UsageTitle: 'Datos de Uso',
    ppS2UsageBody: 'Rastreamos pistas reproducidas, artistas y \u00e1lbumes visitados, b\u00fasquedas realizadas, favoritos guardados y playlists creadas. Estos datos alimentan nuestro motor de recomendaciones y mejoran tu experiencia de descubrimiento.',
    ppS2TechnicalTitle: 'Datos T\u00e9cnicos',
    ppS2TechnicalBody: 'El tipo de navegador, sistema operativo, informaci\u00f3n del dispositivo, registros de acceso, m\u00e9tricas de rendimiento y preferencias de interfaz (tema, idioma, temporizador) se recopilan para garantizar la estabilidad y seguridad de la plataforma.',
    ppS3Title: '3. C\u00f3mo Usamos Tus Datos',
    ppS3Body: 'Personalizaci\u00f3n — Adaptar recomendaciones musicales, sugerencias de g\u00e9nero y descubrimientos de artistas seg\u00fan tu historial de escucha.\nAutenticaci\u00f3n — Identificarte de forma segura y proteger tu cuenta.\nRendimiento — Monitorear y mejorar la velocidad, estabilidad y confiabilidad de la plataforma.\nSeguridad — Detectar y prevenir fraudes, abusos y accesos no autorizados.\nCumplimiento Legal — Cumplir con obligaciones regulatorias seg\u00fan la LGPD y leyes aplicables.',
    ppS4Title: '4. Compartici\u00f3n de Datos',
    ppS4NeverSell: 'Nunca vendemos tus datos personales.',
    ppS4Body: 'Proveedores de Autenticaci\u00f3n — Google OAuth para inicio de sesi\u00f3n seguro.\nInfraestructura — Alojamiento (Vercel, Render), base de datos (Neon PostgreSQL), cach\u00e9 (Redis).\nObligaci\u00f3n Legal — Cuando lo exija la ley o una orden judicial.',
    ppS5Title: '5. Cookies y Almacenamiento Local',
    ppS5Body: 'Autenticaci\u00f3n — Tokens JWT almacenados de forma segura para mantenerte conectado.\nPreferencias — Tema (oscuro/claro), idioma, configuraci\u00f3n del temporizador.\nCach\u00e9 — Datos del cat\u00e1logo de m\u00fasica almacenados en cach\u00e9 localmente para velocidad y resiliencia sin conexi\u00f3n.',
    ppS5ClearData: 'Puedes borrar estos datos en cualquier momento a trav\u00e9s de la configuraci\u00f3n de tu navegador o cerrando sesi\u00f3n.',
    ppS6Title: '6. Seguridad',
    ppS6Body: 'Implementamos medidas de seguridad de acuerdo con los est\u00e1ndares de la industria:',
    ppS6Items: 'HTTPS — Toda la comunicaci\u00f3n est\u00e1 cifrada en tr\u00e1nsito.\nAutenticaci\u00f3n JWT — Tokens con per\u00edodos de expiraci\u00f3n cortos.\nHash de Contrase\u00f1as — Las contrase\u00f1as nunca se almacenan en texto plano.\nLimitaci\u00f3n de Tasa — Protecci\u00f3n contra ataques de fuerza bruta.\nMonitoreo — Monitoreo continuo de seguridad y respuesta a incidentes.',
    ppS7Title: '7. Tus Derechos LGPD',
    ppS7Intro: 'Seg\u00fan la ley brasile\u00f1a (LGPD), tienes derecho a:',
    ppS7Items: 'Acceso — Solicitar una copia de todos los datos personales que tenemos sobre ti.\nCorrecci\u00f3n — Actualizar datos incompletos o inexactos.\nEliminaci\u00f3n — Solicitar la eliminaci\u00f3n permanente de tu cuenta y datos.\nPortabilidad — Exportar tus datos en un formato estructurado y legible por m\u00e1quina (JSON).\nRevocaci\u00f3n de Consentimiento — Retirar el consentimiento en cualquier momento.\nInformaci\u00f3n — Saber con qu\u00e9 entidades se comparten tus datos.',
    ppS8Title: '8. Eliminaci\u00f3n de Cuenta',
    ppS8Body: 'Puedes eliminar tu cuenta en cualquier momento. Este proceso:',
    ppS8Steps: 'Marca tu cuenta para eliminaci\u00f3n\nElimina identificadores personales (nombre, correo, avatar)\nAnonimiza el historial de escucha y datos de comportamiento\nConserva datos anonimizados solo para an\u00e1lisis agregados',
    ppS8DeletePath: 'Para eliminar tu cuenta, ve a Configuraci\u00f3n \u2192 Cuenta \u2192 Eliminar Cuenta o cont\u00e1ctanos directamente.',
    ppS9Title: '9. Retenci\u00f3n de Datos',
    ppS9Body: 'Los datos personales se conservan solo mientras tu cuenta est\u00e9 activa. Las sesiones vencidas, los registros antiguos y las entradas de cach\u00e9 obsoletas se purgan autom\u00e1ticamente. Despu\u00e9s de eliminar la cuenta, los datos residuales se eliminan en un plazo de 30 d\u00edas.',
    ppS10Title: '10. T\u00e9rminos de Uso',
    ppS10Body: 'Al usar ClarkPlayer, aceptas estos t\u00e9rminos. Si no est\u00e1s de acuerdo, deja de usar la plataforma de inmediato.',
    ppS10PermittedUse: 'Uso Permitido',
    ppS10PermittedUseBody: 'ClarkPlayer es una plataforma personal de streaming y descubrimiento de m\u00fasica. Puedes navegar, buscar, reproducir vistas previas, crear playlists y administrar tu biblioteca musical.',
    ppS10UserResp: 'Responsabilidades del Usuario',
    ppS10UserRespBody: 'Eres responsable de mantener la confidencialidad de tus credenciales de cuenta y de toda la actividad bajo tu cuenta. Aceptas proporcionar informaci\u00f3n de registro precisa.',
    ppS10Prohibited: 'Conductas Prohibidas',
    ppS10ProhibitedItems: 'Extracci\u00f3n automatizada de datos (scraping, crawling)\nAcceso no autorizado a la API o ingenier\u00eda inversa\nUso abusivo de URL de vista previa o descarga de contenido\nIntento de eludir las medidas de seguridad\nUso de la plataforma para actividades ilegales\nAcoso o suplantaci\u00f3n de identidad de otros usuarios',
    ppS10IP: 'Propiedad Intelectual',
    ppS10IPBody: 'Todo el contenido musical, vistas previas y material gr\u00e1fico son propiedad de sus respectivos titulares (Apple/iTunes, Spotify, discogr\u00e1ficas). ClarkPlayer proporciona solo descubrimiento y vistas previas en streaming — no se aloja ni redistribuye ning\u00fan contenido.',
    ppS10Liability: 'Limitaci\u00f3n de Responsabilidad',
    ppS10LiabilityBody: 'ClarkPlayer se proporciona "tal cual" sin garant\u00edas. No somos responsables por da\u00f1os derivados del uso o la imposibilidad de usar la plataforma.',
    ppS10Changes: 'Cambios en los T\u00e9rminos',
    ppS10ChangesBody: 'Podemos actualizar estos t\u00e9rminos. El uso continuado despu\u00e9s de los cambios constituye aceptaci\u00f3n. Los cambios importantes se notificar\u00e1n a trav\u00e9s de la plataforma.',
    ppS11Title: '11. Contacto',
    ppS11Body: 'Para consultas relacionadas con la privacidad, solicitudes de datos o para ejercer tus derechos LGPD, contacta:',
    ppContactEmail: 'privacy@clarkplayer.app',
    ppLastUpdated: '\u00daltima actualizaci\u00f3n: 18 de junio de 2026 — Versi\u00f3n 1.0',

    // ── Section titles ──
    trendingNow: 'Tendencia Ahora',
    topArtists: 'Artistas Populares',
    brazilian: 'Brasile\u00f1os',
    discover: 'Descubrir',
    // ── Error messages ──
    couldNotLoadDiscovery: 'No se pudieron cargar los datos de descubrimiento.',
    tryRefreshing: 'Intenta actualizar la p\u00e1gina.',
    couldNotLoadGenres: 'No se pudieron cargar los g\u00e9neros',
    couldNotLoadAlbum: 'No se pudo cargar el \u00e1lbum',
    couldNotLoadArtist: 'No se pudo cargar el artista',
    unexpectedErrorGenres: 'Ocurri\u00f3 un error inesperado al cargar los g\u00e9neros.',
    unexpectedErrorAlbum: 'Ocurri\u00f3 un error inesperado al cargar este \u00e1lbum.',
    unexpectedErrorArtist: 'Ocurri\u00f3 un error inesperado al cargar este artista.',
    backendUnreachable: 'El servidor no est\u00e1 disponible. Verifica tu conexi\u00f3n e int\u00e9ntalo de nuevo.',
    retry: 'Reintentar',
    backToArtists: 'Volver a Artistas',
    backToGenres: 'Volver a G\u00e9neros',
    artistNotInCatalog: 'Este artista a\u00fan no est\u00e1 en nuestro cat\u00e1logo.',
    // ── Account ──
    myAccount: 'Mi Cuenta',
    profileInformation: 'Informaci\u00f3n del Perfil',
    displayName: 'Nombre de visualizaci\u00f3n',
    emailLabel: 'Correo electr\u00f3nico',
    bioLabel: 'Bio',
    saveChanges: 'Guardar cambios',
    linkedAccounts: 'Cuentas Vinculadas',
    connectedLabel: 'Conectado',
    disconnectAction: 'Desconectar',
    dangerZone: 'Zona de Peligro',
    dangerZoneDesc: 'Una vez que elimines tu cuenta, no hay vuelta atr\u00e1s. Aseg\u00farate.',
    deleteAccount: 'Eliminar cuenta',
    deleteConfirmTitle: 'Eliminar Cuenta',
    deleteConfirmDesc: 'Esta acci\u00f3n es permanente. Para confirmar, escribe ELIMINAR abajo.',
    typeDeleteConfirm: 'Escribe ELIMINAR para confirmar',
    deleting: 'Eliminando\u2026',
    free: 'Gratis',
    googleAccountLinked: 'Cuenta de Google vinculada',
    editPhoto: 'Editar foto',
    // ── Auth / Login ──
    welcomeBack: 'Bienvenido de nuevo',
    signInToContinue: 'Inicia sesi\u00f3n para continuar en tu biblioteca',
    continueWithGoogle: 'Continuar con Google',
    orDivider: 'o',
    passwordLabel: 'Contrase\u00f1a',
    forgotPassword: '\u00bfOlvidaste tu contrase\u00f1a?',
    signingIn: 'Iniciando sesi\u00f3n\u2026',
    lockedLabel: 'Bloqueado',
    noAccount: '\u00bfNo tienes una cuenta?',
    signUp: 'Reg\u00edstrate',
    accountCreatedBanner: '\u00a1Cuenta creada con \u00e9xito! Inicia sesi\u00f3n.',
    accountLocked: 'Cuenta Bloqueada Temporalmente',
    tooManyAttempts: 'Demasiados intentos fallidos. Intenta de nuevo en',
    attemptsRemaining: 'intentos restantes antes del bloqueo temporal',
    wrongCredentials: 'Correo o contrase\u00f1a incorrectos. Intenta de nuevo.',
    accessDeniedGoogle: 'Negaste el inicio de sesi\u00f3n con Google. Intenta de nuevo.',
    authFailedGoogle: 'Fall\u00f3 el inicio de sesi\u00f3n con Google. Intenta de nuevo.',
    authFailed: 'Fall\u00f3 la autenticaci\u00f3n. Intenta de nuevo.',
    closeLoginPage: 'Cerrar p\u00e1gina de inicio de sesi\u00f3n',
    // ── Branding / Tagline ──
    clarkTagline: 'Clark de Nombre. S\u00faper por Naturaleza.',
    // ── Register ──
    createYourAccount: 'Crea tu cuenta',
    joinClarkPlayer: '\u00danete a ClarkPlayer y comienza a construir tu biblioteca',
    fullName: 'Nombre completo',
    confirmPassword: 'Confirmar contrase\u00f1a',
    agreeTerms: 'Acepto los T\u00e9rminos de Servicio y la Pol\u00edtica de Privacidad',
    createAccount: 'Crear cuenta',
    creatingAccount: 'Creando cuenta\u2026',
    alreadyHaveAccount: '\u00bfYa tienes una cuenta?',
    weak: 'D\u00e9bil',
    fair: 'Regular',
    strong: 'Fuerte',
    accountCreated: '\u00a1Cuenta creada!',
    redirectingSignIn: 'Redirigiendo al inicio de sesi\u00f3n\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: '\u00bfOlvidaste tu contrase\u00f1a?',
    forgotPasswordDesc: 'Ingresa tu correo y te enviaremos un enlace para restablecerla.',
    checkInbox: 'Revisa tu bandeja de entrada',
    resetLinkSent: 'Hemos enviado un enlace de restablecimiento a',
    clickLinkToReset: 'Haz clic en el enlace del correo para restablecer tu contrase\u00f1a.',
    backToLogin: 'Volver al inicio de sesi\u00f3n',
    sendResetLink: 'Enviar enlace de restablecimiento',
    sending: 'Enviando\u2026',
    // ── Reset Password ──
    resetPassword: 'Restablecer contrase\u00f1a',
    newPassword: 'Nueva contrase\u00f1a',
    resetPasswordBtn: 'Restablecer contrase\u00f1a',
    passwordResetComplete: 'Contrase\u00f1a restablecida',
    passwordUpdated: 'Tu contrase\u00f1a ha sido actualizada. Ahora puedes iniciar sesi\u00f3n.',
    invalidResetLink: 'Enlace inv\u00e1lido',
    invalidResetLinkDesc: 'Este enlace de restablecimiento no es v\u00e1lido o ha expirado. Solicita uno nuevo.',
    enterNewPassword: 'Ingresa tu nueva contrase\u00f1a abajo.',
    goToSignIn: 'Ir al inicio de sesi\u00f3n',
    // ── Verify Email ──
    verifying: 'Verificando\u2026',
    emailVerified: 'Correo Verificado',
    verificationFailed: 'Verificaci\u00f3n Fallida',
    verificationTokenMissing: 'Falta el token de verificaci\u00f3n. Revisa el enlace en tu correo.',
    emailVerifiedMessage: '\u00a1Tu correo ha sido verificado! Ahora puedes iniciar sesi\u00f3n.',
    verificationFailedMessage: 'La verificaci\u00f3n fall\u00f3. El token puede haber expirado. Solicita uno nuevo.',
    // ── Google Callback ──
    signingInGoogle: 'Iniciando sesi\u00f3n con Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'Suelta una imagen o haz clic para subir',
    pngJpgLimit: 'PNG, JPG hasta 5MB',
    playlistNamePlaceholder: 'Mi Playlist',
    playlistCoverPreview: 'Vista previa de la portada',
    togglePrivacy: 'Alternar privacidad',
    changeCoverImage: 'Cambiar imagen',
    removeCoverImage: 'Quitar imagen',
    chooseFromDrive: 'Elegir de Google Drive',
    loadingDrive: 'Cargando Drive\u2026',
    // ── TrackRow ──
    addToFavorites: 'A\u00f1adir a favoritos',
    unfavorite: 'Quitar de favoritos',
    selectTrack: 'Seleccionar',
    currentlyPlaying: 'Reproduciendo ahora',
  } satisfies TranslationMap,

  fr: {
    // ── Settings tab labels ──
    settings: 'Param\u00e8tres',
    appearance: 'Apparence',
    language: 'Langue',
    libraryFiles: 'Biblioth\u00e8que et Fichiers',
    playback: 'Lecture',
    about: '\u00c0 propos',
    // ── Appearance ──
    theme: 'Th\u00e8me',
    dark: 'Sombre',
    light: 'Clair',
    midnight: 'Minuit',
    accentColor: "Couleur d'accent",
    fontSize: 'Taille de police',
    small: 'Petite',
    default: 'Normale',
    large: 'Grande',
    boldMode: 'Mode Gras',
    boldModeDesc: "Activer le texte en gras dans toute l'interface.",
    // ── Language / Region ──
    dateTimeFormat: 'Format de date et heure',
    dateFormat: 'Format de date',
    timeFormat: "Format de l'heure",
    translationContributors: 'Contributeurs \u00e0 la traduction',
    translationThanks: 'Merci \u00e0 nos traducteurs communautaires : Maria S., Jo\u00e3o P., Yuki T., Ahmed K. et autres.',
    languageLabel: 'Langue',
    // ── Library / Files ──
    folderScanning: 'Analyse des dossiers',
    scanNow: 'Analyser tous les dossiers maintenant',
    hiddenFiles: 'Fichiers cach\u00e9s',
    showHiddenFiles: 'Afficher les fichiers cach\u00e9s',
    hiddenFilesDesc: 'Les fichiers cach\u00e9s commencent g\u00e9n\u00e9ralement par un point (ex. : .DS_Store). Activez seulement si n\u00e9cessaire.',
    supportedFormats: 'Formats pris en charge',
    unsupportedFormat: 'Format non pris en charge ?',
    letUsKnow: 'Faites-nous savoir',
    storageUsage: 'Utilisation du stockage',
    // ── Playback / Equalizer ──
    equalizer: '\u00c9galiseur',
    preset: 'Pr\u00e9r\u00e9glage',
    playbackOptions: 'Options de lecture',
    crossfade: 'Fondu encha\u00een\u00e9',
    crossfadeDesc: 'Transition fluide entre les pistes',
    gapless: 'Lecture sans interruption',
    gaplessDesc: 'Pas de silence entre les pistes cons\u00e9cutives',
    normalization: 'Normalisation',
    normalizationDesc: 'Ajuster le volume \u00e0 un niveau constant',
    sleepTimer: 'Minuteur',
    off: 'D\u00e9sactiv\u00e9',
    min: 'min',
    hour: 'heure',
    endOfTrack: 'Fin de piste',
    cancelTimer: 'Annuler le minuteur',
    // ── About ──
    version: 'Version',
    whatsNew: 'Nouveaut\u00e9s',
    privacyPolicy: 'Politique de confidentialit\u00e9',
    termsOfService: "Conditions d'utilisation",
    ossLicenses: 'Licences Open Source',
    madeWith: "Fait avec \u2665 par l'\u00e9quipe ClarkPlayer",
    // ── Navigation ──
    browseGenres: 'Parcourir par genre',
    yourPlaylists: 'Vos playlists',
    newPlaylist: 'Nouvelle playlist',
    sort: 'Trier',
    tracks: 'pistes',
    updated: 'Mis \u00e0 jour',
    noTracksInQueue: 'Aucune piste dans la file',
    browseTracks: 'Parcourez les pistes pour commencer \u00e0 \u00e9couter',
    nowPlaying: 'En cours de lecture',
    queue: "File d'attente",
    createPlaylist: 'Cr\u00e9er une playlist',
    publicLabel: 'Publique',
    privateLabel: 'Priv\u00e9e',
    nameLabel: 'Nom',
    descriptionOptional: 'Description (facultative)',
    descriptionPlaceholder: 'De quoi parle cette playlist ?',
    loginAccount: 'Connexion',
    signOut: 'D\u00e9connexion',
    signIn: 'Connexion',
    home: 'Accueil',
    allTracks: 'Toutes les pistes',
    library: 'Biblioth\u00e8que',
    playlists: 'Playlists',
    artists: 'Artistes',
    genres: 'Genres',
    search: 'Rechercher',
    settingsNav: 'Param\u00e8tres',
    // ── AppShell / player bar ──
    mainNavigation: 'Navigation principale',
    openSidebar: 'Ouvrir la barre lat\u00e9rale',
    closeSidebar: 'Fermer la barre lat\u00e9rale',
    closePanel: 'Fermer le panneau',
    hidePlayer: 'Cacher le lecteur',
    showPlayer: 'Afficher le lecteur',
    toggleFavorite: 'Basculer favori',
    toggleShuffle: 'Basculer al\u00e9atoire',
    previousTrack: 'Piste pr\u00e9c\u00e9dente',
    nextTrack: 'Piste suivante',
    playBtn: 'Lire',
    pauseBtn: 'Pause',
    toggleRepeat: 'Basculer r\u00e9p\u00e9tition',
    volumeLabel: 'Volume',
    lyricsBtn: 'Paroles',
    sleepBtn: 'Sommeil',
    openNowPlayingPanel: 'Ouvrir le panneau de lecture',
    closeNowPlayingPanel: 'Fermer le panneau de lecture',
    closeNavigation: 'Fermer la navigation',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Bienvenue sur ClarkPlayer',
    fortressOfSound: 'Votre Forteresse Sonore est pr\u00eate. Parcourez votre biblioth\u00e8que, cr\u00e9ez des playlists et laissez la musique s\u2019envoler.',
    recentlyPlayed: '\u00c9cout\u00e9s R\u00e9cemment',
    // ── All Tracks ──
    titleColumn: 'Titre',
    albumColumn: 'Album',
    durationColumn: 'Dur\u00e9e',
    formatColumn: 'Format',
    selectAction: 'S\u00e9lectionner',
    songsLabel: 'chansons',
    addToPlaylist: 'Ajouter \u00e0 la playlist',
    deleteAction: 'Supprimer',
    cancelAction: 'Annuler',
    dateAdded: "Date d'ajout",
    artistColumn: 'Artiste',
    sortAction: 'Trier',
    selectedLabel: 's\u00e9lectionn\u00e9es',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Total de pistes',
    favorites: 'Favorites',
    totalDuration: 'Dur\u00e9e totale',
    libraryOverview: "Aper\u00e7u de la biblioth\u00e8que \u00e0 venir.",
    libraryOverviewBrowse: 'Parcourir',
    libraryOverviewOr: 'ou',
    signInToViewLibrary: 'Connectez-vous pour voir votre bibliothèque',
    signInToViewLibraryDesc: 'Créez un compte ou connectez-vous pour commencer à bâtir votre collection musicale. Vos pistes, playlists et statistiques se trouvent ici.',
    loadingLibrary: 'Chargement de la bibliothèque\u2026',
    noTracksYet: 'Aucune piste pour le moment',
    startUploading: 'Commencez à télécharger de la musique pour donner vie à votre bibliothèque.',
    // ── Playlists list ──
    sortLabel: 'Trier :',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'R\u00e9cemment Mises \u00e0 Jour',
    sortMostPlayed: 'Les Plus \u00c9cout\u00e9es',
    sortDateCreated: 'Date de Cr\u00e9ation',
    // ── Playlist detail ──
    playAction: 'Lire',
    shuffleAction: 'Al\u00e9atoire',
    shareAction: 'Partager',
    exportJSON: 'Exporter en JSON',
    exportM3U8: 'Exporter en M3U8',
    collaborativeLabel: 'Collaborative',
    addTracks: 'Ajouter des pistes',
    searchInPlaylist: 'Rechercher dans la playlist\u2026',
    moreOptions: "Plus d'options",
    // ── Artists list ──
    albumSingular: 'album',
    albumPlural: 'albums',
    // ── Artist detail ──
    verifiedArtist: 'Artiste V\u00e9rifi\u00e9',
    followAction: 'Suivre',
    topTracks: 'Meilleures Pistes',
    discography: 'Discographie',
    filterAll: 'Tout',
    filterAlbums: 'Albums',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: 'Artistes Similaires',
    showFullLyrics: 'Afficher toutes les paroles',
    aboutLabel: '\u00c0 propos',
    keyLabel: 'Tonalit\u00e9',
    valenceLabel: 'Valence',
    acousticnessLabel: 'Acoustique',
    instrumentalnessLabel: 'Instrumentalit\u00e9',
    livenessLabel: 'Direct',
    speechinessLabel: 'Parole',
    // ── Genres ──
    browseByGenre: 'Parcourir par Genre',
    // ── Search ──
    searchPlaceholder: 'Rechercher pistes, artistes, playlists\u2026',
    tracksTab: 'Pistes',
    artistsTab: 'Artistes',
    playlistsTab: 'Playlists',
    startTyping: 'Commencez \u00e0 taper pour rechercher dans votre biblioth\u00e8que',
    noTracksFound: 'Aucune piste trouv\u00e9e pour',
    noArtistsFound: 'Aucun artiste trouv\u00e9 pour',
    noPlaylistsFound: 'Aucune playlist trouv\u00e9e pour',
    searchAcrossWeb: 'Rechercher sur le Web',
    searchAcrossWebDesc: 'D\u00e9couvrez de la musique gr\u00e2ce aux plus grandes bases de donn\u00e9es mondiales. Propuls\u00e9 par MusicBrainz, Spotify, iTunes, Genius et Last.fm.',
    searchGlobalPlaceholder: 'Rechercher des chansons, albums ou artistes\u2026',
    searchingLabel: 'Recherche en cours\u2026',
    searchErrorLabel: '\u00c9chec de la recherche. Veuillez r\u00e9essayer.',
    popularityLabel: 'Popularit\u00e9',
    playcountLabel: '\u00c9coutes',
    bpmLabel: 'BPM',
    energyLabel: '\u00c9nergie',
    danceabilityLabel: 'Dansabilit\u00e9',
    previewLabel: 'Aper\u00e7u',
    noPreviewLabel: 'Aper\u00e7u non disponible',
    playPreview: '\u00c9couter l\u2019Aper\u00e7u',
    previewAvailable: 'Aper\u00e7u Disponible',
    discoverNewMusic: 'D\u00e9couvrez de la Musique',
    popularArtists: 'Artistes Populaires',
    newReleases: 'Nouveaut\u00e9s',
    lyricsLabel: 'Paroles',
    similarTracksLabel: 'Pistes Similaires',
    audioFeaturesLabel: 'Caract\u00e9ristiques Audio',
    // ── Empty / Fallback states ──
    noTrackPlaying: 'Aucune musique en lecture',
    noTracksInPlaylist: 'Aucune piste dans cette liste pour le moment',
    noTracksInPlaylistDesc: 'Recherchez des pistes et ajoutez-les \u00e0 cette liste.',
    noPreviewTracksFor: 'Aucune piste d\u0027aper\u00e7u trouv\u00e9e pour',
    goToSearch: 'Aller \u00e0 la Recherche',
    searchUnavailable: 'Recherche indisponible. Veuillez r\u00e9essayer.',
    noTracksOrAlbums: 'Aucune piste ou album trouv\u00e9 pour cet artiste dans le catalogue pour le moment.',
    noTracksFoundForAlbum: 'Aucune piste trouv\u00e9e pour cet album.',
    albumCover: 'Pochette d\u0027album',
    trackProgress: 'Progression du morceau',
    previewTracks: 'Aper\u00e7u des Pistes',
    tracksWithPreview: 'pistes avec aper\u00e7u',
    allRightsReserved: 'Tous droits r\u00e9serv\u00e9s.',
    contactLink: 'Contact',
    agreeTermsPart1: 'J\u0027ai lu les',
    agreeTermsPart2: 'et j\u0027accepte.',
    andLowercase: 'et',
    // ── Privacy Policy Page ──
    legalLabel: 'L\u00e9gal',
    privacyTitle: 'Confidentialit\u00e9',
    policyAccent: 'Politique',
    privacySubtitle: 'Comment ClarkPlayer collecte, utilise et prot\u00e8ge vos donn\u00e9es. Conformit\u00e9 totale avec la LGPD.',
    ppNavIntro: 'Introduction',
    ppNavData: 'Donn\u00e9es',
    ppNavUsage: 'Utilisation',
    ppNavCookies: 'Cookies',
    ppNavSecurity: 'S\u00e9curit\u00e9',
    ppNavLgpdRights: 'Droits LGPD',
    ppNavTerms: 'Conditions',
    ppS1Title: '1. Introduction',
    ppS1Body: 'ClarkPlayer est une plateforme de streaming musical qui offre des exp\u00e9riences musicales personnalis\u00e9es, la d\u00e9couverte dartistes et des recommandations intelligentes. Pour fournir ces fonctionnalit\u00e9s, nous traitons certaines donn\u00e9es personnelles avec transparence et respect.\n\nCette politique explique quelles donn\u00e9es nous collectons, pourquoi nous les collectons, comment nous les utilisons et vos droits en vertu de la loi br\u00e9silienne sur la protection des donn\u00e9es (LGPD \u2014 Lei 13.709/2018).',
    ppS2Title: '2. Donn\u00e9es que Nous Collectons',
    ppS2AccountTitle: 'Donn\u00e9es du Compte',
    ppS2AccountBody: 'Lorsque vous cr\u00e9ez un compte ou vous connectez via Google OAuth, nous collectons votre nom, adresse e-mail et image davatar pour vous identifier et personnaliser votre exp\u00e9rience.',
    ppS2UsageTitle: 'Donn\u00e9es dUtilisation',
    ppS2UsageBody: 'Nous suivons les pistes \u00e9cout\u00e9es, les artistes et albums visit\u00e9s, les recherches effectu\u00e9es, les favoris sauvegard\u00e9s et les playlists cr\u00e9\u00e9es. Ces donn\u00e9es alimentent notre moteur de recommandation et am\u00e9liorent votre exp\u00e9rience de d\u00e9couverte.',
    ppS2TechnicalTitle: 'Donn\u00e9es Techniques',
    ppS2TechnicalBody: 'Le type de navigateur, syst\u00e8me dexploitation, informations sur lappareil, journaux dacc\u00e8s, mesures de performance et pr\u00e9f\u00e9rences dinterface (th\u00e8me, langue, minuteur) sont collect\u00e9s pour garantir la stabilit\u00e9 et la s\u00e9curit\u00e9 de la plateforme.',
    ppS3Title: '3. Comment Nous Utilisons Vos Donn\u00e9es',
    ppS3Body: 'Personnalisation \u2014 Adapter les recommandations musicales, suggestions de genre et d\u00e9couvertes dartistes en fonction de votre historique d\u00e9coute.\nAuthentification \u2014 Vous identifier en toute s\u00e9curit\u00e9 et prot\u00e9ger votre compte.\nPerformance \u2014 Surveiller et am\u00e9liorer la vitesse, la stabilit\u00e9 et la fiabilit\u00e9 de la plateforme.\nS\u00e9curit\u00e9 \u2014 D\u00e9tecter et pr\u00e9venir les fraudes, abus et acc\u00e8s non autoris\u00e9s.\nConformit\u00e9 L\u00e9gale \u2014 R\u00e9pondre aux obligations r\u00e9glementaires selon la LGPD et les lois applicables.',
    ppS4Title: '4. Partage des Donn\u00e9es',
    ppS4NeverSell: 'Nous ne vendons jamais vos donn\u00e9es personnelles.',
    ppS4Body: 'Fournisseurs dAuthentification \u2014 Google OAuth pour une connexion s\u00e9curis\u00e9e.\nInfrastructure \u2014 H\u00e9bergement (Vercel, Render), base de donn\u00e9es (Neon PostgreSQL), cache (Redis).\nObligation L\u00e9gale \u2014 Lorsque requis par la loi ou une ordonnance judiciaire.',
    ppS5Title: '5. Cookies et Stockage Local',
    ppS5Body: 'Authentification \u2014 Jetons JWT stock\u00e9s en toute s\u00e9curit\u00e9 pour vous maintenir connect\u00e9.\nPr\u00e9f\u00e9rences \u2014 Th\u00e8me (sombre/clair), langue, param\u00e8tres du minuteur.\nCache \u2014 Donn\u00e9es du catalogue musical mises en cache localement pour la vitesse et la r\u00e9silience hors ligne.',
    ppS5ClearData: 'Vous pouvez effacer ces donn\u00e9es \u00e0 tout moment via les param\u00e8tres de votre navigateur ou en vous d\u00e9connectant.',
    ppS6Title: '6. S\u00e9curit\u00e9',
    ppS6Body: 'Nous mettons en \u0153uvre des mesures de s\u00e9curit\u00e9 conformes aux normes de lindustrie :',
    ppS6Items: 'HTTPS \u2014 Toutes les communications sont chiffr\u00e9es en transit.\nAuthentification JWT \u2014 Jetons avec des dur\u00e9es dexpiration courtes.\nHachage des Mots de Passe \u2014 Les mots de passe ne sont jamais stock\u00e9s en texte clair.\nLimitation de D\u00e9bit \u2014 Protection contre les attaques par force brute.\nSurveillance \u2014 Surveillance continue de la s\u00e9curit\u00e9 et r\u00e9ponse aux incidents.',
    ppS7Title: '7. Vos Droits LGPD',
    ppS7Intro: 'Selon la loi br\u00e9silienne (LGPD), vous avez le droit de :',
    ppS7Items: 'Acc\u00e8s \u2014 Demander une copie de toutes les donn\u00e9es personnelles que nous d\u00e9tenons sur vous.\nCorrection \u2014 Mettre \u00e0 jour des donn\u00e9es incompl\u00e8tes ou inexactes.\nSuppression \u2014 Demander la suppression permanente de votre compte et de vos donn\u00e9es.\nPortabilit\u00e9 \u2014 Exporter vos donn\u00e9es dans un format structur\u00e9 et lisible par machine (JSON).\nR\u00e9vocation du Consentement \u2014 Retirer votre consentement \u00e0 tout moment.\nInformation \u2014 Savoir avec quelles entit\u00e9s vos donn\u00e9es sont partag\u00e9es.',
    ppS8Title: '8. Suppression de Compte',
    ppS8Body: 'Vous pouvez supprimer votre compte \u00e0 tout moment. Ce processus :',
    ppS8Steps: 'Marque votre compte pour suppression\nSupprime les identifiants personnels (nom, e-mail, avatar)\nAnonymise lhistorique d\u00e9coute et les donn\u00e9es comportementales\nConserve les donn\u00e9es anonymis\u00e9es uniquement pour les analyses agr\u00e9g\u00e9es',
    ppS8DeletePath: 'Pour supprimer votre compte, allez dans Param\u00e8tres \u2192 Compte \u2192 Supprimer le compte ou contactez-nous directement.',
    ppS9Title: '9. Conservation des Donn\u00e9es',
    ppS9Body: 'Les donn\u00e9es personnelles ne sont conserv\u00e9es que pendant que votre compte est actif. Les sessions expir\u00e9es, les anciens journaux et les entr\u00e9es de cache obsol\u00e8tes sont automatiquement purg\u00e9s. Apr\u00e8s la suppression du compte, les donn\u00e9es r\u00e9siduelles sont supprim\u00e9es dans un d\u00e9lai de 30 jours.',
    ppS10Title: '10. Conditions dUtilisation',
    ppS10Body: 'En utilisant ClarkPlayer, vous acceptez ces conditions. Si vous n\u00eates pas daccord, veuillez cesser dutiliser la plateforme imm\u00e9diatement.',
    ppS10PermittedUse: 'Utilisation Autoris\u00e9e',
    ppS10PermittedUseBody: 'ClarkPlayer est une plateforme personnelle de streaming et de d\u00e9couverte musicale. Vous pouvez naviguer, rechercher, \u00e9couter des aper\u00e7us, cr\u00e9er des playlists et g\u00e9rer votre biblioth\u00e8que musicale.',
    ppS10UserResp: 'Responsabilit\u00e9s de lUtilisateur',
    ppS10UserRespBody: 'Vous \u00eates responsable du maintien de la confidentialit\u00e9 de vos identifiants de compte et de toute activit\u00e9 sous votre compte. Vous acceptez de fournir des informations dinscription pr\u00e9cises.',
    ppS10Prohibited: 'Conduites Interdites',
    ppS10ProhibitedItems: 'Extraction automatis\u00e9e de donn\u00e9es (scraping, crawling)\nAcc\u00e8s non autoris\u00e9 \u00e0 lAPI ou ing\u00e9nierie inverse\nUtilisation abusive des URL daper\u00e7u ou t\u00e9l\u00e9chargement de contenu\nTentative de contournement des mesures de s\u00e9curit\u00e9\nUtilisation de la plateforme pour des activit\u00e9s ill\u00e9gales\nHarc\u00e8lement ou usurpation didentit\u00e9 dautres utilisateurs',
    ppS10IP: 'Propri\u00e9t\u00e9 Intellectuelle',
    ppS10IPBody: 'Tout le contenu musical, les aper\u00e7us et les illustrations sont la propri\u00e9t\u00e9 de leurs d\u00e9tenteurs respectifs (Apple/iTunes, Spotify, labels). ClarkPlayer fournit uniquement des aper\u00e7us de d\u00e9couverte et de streaming \u2014 aucun contenu nest h\u00e9berg\u00e9 ou redistribu\u00e9.',
    ppS10Liability: 'Limitation de Responsabilit\u00e9',
    ppS10LiabilityBody: 'ClarkPlayer est fourni "tel quel" sans garanties. Nous ne sommes pas responsables des dommages r\u00e9sultant de lutilisation ou de limpossibilit\u00e9 dutiliser la plateforme.',
    ppS10Changes: 'Modifications des Conditions',
    ppS10ChangesBody: 'Nous pouvons mettre \u00e0 jour ces conditions. Lutilisation continue apr\u00e8s les modifications constitue une acceptation. Les changements importants seront notifi\u00e9s via la plateforme.',
    ppS11Title: '11. Contact',
    ppS11Body: 'Pour les demandes li\u00e9es \u00e0 la confidentialit\u00e9, les demandes de donn\u00e9es ou pour exercer vos droits LGPD, contactez :',
    ppContactEmail: 'privacy@clarkplayer.app',
    ppLastUpdated: 'Derni\u00e8re mise \u00e0 jour : 18 juin 2026 \u2014 Version 1.0',

    // ── Section titles ──
    trendingNow: 'Tendances',
    topArtists: 'Artistes Populaires',
    brazilian: 'Br\u00e9siliens',
    discover: 'D\u00e9couvrir',
    // ── Error messages ──
    couldNotLoadDiscovery: 'Impossible de charger les donn\u00e9es de d\u00e9couverte.',
    tryRefreshing: 'Essayez d\u0027actualiser la page.',
    couldNotLoadGenres: 'Impossible de charger les genres',
    couldNotLoadAlbum: 'Impossible de charger l\u0027album',
    couldNotLoadArtist: 'Impossible de charger l\u0027artiste',
    unexpectedErrorGenres: 'Une erreur inattendue est survenue lors du chargement des genres.',
    unexpectedErrorAlbum: 'Une erreur inattendue est survenue lors du chargement de cet album.',
    unexpectedErrorArtist: 'Une erreur inattendue est survenue lors du chargement de cet artiste.',
    backendUnreachable: 'Le serveur est inaccessible. V\u00e9rifiez votre connexion et r\u00e9essayez.',
    retry: 'R\u00e9essayer',
    backToArtists: 'Retour aux Artistes',
    backToGenres: 'Retour aux Genres',
    artistNotInCatalog: "Cet artiste n'est pas encore dans notre catalogue.",
    // ── Account ──
    myAccount: 'Mon Compte',
    profileInformation: 'Informations du Profil',
    displayName: "Nom d'affichage",
    emailLabel: 'E-mail',
    bioLabel: 'Bio',
    saveChanges: 'Enregistrer les modifications',
    linkedAccounts: 'Comptes Li\u00e9s',
    connectedLabel: 'Connect\u00e9',
    disconnectAction: 'D\u00e9connecter',
    dangerZone: 'Zone de Danger',
    dangerZoneDesc: 'Une fois votre compte supprim\u00e9, il n\u2019y a pas de retour possible. Soyez certain.',
    deleteAccount: 'Supprimer le compte',
    deleteConfirmTitle: 'Supprimer le Compte',
    deleteConfirmDesc: 'Cette action est permanente. Pour confirmer, tapez SUPPRIMER ci-dessous.',
    typeDeleteConfirm: 'Tapez SUPPRIMER pour confirmer',
    deleting: 'Suppression\u2026',
    free: 'Gratuit',
    googleAccountLinked: 'Compte Google li\u00e9',
    editPhoto: 'Modifier la photo',
    // ── Auth / Login ──
    welcomeBack: 'Bon retour',
    signInToContinue: 'Connectez-vous pour acc\u00e9der \u00e0 votre biblioth\u00e8que',
    continueWithGoogle: 'Continuer avec Google',
    orDivider: 'ou',
    passwordLabel: 'Mot de passe',
    forgotPassword: 'Mot de passe oubli\u00e9 ?',
    signingIn: 'Connexion\u2026',
    lockedLabel: 'Verrouill\u00e9',
    noAccount: 'Pas de compte ?',
    signUp: "S'inscrire",
    accountCreatedBanner: 'Compte cr\u00e9\u00e9 avec succ\u00e8s ! Connectez-vous.',
    accountLocked: 'Compte Temporairement Verrouill\u00e9',
    tooManyAttempts: 'Trop de tentatives de connexion. R\u00e9essayez dans',
    attemptsRemaining: 'tentatives restantes avant le verrouillage temporaire',
    wrongCredentials: 'E-mail ou mot de passe incorrect. R\u00e9essayez.',
    accessDeniedGoogle: 'Vous avez refus\u00e9 la connexion Google. R\u00e9essayez.',
    authFailedGoogle: '\u00c9chec de la connexion Google. R\u00e9essayez.',
    authFailed: "\u00c9chec de l'authentification. R\u00e9essayez.",
    closeLoginPage: 'Fermer la page de connexion',
    // ── Branding / Tagline ──
    clarkTagline: 'Clark de Nom. Super par Nature.',
    // ── Register ──
    createYourAccount: 'Cr\u00e9ez votre compte',
    joinClarkPlayer: 'Rejoignez ClarkPlayer et commencez \u00e0 b\u00e2tir votre biblioth\u00e8que',
    fullName: 'Nom complet',
    confirmPassword: 'Confirmer le mot de passe',
    agreeTerms: "J'accepte les Conditions d'Utilisation et la Politique de Confidentialit\u00e9",
    createAccount: 'Cr\u00e9er un compte',
    creatingAccount: 'Cr\u00e9ation du compte\u2026',
    alreadyHaveAccount: 'Vous avez d\u00e9j\u00e0 un compte ?',
    weak: 'Faible',
    fair: 'Moyen',
    strong: 'Fort',
    accountCreated: 'Compte cr\u00e9\u00e9 !',
    redirectingSignIn: 'Redirection vers la connexion\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: 'Mot de passe oubli\u00e9 ?',
    forgotPasswordDesc: 'Entrez votre adresse e-mail et nous vous enverrons un lien de r\u00e9initialisation.',
    checkInbox: 'V\u00e9rifiez votre bo\u00eete de r\u00e9ception',
    resetLinkSent: 'Nous avons envoy\u00e9 un lien de r\u00e9initialisation \u00e0',
    clickLinkToReset: 'Cliquez sur le lien dans l\u2019e-mail pour r\u00e9initialiser votre mot de passe.',
    backToLogin: 'Retour \u00e0 la connexion',
    sendResetLink: 'Envoyer le lien de r\u00e9initialisation',
    sending: 'Envoi\u2026',
    // ── Reset Password ──
    resetPassword: 'R\u00e9initialiser le mot de passe',
    newPassword: 'Nouveau mot de passe',
    resetPasswordBtn: 'R\u00e9initialiser le mot de passe',
    passwordResetComplete: 'Mot de passe r\u00e9initialis\u00e9',
    passwordUpdated: 'Votre mot de passe a \u00e9t\u00e9 mis \u00e0 jour. Vous pouvez maintenant vous connecter.',
    invalidResetLink: 'Lien invalide',
    invalidResetLinkDesc: 'Ce lien de r\u00e9initialisation est invalide ou a expir\u00e9. Veuillez en demander un nouveau.',
    enterNewPassword: 'Entrez votre nouveau mot de passe ci-dessous.',
    goToSignIn: 'Aller \u00e0 la connexion',
    // ── Verify Email ──
    verifying: 'V\u00e9rification\u2026',
    emailVerified: 'E-mail V\u00e9rifi\u00e9',
    verificationFailed: '\u00c9chec de la V\u00e9rification',
    verificationTokenMissing: 'Jeton de v\u00e9rification manquant. V\u00e9rifiez le lien dans votre e-mail.',
    emailVerifiedMessage: 'Votre e-mail a \u00e9t\u00e9 v\u00e9rifi\u00e9 ! Vous pouvez maintenant vous connecter.',
    verificationFailedMessage: 'La v\u00e9rification a \u00e9chou\u00e9. Le jeton a peut-\u00eatre expir\u00e9. Veuillez en demander un nouveau.',
    // ── Google Callback ──
    signingInGoogle: 'Connexion avec Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'D\u00e9posez une image ou cliquez pour t\u00e9l\u00e9charger',
    pngJpgLimit: 'PNG, JPG jusqu\u2019\u00e0 5 Mo',
    playlistNamePlaceholder: 'Ma Playlist',
    playlistCoverPreview: 'Aper\u00e7u de la pochette',
    togglePrivacy: 'Basculer la confidentialit\u00e9',
    changeCoverImage: "Changer l'image",
    removeCoverImage: "Supprimer l'image",
    chooseFromDrive: 'Choisir depuis Google Drive',
    loadingDrive: 'Chargement de Drive\u2026',
    // ── TrackRow ──
    addToFavorites: 'Ajouter aux favoris',
    unfavorite: 'Retirer des favoris',
    selectTrack: 'S\u00e9lectionner',
    currentlyPlaying: 'En cours de lecture',
  } satisfies TranslationMap,

  de: {
    // ── Settings tab labels ──
    settings: 'Einstellungen',
    appearance: 'Erscheinungsbild',
    language: 'Sprache',
    libraryFiles: 'Bibliothek & Dateien',
    playback: 'Wiedergabe',
    about: '\u00dcber',
    // ── Appearance ──
    theme: 'Design',
    dark: 'Dunkel',
    light: 'Hell',
    midnight: 'Mitternacht',
    accentColor: 'Akzentfarbe',
    fontSize: 'Schriftgr\u00f6\u00dfe',
    small: 'Klein',
    default: 'Standard',
    large: 'Gro\u00df',
    boldMode: 'Fettmodus',
    boldModeDesc: 'Fettschrift in der gesamten Oberfl\u00e4che aktivieren.',
    // ── Language / Region ──
    dateTimeFormat: 'Datums- und Zeitformat',
    dateFormat: 'Datumsformat',
    timeFormat: 'Zeitformat',
    translationContributors: '\u00dcbersetzungsmitwirkende',
    translationThanks: 'Dank an unsere Community-\u00dcbersetzer: Maria S., Jo\u00e3o P., Yuki T., Ahmed K. und andere.',
    languageLabel: 'Sprache',
    // ── Library / Files ──
    folderScanning: 'Ordnerscan',
    scanNow: 'Alle Ordner jetzt scannen',
    hiddenFiles: 'Versteckte Dateien',
    showHiddenFiles: 'Versteckte Dateien anzeigen',
    hiddenFilesDesc: 'Versteckte Dateien beginnen meist mit einem Punkt (z.B. .DS_Store). Nur aktivieren wenn n\u00f6tig.',
    supportedFormats: 'Unterst\u00fctzte Formate',
    unsupportedFormat: 'Nicht unterst\u00fctztes Format?',
    letUsKnow: 'Teilen Sie uns mit',
    storageUsage: 'Speichernutzung',
    // ── Playback / Equalizer ──
    equalizer: 'Equalizer',
    preset: 'Voreinstellung',
    playbackOptions: 'Wiedergabeoptionen',
    crossfade: '\u00dcberblendung',
    crossfadeDesc: 'Sanfter \u00dcbergang zwischen Titeln',
    gapless: 'Nahtlose Wiedergabe',
    gaplessDesc: 'Keine Stille zwischen aufeinanderfolgenden Titeln',
    normalization: 'Normalisierung',
    normalizationDesc: 'Lautst\u00e4rke auf ein gleichm\u00e4\u00dfiges Niveau anpassen',
    sleepTimer: 'Schlaftimer',
    off: 'Aus',
    min: 'Min.',
    hour: 'Stunde',
    endOfTrack: 'Titelende',
    cancelTimer: 'Timer abbrechen',
    // ── About ──
    version: 'Version',
    whatsNew: 'Neuerungen',
    privacyPolicy: 'Datenschutz',
    termsOfService: 'Nutzungsbedingungen',
    ossLicenses: 'Open-Source-Lizenzen',
    madeWith: 'Mit \u2665 gemacht vom ClarkPlayer-Team',
    // ── Navigation ──
    browseGenres: 'Nach Genre durchsuchen',
    yourPlaylists: 'Deine Playlists',
    newPlaylist: 'Neue Playlist',
    sort: 'Sortieren',
    tracks: 'Titel',
    updated: 'Aktualisiert',
    noTracksInQueue: 'Keine Titel in der Warteschlange',
    browseTracks: 'Durchst\u00f6bere Titel und beginne zu h\u00f6ren',
    nowPlaying: 'Aktuelle Wiedergabe',
    queue: 'Warteschlange',
    createPlaylist: 'Playlist erstellen',
    publicLabel: '\u00d6ffentlich',
    privateLabel: 'Privat',
    nameLabel: 'Name',
    descriptionOptional: 'Beschreibung (optional)',
    descriptionPlaceholder: 'Worum geht es in dieser Playlist?',
    loginAccount: 'Anmelden',
    signOut: 'Abmelden',
    signIn: 'Anmelden',
    home: 'Start',
    allTracks: 'Alle Titel',
    library: 'Bibliothek',
    playlists: 'Playlists',
    artists: 'K\u00fcnstler',
    genres: 'Genres',
    search: 'Suche',
    settingsNav: 'Einstellungen',
    // ── AppShell / player bar ──
    mainNavigation: 'Hauptnavigation',
    openSidebar: 'Seitenleiste \u00f6ffnen',
    closeSidebar: 'Seitenleiste schlie\u00dfen',
    closePanel: 'Panel schlie\u00dfen',
    hidePlayer: 'Player ausblenden',
    showPlayer: 'Player einblenden',
    toggleFavorite: 'Favorit umschalten',
    toggleShuffle: 'Zufallswiedergabe umschalten',
    previousTrack: 'Vorheriger Titel',
    nextTrack: 'N\u00e4chster Titel',
    playBtn: 'Abspielen',
    pauseBtn: 'Pause',
    toggleRepeat: 'Wiederholung umschalten',
    volumeLabel: 'Lautst\u00e4rke',
    lyricsBtn: 'Liedtexte',
    sleepBtn: 'Schlafen',
    openNowPlayingPanel: 'Wiedergabe-Panel \u00f6ffnen',
    closeNowPlayingPanel: 'Wiedergabe-Panel schlie\u00dfen',
    closeNavigation: 'Navigation schlie\u00dfen',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Willkommen bei ClarkPlayer',
    fortressOfSound: 'Deine Klangfestung ist bereit. Durchst\u00f6bere deine Bibliothek, erstelle Playlists und lass die Musik fliegen.',
    recentlyPlayed: 'K\u00fcrzlich gespielt',
    // ── All Tracks ──
    titleColumn: 'Titel',
    albumColumn: 'Album',
    durationColumn: 'Dauer',
    formatColumn: 'Format',
    selectAction: 'Ausw\u00e4hlen',
    songsLabel: 'Lieder',
    addToPlaylist: 'Zur Playlist hinzuf\u00fcgen',
    deleteAction: 'L\u00f6schen',
    cancelAction: 'Abbrechen',
    dateAdded: 'Hinzugef\u00fcgt am',
    artistColumn: 'K\u00fcnstler',
    sortAction: 'Sortieren',
    selectedLabel: 'ausgew\u00e4hlt',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Titel insgesamt',
    favorites: 'Favoriten',
    totalDuration: 'Gesamtdauer',
    libraryOverview: 'Bibliotheks\u00fcbersicht folgt in K\u00fcrze.',
    libraryOverviewBrowse: 'Durchsuchen',
    libraryOverviewOr: 'oder',
    signInToViewLibrary: 'Melde dich an, um deine Bibliothek zu sehen',
    signInToViewLibraryDesc: 'Erstelle ein Konto oder melde dich an, um deine Musiksammlung aufzubauen. Deine Titel, Playlists und Statistiken findest du hier.',
    loadingLibrary: 'Bibliothek wird geladen\u2026',
    noTracksYet: 'Noch keine Titel',
    startUploading: 'Lade Musik hoch, um deine Bibliothek zum Leben zu erwecken.',
    // ── Playlists list ──
    sortLabel: 'Sortieren:',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'K\u00fcrzlich aktualisiert',
    sortMostPlayed: 'Am h\u00e4ufigsten gespielt',
    sortDateCreated: 'Erstellungsdatum',
    // ── Playlist detail ──
    playAction: 'Abspielen',
    shuffleAction: 'Zufall',
    shareAction: 'Teilen',
    exportJSON: 'Als JSON exportieren',
    exportM3U8: 'Als M3U8 exportieren',
    collaborativeLabel: 'Kollaborativ',
    addTracks: 'Titel hinzuf\u00fcgen',
    searchInPlaylist: 'Titel in Playlist suchen\u2026',
    moreOptions: 'Weitere Optionen',
    // ── Artists list ──
    albumSingular: 'Album',
    albumPlural: 'Alben',
    // ── Artist detail ──
    verifiedArtist: 'Verifizierter K\u00fcnstler',
    followAction: 'Folgen',
    topTracks: 'Top-Titel',
    discography: 'Diskografie',
    filterAll: 'Alle',
    filterAlbums: 'Alben',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: '\u00c4hnliche K\u00fcnstler',
    showFullLyrics: 'Alle Songtexte anzeigen',
    aboutLabel: '\u00dcber',
    keyLabel: 'Tonart',
    valenceLabel: 'Valenz',
    acousticnessLabel: 'Akustik',
    instrumentalnessLabel: 'Instrumentalit\u00e4t',
    livenessLabel: 'Live',
    speechinessLabel: 'Sprachanteil',
    // ── Genres ──
    browseByGenre: 'Nach Genre durchsuchen',
    // ── Search ──
    searchPlaceholder: 'Titel, K\u00fcnstler, Playlists suchen\u2026',
    tracksTab: 'Titel',
    artistsTab: 'K\u00fcnstler',
    playlistsTab: 'Playlists',
    startTyping: 'Beginne zu tippen, um deine Bibliothek zu durchsuchen',
    noTracksFound: 'Keine Titel gefunden f\u00fcr',
    noArtistsFound: 'Keine K\u00fcnstler gefunden f\u00fcr',
    noPlaylistsFound: 'Keine Playlists gefunden f\u00fcr',
    searchAcrossWeb: 'Im Web suchen',
    searchAcrossWebDesc: 'Entdecke Musik aus den weltweit gr\u00f6\u00dften Datenbanken. Unterst\u00fctzt von MusicBrainz, Spotify, iTunes, Genius & Last.fm.',
    searchGlobalPlaceholder: 'Suche nach Songs, Alben oder K\u00fcnstlern\u2026',
    searchingLabel: 'Suche l\u00e4uft\u2026',
    searchErrorLabel: 'Suche fehlgeschlagen. Bitte versuche es erneut.',
    popularityLabel: 'Beliebtheit',
    playcountLabel: 'Wiedergaben',
    bpmLabel: 'BPM',
    energyLabel: 'Energie',
    danceabilityLabel: 'Tanzbarkeit',
    previewLabel: 'Vorschau',
    noPreviewLabel: 'Keine Vorschau verf\u00fcgbar',
    playPreview: 'Vorschau abspielen',
    previewAvailable: 'Vorschau Verf\u00fcgbar',
    discoverNewMusic: 'Neue Musik Entdecken',
    popularArtists: 'Beliebte K\u00fcnstler',
    newReleases: 'Neuerscheinungen',
    lyricsLabel: 'Songtext',
    similarTracksLabel: '\u00c4hnliche Titel',
    audioFeaturesLabel: 'Audio-Merkmale',
    // ── Empty / Fallback states ──
    noTrackPlaying: 'Kein Titel wird abgespielt',
    noTracksInPlaylist: 'Noch keine Titel in dieser Playlist',
    noTracksInPlaylistDesc: 'Suche nach Titeln und f\u00fcge sie dieser Playlist hinzu.',
    noPreviewTracksFor: 'Keine Vorschau-Titel gefunden f\u00fcr',
    goToSearch: 'Zur Suche gehen',
    searchUnavailable: 'Suche nicht verf\u00fcgbar. Bitte versuche es erneut.',
    noTracksOrAlbums: 'Noch keine Titel oder Alben f\u00fcr diesen K\u00fcnstler im Katalog gefunden.',
    noTracksFoundForAlbum: 'Keine Titel f\u00fcr dieses Album gefunden.',
    albumCover: 'Albumcover',
    trackProgress: 'Titel-Fortschritt',
    previewTracks: 'Vorschau-Titel',
    tracksWithPreview: 'Titel mit Vorschau',
    allRightsReserved: 'Alle Rechte vorbehalten.',
    contactLink: 'Kontakt',
    agreeTermsPart1: 'Ich habe die',
    agreeTermsPart2: 'gelesen und stimme zu.',
    andLowercase: 'und',
    // ── Privacy Policy Page ──
    legalLabel: 'Rechtliches',
    privacyTitle: 'Datenschutz',
    policyAccent: 'Richtlinie',
    privacySubtitle: 'Wie ClarkPlayer Ihre Daten sammelt, verwendet und sch\u00fctzt. Vollst\u00e4ndige LGPD-Konformit\u00e4t.',
    ppNavIntro: 'Einleitung',
    ppNavData: 'Daten',
    ppNavUsage: 'Nutzung',
    ppNavCookies: 'Cookies',
    ppNavSecurity: 'Sicherheit',
    ppNavLgpdRights: 'LGPD-Rechte',
    ppNavTerms: 'Bedingungen',
    ppS1Title: '1. Einleitung',
    ppS1Body: 'ClarkPlayer ist eine Musik-Streaming-Plattform, die personalisierte Musikerlebnisse, K\u00fcnstlerentdeckungen und intelligente Empfehlungen bietet. Um diese Funktionen bereitzustellen, verarbeiten wir bestimmte personenbezogene Daten mit Transparenz und Respekt.\n\nDiese Richtlinie erkl\u00e4rt, welche Daten wir sammeln, warum wir sie sammeln, wie wir sie verwenden und welche Rechte Sie gem\u00e4\u00df dem brasilianischen Datenschutzgesetz (LGPD \u2014 Lei 13.709/2018) haben.',
    ppS2Title: '2. Daten, die Wir Sammeln',
    ppS2AccountTitle: 'Kontodaten',
    ppS2AccountBody: 'Wenn Sie ein Konto erstellen oder sich \u00fcber Google OAuth anmelden, erfassen wir Ihren Namen, Ihre E-Mail-Adresse und Ihr Avatar-Bild, um Sie zu identifizieren und Ihr Erlebnis zu personalisieren.',
    ppS2UsageTitle: 'Nutzungsdaten',
    ppS2UsageBody: 'Wir verfolgen abgespielte Titel, besuchte K\u00fcnstler und Alben, durchgef\u00fchrte Suchen, gespeicherte Favoriten und erstellte Playlists. Diese Daten versorgen unsere Empfehlungsmaschine und verbessern Ihr Entdeckungserlebnis.',
    ppS2TechnicalTitle: 'Technische Daten',
    ppS2TechnicalBody: 'Browsertyp, Betriebssystem, Ger\u00e4teinformationen, Zugriffsprotokolle, Leistungskennzahlen und Oberfl\u00e4chenpr\u00e4ferenzen (Design, Sprache, Schlaftimer) werden erfasst, um die Stabilit\u00e4t und Sicherheit der Plattform zu gew\u00e4hrleisten.',
    ppS3Title: '3. Wie Wir Ihre Daten Verwenden',
    ppS3Body: 'Personalisierung \u2014 Musikempfehlungen, Genrevorschl\u00e4ge und K\u00fcnstlerentdeckungen basierend auf Ihrem H\u00f6rverlauf anpassen.\nAuthentifizierung \u2014 Sie sicher identifizieren und Ihr Konto sch\u00fctzen.\nLeistung \u2014 Geschwindigkeit, Stabilit\u00e4t und Zuverl\u00e4ssigkeit der Plattform \u00fcberwachen und verbessern.\nSicherheit \u2014 Betrug, Missbrauch und unbefugten Zugriff erkennen und verhindern.\nRechtliche Compliance \u2014 Regulatorische Verpflichtungen gem\u00e4\u00df LGPD und geltenden Gesetzen erf\u00fcllen.',
    ppS4Title: '4. Datenweitergabe',
    ppS4NeverSell: 'Wir verkaufen niemals Ihre pers\u00f6nlichen Daten.',
    ppS4Body: 'Authentifizierungsanbieter \u2014 Google OAuth f\u00fcr sichere Anmeldung.\nInfrastruktur \u2014 Hosting (Vercel, Render), Datenbank (Neon PostgreSQL), Cache (Redis).\nRechtliche Verpflichtung \u2014 Wenn gesetzlich oder gerichtlich vorgeschrieben.',
    ppS5Title: '5. Cookies und Lokaler Speicher',
    ppS5Body: 'Authentifizierung \u2014 JWT-Tokens sicher gespeichert, um Sie angemeldet zu halten.\nPr\u00e4ferenzen \u2014 Design (dunkel/hell), Sprache, Schlaftimer-Einstellungen.\nCache \u2014 Musikkatalogdaten lokal zwischengespeichert f\u00fcr Geschwindigkeit und Offline-Resilienz.',
    ppS5ClearData: 'Sie k\u00f6nnen diese Daten jederzeit \u00fcber Ihre Browsereinstellungen oder durch Abmelden l\u00f6schen.',
    ppS6Title: '6. Sicherheit',
    ppS6Body: 'Wir implementieren branchen\u00fcbliche Sicherheitsma\u00dfnahmen:',
    ppS6Items: 'HTTPS \u2014 Die gesamte Kommunikation ist w\u00e4hrend der \u00dcbertragung verschl\u00fcsselt.\nJWT-Authentifizierung \u2014 Tokens mit kurzer Ablaufzeit.\nPasswort-Hashing \u2014 Passw\u00f6rter werden niemals im Klartext gespeichert.\nRatenbegrenzung \u2014 Schutz vor Brute-Force-Angriffen.\n\u00dcberwachung \u2014 Kontinuierliche Sicherheits\u00fcberwachung und Vorfallreaktion.',
    ppS7Title: '7. Ihre LGPD-Rechte',
    ppS7Intro: 'Gem\u00e4\u00df dem brasilianischen Gesetz (LGPD) haben Sie das Recht auf:',
    ppS7Items: 'Auskunft \u2014 Eine Kopie aller personenbezogenen Daten anfordern, die wir \u00fcber Sie gespeichert haben.\nBerichtigung \u2014 Unvollst\u00e4ndige oder ungenaue Daten aktualisieren.\nL\u00f6schung \u2014 Dauerhafte L\u00f6schung Ihres Kontos und Ihrer Daten beantragen.\nDaten\u00fcbertragbarkeit \u2014 Ihre Daten in einem strukturierten, maschinenlesbaren Format exportieren (JSON).\nEinwilligungswiderruf \u2014 Einwilligung jederzeit widerrufen.\nInformation \u2014 Wissen, mit welchen Stellen Ihre Daten geteilt werden.',
    ppS8Title: '8. Kontol\u00f6schung',
    ppS8Body: 'Sie k\u00f6nnen Ihr Konto jederzeit l\u00f6schen. Dieser Prozess:',
    ppS8Steps: 'Markiert Ihr Konto zur L\u00f6schung\nEntfernt pers\u00f6nliche Identifikatoren (Name, E-Mail, Avatar)\nAnonymisiert H\u00f6rverlauf und Verhaltensdaten\nBeh\u00e4lt anonymisierte Daten nur f\u00fcr aggregierte Analysen',
    ppS8DeletePath: 'Um Ihr Konto zu l\u00f6schen, gehen Sie zu Einstellungen \u2192 Konto \u2192 Konto l\u00f6schen oder kontaktieren Sie uns direkt.',
    ppS9Title: '9. Datenspeicherung',
    ppS9Body: 'Personenbezogene Daten werden nur gespeichert, solange Ihr Konto aktiv ist. Abgelaufene Sitzungen, alte Protokolle und veraltete Cache-Eintr\u00e4ge werden automatisch gel\u00f6scht. Nach der Kontol\u00f6schung werden Restdaten innerhalb von 30 Tagen entfernt.',
    ppS10Title: '10. Nutzungsbedingungen',
    ppS10Body: 'Durch die Nutzung von ClarkPlayer stimmen Sie diesen Bedingungen zu. Wenn Sie nicht einverstanden sind, stellen Sie die Nutzung bitte sofort ein.',
    ppS10PermittedUse: 'Zul\u00e4ssige Nutzung',
    ppS10PermittedUseBody: 'ClarkPlayer ist eine pers\u00f6nliche Musik-Streaming- und Entdeckungsplattform. Sie k\u00f6nnen st\u00f6bern, suchen, Vorschauen abspielen, Playlists erstellen und Ihre Musikbibliothek verwalten.',
    ppS10UserResp: 'Benutzerverantwortung',
    ppS10UserRespBody: 'Sie sind f\u00fcr die Vertraulichkeit Ihrer Kontodaten und f\u00fcr alle Aktivit\u00e4ten unter Ihrem Konto verantwortlich. Sie stimmen zu, genaue Registrierungsinformationen bereitzustellen.',
    ppS10Prohibited: 'Verbotenes Verhalten',
    ppS10ProhibitedItems: 'Automatisierte Datenextraktion (Scraping, Crawling)\nUnbefugter API-Zugriff oder Reverse Engineering\nMissbrauch von Vorschau-URLs oder Herunterladen von Inhalten\nVersuch, Sicherheitsma\u00dfnahmen zu umgehen\nNutzung der Plattform f\u00fcr illegale Aktivit\u00e4ten\nBel\u00e4stigung oder Identit\u00e4tsdiebstahl anderer Benutzer',
    ppS10IP: 'Geistiges Eigentum',
    ppS10IPBody: 'Alle Musikinhalte, Vorschauen und Grafiken sind Eigentum ihrer jeweiligen Rechteinhaber (Apple/iTunes, Spotify, Plattenfirmen). ClarkPlayer bietet nur Entdeckung und Streaming-Vorschauen \u2014 es werden keine Inhalte gehostet oder weiterverteilt.',
    ppS10Liability: 'Haftungsbeschr\u00e4nkung',
    ppS10LiabilityBody: 'ClarkPlayer wird "wie besehen" ohne Gew\u00e4hrleistung bereitgestellt. Wir haften nicht f\u00fcr Sch\u00e4den, die aus der Nutzung oder der Unm\u00f6glichkeit der Nutzung der Plattform entstehen.',
    ppS10Changes: '\u00c4nderungen der Bedingungen',
    ppS10ChangesBody: 'Wir k\u00f6nnen diese Bedingungen aktualisieren. Die fortgesetzte Nutzung nach \u00c4nderungen stellt eine Annahme dar. Wesentliche \u00c4nderungen werden \u00fcber die Plattform mitgeteilt.',
    ppS11Title: '11. Kontakt',
    ppS11Body: 'F\u00fcr datenschutzbezogene Anfragen, Datenanfragen oder zur Aus\u00fcbung Ihrer LGPD-Rechte kontaktieren Sie:',
    ppContactEmail: 'privacy@clarkplayer.app',
    ppLastUpdated: 'Zuletzt aktualisiert: 18. Juni 2026 \u2014 Version 1.0',

    // ── Section titles ──
    trendingNow: 'Im Trend',
    topArtists: 'Top K\u00fcnstler',
    brazilian: 'Brasilianisch',
    discover: 'Entdecken',
    // ── Error messages ──
    couldNotLoadDiscovery: 'Entdeckungsdaten konnten nicht geladen werden.',
    tryRefreshing: 'Versuche, die Seite zu aktualisieren.',
    couldNotLoadGenres: 'Genres konnten nicht geladen werden',
    couldNotLoadAlbum: 'Album konnte nicht geladen werden',
    couldNotLoadArtist: 'K\u00fcnstler konnte nicht geladen werden',
    unexpectedErrorGenres: 'Beim Laden der Genres ist ein unerwarteter Fehler aufgetreten.',
    unexpectedErrorAlbum: 'Beim Laden dieses Albums ist ein unerwarteter Fehler aufgetreten.',
    unexpectedErrorArtist: 'Beim Laden dieses K\u00fcnstlers ist ein unerwarteter Fehler aufgetreten.',
    backendUnreachable: 'Der Server ist nicht erreichbar. Bitte \u00fcberpr\u00fcfe deine Verbindung und versuche es erneut.',
    retry: 'Erneut versuchen',
    backToArtists: 'Zur\u00fcck zu K\u00fcnstlern',
    backToGenres: 'Zur\u00fcck zu Genres',
    artistNotInCatalog: 'Dieser K\u00fcnstler ist noch nicht in unserem Katalog.',
    // ── Account ──
    myAccount: 'Mein Konto',
    profileInformation: 'Profilinformationen',
    displayName: 'Anzeigename',
    emailLabel: 'E-Mail',
    bioLabel: 'Bio',
    saveChanges: '\u00c4nderungen speichern',
    linkedAccounts: 'Verkn\u00fcpfte Konten',
    connectedLabel: 'Verbunden',
    disconnectAction: 'Trennen',
    dangerZone: 'Gefahrenzone',
    dangerZoneDesc: 'Wenn du dein Konto l\u00f6schst, gibt es kein Zur\u00fcck. Sei dir sicher.',
    deleteAccount: 'Konto l\u00f6schen',
    deleteConfirmTitle: 'Konto L\u00f6schen',
    deleteConfirmDesc: 'Diese Aktion ist endg\u00fcltig. Zur Best\u00e4tigung gib L\u00d6SCHEN ein.',
    typeDeleteConfirm: 'Gib L\u00d6SCHEN zur Best\u00e4tigung ein',
    deleting: 'Wird gel\u00f6scht\u2026',
    free: 'Kostenlos',
    googleAccountLinked: 'Google-Konto verkn\u00fcpft',
    editPhoto: 'Foto bearbeiten',
    // ── Auth / Login ──
    welcomeBack: 'Willkommen zur\u00fcck',
    signInToContinue: 'Melde dich an, um auf deine Bibliothek zuzugreifen',
    continueWithGoogle: 'Mit Google fortfahren',
    orDivider: 'oder',
    passwordLabel: 'Passwort',
    forgotPassword: 'Passwort vergessen?',
    signingIn: 'Anmeldung\u2026',
    lockedLabel: 'Gesperrt',
    noAccount: 'Noch kein Konto?',
    signUp: 'Registrieren',
    accountCreatedBanner: 'Konto erfolgreich erstellt! Bitte anmelden.',
    accountLocked: 'Konto Vor\u00fcbergehend Gesperrt',
    tooManyAttempts: 'Zu viele fehlgeschlagene Anmeldeversuche. Versuche es erneut in',
    attemptsRemaining: 'Versuche verbleibend vor vor\u00fcbergehender Sperre',
    wrongCredentials: 'Falsche E-Mail oder falsches Passwort. Versuche es erneut.',
    accessDeniedGoogle: 'Du hast die Google-Anmeldung abgelehnt. Versuche es erneut.',
    authFailedGoogle: 'Google-Anmeldung fehlgeschlagen. Versuche es erneut.',
    authFailed: 'Authentifizierung fehlgeschlagen. Versuche es erneut.',
    closeLoginPage: 'Anmeldeseite schlie\u00dfen',
    // ── Branding / Tagline ──
    clarkTagline: 'Clark beim Namen. Super von Natur aus.',
    // ── Register ──
    createYourAccount: 'Erstelle dein Konto',
    joinClarkPlayer: 'Tritt ClarkPlayer bei und baue deine Bibliothek auf',
    fullName: 'Vollst\u00e4ndiger Name',
    confirmPassword: 'Passwort best\u00e4tigen',
    agreeTerms: 'Ich stimme den Nutzungsbedingungen und der Datenschutzerkl\u00e4rung zu',
    createAccount: 'Konto erstellen',
    creatingAccount: 'Konto wird erstellt\u2026',
    alreadyHaveAccount: 'Hast du bereits ein Konto?',
    weak: 'Schwach',
    fair: 'Mittel',
    strong: 'Stark',
    accountCreated: 'Konto erstellt!',
    redirectingSignIn: 'Weiterleitung zur Anmeldung\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: 'Passwort vergessen?',
    forgotPasswordDesc: 'Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zur\u00fccksetzen.',
    checkInbox: 'Pr\u00fcfe deinen Posteingang',
    resetLinkSent: 'Wir haben einen Link zum Zur\u00fccksetzen an gesendet',
    clickLinkToReset: 'Klicke auf den Link in der E-Mail, um dein Passwort zur\u00fcckzusetzen.',
    backToLogin: 'Zur\u00fcck zur Anmeldung',
    sendResetLink: 'Link zum Zur\u00fccksetzen senden',
    sending: 'Wird gesendet\u2026',
    // ── Reset Password ──
    resetPassword: 'Passwort zur\u00fccksetzen',
    newPassword: 'Neues Passwort',
    resetPasswordBtn: 'Passwort zur\u00fccksetzen',
    passwordResetComplete: 'Passwort zur\u00fcckgesetzt',
    passwordUpdated: 'Dein Passwort wurde aktualisiert. Du kannst dich jetzt anmelden.',
    invalidResetLink: 'Ung\u00fcltiger Link',
    invalidResetLinkDesc: 'Dieser Link zum Zur\u00fccksetzen ist ung\u00fcltig oder abgelaufen. Bitte fordere einen neuen an.',
    enterNewPassword: 'Gib dein neues Passwort unten ein.',
    goToSignIn: 'Zur Anmeldung',
    // ── Verify Email ──
    verifying: 'Wird verifiziert\u2026',
    emailVerified: 'E-Mail Verifiziert',
    verificationFailed: 'Verifizierung Fehlgeschlagen',
    verificationTokenMissing: 'Verifizierungs-Token fehlt. \u00dcberpr\u00fcfe den Link in deiner E-Mail.',
    emailVerifiedMessage: 'Deine E-Mail wurde verifiziert! Du kannst dich jetzt anmelden.',
    verificationFailedMessage: 'Verifizierung fehlgeschlagen. Das Token ist m\u00f6glicherweise abgelaufen. Bitte fordere ein neues an.',
    // ── Google Callback ──
    signingInGoogle: 'Anmeldung mit Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'Bild ablegen oder klicken zum Hochladen',
    pngJpgLimit: 'PNG, JPG bis 5 MB',
    playlistNamePlaceholder: 'Meine Playlist',
    playlistCoverPreview: 'Cover-Vorschau',
    togglePrivacy: 'Privatsph\u00e4re umschalten',
    changeCoverImage: 'Bild \u00e4ndern',
    removeCoverImage: 'Bild entfernen',
    chooseFromDrive: 'Von Google Drive w\u00e4hlen',
    loadingDrive: 'Drive wird geladen\u2026',
    // ── TrackRow ──
    addToFavorites: 'Zu Favoriten hinzuf\u00fcgen',
    unfavorite: 'Aus Favoriten entfernen',
    selectTrack: 'Ausw\u00e4hlen',
    currentlyPlaying: 'Wird gerade gespielt',
  } satisfies TranslationMap,
}

export default translations
