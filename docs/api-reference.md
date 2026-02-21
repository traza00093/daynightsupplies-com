# API Reference

Open Store exposes REST API endpoints under `/api/`. All endpoints return JSON.

## Authentication

Most API endpoints require authentication via NextAuth.js session cookies. Admin endpoints require `isAdmin: true` on the session.

## Public Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (supports `?category=`, `?featured=true`, `?limit=`) |
| GET | `/api/products/[id]` | Get product by ID |
| GET | `/api/search?q=keyword` | Search products (supports `category`, `minPrice`, `maxPrice`, `inStock`, `limit`, `offset`) |
| GET | `/api/recommendations?productId=1` | Get product recommendations |
| GET | `/api/compare?ids=1,2,3` | Compare products by IDs |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/track?orderNumber=&email=` | Track an order |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-payment-intent` | Create Stripe payment intent |
| POST | `/api/stripe/webhook` | Stripe webhook handler |

### Coupons

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/coupons/validate` | Validate a coupon code |

### Contact & Newsletter

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| POST | `/api/newsletter` | Subscribe to newsletter |

### Shipping

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shipping/carriers` | List shipping carriers |
| POST | `/api/shipping/rates` | Calculate shipping rates |
| GET | `/api/shipping/estimate?zipCode=&carrierId=` | Estimate delivery time |
| GET | `/api/shipping/tracking/[trackingNumber]` | Get tracking events |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews?productId=1` | Get approved reviews for a product |
| POST | `/api/reviews` | Submit a review |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Basic health check |

### Setup (One-Time)

These endpoints are only functional before the first admin account is created. They return `409` once an admin exists.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/setup/status` | Check if setup is needed (`?secret=` if `SETUP_SECRET` is set) |
| POST | `/api/setup` | Create database tables and first admin account |

**POST `/api/setup` body:**

```json
{
  "email": "admin@example.com",
  "password": "SecureP@ssw0rd!",
  "confirmPassword": "SecureP@ssw0rd!",
  "firstName": "John",
  "lastName": "Doe",
  "setupSecret": "optional-if-SETUP_SECRET-is-set"
}
```

Password requirements: 12+ characters, uppercase, lowercase, digit, and special character.

## Authenticated Endpoints

Require a valid user session.

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| PUT | `/api/user/profile` | Update profile (name, phone, address) |
| POST | `/api/user/change-password` | Change password |
| GET | `/api/user/orders` | Get user's order history |

### Wishlist

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | Get user's wishlist |
| POST | `/api/wishlist` | Add product to wishlist (`{ productId }`) |
| DELETE | `/api/wishlist?productId=1` | Remove from wishlist |

### Recently Viewed

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recently-viewed?userId=1` | Get recently viewed products |
| POST | `/api/recently-viewed` | Track a product view |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | Get user's subscriptions |
| POST | `/api/subscriptions` | Create a subscription |
| GET | `/api/subscriptions/plans` | List subscription plans |
| GET | `/api/subscriptions/plans/[id]` | Get plan details |

## Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/resend-verification` | Resend verification email |

NextAuth.js also provides:
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

## Admin Endpoints

Require admin session (`isAdmin: true`).

### Products & Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product |
| PUT | `/api/products/[id]` | Update product |
| DELETE | `/api/products/[id]` | Delete product |
| POST | `/api/upload` | Upload image (Vercel Blob) |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories` | Update category |
| DELETE | `/api/admin/categories` | Delete category |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | List all orders |
| PUT | `/api/orders/[id]/status` | Update order status |
| GET | `/api/orders/[id]/invoice` | Get order invoice |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users (supports `?search=`, `?page=`, `?limit=`) |
| GET | `/api/admin/users/[id]` | Get user details |
| PUT | `/api/admin/users/[id]` | Update user |
| GET | `/api/admin/users/stats` | User statistics |

### Coupons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/coupons` | List all coupons |
| POST | `/api/coupons` | Create coupon |
| PUT | `/api/coupons/[id]` | Update coupon |
| DELETE | `/api/coupons/[id]` | Delete coupon |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/reviews` | List all reviews |
| PUT | `/api/admin/reviews` | Update review status |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get store settings |
| GET | `/api/admin/settings` | Get admin settings |
| PUT | `/api/admin/settings` | Update settings |
| GET | `/api/admin/email-settings` | Get email config |
| PUT | `/api/admin/email-settings` | Update email config |
| POST | `/api/admin/email-settings/test` | Send test email |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary?period=30d` | Revenue, orders, customer summary |
| GET | `/api/analytics/trend?metric=revenue&period=30d` | Trend data for charts |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List product inventory |
| PUT | `/api/inventory` | Update stock quantity |
| GET | `/api/admin/inventory/alerts` | Low stock alerts |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/health` | Admin health check |
| GET | `/api/admin/system/health` | Detailed system metrics |
| POST | `/api/admin/backup` | Create database backup |
| POST | `/api/admin/restore` | Restore from backup |
| GET | `/api/admin/security/logs` | Security event logs |
| POST | `/api/admin/security/logs` | Create security log entry |
| GET | `/api/admin/contacts` | Customer contact messages |
| POST | `/api/admin/init` | Initialize database |

### Carriers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/carriers` | List carriers |
| PUT | `/api/admin/carriers/[id]` | Update carrier |
| DELETE | `/api/admin/carriers/[id]` | Delete carrier |
