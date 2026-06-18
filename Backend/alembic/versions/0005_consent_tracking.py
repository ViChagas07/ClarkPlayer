"""add consent tracking columns to users table

Revision ID: 0005_consent_tracking
Revises: 0004_massive_indexes
Create Date: 2026-06-18
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0005_consent_tracking"
down_revision: Union[str, None] = "0004_massive_indexes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("terms_version", sa.String(20), nullable=True))
    op.add_column("users", sa.Column("privacy_version", sa.String(20), nullable=True))
    op.add_column("users", sa.Column("consent_accepted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("consent_ip", sa.String(45), nullable=True))
    op.add_column("users", sa.Column("consent_user_agent", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "consent_user_agent")
    op.drop_column("users", "consent_ip")
    op.drop_column("users", "consent_accepted_at")
    op.drop_column("users", "privacy_version")
    op.drop_column("users", "terms_version")
