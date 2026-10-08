# Hillbilly Fightwear - Official Store

A full-featured e-commerce store with custom garment builder using Hono framework and Cloudflare Pages.

## Project Overview
- **Name**: Hillbilly Fightwear Store
- **Goal**: E-commerce platform with custom apparel builder
- **Features**: Hero slideshow, product grid, custom garment designer with Fabric.js canvas, Stripe checkout, YouTube video embed, comprehensive security hardening

## URLs
- **Production**: https://hillbilly-fightwear.pages.dev
- **Custom Domain (www)**: https://www.hillbillyfightwear.com
- **Custom Domain (apex)**: https://hillbillyfightwear.com
- **Builder**: https://www.hillbillyfightwear.com/build
- **Contact**: https://www.hillbillyfightwear.com/contact
- **GitHub**: https://github.com/Elev8Ai-15/Hillbilly-Fight-Wear

## Features

### Homepage
- Announcement bar with promotional messaging
- **Scrapbook-style sticker collage** with branded graphics (desktop: absolute positioned, mobile: 3-column grid)
- Logo overlay with transparent background
- **"Build Your Own" CTA section** with featured product grid
- Product cards linking to builder with pre-selections
- **YouTube video embed** (above photo carousel)
- **Full-screen hero carousel** with 6 rotating MMA/rodeo action images
- Pause/Play functionality, navigation dots
- Podcast/Blog section with Spotify embed
- Feature row promoting custom apparel builder
- Fully responsive design (mobile, tablet, desktop)

### Shop
- **48 products** across 5 categories: Men's (13), Women's (7), Kids (1), Hats (12), Decals (15)
- Product modal with size/color/style selection
- Front/Back image hover flip on product cards
- Shopping cart drawer with promo nudges and real-time pricing
- Stripe checkout integration

### Custom Garment Builder (/build)
- **5-Step Wizard Interface**:
  1. Choose Garment (T-Shirt, Sweatshirt, Hoodie, Tank Tops, Trucker Hat, Beanie)
  2. Select Size (XS - XXXL, or hat sizes)
  3. Select Color (White, Grey, Black)
  4. Choose Graphics (20 HFW logos/designs)
  5. Placement auto-assigned (front center + HFW 3" back neck)
- **Real-time Fabric.js Canvas Preview** with front/back toggle
- **Multiple Graphics Support** (+$10 each additional)
- **Dynamic Pricing** with real-time order summary
- **Stripe Checkout Integration** with success/cancel pages

### Contact Page (/contact)
- Contact form with email delivery via Resend API
- Form validation with HTML sanitization

### Security (22 hardening rules)
- CSP with per-request nonces (no unsafe-eval)
- HSTS with preload
- SRI integrity hashes on all CDN resources
- Stripe session ID validation
- Open redirect protection
- CORS strict origin matching
- Rate-limited request body size (1 MB)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main store homepage |
| `/build` | GET | Custom garment builder |
| `/contact` | GET | Contact form page |
| `/checkout/success` | GET | Order confirmation page |
| `/privacy-policy` | GET | Privacy policy page |
| `/cookie-policy` | GET | Cookie policy page |
| `/robots.txt` | GET | Robots directives |
| `/api/garments` | GET | All available garments with prices |
| `/api/graphics` | GET | All available graphics |
| `/api/placements` | GET | Available placement options |
| `/api/products` | GET | Featured products |
| `/api/shop-products` | GET | All 48 shop products |
| `/api/slides` | GET | Homepage slideshow data |
| `/api/pricing` | GET | Pricing constants, shipping, promos |
| `/api/stripe/status` | GET | Stripe configuration status |
| `/api/calculate-price` | POST | Calculate builder order price |
| `/api/cart-pricing` | POST | Calculate cart pricing with promos |
| `/api/shop-checkout` | POST | Cart checkout via Stripe |
| `/api/create-checkout` | POST | Builder checkout via Stripe |
| `/api/contact` | POST | Submit contact form |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/stripe/sync-catalog` | POST | Sync products to Stripe |
| `/api/send-receipt` | POST | Resend order receipt |
| `/api/preview-receipt` | POST | Preview receipt HTML |

## Tech Stack
- **Framework**: Hono 4.x
- **Canvas**: Fabric.js 5.3.1 (with SRI hash)
- **Styling**: Tailwind CSS (local pre-built, minified) + Custom CSS
- **Icons**: FontAwesome 6.4.0 (CDN, with SRI hash)
- **Fonts**: Oswald (Google Fonts)
- **Payments**: Stripe Checkout (live mode)
- **Email**: Resend API
- **Build**: Vite 5.x + TypeScript 5.x
- **CLI**: Wrangler 4.71.0
- **Deployment**: Cloudflare Pages/Workers

## Data Architecture

### Product Catalog (`src/data/catalog.ts`)
- **ShopProduct type**: Strictly typed with `'garment' | 'decal'` union
- **Men's Clothing**: 13 items (2 hoodies, 11 t-shirts)
- **Women's Clothing**: 7 tank tops (incl. pink/purple Thumpin' variants)
- **Kids**: 1 youth hoodie
- **Hats**: 12 (beanies, fitted, adjustable)
- **Decals**: 15 sticker/decal products
- All product images served from `/images/products/web/`

### Graphics Library (20 Total)
All locally hosted in `/images/graphics/`:
- 3 HFW logo variants
- 12 slogan/artwork graphics
- 3 partner logos (GPG, YYCF, FUN)
- 2 women's exclusives (Thumpin' Pink/Purple)

### Static Assets
| Category | Count | Size |
|----------|-------|------|
| Product Images | ~60 | ~8 MB |
| Garment Mockups | 38 | ~4 MB |
| Graphics | 20 | ~3 MB |
| Stickers | 15 | ~1 MB |
| Slides | 6 | ~2 MB |
| Portfolio | 17 | ~2 MB |
| Worker Bundle | 1 | 348 KB |
| **Total** | **~160** | **~20 MB** |

### Storage
- **Static Assets**: Cloudflare Pages CDN (30-day cache, immutable)
- **Product Data**: TypeScript arrays in `src/data/catalog.ts`
- **Payments**: Stripe (external)
- **Email**: Resend API (external)

## Environment Variables

For local development (`.dev.vars`):
```
STRIPE_SECRET_KEY=sk_...
RESEND_API_KEY=re_...
```

For production (Cloudflare secrets):
```bash
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name hillbilly-fightwear
npx wrangler pages secret put RESEND_API_KEY --project-name hillbilly-fightwear
```

## Development

### Local Development
```bash
npm install
npm run build
pm2 start ecosystem.config.cjs
# Server at http://localhost:3000
```

### Production Deployment
```bash
npm run build
npx wrangler pages deploy dist --project-name hillbilly-fightwear
```

### Useful Commands
```bash
npm run build:css          # Rebuild Tailwind CSS only
npx tsc --noEmit           # TypeScript type check (0 errors)
npm audit                  # Security audit (2 moderate, dev-only)
pm2 logs --nostream        # Check server logs
pm2 restart hillbilly-fightwear  # Restart dev server
```

## Project Structure
```
webapp/
├── src/
│   ├── index.tsx          # Main Hono app (homepage + builder, 5.5K lines)
│   ├── data/
│   │   └── catalog.ts     # Product catalog (garments, graphics, shop products)
│   ├── routes/
│   │   ├── api.ts         # API endpoints (checkout, pricing, webhooks)
│   │   └── pages.ts       # Static pages (success, privacy, cookie, contact, 404)
│   ├── utils/
│   │   ├── html.ts        # Shared HTML escape helper
│   │   ├── pricing.ts     # Pricing engine (promos, cart calc, validation)
│   │   ├── stripe.ts      # Stripe API integration (checkout, sync, receipts)
│   │   └── email-receipt.ts # HTML/text email receipt generator
│   └── tailwind-input.css # Tailwind CSS entry point
├── public/
│   ├── images/            # All product, garment, graphic, slide, portfolio images
│   ├── static/
│   │   └── tailwind.css   # Pre-built minified Tailwind CSS
│   ├── _headers           # Cloudflare security headers config
│   ├── _routes.json       # Static file routing config
│   └── manifest.json      # PWA manifest
├── ecosystem.config.cjs   # PM2 configuration
├── package.json
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc
└── README.md
```

## Recent Updates

### v6.0.0 - Full Project Scan & Optimization (2026-03-09)
**17 issues fixed across all source files:**

**Critical Fixes:**
- Fixed swapped front/back images for m2 (Thump Hoodie), m9 (WIMB), m10 (Cling to Guns)
- Fixed 10 TypeScript compilation errors (explicit `ShopProduct[]` typing + Stripe `updated` field)
- Removed duplicate `updated` variable declaration in `stripe.ts`

**Security & Dependencies:**
- Upgraded wrangler 3.114.17 -> 4.71.0 (7 vulns -> 2 dev-only)
- CORS `!origin` now returns production domain instead of wildcard `*`
- Annotated all `any` types with eslint-disable comments for traceability

**Performance:**
- Optimized 44 PNGs (up to 82% reduction) + 14 JPGs — images 27 MB -> 20 MB
- Added `loading="lazy"` to 4 dynamically-inserted image templates
- Updated browserslist database

**Code Quality:**
- Removed dead `renderPlacements()` function
- Deleted orphaned h6 images and temp/ directory
- Consolidated 4 duplicate `escHtml` functions into shared `src/utils/html.ts`
- Extracted magic numbers to named constants (`MAX_REQUEST_BODY_BYTES`, `DATA_CACHE_SECONDS`)

**Build Status:** 0 errors, 0 TypeScript errors, 347.68 KB bundle

### v5.3.0 - Security Hardening (2026-03-04)
- 22-point security hardening patch (SEC-01 through SEC-22)
- Removed `unsafe-eval` from CSP; Fabric.js loads with nonce
- Added HSTS, COOP, SRI hashes, Stripe session validation
- Open redirect guard, contact form sanitization, strict CORS

### v5.2.0 - YouTube, Sticker Updates (2026-02-19)
- Added YouTube video embed above photo carousel
- Removed HFW Logo sticker (sticker-15) from hero collage
- Added Women's Tank - Thumpin Is Lovin (Hot Pink) as w7
- Purple Thumpin Is Lovin graphic added to Build Your Own

### v5.1.0 - Publishing & Cleanup
- Custom domains configured (www + apex)
- GNF sticker position fix
- Comprehensive dead code cleanup (10 files, 735 lines removed)

---
**Status**: Active  
**Last Updated**: 2026-03-09  
**Version**: 6.0.0
