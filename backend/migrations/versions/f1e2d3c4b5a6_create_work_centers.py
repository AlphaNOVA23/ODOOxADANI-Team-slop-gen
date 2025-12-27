"""create_work_centers

Revision ID: f1e2d3c4b5a6
Revises: ef57b185a4f1
Create Date: 2025-12-27 12:45:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "f1e2d3c4b5a6"
down_revision: Union[str, Sequence[str], None] = "ef57b185a4f1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "work_centers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("code", sa.String(), nullable=True),
        sa.Column("tag", sa.String(), nullable=True),
        sa.Column("alternative_workcenters", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("cost_per_hour", sa.Float(), nullable=True),
        sa.Column("capacity_time_efficiency", sa.Float(), nullable=True),
        sa.Column("oee_target", sa.Float(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_index(op.f("ix_work_centers_id"), "work_centers", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_work_centers_id"), table_name="work_centers")
    op.drop_table("work_centers")
