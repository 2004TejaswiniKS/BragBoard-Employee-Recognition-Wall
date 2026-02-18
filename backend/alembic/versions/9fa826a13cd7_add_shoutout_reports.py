"""add shoutout reports

Revision ID: 9fa826a13cd7
Revises: 5c04fdd65b09
Create Date: 2026-01-14 16:30:15.857966
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9fa826a13cd7'
down_revision = '5c04fdd65b09'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'shoutout_reports',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column(
            'shoutout_id',
            sa.Integer(),
            sa.ForeignKey('shoutouts.id', ondelete='CASCADE'),
            nullable=False
        ),
        sa.Column(
            'reported_by',
            sa.Integer(),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False
        ),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.func.now()
        )
    )


def downgrade():
    op.drop_table('shoutout_reports')
