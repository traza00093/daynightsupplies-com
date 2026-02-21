#!/bin/bash

# Loft Studio Health Check Script

echo "🏥 Loft Studio System Health Check"
echo "======================================="

BASE_URL="http://localhost:3000"
ERRORS=0

# Check if application is running
echo "1. Checking application status..."
if curl -s "$BASE_URL" > /dev/null; then
    echo "✅ Application is running"
else
    echo "❌ Application is not responding"
    ((ERRORS++))
fi

# Check database connection
echo "2. Checking database connection..."
if sudo -u postgres psql -d loftstudio_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database is accessible"
else
    echo "❌ Database connection failed"
    ((ERRORS++))
fi

# Check PostgreSQL service
echo "3. Checking PostgreSQL service..."
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL service is running"
else
    echo "❌ PostgreSQL service is not running"
    ((ERRORS++))
fi

# Check disk space
echo "4. Checking disk space..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    echo "✅ Disk space is adequate ($DISK_USAGE% used)"
else
    echo "⚠️  Disk space is running low ($DISK_USAGE% used)"
    ((ERRORS++))
fi

# Check memory usage
echo "5. Checking memory usage..."
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -lt 90 ]; then
    echo "✅ Memory usage is normal ($MEM_USAGE% used)"
else
    echo "⚠️  Memory usage is high ($MEM_USAGE% used)"
fi

# Check API endpoints
echo "6. Checking API endpoints..."
if curl -s "$BASE_URL/api/products" | grep -q "success"; then
    echo "✅ Products API is working"
else
    echo "❌ Products API failed"
    ((ERRORS++))
fi

echo "7. Checking search functionality..."
if curl -s "$BASE_URL/api/search?q=coffee" | grep -q "success"; then
    echo "✅ Search API is working"
else
    echo "❌ Search API failed"
    ((ERRORS++))
fi

echo "8. Checking product details..."
if curl -s "$BASE_URL/api/products/1" | grep -q "success"; then
    echo "✅ Product Detail API is working"
else
    echo "❌ Product Detail API failed"
    ((ERRORS++))
fi

echo "9. Checking order tracking..."
if curl -s "$BASE_URL/api/orders/track?orderNumber=test&email=test@example.com" | grep -q "error"; then
    echo "✅ Order Tracking API is working"
else
    echo "❌ Order Tracking API failed"
    ((ERRORS++))
fi

# Summary
echo ""
echo "Health Check Summary:"
if [ $ERRORS -eq 0 ]; then
    echo "✅ All systems operational"
    exit 0
else
    echo "❌ $ERRORS issues found"
    exit 1
fi