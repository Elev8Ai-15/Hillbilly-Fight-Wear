# Hillbilly Fightwear - Official Store

A recreation of the Hillbilly Fightwear Shopify store as a lightweight web application using Hono framework and Cloudflare Pages.

## Project Overview
- **Name**: Hillbilly Fightwear Store
- **Goal**: Recreate the Hillbilly Fightwear e-commerce landing page
- **Features**: Hero slideshow, product grid, responsive design

## URLs
- **Development**: https://3000-ik0qpv8i47hoxolmj0mr3-b32ec7bb.sandbox.novita.ai

## Features

### Completed Features
- ✅ Announcement bar with "Additional Products Coming Soon" message
- ✅ Hero slideshow with 4 rotating slides (5-second auto-advance)
- ✅ Pause/Play functionality for slideshow
- ✅ Slide navigation dots
- ✅ "Official Store" overlay text on first slide
- ✅ Featured product grid (6 t-shirt products)
- ✅ Product cards with image, title, vendor, and price
- ✅ "View All" button
- ✅ Feature row with image and "More Coming Soon" text
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Search drawer (UI ready)

### API Endpoints
- `GET /` - Main store page
- `GET /api/products` - Returns product data as JSON
- `GET /api/slides` - Returns slideshow data as JSON

## Tech Stack
- **Framework**: Hono
- **Styling**: Tailwind CSS (CDN) + Custom CSS
- **Icons**: FontAwesome (CDN)
- **Fonts**: Oswald (Google Fonts)
- **Deployment**: Cloudflare Pages

## User Guide

1. Visit the homepage to see the full store experience
2. Watch the hero slideshow auto-rotate through fighter images
3. Click dots or pause button to control the slideshow
4. Browse the featured t-shirt collection
5. Click "View All" to see all products (placeholder)

## Deployment

### Development
```bash
npm install
npm run build
npm run dev:sandbox
```

### Production
```bash
npm run deploy
```

## Project Structure
```
webapp/
├── src/
│   └── index.tsx      # Main Hono application
├── dist/              # Build output
├── package.json
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc
└── ecosystem.config.cjs
```

## Original Source
Recreated from: https://hillbilly-fightwear.myshopify.com/

---
**Status**: ✅ Active
**Last Updated**: 2026-01-20
