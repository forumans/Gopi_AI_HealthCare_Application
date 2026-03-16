"""
Add phone column to doctors table
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_phone_to_doctors'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add phone column to doctors table
    op.add_column('doctors', sa.Column('phone', sa.String(20), nullable=True))

def downgrade():
    # Remove phone column from doctors table
    op.drop_column('doctors', 'phone')
