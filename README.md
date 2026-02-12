# Hillbilly Fightwear - Official Store

A full-featured e-commerce store with custom garment builder using Hono framework and Cloudflare Pages.

## Project Overview
- **Name**: Hillbilly Fightwear Store
- **Goal**: E-commerce platform with custom apparel builder
- **Features**: Hero slideshow, product grid, custom garment designer with Fabric.js canvas, Stripe checkout

## URLs
- **Production**: https://hillbilly-fightwear.pages.dev
- **Builder**: https://hillbilly-fightwear.pages.dev/build
- **Custom Domain**: (Pending client approval - DNS configuration ready)

## Features

### Homepage
- Announcement bar with promotional messaging
- **Full-screen hero carousel** with 6 rotating MMA/rodeo action images (4K upscaled)
- Logo overlay with transparent background
- Pause/Play functionality for slideshow
- Slide navigation dots
- Dual CTA buttons: "Build Your Own" + "Shop Now"
- Scroll indicator animation
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
| T-Shirt (Unisex) | $30.00 |
| Tank Top (Men's) | $35.00 |
| Tank Top (Women's) | $35.00 |
| Trucker Hat | $35.00 |
| Beanie | $25.00 |
| Sweatshirt | $45.00 |
| Hoodie | $50.00 |
| Additional Graphic | +$10.00 |

### Graphics Library (22 Total)

**Core HFW Logos:**
- **HFW 3D Black** - 3D effect black logo
- **HFW Black Shadow** - Black with shadow
- **HFW Metal Gloves** - Metal gloves variant
- **HFW White Outline** - White outline variant
- **HFW Logo** - Original HFW logo

**Slogan Graphics:**
- **Thump A Stranger** - Brand slogan design
- **Human Cockfighter** - Fighter artwork
- **MYOB** - "Mind Y'own Business" (Red/White/Blue)
- **GNF** - "G-N-F" patriotic letters
- **WIMB** - "What's It Mean To You?"
- **Cling to Guns** - Patriotic slogan
- **Yes, You Can** - Motivational text
- **Put It On Em** - Fighting slogan
- **Obama Tap** - Political humor
- **Good for Community** - Community message
- **Hard Hittin'** - Fighting slogan
- **Staunch Properties (CHM)** - Partner graphic

**Partner Logos:**
- **GPG Design** - Partner graphic
- **YYCF Logo** - Partner logo
- **FUN Logo** - Brand variant

**Women's Exclusive (Tank Tops & T-Shirts Only):**
- **Thumpin' Is Lovin' (Pink)** 💗 - Women's exclusive
- **Thumpin' Is Lovin' (Purple)** 💜 - Women's exclusive

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
| `/api/shop-products` | GET | All 46 shop products |
| `/api/calculate-price` | POST | Calculate order price |
| `/api/shop-checkout` | POST | Cart checkout via Stripe |
| `/api/create-checkout` | POST | Create Stripe checkout session |
| `/checkout/success` | GET | Order confirmation page |
| `/favicon.ico` | GET | Favicon (returns 204) |

## Tech Stack
- **Framework**: Hono
- **Canvas**: Fabric.js 5.x
- **Styling**: Tailwind CSS (local pre-built, 7KB minified) + Custom CSS
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
- **Slides**: 6 locally hosted 4K images (`/images/slides/`)
  - slide-cage-coach.jpg - Coach through cage fence
  - slide-gpg-handshake.jpg - GPG fighter handshake
  - slide-backstage.jpg - Backstage after fight
  - slide-cage-grapple.jpg - Cage grappling with HFW branding
  - slide-ring-fight.jpg - Ring fight action
  - slide-bullrider.jpg - Bull riding with HFW gear
- **Hero Logo**: Transparent 3D embossed logo (`/images/graphics/hillbilly-fightwear-logo.png`)
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
| Graphics | 10 | 8.3MB |
| Slides (4K) | 6 | 15MB |
| Worker Bundle | 1 | 78KB |
| **Total** | **50** | **~39MB** |

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
│   ├── index.tsx          # Main Hono app (homepage, build routes)
│   ├── data/
│   │   └── catalog.ts     # Product catalog data (garments, graphics, shop products)
│   ├── routes/
│   │   ├── api.ts         # API endpoints (data, checkout, pricing)
│   │   └── pages.ts       # Static pages (success, privacy, cookie, 404)
│   └── tailwind-input.css # Tailwind CSS entry point
├── public/
│   ├── images/
│   │   ├── garments/      # 38 garment mockup images (front/back, incl. pink)
│   │   ├── graphics/      # 10 logo/artwork images + hero logo
│   │   ├── stickers/      # 14 sticker images (incl. GNF red/blue variant)
│   │   └── slides/        # 6 slideshow images (4K)
│   ├── static/
│   │   └── tailwind.css   # Pre-built minified Tailwind CSS
│   └── _routes.json       # Static file routing config
├── dist/                  # Build output
├── tailwind.config.js     # Tailwind CSS configuration
├── package.json
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc
├── ecosystem.config.cjs   # PM2 configuration
└── README.md
```

## Recent Updates (v5.0.0 - Code Review & Stability)
- **Fixed: Hoodie graphic disappearing on color change** - Added 30ms debounce to `updatePreview()` eliminating the async race condition where rapid state changes caused stale `previewUpdateId` callbacks to drop graphics
- **Fixed: All garment backgrounds now pure white** - Changed `#f7f7f7` to `#ffffff` across product-image-wrapper, Shop modal previews, decal modal previews, cart thumbnails, and Build canvas
- **Refactored canvas constants**: Extracted `PRINT_AREA`, `PLACEMENT_POSITIONS`, and `isPlacementVisibleForView()` helper to reduce duplication and improve calibration clarity
- **Fixed: Add Graphic modal now filters restricted graphics** - Modal was previously showing all graphics regardless of garment; now respects `restrictToGarments`
- **Improved keyboard accessibility**: Space key now triggers product card modals with proper `preventDefault`
- **Hardened null checks**: Defensive guards in `renderAdditionalGraphics`, `addToCart` (zipupHoodieImages guard), and API validation
- **Simplified scaling handler**: Canvas object:scaling reduced to single clamped expression
- **Cleaned up dead code**: Removed no-op event handler comment, improved inline documentation

## Previous Updates (v4.0.0 - Production Hardening)
- **CSP Nonces**: Per-request cryptographic nonces for inline script protection
- **Local Tailwind CSS**: Replaced CDN with pre-built 7KB minified CSS
- **Modular Routes**: Extracted API (279 lines), pages (331 lines), catalog (346 lines)
- **XSS Hardening**: HTML-escaped product titles/values in modal and cart rendering
- **Color Preview Fix**: Modal updates garment preview when color selection changes
- **Pink Tank Variants**: Added pink color option with generated preview images
- **D11 Sticker Fix**: Distinct red/blue GNF variant image (was duplicate of d1)
- **Price Calibration**: Corrected featured item pricing to match catalog
- **Error Handling**: Improved addToCart/openProductModal error logging
- **46 Shop Products**: 32 garments + 14 decals across 5 categories verified

## Previous Updates (v3.0.0)
- **Full-screen hero carousel** with 6 new MMA/rodeo action images
- **4K upscaled images** for crisp display on all devices
- **New 3D embossed logo** with transparent background
- **Dual CTA buttons** (Build Your Own + Shop Now)
- **System cleanup**: Removed ~5MB of unused assets
- **Optimized CSS**: background-size: contain for full image visibility
- Zero external dependencies for assets

## Previous Updates (v2.1.0)
- Generated 33 flat-lay garment images with front/back views
- Downloaded and localized all graphics (no Shopify CDN)
- Fixed front/back toggle wiring for canvas preview

## Original Source
Enhanced from: https://hillbilly-fightwear.myshopify.com/

---
**Status**: Active  
**Last Updated**: 2026-02-12  
**Version**: 5.0.0 (Code Review & Stability - Debounced preview, white backgrounds, refactored constants)
