"""add OAuth provider columns to users table

Revision ID: 0001_oauth_provider
Revises: None
Create Date: 2026-06-12

This migration adds the columns required for Google OIDC / social login:

- provider      — the authentication provider (e.g. "google")
- provider_id   — the external user ID from the provider (Google "sub" claim)

It also relaxes ``hashed_password`` to allow NULL so that OAuth-only
accounts do not need a dummy password hash.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0001_oauth_provider"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Make hashed_password nullable (Google users have no password)
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(255),
        nullable=True,
    )

    # 2. Add provider column
    op.add_column(
        "users",
        sa.Column("provider", sa.String(20), nullable=True),
    )
    op.create_index(
        op.f("ix_users_provider"),
        "users",
        ["provider"],
    )

    # 3. Add provider_id column
    op.add_column(
        "users",
        sa.Column("provider_id", sa.String(255), nullable=True),
    )
    op.create_index(
        op.f("ix_users_provider_id"),
        "users",
        ["provider_id"],
    )


def downgrade() -> None:
    # Remove provider index + column
    op.drop_index(op.f("ix_users_provider_id"), table_name="users")
    op.drop_column("users", "provider_id")

    # Remove provider_id index + column
    op.drop_index(op.f("ix_users_provider"), table_name="users")
    op.drop_column("users", "provider")

    # Restore hashed_password NOT NULL
    # (This will fail if any OAuth users exist — intentional safeguard)
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(255),
        nullable=False,
    )
