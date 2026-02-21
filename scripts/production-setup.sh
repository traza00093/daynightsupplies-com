#!/bin/bash

# Production Setup Script - Docker-less Deployment
# This script automates the setup of Loft Studio on a VM with native PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/loftstudio"
APP_USER="loftstudio"
DB_USER="loftstudio"
DB_NAME="loftstudio_db"
DB_PORT="5432"
APP_PORT="3000"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_error "Do not run this script as root"
        exit 1
    fi
}

check_os() {
    if [[ ! "$OSTYPE" == "linux-gnu"* ]]; then
        log_error "This script only supports Linux"
        exit 1
    fi
    log_success "Running on Linux"
}

install_system_deps() {
    log_info "Installing system dependencies..."
    
    if ! command -v curl &> /dev/null; then
        sudo apt update
        sudo apt install -y curl wget git build-essential
        log_success "System dependencies installed"
    else
        log_success "System dependencies already installed"
    fi
}

install_nodejs() {
    log_info "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js $NODE_VERSION already installed"
    else
        log_info "Installing Node.js 18 LTS..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
        log_success "Node.js installed: $(node --version)"
    fi
}

install_postgresql() {
    log_info "Checking PostgreSQL installation..."
    
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version)
        log_success "PostgreSQL already installed: $PG_VERSION"
    else
        log_info "Installing PostgreSQL..."
        sudo apt install -y postgresql postgresql-contrib postgresql-client
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        log_success "PostgreSQL installed and started"
    fi
}

setup_database() {
    log_info "Setting up database..."
    
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        log_warning "Database $DB_NAME already exists"
    else
        log_info "Creating database and user..."
        
        read -sp "Enter database password: " DB_PASSWORD
        echo
        
        sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
ALTER ROLE $DB_USER WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF
        
        log_success "Database and user created"
        
        # Save credentials for later use
        echo "POSTGRES_PASSWORD=$DB_PASSWORD" > /tmp/db_credentials.txt
        chmod 600 /tmp/db_credentials.txt
    fi
    
    # Test connection
    if psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1" &> /dev/null; then
        log_success "Database connection successful"
    else
        log_error "Failed to connect to database"
        exit 1
    fi
}

setup_app_directory() {
    log_info "Setting up application directory..."
    
    if [ ! -d "$APP_DIR" ]; then
        sudo mkdir -p $APP_DIR
        sudo chown $USER:$USER $APP_DIR
        log_success "Application directory created: $APP_DIR"
    else
        log_warning "Application directory already exists"
    fi
}

install_dependencies() {
    log_info "Installing Node.js dependencies..."
    
    cd $APP_DIR
    npm ci --only=production
    log_success "Dependencies installed"
}

setup_environment() {
    log_info "Setting up environment variables..."
    
    if [ ! -f "$APP_DIR/.env.production.local" ]; then
        cp $APP_DIR/.env.local.example $APP_DIR/.env.production.local
        
        # Load database password if available
        if [ -f /tmp/db_credentials.txt ]; then
            source /tmp/db_credentials.txt
            DB_PASSWORD=$POSTGRES_PASSWORD
        else
            read -sp "Enter database password: " DB_PASSWORD
            echo
        fi
        
        # Update environment file
        sed -i "s|postgres://loftstudio:.*@localhost:5432/loftstudio_db|postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME|g" $APP_DIR/.env.production.local
        sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" $APP_DIR/.env.production.local
        
        log_warning "Please edit $APP_DIR/.env.production.local with production values:"
        log_warning "  - NEXTAUTH_URL"
        log_warning "  - NEXTAUTH_SECRET (generate: openssl rand -base64 32)"
        log_warning "  - STRIPE_PUBLISHABLE_KEY"
        log_warning "  - STRIPE_SECRET_KEY"
        log_warning "  - STRIPE_WEBHOOK_SECRET"
        log_warning "  - SMTP_HOST, SMTP_USER, SMTP_PASS"
        
        read -p "Press Enter after updating environment variables..."
    else
        log_success "Environment file already exists"
    fi
}

build_application() {
    log_info "Building application (this may take a few minutes)..."
    
    cd $APP_DIR
    npm run build
    
    if [ -d "$APP_DIR/.next" ]; then
        log_success "Application built successfully"
        log_info "Build output size: $(du -sh $APP_DIR/.next | cut -f1)"
    else
        log_error "Build failed"
        exit 1
    fi
}

initialize_database() {
    log_info "Initializing database..."
    
    cd $APP_DIR
    npm run db:migrate
    log_success "Database migrations completed"
}

create_admin_user() {
    log_info "Creating admin user..."
    
    cd $APP_DIR
    npm run admin:init
    log_success "Admin user created"
}

install_pm2() {
    log_info "Installing PM2..."
    
    if command -v pm2 &> /dev/null; then
        log_success "PM2 already installed"
    else
        sudo npm install -g pm2
        pm2 startup
        pm2 save
        log_success "PM2 installed and configured"
    fi
}

setup_pm2_ecosystem() {
    log_info "Setting up PM2 ecosystem..."
    
    cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'loftstudio-app',
      script: 'npm',
      args: 'start',
      cwd: '/opt/loftstudio',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/loftstudio/error.log',
      out_file: '/var/log/loftstudio/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', '.next', 'logs'],
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
};
EOF
    
    sudo mkdir -p /var/log/loftstudio
    sudo chown $USER:$USER /var/log/loftstudio
    
    log_success "PM2 ecosystem configured"
}

start_application() {
    log_info "Starting application with PM2..."
    
    cd $APP_DIR
    pm2 start ecosystem.config.js
    pm2 save
    
    sleep 3
    
    if pm2 list | grep -q "loftstudio-app"; then
        log_success "Application started successfully"
        pm2 logs loftstudio-app --lines 20
    else
        log_error "Failed to start application"
        pm2 logs loftstudio-app
        exit 1
    fi
}

setup_nginx() {
    log_info "Setting up Nginx..."
    
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
        log_success "Nginx installed"
    else
        log_success "Nginx already installed"
    fi
    
    # Create Nginx configuration
    SERVER_NAME=${SERVER_NAME:-loftstudio.store}
    sudo tee /etc/nginx/sites-available/loftstudio > /dev/null << EOF
upstream loftstudio_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name ${SERVER_NAME};
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://loftstudio_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://loftstudio_backend;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    location ~ /\. {
        deny all;
    }
}
EOF

    # If Let's Encrypt certificates exist, overwrite with HTTPS config
    if [ -f "/etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/${SERVER_NAME}/privkey.pem" ]; then
        sudo tee /etc/nginx/sites-available/loftstudio > /dev/null << EOF
upstream loftstudio_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name ${SERVER_NAME} www.${SERVER_NAME};
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${SERVER_NAME} www.${SERVER_NAME};

    ssl_certificate /etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SERVER_NAME}/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    client_max_body_size 50M;

    location / {
        proxy_pass http://loftstudio_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location ~* ^/_next/static/ {
        proxy_pass http://loftstudio_backend;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://loftstudio_backend;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location ~ \/\. {
        deny all;
    }
}
EOF
    fi

    sudo ln -sf /etc/nginx/sites-available/loftstudio /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log_success "Nginx configured and reloaded"
    else
        log_error "Nginx configuration error"
        exit 1
    fi
}

setup_firewall() {
    log_info "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw allow 22/tcp
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw --force enable
        log_success "Firewall configured"
    else
        log_warning "UFW not available, skipping firewall setup"
    fi
}

setup_backups() {
    log_info "Setting up database backups..."
    
    cat > $APP_DIR/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/loftstudio/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/loftstudio_db_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U loftstudio -d loftstudio_db | gzip > $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "loftstudio_db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF
    
    chmod +x $APP_DIR/backup-db.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null | grep -v "backup-db.sh"; echo "0 2 * * * $APP_DIR/backup-db.sh >> /var/log/loftstudio/backup.log 2>&1") | crontab -
    
    log_success "Backup script configured"
}

health_check() {
    log_info "Running health checks..."
    
    # Check database
    if psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1" &> /dev/null; then
        log_success "Database connection OK"
    else
        log_error "Database connection failed"
        return 1
    fi
    
    # Check application
    sleep 2
    if curl -s http://localhost:3000 > /dev/null; then
        log_success "Application responding"
    else
        log_error "Application not responding"
        return 1
    fi
    
    # Check Nginx
    if curl -s http://localhost > /dev/null; then
        log_success "Nginx proxy OK"
    else
        log_error "Nginx proxy failed"
        return 1
    fi
    
    return 0
}

print_summary() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Production Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Application Details:"
    echo "  Directory: $APP_DIR"
    echo "  Database: $DB_NAME"
    echo "  Database User: $DB_USER"
    echo "  Application Port: $APP_PORT"
    echo "  Nginx Port: 80"
    echo ""
    echo "Useful Commands:"
    echo "  View logs: pm2 logs loftstudio-app"
    echo "  Restart app: pm2 restart loftstudio-app"
    echo "  Stop app: pm2 stop loftstudio-app"
    echo "  Check status: pm2 status"
    echo "  View Nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo ""
    echo "Next Steps:"
    echo "  1. Configure SSL with Let's Encrypt: sudo certbot certonly --nginx"
    echo "  2. Update Nginx config with SSL certificates"
    echo "  3. Configure domain DNS to point to this server"
    echo "  4. Monitor application: pm2 monit"
    echo ""
}

# Main execution
main() {
    log_info "Starting production setup..."
    echo ""
    
    check_root
    check_os
    install_system_deps
    install_nodejs
    install_postgresql
    setup_database
    setup_app_directory
    install_dependencies
    setup_environment
    build_application
    initialize_database
    create_admin_user
    install_pm2
    setup_pm2_ecosystem
    start_application
    setup_nginx
    setup_firewall
    setup_backups
    
    if health_check; then
        print_summary
        log_success "All systems operational!"
    else
        log_error "Health checks failed. Please review logs."
        exit 1
    fi
}

# Run main function
main "$@"
