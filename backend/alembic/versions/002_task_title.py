"""task title

Revision ID: 002
Revises: 001
Create Date: 2026-10-09

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("title", sa.String(length=30), nullable=False, server_default=""),
    )
    op.execute(
        sa.text(
            "UPDATE tasks SET title = LEFT(description, 30) WHERE title = '' OR title IS NULL"
        )
    )
    op.alter_column("tasks", "title", server_default=None)


def downgrade() -> None:
    op.drop_column("tasks", "title")
