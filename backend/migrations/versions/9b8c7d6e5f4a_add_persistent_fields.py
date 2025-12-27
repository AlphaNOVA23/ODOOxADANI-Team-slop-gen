"""add_persistent_fields

Revision ID: 9b8c7d6e5f4a
Revises: c04162415020
Create Date: 2025-12-27 12:31:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9b8c7d6e5f4a"
down_revision: Union[str, Sequence[str], None] = "c04162415020"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("maintenance_teams", sa.Column("description", sa.String(), nullable=True))

    op.add_column("equipment", sa.Column("category", sa.String(), nullable=True))
    op.add_column("equipment", sa.Column("warranty_start_date", sa.Date(), nullable=True))
    op.add_column("equipment", sa.Column("warranty_end_date", sa.Date(), nullable=True))

    op.add_column("maintenance_requests", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("maintenance_requests", sa.Column("priority", sa.String(), nullable=True))
    op.add_column("maintenance_requests", sa.Column("created_date", sa.Date(), nullable=True))
    op.add_column("maintenance_requests", sa.Column("completed_date", sa.Date(), nullable=True))
    op.add_column("maintenance_requests", sa.Column("notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("maintenance_requests", "notes")
    op.drop_column("maintenance_requests", "completed_date")
    op.drop_column("maintenance_requests", "created_date")
    op.drop_column("maintenance_requests", "priority")
    op.drop_column("maintenance_requests", "description")

    op.drop_column("equipment", "warranty_end_date")
    op.drop_column("equipment", "warranty_start_date")
    op.drop_column("equipment", "category")

    op.drop_column("maintenance_teams", "description")
