"""
ClarkPlayer HTML email templates — inline CSS only, compatible with most email clients.
Each function returns an HTML string ready to be sent via the email service.
"""

from __future__ import annotations

# ──────────────────────────────────────────────────────────────────────────────
# Shared layout helpers
# ──────────────────────────────────────────────────────────────────────────────

_CLARK_COLOR = "#6366f1"      # Indigo-500 — primary brand colour
_DARK_COLOR  = "#1e1b4b"      # Indigo-950 — headings / strong text
_MUTED_COLOR = "#64748b"      # Slate-500 — secondary text
_BODY_BG     = "#f8fafc"     # Slate-50 — page background
_CARD_BG     = "#ffffff"     # White — card / button background
_DIVIDER     = "#e2e8f0"     # Slate-200 — horizontal rules

_MAX_WIDTH   = 480            # px, max width of email content


def _settings():
    """Lazily import settings to avoid circular imports at module load time."""
    from app.core.config import get_settings
    return get_settings()


def _base(title: str, body_html: str) -> str:
    """Wrap ``body_html`` in a responsive email shell with header + footer."""
    settings = _settings()
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:{_BODY_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:{_BODY_BG};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="{_MAX_WIDTH}" cellpadding="0" cellspacing="0" style="background-color:{_CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header band -->
          <tr>
            <td style="background-color:{_CLARK_COLOR};padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">ClarkPlayer</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              {body_html}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid {_DIVIDER};margin:0 0 24px;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 28px;text-align:center;color:{_MUTED_COLOR};font-size:13px;line-height:1.6;">
              You're receiving this email because you have a ClarkPlayer account.<br>
              <a href="{settings.FRONTEND_URL}" style="color:{_CLARK_COLOR};text-decoration:none;">clarkplayer.app</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _button(text: str, href: str, *, color: str = _CLARK_COLOR) -> str:
    """Return a centred CTA button."""
    return f"""<div style="text-align:center;margin:28px 0;">
  <a href="{href}"
     style="display:inline-block;padding:14px 32px;background-color:{color};color:#ffffff;font-size:16px;font-weight:600;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
    {text}
  </a>
</div>"""


def _para(text: str, *, size: str = "16px", color: str = _DARK_COLOR) -> str:
    return f"""<p style="margin:0 0 16px;font-size:{size};color:{color};line-height:1.65;">{text}</p>"""


# ──────────────────────────────────────────────────────────────────────────────
# Per-template implementations
# ──────────────────────────────────────────────────────────────────────────────


def verification_email(display_name: str, verify_url: str) -> str:
    settings = _settings()
    title = "Verify your email"
    body = f"""
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:{_DARK_COLOR};">Hey {display_name or "there"},</h2>
      {_para("Thanks for signing up for ClarkPlayer! Please verify your email address by clicking the button below.")}
      {_button("Verify email address", verify_url)}
      {_para("If you didn't create a ClarkPlayer account, you can safely ignore this email.")}
      <p style="margin:24px 0 0;font-size:13px;color:{_MUTED_COLOR};">This link expires in {settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes.</p>
    """
    return _base(title, body)


def password_reset_email(display_name: str, reset_url: str) -> str:
    settings = _settings()
    title = "Reset your password"
    body = f"""
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:{_DARK_COLOR};">Hey {display_name or "there"},</h2>
      {_para("We received a request to reset your ClarkPlayer password. Click the button below to set a new one.")}
      {_button("Reset password", reset_url, color="#dc2626")}
      {_para("If you didn't request a password reset, you can safely ignore this email — your password hasn't changed.")}
      <p style="margin:24px 0 0;font-size:13px;color:{_MUTED_COLOR};">This link expires in {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
    """
    return _base(title, body)


def welcome_email(display_name: str) -> str:
    settings = _settings()
    title = f"Welcome to ClarkPlayer, {display_name}!"
    body = f"""
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:{_DARK_COLOR};">Welcome aboard, {display_name}!</h2>
      {_para("Your email has been verified and your ClarkPlayer account is now fully active.")}
      {_para("Here are a few things you can do next:")}
      <ul style="margin:0 0 24px;padding-left:20px;color:{_DARK_COLOR};font-size:15px;line-height:2;">
        <li>Upload your first track</li>
        <li>Create a playlist</li>
        <li>Explore what's hot on the platform</li>
      </ul>
      {_button("Start listening", settings.FRONTEND_URL)}
    """
    return _base(title, body)


def new_device_alert(display_name: str, ip: str, user_agent: str, timestamp: str) -> str:
    settings = _settings()
    title = "New login detected"
    body = f"""
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:{_DARK_COLOR};">New login on your account</h2>
      {_para("We detected a sign-in to your ClarkPlayer account from a new device.")}
      <table cellpadding="12" cellspacing="0" style="background-color:{_BODY_BG};border-radius:8px;margin:24px 0;width:100%;">
        <tr><td style="font-size:13px;color:{_MUTED_COLOR};font-weight:600;width:80px;">IP address</td><td style="font-size:14px;color:{_DARK_COLOR};">{ip}</td></tr>
        <tr><td style="font-size:13px;color:{_MUTED_COLOR};font-weight:600;">Browser</td><td style="font-size:14px;color:{_DARK_COLOR};">{user_agent}</td></tr>
        <tr><td style="font-size:13px;color:{_MUTED_COLOR};font-weight:600;">Time</td><td style="font-size:14px;color:{_DARK_COLOR};">{timestamp}</td></tr>
      </table>
      {_para("If this was you, no action is needed. If you don't recognise this login, please change your password immediately.")}
      {_button("Secure your account", f"{settings.FRONTEND_URL}/settings", color="#dc2626")}
    """
    return _base(title, body)


def playlist_invite(invitee_name: str, inviter_name: str, playlist_name: str, playlist_url: str) -> str:
    title = f"{inviter_name} invited you to a playlist"
    body = f"""
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:{_DARK_COLOR};">Playlist invite</h2>
      {_para(f"{inviter_name} has invited you to collaborate on the playlist <strong>\"{playlist_name}\"</strong> on ClarkPlayer.")}
      {_button("Open playlist", playlist_url)}
      {_para("Enjoy the music!")}
    """
    return _base(title, body)


def upgrade_confirmation(display_name: str) -> str:
    settings = _settings()
    title = "You're now on ClarkPlayer Pro"
    body = f"""
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:{_DARK_COLOR};">Upgrade confirmed 🎵</h2>
      {_para(f"Hi {display_name}, your ClarkPlayer Pro upgrade is all set. Thank you for supporting the platform!")}
      <p style="margin:0 0 16px;font-size:15px;color:{_DARK_COLOR};">Your new Pro benefits include:</p>
      <ul style="margin:0 0 28px;padding-left:20px;color:{_DARK_COLOR};font-size:15px;line-height:2;">
        <li>Unlimited uploads</li>
        <li>Advanced analytics</li>
        <li>Priority support</li>
        <li>Exclusive Pro badges</li>
      </ul>
      {_button("Explore Pro features", f"{settings.FRONTEND_URL}/settings")}
    """
    return _base(title, body)