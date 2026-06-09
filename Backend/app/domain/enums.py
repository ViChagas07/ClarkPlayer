"""
Domain enumerations — tiny, stable value objects that the whole codebase
can reference without creating coupling to the database or framework.
"""

from enum import StrEnum


class AudioFormat(StrEnum):
    MP3 = "mp3"
    FLAC = "flac"
    WAV = "wav"
    AAC = "aac"
    OGG = "ogg"
    WMA = "wma"
    M4A = "m4a"
    OPUS = "opus"


class PlaylistVisibility(StrEnum):
    PRIVATE = "private"
    PUBLIC = "public"
    UNLISTED = "unlisted"


class TokenType(StrEnum):
    ACCESS = "access"
    REFRESH = "refresh"
