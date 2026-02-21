# Email Configuration

Open Store uses Nodemailer to send transactional emails. It works with any SMTP provider.

## SMTP Setup

### Environment Variables

Add these to `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM='"My Store" <your-email@gmail.com>'
```

### Common Providers

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

To use Gmail, you need an [App Password](https://myaccount.google.com/apppasswords):
1. Enable 2-factor authentication on your Google account
2. Go to Security > App passwords
3. Generate a new app password for "Mail"
4. Use that password as `SMTP_PASS`

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

#### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## Admin Configuration

Email settings can also be configured from the admin panel:

1. Go to **Admin > Settings > Email**
2. Enter SMTP host, port, username, password
3. Set the sender email and name
4. Click **Save**
5. Use **Send Test Email** to verify the configuration

Admin-configured settings override environment variables.

## Email Types

Open Store sends 7 types of transactional emails:

| Email | Trigger | Content |
|-------|---------|---------|
| **Order Confirmation** | Payment successful | Order details, items, total, shipping address |
| **Order Status Update** | Admin updates status | New status, tracking number (if shipped) |
| **Shipping Notification** | Order marked as shipped | Tracking number, estimated delivery |
| **Welcome Email** | New user registration | Welcome message, email verification link |
| **Email Verification** | Registration / resend | Verification link with expiry |
| **Password Reset** | Forgot password request | Reset link with expiry |
| **Contact Form** | Customer submits contact form | Customer message forwarded to store email |

## Email Templates

All email templates are defined in `lib/email.ts`. They use inline HTML/CSS for maximum email client compatibility.

Templates include:
- Responsive design (works on mobile)
- Store branding (name, colors)
- Order details with item images
- Action buttons (track order, reset password)
- Footer with store contact info

## Testing

### Test from Admin Panel

1. Go to **Admin > Settings > Email**
2. Enter a recipient email address
3. Click **Send Test Email**
4. Check your inbox

### Test via API

```bash
curl -X POST http://localhost:3000/api/admin/email-test \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"to": "test@example.com"}'
```

## Troubleshooting

### Emails not sending
- Check SMTP credentials are correct
- Verify the SMTP port (587 for TLS, 465 for SSL)
- Check server logs for SMTP connection errors
- Some providers require enabling "less secure apps" or app passwords

### Emails going to spam
- Set up SPF, DKIM, and DMARC records for your domain
- Use a custom domain instead of gmail.com as the sender
- Avoid spam trigger words in subject lines

### Gmail "Sign-in attempt blocked"
- Use an App Password instead of your regular password
- Enable 2-factor authentication first
