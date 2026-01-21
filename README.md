# Velocity Electric - Master Electrician Lead-Gen Website

A complete, production-ready lead generation website for a Master Electrician business built with Next.js 14, React, TypeScript, TailwindCSS, Neon Postgres, and Prisma.

## Features

- **Mobile-First Design**: Optimized for conversion with sticky CTAs and fast booking
- **Admin CMS**: Full CRUD for services, service areas, testimonials, and promos
- **Lead Management**: Form validation, database storage, and email notifications
- **Local SEO**: Schema markup, sitemap, robots.txt, and city-specific pages
- **Analytics Ready**: GA4 integration with event tracking
- **Anti-Spam**: Honeypot fields and rate limiting

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS with custom design system
- **Database**: Neon Postgres + Prisma ORM
- **Forms**: React Hook Form + Zod validation
- **Email**: Resend
- **Rate Limiting**: Upstash Redis (with in-memory fallback)
- **Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Neon Postgres database (or any Postgres)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd velocityelectric
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:
   ```env
   # Required
   DATABASE_URL="postgresql://..."
   ADMIN_PASSWORD="your-secure-password"

   # Optional but recommended
   RESEND_API_KEY="re_..."
   OWNER_NOTIFICATION_EMAIL="owner@example.com"
   NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
   NEXT_PUBLIC_GA_ID="G-..."

   # Optional (falls back to in-memory)
   UPSTASH_REDIS_REST_URL=""
   UPSTASH_REDIS_REST_TOKEN=""
   ```

3. **Set up the database**:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

4. **Seed with starter content**:
   ```bash
   pnpm db:seed
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Admin Access

Navigate to `/admin/login` and enter your `ADMIN_PASSWORD`.

## Project Structure

```
src/
├── app/
│   ├── (marketing)/        # Public pages
│   │   ├── page.tsx        # Home
│   │   ├── about/
│   │   ├── contact/
│   │   ├── reviews/
│   │   ├── specials/
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   └── service-areas/
│   │       ├── page.tsx
│   │       └── [slug]/
│   ├── admin/              # Admin CMS
│   │   ├── page.tsx        # Dashboard
│   │   ├── leads/
│   │   ├── services/
│   │   ├── service-areas/
│   │   ├── testimonials/
│   │   ├── promos/
│   │   └── settings/
│   ├── actions/            # Server Actions
│   ├── api/
│   ├── layout.tsx
│   ├── globals.css
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                 # Base components
│   ├── layout/             # Header, Footer, etc.
│   ├── sections/           # Page sections
│   ├── forms/              # Form components
│   └── seo/                # Schema markup
├── lib/
│   ├── db.ts               # Prisma client
│   ├── config.ts           # Site config
│   ├── utils.ts            # Utilities
│   ├── email.ts            # Email service
│   ├── rate-limit.ts       # Rate limiting
│   ├── analytics.ts        # GA4 tracking
│   └── validations.ts      # Zod schemas
└── public/
    └── brand/
        └── logo.png        # Your logo
```

## Customization

### Brand Colors

Edit `src/app/globals.css`:

```css
:root {
  --color-primary: #0B1F3B;
  --color-accent: #1E88FF;
  /* ... other tokens */
}
```

### Logo

Replace `public/brand/logo.svg` with your logo. If using PNG format:
1. Save as `public/brand/logo.svg` or `public/brand/logo.png`
2. Update references in `src/components/layout/header.tsx` and `footer.tsx` if changing format

### Business Info

1. Update via Admin CMS at `/admin/settings`
2. Or edit the seed data in `prisma/seed.ts`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

The build command is automatically detected. Vercel will run:
```bash
pnpm build
```

### Other Platforms

Build command:
```bash
pnpm build
```

Start command:
```bash
pnpm start
```

## Database Commands

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema changes
pnpm prisma db push

# Run migrations (production)
pnpm prisma migrate deploy

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:migrate   # Run Prisma migrations
pnpm db:push      # Push schema to database
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
```

## Pages Overview

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, services, reviews |
| `/services` | Services listing |
| `/services/[slug]` | Service detail page |
| `/service-areas` | Service areas listing |
| `/service-areas/[slug]` | City-specific SEO page |
| `/about` | About the business |
| `/reviews` | Customer testimonials |
| `/specials` | Current promotions |
| `/contact` | Contact form |
| `/admin` | Admin dashboard |
| `/admin/leads` | Lead management |
| `/admin/services` | Service CRUD |
| `/admin/service-areas` | Area CRUD |
| `/admin/testimonials` | Review CRUD |
| `/admin/promos` | Promo CRUD |
| `/admin/settings` | Site configuration |

## SEO Features

- Dynamic meta tags per page
- LocalBusiness schema markup
- FAQ schema on service/area pages
- Auto-generated sitemap.xml
- robots.txt configuration
- City-specific landing pages
- NAP (Name, Address, Phone) in footer

## Lead Flow

1. User fills booking form
2. Honeypot check for spam
3. Rate limiting by IP
4. Server-side validation
5. Save to database
6. Email notification to owner
7. Success confirmation to user
8. GA4 event tracking

## License

Private - All rights reserved
