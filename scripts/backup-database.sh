#!/bin/bash

# Loft Studio Database Backup Script

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="loftstudio_backup_$TIMESTAMP.sql"

echo "🗄️  Loft Studio Database Backup"
echo "===================================="

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Creating backup: $BACKUP_FILE"

# Create database backup
sudo -u postgres pg_dump loftstudio_db > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "✅ Backup compressed: $BACKUP_DIR/$BACKUP_FILE.gz"
    
    # Keep only last 7 backups
    cd $BACKUP_DIR
    ls -t loftstudio_backup_*.sql.gz | tail -n +8 | xargs -r rm
    echo "🧹 Old backups cleaned up (keeping last 7)"
    
    echo ""
    echo "Available backups:"
    ls -lah loftstudio_backup_*.sql.gz 2>/dev/null || echo "No backups found"
else
    echo "❌ Backup failed!"
    exit 1
fi
