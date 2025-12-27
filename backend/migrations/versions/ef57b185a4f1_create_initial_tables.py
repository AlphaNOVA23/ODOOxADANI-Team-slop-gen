"""create_initial_tables

Revision ID: ef57b185a4f1
Revises: 9b8c7d6e5f4a
Create Date: 2025-12-27 12:44:15.516691

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ef57b185a4f1'
down_revision: Union[str, Sequence[str], None] = '9b8c7d6e5f4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
