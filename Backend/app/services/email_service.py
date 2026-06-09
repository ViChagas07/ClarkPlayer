"""
ClarkPlayer email service — powered by Resend.

All email sending is centralised here. Import and call the
send_* functions from route handlers or other services.
"""

import resend

from app.core.config import Settings


def _settings() -> Settings:
    """Lazily import settings to avoid issues at module load time."""
    from app.core.config import get_settings
    return get_settings()


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

async def _send(to: str, subject: str, html: str) -> None:
    """
    Low-level send wrapper. Raises on Resend API errors so callers
    can handle failures (e.g., log and continue rather than crashing
    the request that triggered the email).
    """
    settings = _settings()
    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send({
        "from": settings.RESEND_FROM,
        "to": to,
        "subject": subject,
        "html": html,
    })


# ---------------------------------------------------------------------------
# 1. Email verification
# ---------------------------------------------------------------------------

async def send_verification_email(to: str, display_name: str, token: str) -> None:
    from app.services.email_templates import verification_email

    settings = _settings()
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = verification_email(display_name, verify_url)
    await _send(to, "Verify your ClarkPlayer email", html)


# ---------------------------------------------------------------------------
# 2. Password reset
# ---------------------------------------------------------------------------

async def send_password_reset_email(to: str, display_name: str, token: str) -> None:
    from app.services.email_templates import password_reset_email

    settings = _settings()
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = password_reset_email(display_name, reset_url)
    await _send(to, "Reset your ClarkPlayer password", html)


# ---------------------------------------------------------------------------
# 3. Welcome email (sent after email verification is confirmed)
# ---------------------------------------------------------------------------

async def send_welcome_email(to: str, display_name: str) -> None:
    from app.services.email_templates import welcome_email

    html = welcome_email(display_name)
    await _send(to, f"Welcome to ClarkPlayer, {display_name}!", html)


# ---------------------------------------------------------------------------
# 4. New device login alert
# ---------------------------------------------------------------------------

async def send_new_device_alert(
    to: str,
    display_name: str,
    ip: str,
    user_agent: str,
    timestamp: str,
) -> None:
    from app.services.email_templates import new_device_alert

    html = new_device_alert(display_name, ip, user_agent, timestamp)
    await _send(to, "New login detected on your ClarkPlayer account", html)


# ---------------------------------------------------------------------------
# 5. Collaborative playlist invitation
# ---------------------------------------------------------------------------

async def send_playlist_invite(
    to: str,
    invitee_name: str,
    inviter_name: str,
    playlist_name: str,
    playlist_url: str,
) -> None:
    from app.services.email_templates import playlist_invite

    html = playlist_invite(invitee_name, inviter_name, playlist_name, playlist_url)
    await _send(to, f"{inviter_name} invited you to collaborate on a playlist", html)


# ---------------------------------------------------------------------------
# 6. Pro plan upgrade confirmation
# ---------------------------------------------------------------------------

async def send_upgrade_confirmation(to: str, display_name: str) -> None:
    from app.services.email_templates import upgrade_confirmation

    html = upgrade_confirmation(display_name)
    await _send(to, "You're now on ClarkPlayer Pro 🎵", html)