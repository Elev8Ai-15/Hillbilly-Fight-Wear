# Hillbilly Fightwear - Official Store

A full-featured e-commerce store with custom garment builder using Hono framework and Cloudflare Pages.

## Project Overview
- **Name**: Hillbilly Fightwear Store
- **Goal**: E-commerce platform with custom apparel builder
- **Features**: Hero slideshow, product grid, custom garment designer with Fabric.js canvas, Stripe checkout

## URLs
- **Development**: https://3000-ik0qpv8i47hoxolmj0mr3-b32ec7bb.sandbox.novita.ai
- **Builder**: https://3000-ik0qpv8i47hoxolmj0mr3-b32ec7bb.sandbox.novita.ai/build

## Features

### Homepage
- Announcement bar with promotional messaging
- Hero slideshow with 4 rotating slides (5-second auto-advance)
- Pause/Play functionality for slideshow
- Slide navigation dots
- "Official Store" overlay text on first slide
- **"Build Your Own" CTA section**
- Featured product grid (6 t-shirt products)
- Product cards linking to builder with pre-selections
- Feature row promoting custom apparel builder
- Fully responsive design (mobile, tablet, desktop)

### Custom Garment Builder (/build)
- **5-Step Wizard Interface**:
  1. Choose Garment (T-Shirt, Sweatshirt, Hoodie, Tank Tops, Trucker Hat)
  2. Select Size (XS - XXXL, or hat sizes)
  3. Select Color (White, Grey, Black)
  4. Choose Graphics (11 HFW logos/designs)
  5. Select Placement (Full Front/Back, Left/Right Chest, Hat Front)
- **Real-time Fabric.js Canvas Preview**
  - Live preview of garment with graphic overlay
  - **Front/Back view toggle** (automatic switching based on placement)
  - Graphics overlay with proper positioning
- **Multiple Graphics Support**
  - Add additional graphics (+$10 each)
  - Choose different placements for each
- **Dynamic Pricing**
  - Real-time price calculation
  - Order summary with itemized breakdown
- **Stripe Checkout Integration**
  - Secure payment processing
  - Configuration metadata preserved
  - Success/Cancel pages

### Pricing
| Garment | Base Price |
|---------|------------|
| T-Shirt (Unisex) | $23.00 |
| Tank Top (Men's) | $20.00 |
| Tank Top (Women's) | $20.00 |
| Trucker Hat | $25.00 |
| Sweatshirt | $45.00 |
| Hoodie | $55.00 |
| Additional Graphic | +$10.00 |

### Graphics Library (11 Total)
- **HFW Original** - Main Hillbilly Fightwear logo
- **HFW 3D Black** - 3D effect black logo
- **HFW Metal Gloves** - Metal gloves variant
- **HFW Black Shadow** - Black with shadow
- **HFW White Outline** - White outline variant
- **HFW Logo** - Original HFW logo
- **Human Cockfighter** - Fighter artwork
- **Thump A Stranger** - Brand slogan design
- **GPG Design** - Partner graphic
- **YYCF Logo** - Partner logo
- **FUN Logo** - Brand variant

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main store homepage |
| `/build` | GET | Custom garment builder |
| `/api/garments` | GET | All available garments with prices |
| `/api/graphics` | GET | All available graphics |
| `/api/placements` | GET | Available placement options |
| `/api/products` | GET | Featured products |
| `/api/slides` | GET | Homepage slideshow data |
| `/api/calculate-price` | POST | Calculate order price |
| `/api/create-checkout` | POST | Create Stripe checkout session |
| `/checkout/success` | GET | Order confirmation page |
| `/favicon.ico` | GET | Favicon (returns 204) |

## Tech Stack
- **Framework**: Hono
- **Canvas**: Fabric.js 5.x
- **Styling**: Tailwind CSS (CDN) + Custom CSS
- **Icons**: FontAwesome 6.4.0 (CDN)
- **Fonts**: Oswald (Google Fonts)
- **Payments**: Stripe Checkout
- **Deployment**: Cloudflare Pages/Workers

## Data Architecture

### Garment Images (33 Total)
All AI-generated flat-lay mockup images served locally:
- **Front/Back views** for all tops (T-Shirt, Sweatshirt, Hoodie, Tank Tops)
- **Single view** for Trucker Hats
- **3 colors each**: White, Black, Grey
- Location: `/images/garments/`

### Graphics Assets (11 Total)
All locally hosted in `/images/graphics/`:
- No external Shopify CDN dependencies
- Optimized for canvas overlay

### Homepage Assets
- **Slides**: 4 locally hosted images (`/images/slides/`)
- **Hero Background**: Local hero image (`/images/hero-bg.jpg`)
- **Product Thumbnails**: Local graphics images

### Storage
- **Static Assets**: Cloudflare Pages (auto-served from public/)
- **Product Data**: In-memory TypeScript arrays
- **Payments**: Stripe (external service)
- **Future**: Cloudflare D1 for order history

## Asset Summary
| Category | Count | Size |
|----------|-------|------|
| Garment Images | 33 | 16MB |
| Graphics | 11 | 1.9MB |
| Slides | 4 | 1.1MB |
| Hero Background | 1 | 80KB |
| Worker Bundle | 1 | 76KB |
| **Total** | **50** | **~19MB** |

## User Guide

### Browsing
1. Visit homepage to see featured products
2. Watch the hero slideshow auto-rotate
3. Click any product to jump to builder with that graphic

### Building Custom Apparel
1. Click "Start Designing" or go to `/build`
2. **Step 1**: Select your garment type
3. **Step 2**: Choose your size
4. **Step 3**: Pick a color (watch preview update!)
5. **Step 4**: Select a graphic from the gallery
6. **Step 5**: Choose where to place the graphic
7. **Toggle Front/Back** to see different placements
8. Optional: Add more graphics (+$10 each)
9. Review your order summary
10. Click "Proceed to Checkout" for Stripe payment

## Environment Variables

For Stripe integration, set these in `.dev.vars` (local) or Cloudflare secrets (production):

```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
```

## Development

### Local Development
```bash
npm install
npm run build
pm2 start ecosystem.config.cjs
```

### Production Deployment
```bash
npm run build
npx wrangler pages deploy dist
```

## Project Structure
```
webapp/
├── src/
│   └── index.tsx          # Main Hono app (routes, data, APIs)
├── public/
│   ├── images/
│   │   ├── garments/      # 33 garment mockup images (front/back)
│   │   ├── graphics/      # 11 logo/artwork images
│   │   ├── slides/        # 4 slideshow images
│   │   └── hero-bg.jpg    # Hero section background
│   └── _routes.json       # Static file routing config
├── dist/                  # Build output
├── package.json
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc
├── ecosystem.config.cjs   # PM2 configuration
└── README.md
```

## Recent Updates (v2.1.0)
- Generated 33 flat-lay garment images with front/back views
- Added 4 new user-provided logo variants
- Downloaded and localized all 11 graphics (no Shopify CDN)
- Downloaded slides and hero images locally
- Fixed front/back toggle wiring for canvas preview
- Updated all product/slide arrays with local paths
- Zero external Shopify dependencies
- Optimized image assets

## Original Source
Enhanced from: https://hillbilly-fightwear.myshopify.com/

---
**Status**: Active  
**Last Updated**: 2026-01-20  
**Version**: 2.1.0 (Full Local Assets Release)
