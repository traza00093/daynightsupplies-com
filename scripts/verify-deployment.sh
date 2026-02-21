#!/bin/bash

# Deployment Verification Script
# Verifies that all components are properly configured and running

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Functions
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_summary() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Verification Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Passed:  ${GREEN}$PASSED${NC}"
    echo -e "Failed:  ${RED}$FAILED${NC}"
    echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All critical checks passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ Some checks failed. Please review above.${NC}"
        return 1
    fi
}

# Main verification
main() {
    print_header "System Verification"
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        check_pass "Running on Linux"
    else
        check_fail "Not running on Linux"
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        check_pass "Node.js installed: $NODE_VERSION"
    else
        check_fail "Node.js not installed"
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        check_pass "npm installed: $NPM_VERSION"
    else
        check_fail "npm not installed"
    fi
    
    print_header "PostgreSQL Verification"
    
    # Check PostgreSQL
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version)
        check_pass "PostgreSQL installed: $PG_VERSION"
    else
        check_fail "PostgreSQL not installed"
    fi
    
    # Check PostgreSQL service
    if sudo systemctl is-active --quiet postgresql; then
        check_pass "PostgreSQL service is running"
    else
        check_fail "PostgreSQL service is not running"
    fi
    
    # Check database connection
    if psql -h localhost -U loftstudio -d loftstudio_db -c "SELECT 1" &> /dev/null; then
        check_pass "Database connection successful"
    else
        check_warn "Database connection failed (may not be configured yet)"
    fi
    
    # Check database tables
    if psql -h localhost -U loftstudio -d loftstudio_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" &> /dev/null; then
        TABLE_COUNT=$(psql -h localhost -U loftstudio -d loftstudio_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        if [ "$TABLE_COUNT" -gt 0 ]; then
            check_pass "Database tables exist: $TABLE_COUNT tables"
        else
            check_warn "Database is empty (may need initialization)"
        fi
    fi
    
    print_header "Application Verification"
    
    # Check application directory
    if [ -d "/opt/loftstudio" ]; then
        check_pass "Application directory exists: /opt/loftstudio"
    else
        check_fail "Application directory not found: /opt/loftstudio"
    fi
    
    # Check package.json
    if [ -f "/opt/loftstudio/package.json" ]; then
        check_pass "package.json found"
    else
        check_fail "package.json not found"
    fi
    
    # Check node_modules
    if [ -d "/opt/loftstudio/node_modules" ]; then
        check_pass "Dependencies installed (node_modules exists)"
    else
        check_warn "Dependencies not installed (run: npm ci --only=production)"
    fi
    
    # Check .next build
    if [ -d "/opt/loftstudio/.next" ]; then
        BUILD_SIZE=$(du -sh /opt/loftstudio/.next | cut -f1)
        check_pass "Application built: $BUILD_SIZE"
    else
        check_warn "Application not built (run: npm run build)"
    fi
    
    # Check environment file
    if [ -f "/opt/loftstudio/.env.production.local" ]; then
        check_pass "Environment file configured"
    else
        check_warn "Environment file not found (copy from .env.production.example)"
    fi
    
    print_header "PM2 Verification"
    
    # Check PM2
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        check_pass "PM2 installed: $PM2_VERSION"
    else
        check_warn "PM2 not installed (run: sudo npm install -g pm2)"
    fi
    
    # Check PM2 app status
    if pm2 list 2>/dev/null | grep -q "loftstudio-app"; then
        APP_STATUS=$(pm2 list 2>/dev/null | grep "loftstudio-app" | awk '{print $NF}')
        if [ "$APP_STATUS" = "online" ]; then
            check_pass "Application is running (PM2)"
        else
            check_warn "Application status: $APP_STATUS"
        fi
    else
        check_warn "Application not started with PM2"
    fi
    
    print_header "Nginx Verification"
    
    # Check Nginx
    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1 | cut -d' ' -f3)
        check_pass "Nginx installed: $NGINX_VERSION"
    else
        check_warn "Nginx not installed"
    fi
    
    # Check Nginx service
    if sudo systemctl is-active --quiet nginx; then
        check_pass "Nginx service is running"
    else
        check_warn "Nginx service is not running"
    fi
    
    # Check Nginx config
    if sudo nginx -t &> /dev/null; then
        check_pass "Nginx configuration is valid"
    else
        check_fail "Nginx configuration has errors"
    fi
    
    print_header "Network Verification"
    
    # Check if application is listening
    if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
        check_pass "Application listening on port 3000"
    else
        check_warn "Application not listening on port 3000"
    fi
    
    # Check if Nginx is listening
    if netstat -tuln 2>/dev/null | grep -q ":80 "; then
        check_pass "Nginx listening on port 80"
    else
        check_warn "Nginx not listening on port 80"
    fi
    
    # Check if PostgreSQL is listening
    if netstat -tuln 2>/dev/null | grep -q ":5432 "; then
        check_pass "PostgreSQL listening on port 5432"
    else
        check_warn "PostgreSQL not listening on port 5432"
    fi
    
    print_header "Health Checks"
    
    # Check application health
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        check_pass "Application responding on localhost:3000"
    else
        check_warn "Application not responding on localhost:3000"
    fi
    
    # Check Nginx proxy
    if curl -s http://localhost > /dev/null 2>&1; then
        check_pass "Nginx proxy responding on localhost"
    else
        check_warn "Nginx proxy not responding"
    fi
    
    # Check API health endpoint
    if curl -s http://localhost/api/admin/health > /dev/null 2>&1; then
        check_pass "API health endpoint responding"
    else
        check_warn "API health endpoint not responding"
    fi
    
    print_header "File System Verification"
    
    # Check log directory
    if [ -d "/var/log/loftstudio" ]; then
        check_pass "Log directory exists"
    else
        check_warn "Log directory not found"
    fi
    
    # Check backup directory
    if [ -d "/opt/loftstudio/backups" ]; then
        BACKUP_COUNT=$(ls -1 /opt/loftstudio/backups/*.sql.gz 2>/dev/null | wc -l)
        if [ $BACKUP_COUNT -gt 0 ]; then
            check_pass "Backups configured: $BACKUP_COUNT backups found"
        else
            check_warn "Backup directory exists but no backups found"
        fi
    else
        check_warn "Backup directory not found"
    fi
    
    # Check disk space
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -lt 80 ]; then
        check_pass "Disk usage: ${DISK_USAGE}% (OK)"
    else
        check_warn "Disk usage: ${DISK_USAGE}% (High)"
    fi
    
    print_header "Security Verification"
    
    # Check SSL certificate
    if [ -f "/etc/letsencrypt/live/*/fullchain.pem" ]; then
        check_pass "SSL certificate found"
    else
        check_warn "SSL certificate not found"
    fi
    
    # Check firewall
    if sudo ufw status 2>/dev/null | grep -q "Status: active"; then
        check_pass "Firewall is enabled"
    else
        check_warn "Firewall is not enabled"
    fi
    
    # Check environment file permissions
    if [ -f "/opt/loftstudio/.env.production.local" ]; then
        PERMS=$(stat -c "%a" /opt/loftstudio/.env.production.local)
        if [ "$PERMS" = "600" ] || [ "$PERMS" = "640" ]; then
            check_pass "Environment file permissions are secure: $PERMS"
        else
            check_warn "Environment file permissions may be too open: $PERMS"
        fi
    fi
    
    print_summary
}

# Run main function
main "$@"
