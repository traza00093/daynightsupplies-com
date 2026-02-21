# Admin Guide

The admin dashboard provides full control over your store. Access it at `/admin` after signing in with an admin account.

## Initial Setup

### Create Admin Account

**Option A: Web Setup (Recommended)**

Visit `/setup` in your browser. This page lets you:
1. Create your admin account with your own email and password
2. Automatically creates database tables if they don't exist
3. Signs you in and redirects to the admin dashboard

The setup page disables itself permanently once an admin account exists.

> **Tip:** On Vercel deployments, set a `SETUP_SECRET` environment variable for extra security. The setup page will require it before allowing access.

**Option B: CLI Setup**

```bash
npm run admin:init
```

This creates an admin user with a secure random password. The credentials are printed to the console — save them!

### First Login

If you used the CLI setup:
1. Go to `/auth/signin`
2. Enter the admin email and password from the init script
3. You'll be redirected to the admin dashboard

If you used the web setup, you're already signed in.

## Dashboard

The main dashboard shows:
- **Revenue** - Total revenue for the selected period
- **Orders** - Order count and average value
- **Customers** - New and returning customers
- **Trend Charts** - Revenue, orders, and customer trends over time
- **Top Products** - Best-selling products
- **Recent Orders** - Latest orders with status

## Products

### Adding a Product

1. Go to **Admin > Products**
2. Click **Add Product**
3. Fill in:
   - **Name** - Product title
   - **Description** - Full description (supports plain text)
   - **Price** - Current selling price
   - **Original Price** - Optional, shown as strikethrough for discounts
   - **Category** - Select from existing categories
   - **SKU** - Stock keeping unit (optional)
   - **Stock Quantity** - Available inventory count
   - **Image** - Upload product image (stored in Vercel Blob)
   - **Tags** - Comma-separated tags for search
   - **Featured** - Toggle to show on homepage
4. Click **Save**

### Managing Inventory

Products track stock automatically:
- Stock decrements when an order is paid (via Stripe webhook)
- Low stock alerts appear in **Admin > Inventory Alerts**
- Configure the low stock threshold in **Admin > Settings**

## Categories

### Adding a Category

1. Go to **Admin > Categories**
2. Click **Add Category**
3. Fill in:
   - **Name** - Category name
   - **Slug** - URL-friendly name (auto-generated)
   - **Icon** - Lucide icon name (e.g., `shirt`, `watch`, `gem`)
   - **Image** - Category banner image
4. Click **Save**

## Orders

### Order Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Order placed, awaiting payment |
| `paid` | Payment confirmed via Stripe |
| `processing` | Being prepared for shipment |
| `shipped` | In transit with tracking number |
| `delivered` | Successfully delivered |
| `cancelled` | Order cancelled |
| `payment_failed` | Stripe payment failed |

### Updating Order Status

1. Go to **Admin > Orders**
2. Click on an order
3. Select the new status
4. Optionally add:
   - **Tracking Number** - Carrier tracking ID
   - **Notes** - Internal notes
5. Click **Update**

Status changes trigger email notifications to the customer.

## Users

### Viewing Users

Go to **Admin > Users** to see all registered users with:
- Name, email, account type
- Active/verified/locked status
- Registration date
- Search and pagination

### User Details

Click on a user to see:
- Profile information
- Order history
- Reviews submitted
- Wishlist items
- Activity log

### Managing Users

Admin can:
- **Activate/Deactivate** user accounts
- **Lock/Unlock** accounts
- **Change account type** (customer/admin)
- **Verify email** manually

## Coupons

### Creating a Coupon

1. Go to **Admin > Coupons**
2. Click **Add Coupon**
3. Configure:
   - **Code** - The coupon code customers enter (auto-uppercased)
   - **Type** - `percentage` or `fixed_amount`
   - **Value** - Discount amount (e.g., 10 for 10% or $10)
   - **Minimum Order** - Minimum cart total to apply
   - **Maximum Discount** - Cap on percentage discounts
   - **Usage Limit** - Maximum number of uses
   - **Valid From/Until** - Date range
   - **Active** - Enable/disable toggle

## Reviews

### Moderation

Go to **Admin > Reviews** to see all customer reviews. Reviews submitted by non-admin users start with `pending` status.

- **Approve** - Makes the review visible on the product page
- **Reject** - Hides the review

Admin-submitted reviews are auto-approved.

## Settings

### General Settings

**Admin > Settings** configures:
- **Store Name** - Displayed in header, emails, and meta tags
- **Store Email** - Contact and sender email
- **Store Phone** - Displayed in footer and contact page
- **Store Address** - Physical location
- **Currency** - Display currency (USD, EUR, etc.)
- **Timezone** - For date formatting

### Stripe Configuration

- **Publishable Key** - Used client-side for Stripe Elements
- **Secret Key** - Used server-side for creating payment intents
- **Webhook Secret** - For verifying Stripe webhook signatures

### Feature Toggles

Enable or disable features:
- Notifications
- Newsletter
- Reviews
- Wishlist
- Simple shipping mode

### Email Settings

See [Email Configuration](email-setup.md) for SMTP setup.

## Security

### Security Logs

**Admin > Security** shows:
- Login attempts (successful and failed)
- Admin actions (product changes, user updates)
- IP addresses and user agents

### Account Security

- Accounts lock after repeated failed login attempts
- Admin can manually lock/unlock accounts
- Password requirements: minimum 8 characters
- Admin passwords: minimum 12 characters with complexity requirements

## Backup & Restore

### Creating a Backup

**Admin > Backup** exports all database tables as a JSON file.

### Restoring from Backup

**Admin > Restore** imports a previously exported JSON backup file. Settings and categories are restored with conflict handling.

## System Health

**Admin > System Health** shows:
- Database connection status and response time
- Server uptime and memory usage
- API response times
- Storage usage
