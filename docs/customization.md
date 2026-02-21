# Customization Guide

Open Store is designed to be easily customizable for your brand.

## Store Branding

### Store Name & Info

Update via **Admin > Settings** or environment variables:

```env
STORE_NAME="My Awesome Store"
STORE_EMAIL="hello@mystore.com"
STORE_PHONE="+1 (555) 123-4567"
STORE_ADDRESS="123 Main St, City, State 12345"
STORE_CURRENCY="USD"
```

These values appear in:
- Page header and footer
- Email templates
- Meta tags and SEO
- Contact page
- Order confirmations

### Logo

Replace the logo file at `public/images/logo.png`. Recommended size: 200x50px, PNG with transparent background.

### Favicon

Replace `public/favicon.ico` with your favicon. Use [favicon.io](https://favicon.io) to generate from an image.

## Color Theme

The color scheme is defined in `tailwind.config.ts` and `app/globals.css`.

### Changing the Primary Color

Edit `tailwind.config.ts` to change the primary color scheme:

```js
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        // ... customize your primary color scale
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
      },
    },
  },
}
```

### CSS Variables

Global styles are in `app/globals.css`. Key variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 72.2% 50.6%;
  --primary-foreground: 0 85.7% 97.3%;
  /* ... */
}
```

## Layout & Pages

### Header

Edit `components/Header.tsx` to customize:
- Navigation links
- Logo placement
- Search bar behavior
- Cart icon

### Footer

Edit `components/Footer.tsx` to customize:
- Footer links
- Social media links
- Copyright text
- Newsletter signup

### Homepage

The homepage (`app/page.tsx`) is composed of:
- `HeroBanner` - Main banner with call-to-action
- `FeaturedCategories` - Category grid
- `BestSellers` - Top products carousel
- Product listings

Rearrange, add, or remove components to customize the layout.

### Static Pages

These pages can be edited directly:
- `app/about/page.tsx` - About page
- `app/contact/page.tsx` - Contact form
- `app/faq/page.tsx` - FAQ section
- `app/privacy/page.tsx` - Privacy policy
- `app/terms/page.tsx` - Terms of service

## SEO

### Admin SEO Settings

Go to **Admin > SEO** to configure:
- Default page title and description
- Open Graph image
- Social media meta tags

### Per-Page Meta Tags

Each page exports metadata via Next.js conventions:

```tsx
export const metadata = {
  title: 'Page Title - Store Name',
  description: 'Page description for search engines',
};
```

Dynamic pages (products, categories) generate metadata from database content.

## Adding New Pages

### Static Page

Create a new file at `app/your-page/page.tsx`:

```tsx
export default function YourPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Your Page Title</h1>
      <p>Your content here.</p>
    </div>
  );
}
```

### Adding to Navigation

Edit `components/Header.tsx` to add navigation links.

## Adding New Product Fields

1. Add the column to `lib/schema.sql`
2. Run `npm run db:setup`
3. Update queries in `lib/db.ts`
4. Update the admin product form in `app/admin/products/page.tsx`
5. Update the product display in `app/product/[id]/page.tsx`

## UI Components

Open Store uses [shadcn/ui](https://ui.shadcn.com) components built on [Radix UI](https://radix-ui.com).

Available components in `components/ui/`:
- Button, Input, Label, Textarea
- Card, Badge, Separator
- Dialog, Sheet, Popover
- Select, Checkbox, Switch
- Table, Tabs
- Toast notifications (via Sonner)

### Adding New UI Components

```bash
npx shadcn-ui@latest add [component-name]
```

## Image Optimization

Images are optimized by Next.js Image component:
- Automatic WebP/AVIF conversion
- Responsive sizing
- Lazy loading

To add new image domains (for external images), edit `next.config.js`:

```js
images: {
  domains: ['images.unsplash.com', 'your-domain.com'],
}
```
