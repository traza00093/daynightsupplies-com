#!/bin/bash

# Loft Studio Database Restore Script

BACKUP_DIR="./backups"

echo "🔄 Loft Studio Database Restore"
echo "===================================="

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lah $BACKUP_DIR/loftstudio_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring from: $BACKUP_FILE"
echo ""
read -p "⚠️  This will overwrite the current database. Continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Drop and recreate database
echo "Dropping existing database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS loftstudio_db;"
sudo -u postgres psql -c "CREATE DATABASE loftstudio_db;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE loftstudio_db TO loftstudio;"

# Restore from backup
echo "Restoring database..."
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | sudo -u postgres psql loftstudio_db
else
    sudo -u postgres psql loftstudio_db < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi
