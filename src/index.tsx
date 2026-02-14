import { Hono } from 'hono'
import { cors } from 'hono/cors'
import apiRoutes from './routes/api'
import pageRoutes from './routes/pages'
import {
  garments, graphics, placements,
  products, shopProducts, slides,
  mensClothing, womensClothing, kidsClothing, hats, decals,
  type ShopProduct
} from './data/catalog'

type Bindings = {
  STRIPE_SECRET_KEY?: string
}

type Variables = {
  nonce: string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ============================================
// SECURITY: Comprehensive Security Headers
// (X-Frame-Options removed to allow iframe embedding for previews;
//  Cross-Origin policies relaxed for sandbox/preview compatibility)
// ============================================
app.use('*', async (c, next) => {
  // Generate a cryptographic nonce for CSP (per-request, 128-bit random base64)
  const nonceBytes = new Uint8Array(16)
  crypto.getRandomValues(nonceBytes)
  const nonce = btoa(String.fromCharCode(...nonceBytes))
  c.set('nonce', nonce)

  await next()
  // Set security headers manually for full control
  // Use per-request nonce to allow inline scripts/styles without 'unsafe-inline'
  // CSP: nonce-based script-src prevents XSS script injection.
  // style-src uses 'unsafe-inline' WITHOUT a nonce - per CSP3 spec, 'unsafe-inline' is ignored
  // when a nonce/hash is present, so we deliberately omit the nonce from style-src.
  // Inline style injection is not a meaningful XSS vector; nonces protect scripts.
  c.res.headers.set('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https://api.stripe.com https://cdn.shopify.com https://api.resend.com; frame-src 'self' https://js.stripe.com https://open.spotify.com https://anchor.fm; frame-ancestors *; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`)
  c.res.headers.set('X-Content-Type-Options', 'nosniff')
  c.res.headers.set('X-XSS-Protection', '1; mode=block')
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)')
  // Explicitly remove headers that block iframe embedding
  c.res.headers.delete('X-Frame-Options')
  c.res.headers.delete('Cross-Origin-Opener-Policy')
  c.res.headers.delete('Cross-Origin-Resource-Policy')
  c.res.headers.delete('Cross-Origin-Embedder-Policy')
})

// CORS for API endpoints
// In production, restrict to hillbillyfightwear.com; in dev/sandbox, allow all origins
app.use('/api/*', cors({
  origin: (origin) => {
    const allowed = ['https://hillbillyfightwear.com', 'https://www.hillbillyfightwear.com']
    // Allow requests with no origin (same-origin, server-side) or from allowed domains
    if (!origin || allowed.includes(origin)) return origin || '*'
    // In sandbox/dev, allow all origins for testing
    if (origin.includes('.sandbox.') || origin.includes('localhost') || origin.includes('127.0.0.1')) return origin
    return allowed[0] // Default fallback
  },
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true
}))

// All product data imported from single source of truth: src/data/catalog.ts
// This eliminates duplicate definitions that previously caused drift between
// the homepage, Build page, and API endpoints.

// ============================================
// ROUTE: Homepage
// ============================================

app.get('/', (c) => {
  const nonce = c.get('nonce')
  const slidesHtml = slides.map((slide, index) => `
    <div class="slide ${index === 0 ? 'active' : ''}" 
         style="background-image: url('${slide.image}')"
         data-slide="${index}">
      ${slide.hasOverlay ? `
        <div class="slide-overlay">
          <h2 class="slide-title">${slide.title}</h2>
          <span class="slide-subtitle">${slide.subtitle}</span>
        </div>
      ` : ''}
    </div>
  `).join('')

  const dotsHtml = slides.map((_, index) => `
    <button class="dot ${index === 0 ? 'active' : ''}" data-dot="${index}" data-action="goToSlide" data-index="${index}"></button>
  `).join('')

  // HTML-escape helper for product titles in attributes (XSS prevention)
  const escHtml = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const productsHtml = products.map(product => `
    <a href="${product.url}" class="product-card">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${escHtml(product.title)}" class="product-image" loading="lazy">
      </div>
      <h4 class="product-title">${escHtml(product.title)}</h4>
      <div class="product-vendor">${escHtml(product.vendor)}</div>
      <div class="product-price">${product.price}</div>
    </a>
  `).join('')

  // Helper function to generate product cards - opens detail modal on click
  // Product titles and vendors are HTML-escaped to prevent XSS
  const generateProductCards = (items: ShopProduct[]) => items.map(product => `
    <div class="product-card${product.backImage ? ' has-back' : ''}" role="listitem" aria-label="${escHtml(product.title)} - ${product.price}" data-action="openProductModal" data-product-id="${product.id}" tabindex="0">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${escHtml(product.title)}" class="product-image product-img-front" loading="lazy" width="280" height="280">${product.backImage ? `
        <img src="${product.backImage}" alt="${escHtml(product.title)} - Back" class="product-image product-img-back" loading="lazy" width="280" height="280">` : ''}
      </div>${product.backImage ? '<div class="flip-hint"><i class="fas fa-sync-alt"></i> Hover for back</div>' : ''}
      <h4 class="product-title">${escHtml(product.title)}</h4>
      <div class="product-vendor">${escHtml(product.vendor)}</div>
      <div class="product-price" aria-label="Price: ${product.price}">${product.price}</div>
      <div class="price-includes-badge"><i class="fas fa-check-circle"></i> Tax &amp; Shipping Included</div>
    </div>
  `).join('')

  // Generate HTML for each category
  const mensClothingHtml = generateProductCards(mensClothing)
  const womensClothingHtml = generateProductCards(womensClothing)
  const kidsClothingHtml = generateProductCards(kidsClothing)
  const hatsHtml = generateProductCards(hats)
  const decalsHtml = generateProductCards(decals)

  return c.html(`<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  
  <!-- SEO Meta Tags -->
  <title>Hillbilly Fightwear - Official MMA & Combat Sports Apparel Store</title>
  <meta name="description" content="Official Hillbilly Fightwear store. Shop premium MMA apparel, custom fight gear, hoodies, t-shirts, hats, and decals. Build your own custom designs with our unique graphics.">
  <meta name="keywords" content="MMA apparel, fight gear, Hillbilly Fightwear, custom t-shirts, hoodies, combat sports, UFC gear, wrestling apparel, BJJ clothing">
  <meta name="author" content="Hillbilly Fightwear">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://hillbillyfightwear.com/">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://hillbillyfightwear.com/">
  <meta property="og:title" content="Hillbilly Fightwear - Official MMA & Combat Sports Apparel">
  <meta property="og:description" content="Shop premium MMA apparel and custom fight gear. Hoodies, t-shirts, hats, and more. Build your own custom designs.">
  <meta property="og:image" content="/images/graphics/hillbilly-fightwear-logo.png">
  <meta property="og:site_name" content="Hillbilly Fightwear">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://hillbillyfightwear.com/">
  <meta name="twitter:title" content="Hillbilly Fightwear - Official MMA & Combat Sports Apparel">
  <meta name="twitter:description" content="Shop premium MMA apparel and custom fight gear. Build your own custom designs.">
  <meta name="twitter:image" content="/images/graphics/hillbilly-fightwear-logo.png">
  
  <!-- Mobile & PWA -->
  <meta name="theme-color" content="#8B0000">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="HFW Store">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="format-detection" content="telephone=no">
  
  <!-- Preconnect for Performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.shopify.com">
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  
  <!-- Critical CSS Preload -->
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap" as="style">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/images/graphics/hillbilly-fightwear-logo.png" sizes="any">
  <link rel="apple-touch-icon" href="/images/graphics/hillbilly-fightwear-logo.png" sizes="180x180">
  
  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json" nonce="${nonce}">
  {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Hillbilly Fightwear",
    "description": "Official MMA and combat sports apparel store",
    "url": "https://hillbillyfightwear.com",
    "logo": "https://hillbillyfightwear.com/images/graphics/hillbilly-fightwear-logo.png",
    "priceRange": "$$",
    "sameAs": [
      "https://www.facebook.com/hillbillyfightwear",
      "https://www.instagram.com/hillbillyfightwear"
    ],
    "potentialAction": {
      "@type": "ViewAction",
      "target": "https://hillbillyfightwear.com"
    }
  }
  </script>
  
  <link rel="stylesheet" href="/static/tailwind.css">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style nonce="${nonce}">
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; }
    
    /* Accessibility: Focus visible for keyboard navigation */
    *:focus-visible {
      outline: 3px solid #8B0000;
      outline-offset: 2px;
    }
    
    /* Accessibility: Reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* Accessibility: Skip to main content link */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #8B0000;
      color: #fff;
      padding: 8px 16px;
      z-index: 10000;
      text-decoration: none;
      font-weight: 600;
    }
    .skip-link:focus {
      top: 0;
    }
    
    /* Accessibility: Screen reader only class */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    body {
      font-family: 'Oswald', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #fff;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    /* =============================================
       COMPACT NAVIGATION BAR
       ============================================= */
    .site-nav {
      background: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      height: 44px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand {
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-decoration: none;
      white-space: nowrap;
    }
    .nav-brand:hover { color: #ccc; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-tab {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      border-radius: 3px;
      color: #fff;
      background: transparent;
      border: 1.5px solid rgba(255,255,255,0.3);
      transition: all 0.25s;
      white-space: nowrap;
    }
    .nav-tab:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.6);
    }
    .nav-tab-deals {
      background: #8B0000;
      border-color: #8B0000;
      animation: pulse-deals 2s ease-in-out infinite;
    }
    .nav-tab-deals:hover {
      background: #a50000;
      border-color: #a50000;
    }
    @keyframes pulse-deals {
      0%, 100% { box-shadow: 0 0 0 0 rgba(139,0,0,0.4); }
      50% { box-shadow: 0 0 8px 2px rgba(139,0,0,0.6); }
    }
    .nav-cart {
      position: relative;
      background: none;
      border: 1.5px solid rgba(255,255,255,0.3);
      color: #fff;
      padding: 6px 10px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.25s;
    }
    .nav-cart:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.6);
    }
    .cart-badge {
      position: absolute;
      top: -7px;
      right: -7px;
      background: #8B0000;
      color: #fff;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.65rem;
      display: none;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    @media (max-width: 480px) {
      .site-nav { padding: 0 10px; height: 40px; }
      .nav-brand { font-size: 0.75rem; letter-spacing: 1px; }
      .nav-tab { padding: 5px 8px; font-size: 0.68rem; gap: 3px; }
      .nav-tab i { display: none; }
    }

    /* =============================================
       PROMOTIONS BANNER (below hero)
       ============================================= */
    .promo-section {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%);
      padding: 40px 20px;
      text-align: center;
      color: #fff;
    }
    .promo-section h2 {
      font-size: 1.6rem;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 30px;
      color: #fff;
    }
    .promo-cards {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      max-width: 900px;
      margin: 0 auto 24px;
    }
    .promo-card {
      background: rgba(255,255,255,0.08);
      border: 2px solid rgba(139,0,0,0.5);
      border-radius: 10px;
      padding: 28px 24px;
      flex: 1 1 260px;
      max-width: 380px;
      transition: transform 0.3s, border-color 0.3s;
    }
    .promo-card:hover {
      transform: translateY(-4px);
      border-color: #8B0000;
    }
    .promo-card .promo-icon {
      font-size: 2rem;
      margin-bottom: 12px;
      color: #ff4444;
    }
    .promo-card h3 {
      font-size: 1.2rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
      color: #fff;
    }
    .promo-card p {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.7);
      line-height: 1.5;
      margin: 0;
    }
    .promo-card .promo-highlight {
      color: #ff6666;
      font-weight: 700;
      font-size: 1.4rem;
      display: block;
      margin-top: 6px;
    }
    .promo-permanent {
      margin-top: 8px;
      padding: 14px 28px;
      background: rgba(139,0,0,0.3);
      border: 1px solid rgba(139,0,0,0.5);
      border-radius: 6px;
      display: inline-block;
    }
    .promo-permanent p {
      margin: 0;
      font-size: 0.95rem;
      color: rgba(255,255,255,0.9);
      letter-spacing: 1px;
    }
    .promo-permanent i {
      color: #ff6666;
      margin-right: 6px;
    }
    @media (max-width: 600px) {
      .promo-section { padding: 28px 14px; }
      .promo-section h2 { font-size: 1.2rem; letter-spacing: 2px; }
      .promo-card { padding: 20px 16px; }
      .promo-card h3 { font-size: 1rem; }
      .promo-card .promo-highlight { font-size: 1.15rem; }
    }
    
    /* HERO CAROUSEL - Full screen background carousel */
    .hero-carousel {
      position: relative;
      width: 100%;
      height: 100vh;
      min-height: 600px;
      max-height: 1200px;
      overflow: hidden;
      background: #0a0a0a;
    }
    
    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 1s ease-in-out;
      background-size: contain;
      background-position: center center;
      background-repeat: no-repeat;
      background-color: #0a0a0a;
    }
    
    .slide.active { opacity: 1; }
    
    /* Dark overlay on carousel for text readability */
    .hero-carousel::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.2) 40%,
        rgba(0, 0, 0, 0.3) 70%,
        rgba(0, 0, 0, 0.7) 100%
      );
      z-index: 1;
      pointer-events: none;
    }
    
    .slideshow-dots {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      z-index: 10;
    }
    
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      cursor: pointer;
      border: 2px solid rgba(255,255,255,0.8);
      transition: all 0.3s;
    }
    
    .dot:hover { background: rgba(255,255,255,0.7); }
    .dot.active { background: #fff; transform: scale(1.2); }
    
    .slideshow-pause {
      position: absolute;
      top: 80px;
      right: 20px;
      background: rgba(0,0,0,0.5);
      color: #fff;
      border: none;
      padding: 10px 15px;
      cursor: pointer;
      z-index: 10;
      border-radius: 4px;
      transition: all 0.3s;
    }
    
    .slideshow-pause:hover { background: rgba(0,0,0,0.7); }
    
    /* Hero Content - Overlaid on carousel */
    .hero-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
      text-align: center;
      padding: 40px 20px;
      width: 100%;
      max-width: 900px;
    }
    
    .hero-logo {
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
    }
    
    .hero-logo img {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 10px 50px rgba(0, 0, 0, 0.9))
              drop-shadow(0 0 80px rgba(139, 0, 0, 0.6));
    }
    
    .hero-tagline {
      color: #fff;
      font-size: 1.8rem;
      text-transform: uppercase;
      letter-spacing: 8px;
      margin-top: 30px;
      text-shadow: 2px 2px 15px rgba(0, 0, 0, 0.9);
      font-weight: 500;
    }
    
    .hero-cta {
      margin-top: 40px;
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .hero-cta a {
      display: inline-block;
      padding: 18px 50px;
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .hero-cta .btn-primary {
      background: #8B0000;
      color: #fff;
      box-shadow: 0 8px 30px rgba(139, 0, 0, 0.5);
    }
    
    .hero-cta .btn-primary:hover {
      background: #a50000;
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(139, 0, 0, 0.7);
    }
    
    .hero-cta .btn-secondary {
      background: transparent;
      color: #fff;
      border: 2px solid rgba(255,255,255,0.8);
    }
    
    .hero-cta .btn-secondary:hover {
      background: rgba(255,255,255,0.1);
      border-color: #fff;
      transform: translateY(-3px);
    }
    
    /* Scroll indicator */
    .scroll-indicator {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      color: #fff;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.7;
      animation: bounce 2s infinite;
    }
    
    .scroll-indicator i {
      display: block;
      margin-top: 8px;
      font-size: 1.5rem;
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
      40% { transform: translateX(-50%) translateY(-10px); }
      60% { transform: translateX(-50%) translateY(-5px); }
    }
    
    @media (max-width: 768px) {
      .hero-carousel {
        min-height: 100vh;
        height: 100vh;
      }
      .hero-content {
        padding: 30px 15px;
      }
      .hero-logo {
        max-width: 90%;
      }
      .hero-tagline {
        font-size: 1.1rem;
        letter-spacing: 4px;
        margin-top: 20px;
      }
      .hero-cta a {
        padding: 14px 30px;
        font-size: 0.95rem;
      }
      .hero-cta {
        flex-direction: column;
        align-items: center;
      }
      .scroll-indicator {
        bottom: 100px;
      }
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    @media (max-width: 768px) {
      .product-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
    }
    
    @media (max-width: 480px) {
      .product-grid { grid-template-columns: 1fr; }
    }
    
    .product-card {
      text-align: center;
      text-decoration: none;
      color: inherit;
      display: block;
      transition: transform 0.3s, box-shadow 0.3s;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
    }
    
    .product-card:hover { transform: translateY(-5px); }
    .product-card:focus-visible { 
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
    }
    
    .product-image-wrapper {
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    
    .product-image {
      width: 100%;
      height: auto;
      max-width: 280px;
      margin: 0 auto;
      display: block;
      object-fit: contain;
      transition: opacity 0.35s ease;
    }
    
    /* Front/back image hover swap for products with backImage */
    .product-img-back {
      position: absolute;
      top: 20px; left: 20px; right: 20px; bottom: 20px;
      width: calc(100% - 40px);
      max-width: none;
      height: calc(100% - 40px);
      opacity: 0;
    }
    .product-card.has-back:hover .product-img-front,
    .product-card.has-back:focus-within .product-img-front { opacity: 0; }
    .product-card.has-back:hover .product-img-back,
    .product-card.has-back:focus-within .product-img-back { opacity: 1; }
    
    .flip-hint {
      font-size: 0.7rem;
      color: #999;
      text-align: center;
      margin-top: -8px;
      margin-bottom: 4px;
      transition: opacity 0.3s;
    }
    .product-card.has-back:hover .flip-hint { opacity: 0; }
    
    .product-title { 
      font-size: 1.1rem; 
      font-weight: 600; 
      margin: 10px 0 5px; 
      color: #333;
      /* Prevent long titles from breaking layout */
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .product-vendor { font-size: 0.9rem; color: #666; margin-bottom: 8px; }
    .product-price { font-size: 1rem; font-weight: 600; color: #333; }
    .price-includes-badge {
      font-size: 0.7rem;
      color: #4CAF50;
      font-weight: 500;
      margin-top: 4px;
      letter-spacing: 0.3px;
    }
    .price-includes-badge i { margin-right: 3px; }
    
    /* Mobile touch targets - minimum 44px for accessibility */
    @media (max-width: 768px) {
      .product-card {
        min-height: 44px;
      }
      .btn-primary, .btn-secondary, .view-all-btn, .build-cta-btn {
        min-height: 48px;
        min-width: 48px;
        padding: 14px 24px;
      }
      .dot {
        width: 16px;
        height: 16px;
      }
    }
    
    /* Shop grid for all products */
    .shop-grid {
      grid-template-columns: repeat(4, 1fr);
      max-width: 1400px;
    }
    
    @media (max-width: 1024px) {
      .shop-grid { grid-template-columns: repeat(3, 1fr); }
    }
    
    @media (max-width: 768px) {
      .shop-grid { grid-template-columns: repeat(2, 1fr); }
    }
    
    @media (max-width: 480px) {
      .shop-grid { grid-template-columns: 1fr; }
    }
    
    .external-link {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(139, 0, 0, 0.9);
      color: #fff;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .product-card:hover .external-link {
      opacity: 1;
    }
    
    .section-header { text-align: center; padding: 15px 20px 10px; }
    .section-header h2 { font-size: 1.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #333; margin: 0; }
    
    /* Category sections within Shop Now */
    .category-section {
      max-width: 1400px;
      margin: 0 auto 40px;
      padding: 0 20px;
    }
    
    .category-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: #8B0000;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 15px 0 10px;
      padding-bottom: 8px;
      border-bottom: 2px solid #8B0000;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .category-title i {
      font-size: 1.2rem;
    }
    
    .category-promo-banner {
      background: rgba(139,0,0,0.06);
      border: 1px solid rgba(139,0,0,0.2);
      border-radius: 6px;
      padding: 10px 16px;
      font-size: 0.85rem;
      color: #8B0000;
      font-weight: 500;
      margin-bottom: 5px;
      letter-spacing: 0.3px;
    }
    .category-promo-banner i {
      margin-right: 6px;
    }
    @media (max-width: 600px) {
      .category-promo-banner { font-size: 0.78rem; padding: 8px 12px; }
    }
    
    .category-section .product-grid {
      padding: 20px 0;
    }
    
    .view-all-wrapper { text-align: center; padding: 30px 20px 50px; }
    .view-all-btn {
      display: inline-block;
      padding: 12px 40px;
      border: 2px solid #333;
      color: #333;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
      transition: all 0.3s;
    }
    .view-all-btn:hover { background: #333; color: #fff; }
    
    .build-cta {
      background: linear-gradient(135deg, #8B0000 0%, #4a0000 100%);
      padding: 60px 20px;
      text-align: center;
      color: #fff;
    }
    
    .build-cta h2 {
      font-size: 2.5rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin: 0 0 15px;
    }
    
    .build-cta p {
      font-size: 1.2rem;
      margin: 0 0 30px;
      opacity: 0.9;
    }
    
    .build-cta-btn {
      display: inline-block;
      padding: 15px 50px;
      background: #fff;
      color: #8B0000;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 700;
      font-size: 1.1rem;
      border-radius: 4px;
      transition: all 0.3s;
    }
    
    .build-cta-btn:hover {
      background: #f0f0f0;
      transform: scale(1.05);
    }
    
    .feature-row {
      display: flex;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 50px 20px;
      gap: 50px;
    }
    
    @media (max-width: 768px) {
      .feature-row { flex-direction: column; text-align: center; }
    }
    
    .feature-image { flex: 1; max-width: 500px; }
    .feature-image img { width: 100%; height: auto; border-radius: 4px; }
    .feature-text { flex: 1; }
    .feature-text h2 { font-size: 1.8rem; font-weight: 600; margin: 0 0 20px; color: #333; }
    .feature-text p { font-size: 1rem; line-height: 1.8; color: #666; margin: 0; }
    
    .divider { border: none; border-top: 1px solid #e0e0e0; margin: 0 20px; max-width: 1160px; margin-left: auto; margin-right: auto; }
    
    /* ADA Compliance Accessibility Widget */
    .ada-widget-btn {
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 56px;
      height: 56px;
      background: #1565C0;
      color: #fff;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 15px rgba(21, 101, 192, 0.4);
      transition: all 0.3s;
    }
    .ada-widget-btn:hover { background: #0D47A1; transform: scale(1.1); box-shadow: 0 6px 20px rgba(21, 101, 192, 0.6); }
    .ada-widget-btn:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
    
    .ada-panel {
      position: fixed;
      bottom: 90px;
      left: 20px;
      width: 320px;
      max-height: 70vh;
      overflow-y: auto;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.25);
      z-index: 9998;
      display: none;
      padding: 0;
    }
    .ada-panel.open { display: block; }
    .ada-panel-header {
      background: #1565C0;
      color: #fff;
      padding: 15px 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ada-panel-header h3 { margin: 0; font-size: 1rem; font-weight: 600; }
    .ada-panel-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0 5px;
    }
    .ada-panel-body { padding: 15px 20px; }
    .ada-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    .ada-option:last-child { border-bottom: none; }
    .ada-option-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      color: #333;
    }
    .ada-option-label i { color: #1565C0; width: 20px; text-align: center; }
    .ada-toggle {
      position: relative;
      width: 44px;
      height: 24px;
      background: #ccc;
      border-radius: 12px;
      cursor: pointer;
      border: none;
      padding: 0;
      transition: background 0.3s;
    }
    .ada-toggle.active { background: #1565C0; }
    .ada-toggle::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.3s;
    }
    .ada-toggle.active::after { transform: translateX(20px); }
    .ada-slider-row { padding: 12px 0; border-bottom: 1px solid #eee; }
    .ada-slider-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      color: #333;
      margin-bottom: 8px;
    }
    .ada-slider-label i { color: #1565C0; width: 20px; text-align: center; }
    .ada-slider {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: #ddd;
      border-radius: 3px;
      outline: none;
    }
    .ada-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: #1565C0;
      border-radius: 50%;
      cursor: pointer;
    }
    .ada-reset {
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      color: #666;
      transition: all 0.3s;
    }
    .ada-reset:hover { background: #eee; color: #333; }
    
    @media (max-width: 480px) {
      .ada-panel { width: calc(100vw - 40px); left: 20px; }
      .ada-widget-btn { width: 48px; height: 48px; font-size: 1.3rem; bottom: 15px; left: 15px; }
    }

    /* =============================================
       SCRAPBOOK STICKER COLLAGE - Hero Landing
       ============================================= */
    .scrapbook-hero {
      position: relative;
      width: 100%;
      min-height: 85vh;
      background: #f5f5f0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Subtle worn-paper texture */
    .scrapbook-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(139,0,0,0.05) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 30%, rgba(139,0,0,0.04) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(0,0,0,0.02) 0%, transparent 40%);
      z-index: 0;
    }

    /* Centered logo area — kept narrow to maximize sticker space */
    .scrapbook-center {
      position: relative;
      z-index: 3;
      text-align: center;
      padding: 40px 20px;
      max-width: 600px;
    }

    .scrapbook-center img {
      width: 100%;
      max-width: 510px;
      height: auto;
      filter: drop-shadow(0 8px 30px rgba(0,0,0,0.3))
              drop-shadow(0 0 40px rgba(139,0,0,0.2));
    }

    .hero-slogan {
      font-family: 'Oswald', Arial, sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 8px;
      color: #8B0000;
      margin: 18px 0 0;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.15);
      opacity: 0.95;
    }
    @media (max-width: 768px) {
      .hero-slogan { font-size: 0.9rem; letter-spacing: 4px; margin-top: 10px; }
    }
    @media (max-width: 400px) {
      .hero-slogan { font-size: 0.75rem; letter-spacing: 3px; }
    }

    .scrapbook-cta {
      margin-top: 20px;
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .scrapbook-cta a {
      display: inline-block;
      padding: 14px 40px;
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .scrapbook-cta .btn-primary {
      background: #8B0000;
      color: #fff;
      box-shadow: 0 4px 15px rgba(139,0,0,0.4);
    }
    .scrapbook-cta .btn-primary:hover {
      background: #a50000;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(139,0,0,0.5);
    }
    .scrapbook-cta .btn-secondary {
      background: transparent;
      color: #1a1a1a;
      border: 2px solid #333;
    }
    .scrapbook-cta .btn-secondary:hover {
      background: rgba(0,0,0,0.05);
      border-color: #1a1a1a;
      transform: translateY(-2px);
    }

    /* Sticker collage container — z-index 2, BELOW logo content (z-index 3) */
    .sticker-collage {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
    }

    .sticker-collage .sticker {
      position: absolute;
      pointer-events: auto;
      transition: transform 0.3s ease, filter 0.3s ease;
      filter: drop-shadow(2px 3px 6px rgba(0,0,0,0.25));
      image-rendering: auto;
    }

    .sticker-collage .sticker:hover {
      transform: var(--hover-rotate, rotate(0deg)) scale(1.15);
      filter: drop-shadow(3px 5px 10px rgba(0,0,0,0.35));
      z-index: 5;
    }

    /* =======================================================
       SCRAPBOOK LAYOUT — Mathematically verified placement
       
       All positions verified with pixel-accurate overlap detection
       at viewports: 1200x800, 1400x900, 1024x768, 1000x700, 900x700.
       
       Layout: 3 top, 3 left, 3 right, 4 bottom = 13 total (GNF-RB #2 deleted)
       All stickers +25% size. Specific moves applied per user request.
       
       Sticker map (aspect ratios) — all widths +25%:
         1=HCF(181px) 3=ObamaTap(98px) 4=Thump(144px)
         5=FunRide(90px) 6=PutItOnEm(131px,moved↓1\"→right2.25\")
         7=YourNeck/ClingToGuns(162px,moved←2\") 8=YesYouCan(98px,moved←2\")
         9=ThumpinLovin(94px,moved↑0.5\") 10=Community(156px)
         11=HFW(150px,moved↓0.5\"→right1\") 12=GNF(125px,moved→1.5\")
         13=MYOB(156px,moved←2\") 14=Cunt(144px)
       ======================================================= */

    /* --- TOP ROW: 3 stickers (GNF-RB #2 deleted) ---
         L:1% + L:17% ... R:8% (moved left 1"). All +25% size. */
    .sticker-collage .sticker-1  { top: 1%;  left: 1%;    width: 235px; transform: rotate(-6deg);  --hover-rotate: rotate(-3deg); }  /* HCF 181→235 (+30%) */
    .sticker-collage .sticker-4  { top: 2%;  left: 19%;   width: 187px; transform: rotate(5deg);   --hover-rotate: rotate(2deg); }   /* Thump — right 0.25" (17→19%) */
    .sticker-collage .sticker-2  { display: none !important; }  /* GNF-RB DELETED per request */
    .sticker-collage .sticker-7  { top: 2%;  right: 22%;  width: 211px; transform: rotate(7deg);   --hover-rotate: rotate(3deg); }   /* ClingToGuns 162→211 (+30%) */

    /* --- LEFT COLUMN --- */
    .sticker-collage .sticker-6  { top: 34%; left: 17%;   width: 170px; transform: rotate(4deg);   --hover-rotate: rotate(2deg); }   /* PutItOnEm — left 1" (24→17%), down 0.5" (30→34%) */
    .sticker-collage .sticker-3  { top: 36%; left: 2%;    width: 127px; transform: rotate(-8deg);  --hover-rotate: rotate(-4deg); }  /* ObamaTap 98→127 (+30%) */
    .sticker-collage .sticker-11 { top: 70%; left: 12%;   width: 195px; transform: rotate(3deg);   --hover-rotate: rotate(1deg); }   /* HFW — left 1.25" (21→12%) */

    /* --- RIGHT COLUMN --- */
    .sticker-collage .sticker-5  { top: 16%; right: 2%;   width: 117px; transform: rotate(-5deg);  --hover-rotate: rotate(-2deg); }  /* FunRide 90→117 (+30%) */
    .sticker-collage .sticker-8  { top: 48%; right: 22%;  width: 127px; transform: rotate(6deg);   --hover-rotate: rotate(3deg); }   /* YesYouCan 98→127 (+30%) */
    .sticker-collage .sticker-9  { top: 64%; right: 2%;   width: 122px; transform: rotate(-6deg);  --hover-rotate: rotate(-3deg); }  /* ThumpinLovin 94→122 (+30%) */

    /* --- BOTTOM ROW --- */
    .sticker-collage .sticker-10 { bottom: 1%; left: 1%;   width: 203px; transform: rotate(-3deg);  --hover-rotate: rotate(-1deg); }  /* Community 156→203 (+30%) */
    .sticker-collage .sticker-12 { bottom: 1%; left: 25%;  width: 163px; transform: rotate(5deg);   --hover-rotate: rotate(2deg); }   /* GNF — right 1.25" (12→25%) */
    .sticker-collage .sticker-13 { bottom: 1%; right: 30%; width: 203px; transform: rotate(4deg);   --hover-rotate: rotate(2deg); }   /* MYOB 156→203 (+30%) */
    .sticker-collage .sticker-14 { bottom: 1%; right: 1%;  width: 187px; transform: rotate(-5deg);  --hover-rotate: rotate(-2deg); }  /* Cunt 144→187 (+30%) */

    /* Tablet — proportionally scaled, positions preserved */
    @media (max-width: 1024px) {
      .scrapbook-hero { min-height: 80vh; }
      .scrapbook-center img { max-width: 420px; }
      .sticker-collage .sticker-1  { width: 189px; }
      .sticker-collage .sticker-4  { width: 150px; }
      .sticker-collage .sticker-7  { width: 169px; }
      .sticker-collage .sticker-5  { width: 94px; }
      .sticker-collage .sticker-8  { width: 101px; }
      .sticker-collage .sticker-6  { width: 137px; }
      .sticker-collage .sticker-3  { width: 101px; }
      .sticker-collage .sticker-11 { width: 156px; }
      .sticker-collage .sticker-10 { width: 163px; }
      .sticker-collage .sticker-12 { width: 130px; }
      .sticker-collage .sticker-14 { width: 150px; }
      .sticker-collage .sticker-13 { width: 163px; }
      .sticker-collage .sticker-9  { width: 98px; }
    }

    /* Mobile — push stickers to edges so center logo/buttons stay clear */
    @media (max-width: 768px) {
      .scrapbook-hero { min-height: 100vh; }
      .scrapbook-center { max-width: 280px; padding: 15px 10px; }
      .scrapbook-center img { max-width: 255px; }
      .scrapbook-cta a { padding: 7px 18px; font-size: 0.75rem; }
      .scrapbook-cta { flex-direction: column; align-items: center; gap: 6px; }

      /* Top row — across the top, well above logo */
      .sticker-collage .sticker-1  { top: 1%;  left: 1%;   width: 104px !important; }
      .sticker-collage .sticker-4  { top: 1%;  left: 22%;  width: 85px !important; }
      .sticker-collage .sticker-7  { top: 1%;  right: 1%;  left: auto; width: 98px !important; }
      /* Left side — hugging left edge */
      .sticker-collage .sticker-6  { top: 22%; left: 1%;   right: auto; width: 78px !important; }
      .sticker-collage .sticker-3  { top: 30%; left: 1%;   right: auto; width: 59px !important; }
      .sticker-collage .sticker-11 { top: 59%; left: 20%;  right: auto; width: 85px !important; }
      /* Right side — hugging right edge */
      .sticker-collage .sticker-5  { top: 14%; right: 1%;  left: auto; width: 55px !important; }
      .sticker-collage .sticker-8  { top: 42%; right: 1%;  left: auto; width: 59px !important; }
      .sticker-collage .sticker-9  { top: 58%; right: 1%;  left: auto; width: 55px !important; }
      /* Bottom row — across the bottom, below buttons */
      .sticker-collage .sticker-10 { bottom: 1%; left: 1%;   width: 91px !important; }
      .sticker-collage .sticker-12 { bottom: 1%; left: 22%;  width: 72px !important; }
      .sticker-collage .sticker-13 { bottom: 1%; right: 18%; left: auto; width: 91px !important; }
      .sticker-collage .sticker-14 { bottom: 1%; right: 1%;  left: auto; width: 85px !important; }
    }

    /* Small phones — even smaller stickers, same edge-hugging positions */
    @media (max-width: 400px) {
      .scrapbook-center img { max-width: 210px; }
      .sticker-collage .sticker-1  { width: 85px !important; }
      .sticker-collage .sticker-4  { width: 68px !important; }
      .sticker-collage .sticker-7  { width: 78px !important; }
      .sticker-collage .sticker-5  { width: 44px !important; }
      .sticker-collage .sticker-8  { width: 47px !important; }
      .sticker-collage .sticker-6  { width: 62px !important; }
      .sticker-collage .sticker-3  { width: 47px !important; }
      .sticker-collage .sticker-11 { width: 68px !important; }
      .sticker-collage .sticker-10 { width: 72px !important; }
      .sticker-collage .sticker-12 { width: 57px !important; }
      .sticker-collage .sticker-14 { width: 65px !important; }
      .sticker-collage .sticker-13 { width: 72px !important; }
      .sticker-collage .sticker-9  { width: 44px !important; }
    }
  </style>
</head>
<body>
  <!-- Accessibility: Skip to main content link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- Compact Navigation Bar -->
  <header role="banner">
    <nav class="site-nav" aria-label="Primary navigation">
      <a href="/" class="nav-brand">Hillbilly Fightwear</a>
      <div class="nav-links">
        <a href="#shop" class="nav-tab"><i class="fas fa-shopping-bag" aria-hidden="true"></i> Shop</a>
        <a href="#deals" class="nav-tab nav-tab-deals"><i class="fas fa-tags" aria-hidden="true"></i> Deals</a>
        <a href="/build" class="nav-tab"><i class="fas fa-paint-brush" aria-hidden="true"></i> Build</a>
        <a href="/contact" class="nav-tab"><i class="fas fa-envelope" aria-hidden="true"></i> Contact</a>
        <button data-action="toggleCart" class="nav-cart" aria-label="Shopping cart" title="View Cart">
          <i class="fas fa-shopping-cart"></i>
          <span id="cartBadge" class="cart-badge">0</span>
        </button>
      </div>
    </nav>
  </header>
  
  <!-- Main Content -->
  <main id="main-content" role="main">

  <!-- SCRAPBOOK STICKER COLLAGE HERO -->
  <section class="scrapbook-hero" aria-label="Hillbilly Fightwear Sticker Collage">

    <!-- Sticker Collage Layer (z-index 1) — above background, below logo -->
    <div class="sticker-collage" aria-hidden="true">
      <!-- TOP ROW -->
      <img class="sticker sticker-1"  src="/images/stickers/sticker-hcf.png?v=13"           alt="" loading="eager" draggable="false">
      <!-- GNF Red/Blue (#2) removed per user request -->
      <img class="sticker sticker-3"  src="/images/stickers/sticker-obama-tap.png?v=13"      alt="" loading="eager" draggable="false">
      <img class="sticker sticker-4"  src="/images/stickers/sticker-thump.png?v=13"          alt="" loading="eager" draggable="false">
      <img class="sticker sticker-5"  src="/images/stickers/sticker-fun-ride.png?v=13"       alt="" loading="eager" draggable="false">
      <!-- MIDDLE ROW (flanking logo) -->
      <img class="sticker sticker-6"  src="/images/stickers/sticker-put-it-on-em.png?v=15"   alt="" loading="eager" draggable="false">
      <img class="sticker sticker-7"  src="/images/stickers/sticker-your-neck.png?v=13"      alt="" loading="eager" draggable="false">
      <img class="sticker sticker-8"  src="/images/stickers/sticker-yes-you-can.png?v=13"    alt="" loading="eager" draggable="false">
      <img class="sticker sticker-9"  src="/images/stickers/sticker-thumpin-is-lovin.png?v=13" alt="" loading="eager" draggable="false">
      <!-- BOTTOM ROW -->
      <img class="sticker sticker-10" src="/images/stickers/sticker-community.png?v=13"      alt="" loading="eager" draggable="false">
      <img class="sticker sticker-11" src="/images/stickers/sticker-hfw.png?v=13"            alt="" loading="eager" draggable="false">
      <img class="sticker sticker-12" src="/images/stickers/sticker-gnf.png?v=13"            alt="" loading="eager" draggable="false">
      <img class="sticker sticker-13" src="/images/stickers/sticker-myob.png?v=15"           alt="" loading="eager" draggable="false">
      <img class="sticker sticker-14" src="/images/stickers/sticker-cunt.png?v=13"           alt="" loading="eager" draggable="false">
    </div>

    <!-- Centered Logo + CTA (z-index 3) -->
    <div class="scrapbook-center">
      <img src="/images/graphics/hillbilly-fightwear-logo.png?v=3" alt="Hillbilly Fightwear Logo">
      <p class="hero-slogan">Thump A Stranger</p>
      <div class="scrapbook-cta">
        <a href="#shop" class="btn-primary"><i class="fas fa-shopping-bag" aria-hidden="true"></i> Shop Now</a>
        <a href="/build" class="btn-secondary"><i class="fas fa-paint-brush" aria-hidden="true"></i> Build Y'Own</a>
      </div>
    </div>

  </section>

  <!-- PROMOTIONS SECTION -->
  <section id="deals" class="promo-section" aria-labelledby="deals-heading">
    <h2 id="deals-heading"><i class="fas fa-fire" aria-hidden="true"></i> Current Deals</h2>
    <div class="promo-cards">
      <div class="promo-card">
        <div class="promo-icon"><i class="fas fa-tshirt"></i></div>
        <h3>T-Shirts & Tanks</h3>
        <p>Stock up on your favorite designs</p>
        <span class="promo-highlight">Buy 2, Get 1 FREE</span>
      </div>
      <div class="promo-card">
        <div class="promo-icon"><i class="fas fa-sticky-note"></i></div>
        <h3>Sticker Bundle</h3>
        <p>Grab a handful of stickers</p>
        <span class="promo-highlight">5 for $29</span>
      </div>
    </div>
    <div class="promo-permanent">
      <p><i class="fas fa-gift" aria-hidden="true"></i> All hat & hoodie purchases come with a free sticker</p>
    </div>
    <div class="promo-permanent" style="margin-top:12px; background:rgba(76,175,80,0.15); border-color:rgba(76,175,80,0.4);">
      <p style="color:#b8ffb8;"><i class="fas fa-shield-alt" style="color:#66ff66;" aria-hidden="true"></i> <strong>All prices include tax &amp; free shipping</strong> &mdash; what you see is what you pay</p>
    </div>
  </section>

  <!-- Shop Now Section - All Products from Official Store (Organized by Category) -->
  <section id="shop" style="background: #f5f5f5; padding: 10px 0 40px;" aria-labelledby="shop-heading">
    <h2 id="shop-heading" class="sr-only">Shop Now</h2>
    
    <!-- MENS CLOTHING -->
    <div class="category-section" role="region" aria-labelledby="mens-heading">
      <h3 class="category-title" id="mens-heading"><i class="fas fa-male" aria-hidden="true"></i> Men's Clothing</h3>
      <div class="category-promo-banner"><i class="fas fa-tags"></i> Buy 2, Get 1 FREE on all T-Shirts &amp; Tanks &mdash; prices include tax &amp; shipping!</div>
      <div class="product-grid shop-grid" role="list">
        ${mensClothingHtml}
      </div>
    </div>
    
    <!-- WOMENS CLOTHING -->
    <div class="category-section" role="region" aria-labelledby="womens-heading">
      <h3 class="category-title" id="womens-heading"><i class="fas fa-female" aria-hidden="true"></i> Women's Clothing</h3>
      <div class="category-promo-banner"><i class="fas fa-tags"></i> Buy 2, Get 1 FREE on all Tanks &mdash; prices include tax &amp; shipping!</div>
      <div class="product-grid shop-grid" role="list">
        ${womensClothingHtml}
      </div>
    </div>
    
    <!-- KIDS CLOTHING -->
    <div class="category-section" role="region" aria-labelledby="kids-heading">
      <h3 class="category-title" id="kids-heading"><i class="fas fa-child" aria-hidden="true"></i> Kids' Clothing</h3>
      <div class="category-promo-banner" style="background:rgba(76,175,80,0.08); border-color:rgba(76,175,80,0.3); color:#2e7d32;"><i class="fas fa-truck"></i> All prices include tax &amp; free shipping!</div>
      <div class="product-grid shop-grid" role="list">
        ${kidsClothingHtml}
      </div>
    </div>
    
    <!-- HATS -->
    <div class="category-section" role="region" aria-labelledby="hats-heading">
      <h3 class="category-title" id="hats-heading"><i class="fas fa-hat-cowboy" aria-hidden="true"></i> Hats</h3>
      <div class="category-promo-banner"><i class="fas fa-gift"></i> FREE sticker with every hat purchase &mdash; prices include tax &amp; shipping!</div>
      <div class="product-grid shop-grid" role="list">
        ${hatsHtml}
      </div>
    </div>
    
    <!-- DECALS / STICKERS -->
    <div class="category-section" role="region" aria-labelledby="decals-heading">
      <h3 class="category-title" id="decals-heading"><i class="fas fa-sticky-note" aria-hidden="true"></i> Decals & Stickers</h3>
      <div class="category-promo-banner"><i class="fas fa-layer-group"></i> Grab 5 for just $29 (save $6!) &mdash; prices include tax &amp; shipping!</div>
      <div class="product-grid shop-grid" role="list">
        ${decalsHtml}
      </div>
    </div>
    
    <div class="view-all-wrapper">
      <a href="https://hillbillyfightwear.com/collections/all" target="_blank" rel="noopener noreferrer" class="view-all-btn" aria-label="View all products on Official Store (opens in new window)">
        <i class="fas fa-external-link-alt" aria-hidden="true"></i> View All on Official Store
      </a>
    </div>
  </section>
  
  <!-- Build Your Own CTA -->
  <section class="build-cta" id="build">
    <h2><i class="fas fa-tshirt"></i> Build Y'Own</h2>
    <p>Design custom apparel with your favorite Hillbilly Fightwear graphics</p>
    <a href="/build" class="build-cta-btn">
      <i class="fas fa-paint-brush"></i> Start Designing
    </a>
  </section>
  
  <!-- Featured Collection - Build Your Own -->
  <section id="products" style="background: #fff;">
    <div class="section-header">
      <h2>Featured Custom Designs</h2>
      <p style="color: #666; margin-top: 10px; font-size: 0.95rem;">Click any design to customize it with our garment builder</p>
    </div>
    
    <div class="product-grid">
      ${productsHtml}
    </div>
    
    <div class="view-all-wrapper">
      <a href="/build" class="view-all-btn"><i class="fas fa-paint-brush"></i> Build Y'Own</a>
    </div>
  </section>
  
  <!-- Feature Row -->
  <section class="feature-row" style="background: #f5f5f5;">
    <div class="feature-image">
      <img src="/images/slides/slide-cage-grapple.jpg" alt="Fighter grappling in cage - Hillbilly Fightwear MMA gear" loading="lazy">
    </div>
    <div class="feature-text">
      <h2>Custom Apparel Builder</h2>
      <p>Now you can create your own custom apparel with all of our artwork and logos. Choose your garment style, size, color, and graphics to create something unique. T-shirts, hoodies, sweatshirts, tank tops, and trucker hats available!</p>
    </div>
  </section>

  <!-- IMAGE CAROUSEL - Moved to bottom of page -->
  <section class="hero-carousel" style="height: 60vh; min-height: 400px;" aria-label="Featured images slideshow" role="region">
    <!-- Carousel Slides -->
    ${slidesHtml}
    
    <!-- Slideshow Controls -->
    <button class="slideshow-pause" id="pauseBtn" data-action="togglePause" aria-label="Pause slideshow" aria-pressed="false" style="top: 20px;">
      <i class="fas fa-pause" id="pauseIcon" aria-hidden="true"></i>
    </button>
    
    <div class="slideshow-dots">
      ${dotsHtml}
    </div>
  </section>
  
  <!-- PODCAST / BLOG SECTION -->
  <section id="podcast" style="background: #fff; padding: 50px 20px;" aria-labelledby="podcast-heading">
    <div style="max-width: 900px; margin: 0 auto; text-align: center;">
      <h2 id="podcast-heading" style="font-size: 1.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #333; margin: 0 0 8px;">
        <i class="fas fa-podcast" style="color: #8B0000;" aria-hidden="true"></i> The Podcast
      </h2>
      <p style="color: #666; font-size: 1rem; margin: 0 0 30px; line-height: 1.6;">
        Conversations with the Human Cockfighter &mdash; stories, discipline, and life on the mat.
      </p>
      
      <!-- Spotify Embed: Hillbilly Fightwear Podcast -->
      <div style="max-width: 700px; margin: 0 auto 30px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <iframe 
          style="border-radius:12px; border:0; width:100%; height:352px;" 
          src="https://open.spotify.com/embed/show/4RbslfSGJhey2oFMEEtMbT?utm_source=generator&theme=0" 
          allowfullscreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          title="Hillbilly Fightwear Podcast on Spotify">
        </iframe>
      </div>

      <!-- Recent Episodes Quick Links -->
      <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-bottom: 25px;">
        <a href="https://anchor.fm/hillbillyfightwear/episodes/Discipline-e1h4qf8" target="_blank" rel="noopener noreferrer" 
           style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s;">
          <i class="fas fa-play-circle" style="color: #8B0000;"></i> Discipline
        </a>
        <a href="https://anchor.fm/hillbillyfightwear/episodes/Investment-e1h4q73" target="_blank" rel="noopener noreferrer" 
           style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s;">
          <i class="fas fa-play-circle" style="color: #8B0000;"></i> Investment
        </a>
        <a href="https://anchor.fm/hillbillyfightwear/episodes/Medicine-e1h4q02" target="_blank" rel="noopener noreferrer" 
           style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s;">
          <i class="fas fa-play-circle" style="color: #8B0000;"></i> Medicine
        </a>
        <a href="https://anchor.fm/hillbillyfightwear/episodes/Crime-e1h4ppk" target="_blank" rel="noopener noreferrer" 
           style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s;">
          <i class="fas fa-play-circle" style="color: #8B0000;"></i> Crime
        </a>
      </div>
      
      <a href="https://anchor.fm/hillbillyfightwear" target="_blank" rel="noopener noreferrer" 
         style="display: inline-block; padding: 14px 40px; background: #8B0000; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; font-size: 0.95rem; border-radius: 4px; transition: all 0.3s;">
        <i class="fas fa-headphones"></i> Listen to All Episodes
      </a>
    </div>
  </section>

  </main>
  
  <!-- Footer -->
  <footer role="contentinfo" style="background: #1a1a1a; color: #fff; padding: 40px 20px; text-align: center;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <p style="margin: 0 0 10px;"><strong>Hillbilly Fightwear</strong> - Official MMA & Combat Sports Apparel</p>
      <p style="margin: 0; font-size: 0.9rem; color: #999;">© ${new Date().getFullYear()} Hillbilly Fightwear. All rights reserved.</p>
      <nav aria-label="Footer navigation" style="margin-top: 20px;">
        <a href="/build" style="color: #8B0000; margin: 0 15px; text-decoration: none;">Build Y'Own</a>
        <a href="#shop" style="color: #8B0000; margin: 0 15px; text-decoration: none;">Shop Now</a>
        <a href="/contact" style="color: #8B0000; margin: 0 15px; text-decoration: none;">Contact Us</a>
        <a href="#podcast" style="color: #8B0000; margin: 0 15px; text-decoration: none;">Podcast</a>
        <a href="https://hillbillyfightwear.com" target="_blank" rel="noopener noreferrer" style="color: #8B0000; margin: 0 15px; text-decoration: none;">Official Store</a>
      </nav>
      <nav aria-label="Legal navigation" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">
        <a href="/privacy-policy" style="color: #888; margin: 0 15px; text-decoration: none; font-size: 0.85rem;">Privacy Policy</a>
        <a href="/cookie-policy" style="color: #888; margin: 0 15px; text-decoration: none; font-size: 0.85rem;">Cookie Policy</a>
        <a href="javascript:void(0)" data-action="showCookieSettings" style="color: #888; margin: 0 15px; text-decoration: none; font-size: 0.85rem;">Cookie Settings</a>
      </nav>
    </div>
  </footer>
  
  <!-- ADA Compliance Accessibility Widget -->
  <button class="ada-widget-btn" id="adaWidgetBtn" data-action="toggleAdaPanel" aria-label="Accessibility Options" title="Accessibility Options">
    <i class="fas fa-universal-access" aria-hidden="true"></i>
  </button>
  
  <div class="ada-panel" id="adaPanel" role="dialog" aria-label="Accessibility Settings">
    <div class="ada-panel-header">
      <h3><i class="fas fa-universal-access"></i> Accessibility</h3>
      <button class="ada-panel-close" data-action="toggleAdaPanel" aria-label="Close accessibility panel">&times;</button>
    </div>
    <div class="ada-panel-body">
      <div class="ada-slider-row">
        <div class="ada-slider-label"><i class="fas fa-text-height"></i> Text Size</div>
        <input type="range" class="ada-slider" id="adaFontSize" min="80" max="150" value="100" aria-label="Adjust text size">
      </div>
      <div class="ada-option">
        <div class="ada-option-label"><i class="fas fa-adjust"></i> High Contrast</div>
        <button class="ada-toggle" id="adaContrast" data-action="toggleA11y" data-feature="contrast" aria-label="Toggle high contrast" role="switch" aria-checked="false"></button>
      </div>
      <div class="ada-option">
        <div class="ada-option-label"><i class="fas fa-underline"></i> Highlight Links</div>
        <button class="ada-toggle" id="adaLinks" data-action="toggleA11y" data-feature="links" aria-label="Toggle link highlighting" role="switch" aria-checked="false"></button>
      </div>
      <div class="ada-option">
        <div class="ada-option-label"><i class="fas fa-font"></i> Readable Font</div>
        <button class="ada-toggle" id="adaFont" data-action="toggleA11y" data-feature="font" aria-label="Toggle readable font" role="switch" aria-checked="false"></button>
      </div>
      <div class="ada-option">
        <div class="ada-option-label"><i class="fas fa-pause-circle"></i> Stop Animations</div>
        <button class="ada-toggle" id="adaAnimations" data-action="toggleA11y" data-feature="animations" aria-label="Toggle stop animations" role="switch" aria-checked="false"></button>
      </div>
      <div class="ada-option">
        <div class="ada-option-label"><i class="fas fa-mouse-pointer"></i> Large Cursor</div>
        <button class="ada-toggle" id="adaCursor" data-action="toggleA11y" data-feature="cursor" aria-label="Toggle large cursor" role="switch" aria-checked="false"></button>
      </div>
      <button class="ada-reset" data-action="resetA11y"><i class="fas fa-undo"></i> Reset All Settings</button>
    </div>
  </div>
  
  <!-- Product Detail Modal -->
  <div id="productModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10000; overflow-y:auto;" data-action="closeProductModalBg">
    <div style="background:#fff; max-width:600px; margin:40px auto; border-radius:12px; overflow:hidden; position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.4);">
      <button data-action="closeProductModal" style="position:absolute; top:12px; right:16px; background:rgba(0,0,0,0.5); color:#fff; border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:1.2rem; z-index:2; display:flex; align-items:center; justify-content:center;" aria-label="Close">&times;</button>
      <div id="modalContent"></div>
    </div>
  </div>
  
  <!-- Cart Drawer -->
  <div id="cartOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10001;" data-action="toggleCart"></div>
  <div id="cartDrawer" style="position:fixed; top:0; right:-420px; width:400px; max-width:90vw; height:100%; background:#fff; z-index:10002; box-shadow:-4px 0 30px rgba(0,0,0,0.3); transition:right 0.3s ease; display:flex; flex-direction:column;">
    <div style="background:#1a1a1a; color:#fff; padding:20px; display:flex; justify-content:space-between; align-items:center;">
      <h3 style="margin:0; font-size:1.2rem; font-weight:600;"><i class="fas fa-shopping-cart"></i> Your Cart</h3>
      <button data-action="toggleCart" style="background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;" aria-label="Close cart">&times;</button>
    </div>
    <div id="cartItems" style="flex:1; overflow-y:auto; padding:15px;"></div>
    <div id="cartFooter" style="border-top:2px solid #eee; padding:20px; display:none;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:1.1rem; font-weight:600;">
        <span>Total:</span>
        <span id="cartTotal">$0.00</span>
      </div>
      <div id="cartPricingGuarantee" style="text-align:center; margin-bottom:12px; padding:10px; background:rgba(76,175,80,0.08); border:1px solid rgba(76,175,80,0.2); border-radius:6px;">
        <div style="color:#2e7d32; font-size:0.82rem; font-weight:600; margin-bottom:2px;"><i class="fas fa-shield-alt"></i> All-Inclusive Pricing</div>
        <div style="color:#4CAF50; font-size:0.75rem; font-weight:500;">Tax &amp; shipping included &mdash; what you see is what you pay</div>
      </div>
      <button data-action="cartCheckout" style="width:100%; padding:16px; background:#8B0000; color:#fff; border:none; border-radius:6px; font-size:1rem; font-weight:600; text-transform:uppercase; letter-spacing:1px; cursor:pointer; transition:background 0.3s;">
        <i class="fas fa-lock"></i> Proceed to Checkout
      </button>
      <button data-action="toggleCart" style="width:100%; padding:12px; background:transparent; color:#333; border:1px solid #ddd; border-radius:6px; font-size:0.9rem; font-weight:500; cursor:pointer; margin-top:8px; transition:all 0.3s;">
        <i class="fas fa-arrow-left"></i> Continue Shopping
      </button>
    </div>
  </div>
  
  <!-- Shop Products Data + Garment Color Image Map for JavaScript -->
  <script nonce="${nonce}">
    var allShopProducts = ${JSON.stringify(shopProducts).replace(/<\//g, '<\\/')};
    var garmentColorImages = ${JSON.stringify(
      garments.reduce((acc: Record<string, Record<string, { front: string; back?: string }>>, g) => {
        acc[g.id] = g.images as Record<string, { front: string; back?: string }>
        return acc
      }, {} as Record<string, Record<string, { front: string; back?: string }>>)
    ).replace(/<\//g, '<\\/')};
    // Graphics lookup map: graphicId → fullImage URL
    var graphicsMap = ${JSON.stringify(
      graphics.reduce((acc: Record<string, string>, g: { id: string; fullImage: string }) => {
        acc[g.id] = g.fullImage
        return acc
      }, {} as Record<string, string>)
    ).replace(/<\//g, '<\\/')};
    function getColorPreviewImage(product, color) {
      if (!product.garmentType || !color) return product.image;
      var colorKey = color.toLowerCase();
      var gImages = garmentColorImages[product.garmentType];
      if (gImages && gImages[colorKey] && gImages[colorKey].front) {
        return gImages[colorKey].front;
      }
      return product.image;
    }
  </script>
  
  <!-- GDPR Cookie Consent Banner -->
  <div id="cookieConsent" class="cookie-consent" style="display: none;">
    <div class="cookie-content">
      <div class="cookie-compact">
        <div class="cookie-text">
          <span class="cookie-title"><i class="fas fa-cookie-bite"></i> We use cookies</span>
          <span class="cookie-desc">We use cookies to enhance your experience. <a href="/cookie-policy">Learn more</a></span>
        </div>
        <div class="cookie-compact-btns">
          <button data-action="acceptAllCookies" class="cookie-btn accept-all">Accept All</button>
          <button data-action="rejectNonEssential" class="cookie-btn reject">Reject</button>
          <button data-action="toggleCookieDetails" class="cookie-btn settings-btn" id="cookieSettingsBtn"><i class="fas fa-cog"></i> <span class="settings-label">Settings</span></button>
        </div>
      </div>
      <div class="cookie-details" id="cookieDetails" style="display: none;">
        <div class="cookie-options">
          <div class="cookie-option">
            <label><input type="checkbox" id="cookieNecessary" checked disabled> <strong>Necessary</strong> <span>(Always active)</span></label>
            <p>Essential for the website to function properly.</p>
          </div>
          <div class="cookie-option">
            <label><input type="checkbox" id="cookieAnalytics"> <strong>Analytics</strong></label>
            <p>Help us understand how visitors interact with our website.</p>
          </div>
          <div class="cookie-option">
            <label><input type="checkbox" id="cookieMarketing"> <strong>Marketing</strong></label>
            <p>Used to deliver personalized advertisements.</p>
          </div>
        </div>
        <div class="cookie-detail-btns">
          <button data-action="savePreferences" class="cookie-btn save-prefs">Save Preferences</button>
        </div>
      </div>
    </div>
  </div>
  
  <style nonce="${nonce}">
    .cookie-consent {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1a1a1a;
      color: #fff;
      z-index: 9999;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      padding: 16px 20px;
    }
    .cookie-content {
      max-width: 1200px;
      margin: 0 auto;
    }
    .cookie-compact {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .cookie-text {
      flex: 1;
      min-width: 0;
    }
    .cookie-title {
      font-size: 1rem;
      font-weight: 600;
      display: block;
      margin-bottom: 2px;
    }
    .cookie-title i { color: #8B0000; margin-right: 6px; }
    .cookie-desc {
      font-size: 0.85rem;
      color: #aaa;
      display: block;
    }
    .cookie-desc a { color: #8B0000; }
    .cookie-compact-btns {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      align-items: center;
    }
    .cookie-btn {
      padding: 8px 18px;
      border: none;
      border-radius: 4px;
      font-family: 'Oswald', sans-serif;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }
    .accept-all { background: #8B0000; color: #fff; }
    .accept-all:hover { background: #a00000; }
    .reject { background: transparent; color: #888; border: 1px solid #444; }
    .reject:hover { color: #fff; border-color: #666; }
    .settings-btn { background: #333; color: #ccc; border: 1px solid #555; }
    .settings-btn:hover { background: #444; color: #fff; }
    .save-prefs { background: #8B0000; color: #fff; }
    .save-prefs:hover { background: #a00000; }
    .cookie-details {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #333;
    }
    .cookie-options {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .cookie-option {
      flex: 1;
      min-width: 180px;
      background: #2a2a2a;
      padding: 10px 12px;
      border-radius: 6px;
    }
    .cookie-option label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .cookie-option label span { color: #888; font-size: 0.75rem; }
    .cookie-option p { margin: 4px 0 0; font-size: 0.75rem; color: #777; }
    .cookie-option input[type="checkbox"] { width: 16px; height: 16px; accent-color: #8B0000; }
    .cookie-detail-btns { display: flex; gap: 8px; }
    
    @media (max-width: 768px) {
      .cookie-consent { padding: 12px 14px; }
      .cookie-compact { flex-direction: column; gap: 10px; align-items: stretch; }
      .cookie-text { text-align: center; }
      .cookie-title { font-size: 0.9rem; }
      .cookie-desc { font-size: 0.78rem; }
      .cookie-compact-btns { justify-content: center; gap: 6px; }
      .cookie-btn { padding: 8px 14px; font-size: 0.78rem; }
      .settings-label { display: none; }
      .cookie-options { flex-direction: column; gap: 8px; }
      .cookie-option { min-width: unset; padding: 8px 10px; }
      .cookie-detail-btns { justify-content: center; }
    }
  </style>
  
  <script nonce="${nonce}">
    let currentSlide = 0;
    let isPaused = false;
    let slideInterval;
    const slidesEl = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const totalSlides = slidesEl.length;
    
    function showSlide(index) {
      slidesEl.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      slidesEl[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    }
    
    function nextSlide() { showSlide((currentSlide + 1) % totalSlides); }
    function goToSlide(index) { showSlide(index); resetInterval(); }
    
    function togglePause() {
      isPaused = !isPaused;
      const pauseIcon = document.getElementById('pauseIcon');
      if (isPaused) {
        clearInterval(slideInterval);
        pauseIcon.classList.remove('fa-pause');
        pauseIcon.classList.add('fa-play');
      } else {
        startInterval();
        pauseIcon.classList.remove('fa-play');
        pauseIcon.classList.add('fa-pause');
      }
    }
    
    function startInterval() { slideInterval = setInterval(nextSlide, 5000); }
    function resetInterval() { if (!isPaused) { clearInterval(slideInterval); startInterval(); } }
    
    startInterval();
    
    // ========================================
    // GDPR Cookie Consent Management
    // ========================================
    function getCookieConsent() {
      try {
        var raw = localStorage.getItem('cookieConsent');
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }
    
    function setCookieConsent(preferences) {
      localStorage.setItem('cookieConsent', JSON.stringify({
        ...preferences,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
    }
    
    function showCookieBanner() {
      document.getElementById('cookieConsent').style.display = 'block';
      // Always start with details collapsed
      document.getElementById('cookieDetails').style.display = 'none';
    }
    
    function hideCookieBanner() {
      document.getElementById('cookieConsent').style.display = 'none';
      document.getElementById('cookieDetails').style.display = 'none';
    }
    
    function toggleCookieDetails() {
      const details = document.getElementById('cookieDetails');
      const isHidden = details.style.display === 'none';
      details.style.display = isHidden ? 'block' : 'none';
    }
    
    function showCookieSettings() {
      const consent = getCookieConsent();
      if (consent) {
        document.getElementById('cookieAnalytics').checked = consent.analytics || false;
        document.getElementById('cookieMarketing').checked = consent.marketing || false;
      }
      showCookieBanner();
      // Auto-expand the details panel when user explicitly opens settings
      document.getElementById('cookieDetails').style.display = 'block';
    }
    
    function acceptAllCookies() {
      setCookieConsent({ necessary: true, analytics: true, marketing: true });
      hideCookieBanner();
      applyConsent({ necessary: true, analytics: true, marketing: true });
    }
    
    function rejectNonEssential() {
      setCookieConsent({ necessary: true, analytics: false, marketing: false });
      hideCookieBanner();
      applyConsent({ necessary: true, analytics: false, marketing: false });
    }
    
    function savePreferences() {
      const prefs = {
        necessary: true,
        analytics: document.getElementById('cookieAnalytics').checked,
        marketing: document.getElementById('cookieMarketing').checked
      };
      setCookieConsent(prefs);
      hideCookieBanner();
      applyConsent(prefs);
    }
    
    function applyConsent(prefs) {
      // Placeholder for future analytics/marketing cookie integrations
      // When adding GA, FB Pixel etc., conditionally load scripts based on prefs
    }
    
    // Check consent on page load
    document.addEventListener('DOMContentLoaded', function() {
      const consent = getCookieConsent();
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check if user wants to manage settings from cookie policy page
      if (urlParams.get('showCookieSettings') === 'true') {
        showCookieSettings();
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (!consent) {
        // Show banner after a short delay for better UX
        setTimeout(showCookieBanner, 1000);
      } else {
        applyConsent(consent);
      }
      
      // Restore ADA settings
      restoreA11ySettings();
      
      // ==========================================
      // GLOBAL EVENT DELEGATION
      // All interactive elements use data-action attributes
      // instead of inline onclick (which is blocked by CSP nonce).
      // ==========================================
      document.addEventListener('click', function(e) {
        var el = e.target.closest('[data-action]');
        if (!el) return;
        var action = el.dataset.action;
        
        switch(action) {
          // Cookie consent
          case 'acceptAllCookies': acceptAllCookies(); break;
          case 'rejectNonEssential': rejectNonEssential(); break;
          case 'toggleCookieDetails': toggleCookieDetails(); break;
          case 'savePreferences': savePreferences(); break;
          case 'showCookieSettings': e.preventDefault(); showCookieSettings(); break;
          
          // ADA accessibility
          case 'toggleAdaPanel': toggleAdaPanel(); break;
          case 'toggleA11y': toggleA11y(el.getAttribute('data-feature')); break;
          case 'resetA11y': resetA11y(); break;
          
          // Slideshow
          case 'togglePause': togglePause(); break;
          case 'goToSlide': goToSlide(parseInt(el.dataset.index, 10)); break;
          
          // Product cards & modal
          case 'openProductModal': openProductModal(el.getAttribute('data-product-id')); break;
          case 'closeProductModal': closeProductModal(); break;
          case 'closeProductModalBg':
            if (e.target === el) closeProductModal();
            break;
          
          // Modal option steps
          case 'selectModalSize':
            selectModalSize(el.dataset.productId, el.dataset.size);
            break;
          case 'selectModalColor':
            selectModalColor(el.dataset.productId, el.dataset.color);
            break;
          case 'selectModalStyle':
            selectModalStyle(el.dataset.productId, el.dataset.style);
            break;
          case 'renderGarmentModalBack':
          case 'renderGarmentModalStep':
            var pid = el.dataset.productId;
            var step = el.dataset.step;
            var prod = allShopProducts.find(function(p) { return p.id === pid; });
            if (prod) renderGarmentModal(prod, step);
            break;
          case 'toggleModalView':
            var tvPid = el.dataset.productId;
            var tvView = el.dataset.view;
            modalState.modalView = tvView;
            var tvProduct = allShopProducts.find(function(p) { return p.id === tvPid; });
            if (tvProduct) renderGarmentModal(tvProduct, modalState.step);
            break;
          case 'toggleDecalView':
            var dvPid = el.dataset.productId;
            var dvView = el.dataset.view;
            modalState.modalView = dvView;
            var dvProduct = allShopProducts.find(function(p) { return p.id === dvPid; });
            if (dvProduct) renderDecalModal(dvProduct);
            break;
          
          // Cart
          case 'toggleCart': toggleCart(); break;
          case 'cartCheckout': cartCheckout(); break;
          case 'addToCart':
            addToCart(
              el.dataset.productId,
              el.dataset.size,
              el.dataset.color,
              el.dataset.style
            );
            break;
          case 'changeQty':
            changeQty(parseInt(el.dataset.index, 10), parseInt(el.dataset.delta, 10));
            break;
          case 'removeFromCart':
            removeFromCart(parseInt(el.dataset.index, 10));
            break;
        }
      });
      
      // Handle keyboard Enter/Space on product cards (accessibility)
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var el = e.target.closest('[data-action="openProductModal"]');
          if (el) {
            e.preventDefault();
            openProductModal(el.getAttribute('data-product-id'));
          }
        }
      });
      
      // Handle ADA font size slider (input event, not click)
      var fontSlider = document.getElementById('adaFontSize');
      if (fontSlider) {
        fontSlider.addEventListener('input', function() { setFontSize(this.value); });
      }
    });
    
    // ========================================
    // ADA Compliance Accessibility Widget
    // ========================================
    function toggleAdaPanel() {
      var panel = document.getElementById('adaPanel');
      panel.classList.toggle('open');
    }
    
    function setFontSize(val) {
      document.documentElement.style.fontSize = val + '%';
      localStorage.setItem('ada_fontSize', val);
    }
    
    var a11yState = { contrast: false, links: false, font: false, animations: false, cursor: false };
    
    function toggleA11y(feature) {
      a11yState[feature] = !a11yState[feature];
      var btn = document.getElementById('ada' + feature.charAt(0).toUpperCase() + feature.slice(1));
      btn.classList.toggle('active', a11yState[feature]);
      btn.setAttribute('aria-checked', a11yState[feature].toString());
      applyA11y(feature, a11yState[feature]);
      localStorage.setItem('ada_' + feature, a11yState[feature]);
    }
    
    function applyA11y(feature, enabled) {
      var body = document.body;
      switch(feature) {
        case 'contrast':
          if (enabled) {
            body.style.filter = 'contrast(1.4)';
          } else {
            body.style.filter = '';
          }
          break;
        case 'links':
          document.querySelectorAll('a').forEach(function(a) {
            if (enabled) {
              a.style.textDecoration = 'underline';
              a.style.textDecorationThickness = '2px';
              a.style.textUnderlineOffset = '3px';
            } else {
              a.style.textDecoration = '';
              a.style.textDecorationThickness = '';
              a.style.textUnderlineOffset = '';
            }
          });
          break;
        case 'font':
          body.style.fontFamily = enabled ? 'Arial, Helvetica, sans-serif' : '';
          break;
        case 'animations':
          if (enabled) {
            var style = document.createElement('style');
            style.id = 'ada-no-animations';
            style.textContent = '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
            document.head.appendChild(style);
            // Also pause slideshow
            if (slideInterval) {
              clearInterval(slideInterval);
              isPaused = true;
            }
          } else {
            var el = document.getElementById('ada-no-animations');
            if (el) el.remove();
            isPaused = false;
            startInterval();
          }
          break;
        case 'cursor':
          body.style.cursor = enabled ? 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2732%27 height=%2732%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18.5V2%27 fill=%27%23000%27 stroke=%27%23fff%27 stroke-width=%271%27/%3E%3C/svg%3E"), auto' : '';
          break;
      }
    }
    
    function resetA11y() {
      document.documentElement.style.fontSize = '';
      document.getElementById('adaFontSize').value = 100;
      ['contrast', 'links', 'font', 'animations', 'cursor'].forEach(function(f) {
        a11yState[f] = false;
        var btn = document.getElementById('ada' + f.charAt(0).toUpperCase() + f.slice(1));
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
        applyA11y(f, false);
        localStorage.removeItem('ada_' + f);
      });
      localStorage.removeItem('ada_fontSize');
    }
    
    function restoreA11ySettings() {
      var fontSize = localStorage.getItem('ada_fontSize');
      if (fontSize) {
        document.documentElement.style.fontSize = fontSize + '%';
        document.getElementById('adaFontSize').value = fontSize;
      }
      ['contrast', 'links', 'font', 'animations', 'cursor'].forEach(function(f) {
        var saved = localStorage.getItem('ada_' + f);
        if (saved === 'true') {
          a11yState[f] = true;
          var btn = document.getElementById('ada' + f.charAt(0).toUpperCase() + f.slice(1));
          btn.classList.add('active');
          btn.setAttribute('aria-checked', 'true');
          applyA11y(f, true);
        }
      });
    }
    
    // ========================================
    // SHOPPING CART SYSTEM
    // ========================================
    var cart = JSON.parse(localStorage.getItem('hfw_cart') || '[]');
    
    function saveCart() {
      localStorage.setItem('hfw_cart', JSON.stringify(cart));
      updateCartBadge();
    }
    
    function updateCartBadge() {
      var badge = document.getElementById('cartBadge');
      var count = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
      if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count;
      } else {
        badge.style.display = 'none';
      }
    }
    
    function toggleCart() {
      var drawer = document.getElementById('cartDrawer');
      var overlay = document.getElementById('cartOverlay');
      var isOpen = drawer.style.right === '0px';
      if (isOpen) {
        drawer.style.right = '-420px';
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      } else {
        renderCart();
        drawer.style.right = '0px';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
      }
    }
    
    function renderCart() {
      var container = document.getElementById('cartItems');
      var footer = document.getElementById('cartFooter');
      if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:60px 20px; color:#999;"><i class="fas fa-shopping-cart" style="font-size:3rem; margin-bottom:15px; display:block;"></i><p style="font-size:1.1rem; margin:0;">Your cart is empty</p><p style="font-size:0.85rem; margin-top:8px;">Browse products and add items to get started.</p></div>';
        footer.style.display = 'none';
        return;
      }
      // HTML-escape helper for user-facing text in innerHTML
      function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
      var html = '';
      var total = 0;
      cart.forEach(function(item, index) {
        var subtotal = item.price * item.qty;
        total += subtotal;
        var details = '';
        if (item.size) details += '<span style="background:#f0f0f0; padding:2px 8px; border-radius:3px; font-size:0.75rem;">Size: ' + esc(item.size) + '</span> ';
        if (item.style) details += '<span style="background:#f0f0f0; padding:2px 8px; border-radius:3px; font-size:0.75rem;">Style: ' + esc(item.style) + '</span> ';
        if (item.color) details += '<span style="background:#f0f0f0; padding:2px 8px; border-radius:3px; font-size:0.75rem;">Color: ' + esc(item.color) + '</span>';
        html += '<div style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #eee; align-items:flex-start;">' +
          '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" style="width:70px; height:70px; object-fit:contain; border-radius:6px; background:#ffffff; flex-shrink:0;">' +
          '<div style="flex:1; min-width:0;">' +
            '<div style="font-weight:600; font-size:0.9rem; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(item.title) + '</div>' +
            '<div style="margin-bottom:6px;">' + details + '</div>' +
            '<div style="display:flex; align-items:center; gap:8px;">' +
              '<button data-action="changeQty" data-index="' + index + '" data-delta="-1" style="width:28px; height:28px; border:1px solid #ddd; background:#fff; border-radius:4px; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:center;">-</button>' +
              '<span style="font-size:0.9rem; min-width:20px; text-align:center;">' + item.qty + '</span>' +
              '<button data-action="changeQty" data-index="' + index + '" data-delta="1" style="width:28px; height:28px; border:1px solid #ddd; background:#fff; border-radius:4px; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:center;">+</button>' +
              '<span style="margin-left:auto; font-weight:600;">$' + subtotal.toFixed(2) + '</span>' +
            '</div>' +
          '</div>' +
          '<button data-action="removeFromCart" data-index="' + index + '" style="background:none; border:none; color:#999; cursor:pointer; font-size:0.9rem; padding:4px;" aria-label="Remove item"><i class="fas fa-trash"></i></button>' +
        '</div>';
      });
      container.innerHTML = html;
      footer.style.display = 'block';
      document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
      
      // Fetch server-side pricing with promotions
      updateCartPricing();
    }
    
    // Fetch server-side pricing breakdown (includes promotions)
    var _cartPricingTimer = null;
    function updateCartPricing() {
      if (_cartPricingTimer) clearTimeout(_cartPricingTimer);
      _cartPricingTimer = setTimeout(function() {
        if (cart.length === 0) return;
        fetch('/api/cart-pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: cart })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.error) return;
          var totalEl = document.getElementById('cartTotal');
          var promoEl = document.getElementById('cartPromos');
          
          // Update total with server-calculated amount
          totalEl.textContent = '$' + data.total;
          
          // Show promotions if any
          if (!promoEl) {
            promoEl = document.createElement('div');
            promoEl.id = 'cartPromos';
            var totalRow = totalEl.parentElement;
            if (totalRow) totalRow.parentElement.insertBefore(promoEl, totalRow);
          }
          
          var promoHtml = '';
          if (data.discountDetails && data.discountDetails.length > 0) {
            data.discountDetails.forEach(function(d) {
              promoHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.85rem; color:#28a745;"><span><i class="fas fa-tag"></i> ' + d.description + '</span><span>-$' + parseFloat(d.amount).toFixed(2) + '</span></div>';
            });
          }
          if (parseFloat(data.discount) > 0) {
            promoHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.9rem;"><span>Subtotal</span><span>$' + data.subtotal + '</span></div>';
            promoHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.9rem; color:#28a745; font-weight:600;"><span>Savings</span><span>-$' + data.discount + '</span></div>';
          }
          if (data.freeItems && data.freeItems.length > 0) {
            data.freeItems.forEach(function(f) {
              promoHtml += '<div style="margin-bottom:6px; font-size:0.8rem; color:#28a745;"><i class="fas fa-gift"></i> ' + f.title + ' - ' + f.reason + '</div>';
            });
          }
          promoEl.innerHTML = promoHtml;
        })
        .catch(function() { /* silently ignore pricing fetch errors */ });
      }, 300);
    }
    
    function addToCart(productId, size, color, style) {
      try {
        var product = allShopProducts.find(function(p) { return p.id === productId; });
        if (!product) return;
        // Resolve the best preview image for the cart thumbnail:
        // 1. If Zip-Up hoodie → use zip-up images.
        // 2. Otherwise → use color-specific garment image.
        // 3. Fallback → product's default image.
        var cartImage = product.image;
        if (color) {
          if (style === 'Zip-Up' && product.garmentType === 'hoodie' && typeof zipupHoodieImages !== 'undefined') {
            var ck = color.toLowerCase();
            cartImage = (zipupHoodieImages[ck] && zipupHoodieImages[ck].front) || getColorPreviewImage(product, color);
          } else {
            cartImage = getColorPreviewImage(product, color);
          }
        }
        // Check for duplicate (same product, size, color, style)
        var existing = cart.findIndex(function(item) {
          return item.productId === productId && item.size === (size||'') && item.color === (color||'') && item.style === (style||'');
        });
        if (existing >= 0) {
          cart[existing].qty += 1;
        } else {
          cart.push({
            productId: productId,
            title: product.title,
            price: product.priceNum,
            image: cartImage,
            size: size || '',
            color: color || '',
            style: style || '',
            qty: 1,
            type: product.type === 'decal' ? 'decal' : 'garment',
            garmentType: product.garmentType || ''
          });
        }
        saveCart();
        closeProductModal();
        toggleCart();
      } catch(e) { console.error('addToCart error:', e); }
    }
    
    function changeQty(index, delta) {
      if (index < 0 || index >= cart.length) return;
      cart[index].qty += delta;
      if (cart[index].qty > 100) cart[index].qty = 100;
      if (cart[index].qty <= 0) cart.splice(index, 1);
      saveCart();
      renderCart();
    }
    
    function removeFromCart(index) {
      if (index < 0 || index >= cart.length) return;
      cart.splice(index, 1);
      saveCart();
      renderCart();
    }
    
    function cartCheckout() {
      if (cart.length === 0) { alert('Your cart is empty.'); return; }
      
      // Disable button during checkout
      var checkoutBtns = document.querySelectorAll('[data-action="cartCheckout"]');
      checkoutBtns.forEach(function(btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'; });
      
      // Call checkout API
      fetch('/api/shop-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.url) {
          window.location.href = data.url;
        } else if (data.demo) {
          // Build detailed order summary for demo mode
          var msg = 'Order Placed (Demo Mode)\\n';
          msg += 'Order ID: ' + data.orderId + '\\n';
          msg += '================================\\n\\n';
          data.items.forEach(function(item) {
            var details = [item.size, item.style, item.color].filter(Boolean).join(', ');
            msg += item.title + (details ? ' (' + details + ')' : '') + '\\n';
            msg += '  ' + item.qty + ' x $' + item.unitPrice + ' = $' + item.subtotal + '\\n';
          });
          msg += '\\n--------------------------------\\n';
          msg += 'Subtotal: $' + data.subtotal + '\\n';
          if (parseFloat(data.discount) > 0) {
            data.discountDetails.forEach(function(d) { msg += 'Discount: ' + d.description + ' (-$' + parseFloat(d.amount).toFixed(2) + ')\\n'; });
          }
          msg += 'Shipping: ' + data.shipping + '\\n';
          msg += 'TOTAL: $' + data.total + '\\n';
          if (data.freeItems && data.freeItems.length > 0) {
            msg += '\\nFree Items:\\n';
            data.freeItems.forEach(function(f) { msg += '  ' + f.title + ' - ' + f.reason + '\\n'; });
          }
          msg += '\\nStripe checkout will activate when API key is configured.';
          alert(msg);
          cart = [];
          saveCart();
          renderCart();
        } else if (data.error) {
          alert('Error: ' + data.error);
        }
        // Re-enable checkout buttons
        checkoutBtns.forEach(function(btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Checkout'; });
      })
      .catch(function(err) {
        alert('Checkout error. Please try again.');
        checkoutBtns.forEach(function(btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Checkout'; });
      });
    }
    
    // ========================================
    // PRODUCT DETAIL MODAL
    // ========================================
    var modalState = { step: 'view', selectedSize: '', selectedColor: '', selectedStyle: '', modalView: 'front' };
    
    function openProductModal(productId) {
      try {
      var product = allShopProducts.find(function(p) { return p.id === productId; });
      if (!product) { console.warn('Product not found:', productId); return; }
      modalState = { step: 'view', selectedSize: '', selectedColor: '', selectedStyle: '', productId: productId, modalView: 'front' };
      
      if (product.type === 'garment') {
        renderGarmentModal(product, 'size');
      } else {
        renderDecalModal(product);
      }
      
      document.getElementById('productModal').style.display = 'block';
      document.body.style.overflow = 'hidden';
      } catch(e) { console.error('openProductModal error:', e); }
    }
    
    function closeProductModal() {
      document.getElementById('productModal').style.display = 'none';
      document.body.style.overflow = '';
    }
    
    // Zip-up hoodie images for the Shop modal style selector.
    // When a user selects "Zip-Up" style for a hoodie product, we swap the
    // preview image from the pullover hoodie to the zip-up variant.
    var zipupHoodieImages = ${JSON.stringify(
      garments.find(g => g.id === 'zipup-hoodie')?.images || {}
    ).replace(/<\//g, '<\\/')};
    
    // Shop modal: always displays Shopify product photos (no color-based preview changes)
    function renderGarmentModal(product, step) {
      modalState.step = step;
      var mc = document.getElementById('modalContent');
      
      // Shop Now: always use Shopify product photos (no color-based preview changes)
      var viewKey = modalState.modalView || 'front';
      var previewImg = (viewKey === 'back' && product.backImage) ? product.backImage : product.image;
      
      // Show front/back toggle when product has a backImage
      var viewToggleHtml = '';
      if (product.backImage) {
        var frontActive = viewKey === 'front' ? 'background:#8B0000; color:#fff;' : 'background:#f5f5f5; color:#333;';
        var backActive = viewKey === 'back' ? 'background:#8B0000; color:#fff;' : 'background:#f5f5f5; color:#333;';
        viewToggleHtml = '<div style="display:flex; justify-content:center; gap:8px; padding:8px 0 0;">' +
          '<button data-action="toggleModalView" data-product-id="' + product.id + '" data-view="front" style="padding:6px 16px; border:1px solid #ddd; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600; ' + frontActive + '">FRONT</button>' +
          '<button data-action="toggleModalView" data-product-id="' + product.id + '" data-view="back" style="padding:6px 16px; border:1px solid #ddd; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600; ' + backActive + '">BACK</button>' +
        '</div>';
      }
      
      // Always use a simple <img> — no canvas compositing in the Shop section
      var imageHtml = '<div style="background:#ffffff; padding:20px; text-align:center; position:relative;">' +
          '<div style="position:relative; display:inline-block;">' +
            '<img id="modalPreviewImg" src="' + previewImg + '" alt="' + product.title.replace(/'/g, '&#39;').replace(/"/g, '&quot;') + '" style="max-width:100%; max-height:300px; object-fit:contain;">' +
          '</div>' +
          viewToggleHtml +
        '</div>';
      
      var headerHtml = '<div style="padding:20px 20px 10px;">' +
        '<h3 style="margin:0 0 5px; font-size:1.3rem; font-weight:600;">' + product.title.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</h3>' +
        '<div style="color:#8B0000; font-size:1.2rem; font-weight:600;">' + product.price + '</div>' +
        '<div style="color:#4CAF50; font-size:0.8rem; font-weight:500; margin-top:4px;"><i class="fas fa-shield-alt"></i> Tax &amp; shipping included</div>' +
      '</div>';
      
      // Helper to build selection summary pills
      var summaryPills = function() {
        var pills = '';
        if (modalState.selectedSize) pills += '<span style="background:#f0f7ff; padding:4px 10px; border-radius:4px;"><i class="fas fa-ruler" style="color:#4CAF50;"></i> ' + modalState.selectedSize + '</span> ';
        if (modalState.selectedColor) pills += '<span style="background:#f0f7ff; padding:4px 10px; border-radius:4px;"><i class="fas fa-palette" style="color:#4CAF50;"></i> ' + modalState.selectedColor + '</span> ';
        if (modalState.selectedStyle) pills += '<span style="background:#f0f7ff; padding:4px 10px; border-radius:4px;"><i class="fas fa-hoodie" style="color:#4CAF50;"></i> ' + modalState.selectedStyle + '</span> ';
        return pills ? '<div style="padding:0 20px 8px; font-size:0.85rem; color:#555; display:flex; flex-wrap:wrap; gap:6px;">' + pills + '</div>' : '';
      };
      
      if (step === 'size') {
        // SIZE SELECTION STEP
        var sizesHtml = product.sizes.map(function(s) {
          var sel = modalState.selectedSize === s ? 'background:#8B0000; color:#fff; border-color:#8B0000;' : '';
          return '<button data-action="selectModalSize" data-product-id="' + product.id + '" data-size="' + s + '" style="padding:12px 20px; border:2px solid #ddd; background:#fff; border-radius:6px; cursor:pointer; font-size:1rem; font-weight:600; min-width:60px; transition:all 0.2s; ' + sel + '">' + s + '</button>';
        }).join('');
        
        mc.innerHTML = imageHtml + headerHtml +
          '<div style="padding:0 20px 20px;">' +
            '<h4 style="margin:0 0 12px; font-size:1rem; color:#666; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-ruler"></i> Select Size</h4>' +
            '<div style="display:flex; flex-wrap:wrap; gap:10px;">' + sizesHtml + '</div>' +
          '</div>';
          
      } else if (step === 'color') {
        // COLOR SELECTION STEP
        var colorsHtml = product.colors.map(function(c) {
          var bg = c.toLowerCase() === 'black' ? '#1a1a1a' : c.toLowerCase() === 'white' ? '#fff' : c.toLowerCase() === 'grey' ? '#808080' : c.toLowerCase() === 'pink' ? '#FF69B4' : '#ddd';
          var textColor = (c.toLowerCase() === 'white' || c.toLowerCase() === 'pink') ? '#333' : '#fff';
          var sel = modalState.selectedColor === c ? 'box-shadow:0 0 0 3px #8B0000; transform:scale(1.05);' : '';
          return '<button data-action="selectModalColor" data-product-id="' + product.id + '" data-color="' + c + '" style="padding:14px 24px; border:2px solid #ddd; background:' + bg + '; color:' + textColor + '; border-radius:8px; cursor:pointer; font-size:0.95rem; font-weight:600; min-width:80px; transition:all 0.2s; ' + sel + '">' + c + '</button>';
        }).join('');
        
        var backStep = 'size';
        
        mc.innerHTML = imageHtml + headerHtml + summaryPills() +
          '<div style="padding:0 20px 5px;">' +
            '<h4 style="margin:0 0 12px; font-size:1rem; color:#666; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-palette"></i> Select Color</h4>' +
            '<div style="display:flex; flex-wrap:wrap; gap:10px;">' + colorsHtml + '</div>' +
          '</div>' +
          '<div style="padding:15px 20px 20px; display:flex; gap:10px;">' +
            '<button data-action="renderGarmentModalBack" data-product-id="' + product.id + '" data-step="' + backStep + '" style="flex:1; padding:12px; background:#f5f5f5; color:#333; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:0.9rem;"><i class="fas fa-arrow-left"></i> Back</button>' +
          '</div>';
          
      } else if (step === 'style') {
        // STYLE SELECTION STEP (Pullover / Zip-Up for hoodies)
        var stylesHtml = product.styles.map(function(s) {
          var sel = modalState.selectedStyle === s ? 'background:#8B0000; color:#fff; border-color:#8B0000;' : '';
          return '<button data-action="selectModalStyle" data-product-id="' + product.id + '" data-style="' + s + '" style="padding:16px 28px; border:2px solid #ddd; background:#fff; border-radius:8px; cursor:pointer; font-size:1.05rem; font-weight:600; min-width:120px; transition:all 0.2s; ' + sel + '">' + s + '</button>';
        }).join('');
        
        var continueBtn = modalState.selectedStyle ?
          '<button data-action="renderGarmentModalStep" data-product-id="' + product.id + '" data-step="confirm" style="flex:2; padding:14px; background:#8B0000; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:1rem; font-weight:600; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-arrow-right"></i> Continue</button>' : '';
        
        mc.innerHTML = imageHtml + headerHtml + summaryPills() +
          '<div style="padding:0 20px 5px;">' +
            '<h4 style="margin:0 0 12px; font-size:1rem; color:#666; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-vest"></i> Select Style</h4>' +
            '<div style="display:flex; flex-wrap:wrap; gap:12px;">' + stylesHtml + '</div>' +
          '</div>' +
          '<div style="padding:15px 20px 20px; display:flex; gap:10px;">' +
            '<button data-action="renderGarmentModalBack" data-product-id="' + product.id + '" data-step="color" style="flex:1; padding:12px; background:#f5f5f5; color:#333; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:0.9rem;"><i class="fas fa-arrow-left"></i> Back</button>' +
            continueBtn +
          '</div>';
          
      } else if (step === 'confirm') {
        // CONFIRM + ADD TO CART
        mc.innerHTML = imageHtml + headerHtml + summaryPills() +
          '<div style="padding:10px 20px 20px; display:flex; flex-direction:column; gap:10px;">' +
            '<button data-action="addToCart" data-product-id="' + product.id + '" data-size="' + modalState.selectedSize + '" data-color="' + modalState.selectedColor + '" data-style="' + (modalState.selectedStyle || '') + '" style="padding:16px; background:#8B0000; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:1rem; font-weight:600; text-transform:uppercase; letter-spacing:1px; transition:background 0.3s;"><i class="fas fa-cart-plus"></i> Add to Cart</button>' +
            '<button data-action="closeProductModal" style="padding:12px; background:transparent; color:#333; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:0.9rem;"><i class="fas fa-arrow-left"></i> Keep Shopping</button>' +
            '<button data-action="renderGarmentModalBack" data-product-id="' + product.id + '" data-step="size" style="padding:10px; background:transparent; color:#666; border:none; cursor:pointer; font-size:0.85rem; text-decoration:underline;">Change Options</button>' +
          '</div>';
      }
      
    }
    
    function selectModalSize(productId, size) {
      modalState.selectedSize = size;
      var product = allShopProducts.find(function(p) { return p.id === productId; });
      // Auto-advance to color step
      renderGarmentModal(product, 'color');
    }
    
    function selectModalColor(productId, color) {
      modalState.selectedColor = color;
      var product = allShopProducts.find(function(p) { return p.id === productId; });
      // If product has styles (e.g. Pullover/Zip-Up), go to style step; otherwise confirm
      if (product.styles && product.styles.length > 0) {
        renderGarmentModal(product, 'style');
      } else {
        renderGarmentModal(product, 'confirm');
      }
    }
    
    function selectModalStyle(productId, style) {
      modalState.selectedStyle = style;
      var product = allShopProducts.find(function(p) { return p.id === productId; });
      // Stay on style step so user can see selection highlight
      renderGarmentModal(product, 'style');
    }
    
    function renderDecalModal(product) {
      var mc = document.getElementById('modalContent');
      var safeTitle = product.title.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
      var viewKey = modalState.modalView || 'front';
      var displayImg = (viewKey === 'back' && product.backImage) ? product.backImage : product.image;
      
      // Show front/back toggle for decals that have Shopify photography (backImage)
      var viewToggleHtml = '';
      if (product.backImage) {
        var frontActive = viewKey === 'front' ? 'background:#8B0000; color:#fff;' : 'background:#f5f5f5; color:#333;';
        var backActive = viewKey === 'back' ? 'background:#8B0000; color:#fff;' : 'background:#f5f5f5; color:#333;';
        viewToggleHtml = '<div style="display:flex; justify-content:center; gap:8px; padding:10px 0 0;">' +
          '<button data-action="toggleDecalView" data-product-id="' + product.id + '" data-view="front" style="padding:6px 16px; border:1px solid #ddd; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600; ' + frontActive + '">GRAPHIC</button>' +
          '<button data-action="toggleDecalView" data-product-id="' + product.id + '" data-view="back" style="padding:6px 16px; border:1px solid #ddd; border-radius:4px; cursor:pointer; font-size:0.8rem; font-weight:600; ' + backActive + '">PRODUCT PHOTO</button>' +
        '</div>';
      }
      
      mc.innerHTML = '<div style="background:#ffffff; padding:30px; text-align:center;">' +
          '<img src="' + displayImg + '" alt="' + safeTitle + '" style="max-width:100%; max-height:400px; object-fit:contain;">' +
          viewToggleHtml +
        '</div>' +
        '<div style="padding:20px;">' +
          '<h3 style="margin:0 0 5px; font-size:1.3rem; font-weight:600;">' + safeTitle + '</h3>' +
          '<div style="color:#666; font-size:0.9rem; margin-bottom:8px;">' + product.vendor + '</div>' +
          '<div style="color:#8B0000; font-size:1.3rem; font-weight:600; margin-bottom:4px;">' + product.price + '</div>' +
          '<div style="color:#4CAF50; font-size:0.8rem; font-weight:500; margin-bottom:16px;"><i class="fas fa-shield-alt"></i> Tax &amp; shipping included</div>' +
          '<div style="display:flex; flex-direction:column; gap:10px;">' +
            '<button data-action="addToCart" data-product-id="' + product.id + '" data-size="" data-color="" style="padding:16px; background:#8B0000; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:1rem; font-weight:600; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-cart-plus"></i> Add to Cart</button>' +
            '<button data-action="closeProductModal" style="padding:12px; background:transparent; color:#333; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:0.9rem;"><i class="fas fa-arrow-left"></i> Keep Shopping</button>' +
          '</div>' +
        '</div>';
    }
    
    // Init cart badge on page load
    updateCartBadge();
  </script>
</body>
</html>`)
})

// ============================================
// ROUTE: Custom Garment Builder
// ============================================

app.get('/build', (c) => {
  const nonce = c.get('nonce')
  // Pass data as JSON for client-side JavaScript
  const garmentsJson = JSON.stringify(garments)
  const graphicsJson = JSON.stringify(graphics)
  const placementsJson = JSON.stringify(placements)

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Y'Own - Hillbilly Fightwear</title>
  <link rel="stylesheet" href="/static/tailwind.css">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
  <style nonce="${nonce}">
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; }
    
    body {
      font-family: 'Oswald', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }
    
    .builder-container {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 30px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px 20px;
      min-height: calc(100vh - 60px);
    }
    
    @media (max-width: 1024px) {
      .builder-container {
        grid-template-columns: 1fr;
      }
    }
    
    .preview-section {
      background: #fff;
      border-radius: 12px;
      padding: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: sticky;
      top: 20px;
      height: fit-content;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    
    .canvas-wrapper {
      position: relative;
      width: 100%;
      max-width: 350px;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    #previewCanvas {
      display: block;
      width: 100%;
    }
    
    /* Canvas styling for graphics selection */
    .canvas-container {
      cursor: default !important;
    }
    
    .canvas-container canvas {
      cursor: default !important;
    }
    
    /* Drag hint styling */
    .drag-hint {
      margin-top: 12px;
      padding: 10px 15px;
      background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
      border: 1px solid #f0c0c0;
      border-radius: 6px;
      font-size: 0.75rem;
      color: #8B0000;
      text-align: center;
      animation: pulse-hint 2s ease-in-out infinite;
    }
    
    .drag-hint i {
      margin-right: 6px;
    }
    
    @keyframes pulse-hint {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .view-toggle {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .view-btn {
      padding: 10px 25px;
      border: 2px solid #333;
      background: transparent;
      color: #333;
      cursor: pointer;
      font-family: 'Oswald', sans-serif;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s;
      border-radius: 4px;
    }
    
    .view-btn.active, .view-btn:hover {
      background: #333;
      color: #fff;
    }
    
    .options-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .option-group {
      background: #fff;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .option-group h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 20px;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .option-group h3 .step-num {
      width: 28px;
      height: 28px;
      background: #8B0000;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }
    
    .garment-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    
    .garment-option {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 12px 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #fff;
    }
    
    .garment-option:hover { border-color: #999; }
    .garment-option.selected { border-color: #8B0000; background: #fff5f5; }
    
    .garment-option img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 6px;
    }
    
    .garment-option .name { font-size: 0.7rem; font-weight: 600; color: #333; margin-bottom: 2px; }
    .garment-option .price { font-size: 0.75rem; color: #8B0000; font-weight: 600; }
    
    .size-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .size-option {
      min-width: 45px;
      padding: 8px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      text-align: center;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.3s;
      background: #fff;
    }
    
    .size-option:hover { border-color: #999; }
    .size-option.selected { border-color: #8B0000; background: #8B0000; color: #fff; }
    
    .color-grid {
      display: flex;
      gap: 15px;
    }
    
    .color-option {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      cursor: pointer;
      border: 3px solid #e0e0e0;
      transition: all 0.3s;
      position: relative;
    }
    
    .color-option:hover { border-color: #999; transform: scale(1.1); }
    .color-option.selected { border-color: #8B0000; box-shadow: 0 0 0 3px rgba(139,0,0,0.3); }
    
    .color-option.white { background: #fff; }
    .color-option.black { background: #1a1a1a; }
    .color-option.grey { background: #808080; }
    
    .color-option .color-name {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.65rem;
      color: #666;
      white-space: nowrap;
    }
    
    .graphics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 5px;
    }
    
    /* Custom scrollbar for graphics grid */
    .graphics-grid::-webkit-scrollbar {
      width: 6px;
    }
    .graphics-grid::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    .graphics-grid::-webkit-scrollbar-thumb {
      background: #8B0000;
      border-radius: 3px;
    }
    .graphics-grid::-webkit-scrollbar-thumb:hover {
      background: #6B0000;
    }
    
    .graphic-option {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.3s;
      background: #fff;
      text-align: center;
    }
    
    .graphic-option:hover { border-color: #999; }
    .graphic-option.selected { border-color: #8B0000; background: #fff5f5; }
    
    .graphic-option img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: contain;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    
    .graphic-option .name { font-size: 0.6rem; color: #666; line-height: 1.2; }
    
    .placement-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .placement-option {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #fff;
      font-size: 0.9rem;
    }
    
    .placement-option:hover { border-color: #999; }
    .placement-option.selected { border-color: #8B0000; background: #8B0000; color: #fff; }
    
    .additional-graphics {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    
    .additional-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      background: #f8f8f8;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    
    .additional-item .info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .additional-item img {
      width: 35px;
      height: 35px;
      object-fit: contain;
      border-radius: 4px;
    }
    
    .remove-btn {
      background: #dc3545;
      color: #fff;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
    
    .add-graphic-btn {
      width: 100%;
      padding: 12px;
      border: 2px dashed #999;
      background: transparent;
      color: #666;
      cursor: pointer;
      border-radius: 6px;
      font-family: 'Oswald', sans-serif;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s;
      font-size: 0.85rem;
    }
    
    .add-graphic-btn:hover { border-color: #8B0000; color: #8B0000; }
    
    .order-summary {
      background: #1a1a1a;
      color: #fff;
      border-radius: 12px;
      padding: 25px;
      width: 100%;
      margin-top: 25px;
    }
    
    .order-summary h3 {
      margin: 0 0 15px;
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .summary-line {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-size: 0.85rem;
    }
    
    .summary-line:last-of-type { border-bottom: none; }
    
    .summary-total {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      margin-top: 10px;
      border-top: 2px solid rgba(255,255,255,0.3);
      font-size: 1.2rem;
      font-weight: 700;
    }
    
    .checkout-btn {
      width: 100%;
      padding: 16px;
      background: #8B0000;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-family: 'Oswald', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 15px;
    }
    
    .checkout-btn:hover { background: #a00000; transform: scale(1.02); }
    .checkout-btn:disabled { background: #666; cursor: not-allowed; transform: none; }
    
    .builder-header {
      background: #1a1a1a;
      color: #fff;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .builder-header a {
      color: #fff;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
    }
    
    .builder-header a:hover { color: #ccc; }
    
    .builder-header h1 {
      margin: 0;
      font-size: 1.3rem;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    
    .modal-overlay.active { display: flex; }
    
    .modal-content {
      background: #fff;
      padding: 30px;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .modal-content h3 {
      margin: 0 0 20px;
      font-size: 1.2rem;
      color: #333;
    }
    
    .modal-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .modal-buttons button {
      flex: 1;
      padding: 12px;
      border-radius: 6px;
      font-family: 'Oswald', sans-serif;
      text-transform: uppercase;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .modal-cancel {
      border: 2px solid #333;
      background: transparent;
      color: #333;
    }
    
    .modal-confirm {
      border: none;
      background: #8B0000;
      color: #fff;
    }
    
    /* Mobile Navigation Tabs */
    .mobile-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1a1a1a;
      z-index: 100;
      padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
    }
    
    .mobile-nav-inner {
      display: flex;
      justify-content: space-around;
      align-items: center;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .mobile-nav-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      color: #888;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s;
      font-family: 'Oswald', sans-serif;
    }
    
    .mobile-nav-btn:hover,
    .mobile-nav-btn:active,
    .mobile-nav-btn.active {
      color: #fff;
      background: rgba(139, 0, 0, 0.3);
    }
    
    .mobile-nav-btn .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #333;
      color: #888;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    
    .mobile-nav-btn:hover .step-circle,
    .mobile-nav-btn:active .step-circle,
    .mobile-nav-btn.active .step-circle {
      background: #8B0000;
      color: #fff;
    }
    
    .mobile-nav-btn .step-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    @media (max-width: 768px) {
      .mobile-nav {
        display: block;
      }
      
      body {
        padding-bottom: 80px; /* Space for mobile nav */
      }
      
      .builder-container {
        padding-bottom: 100px;
      }
      
      .option-group {
        scroll-margin-top: 80px; /* Account for header when scrolling */
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="builder-header">
    <a href="/">
      <i class="fas fa-arrow-left"></i>
      <span>Back to Store</span>
    </a>
    <h1><i class="fas fa-tshirt"></i> Custom Builder</h1>
    <div style="width: 120px;"></div>
  </header>
  
  <div class="builder-container">
    <!-- Options Panel -->
    <div class="options-section">
      <!-- Step 1: Garment -->
      <div class="option-group" id="step1">
        <h3><span class="step-num">1</span> Choose Your Garment</h3>
        <div class="garment-grid" id="garmentGrid"></div>
      </div>
      
      <!-- Step 2: Size -->
      <div class="option-group" id="step2">
        <h3><span class="step-num">2</span> Select Size</h3>
        <div class="size-grid" id="sizeGrid">
          <div style="color: #999; font-size: 0.9rem;">Select a garment first</div>
        </div>
      </div>
      
      <!-- Step 3: Color (dynamically rendered based on garment) -->
      <div class="option-group" id="step3">
        <h3><span class="step-num">3</span> Select Color</h3>
        <div class="color-grid" id="colorGrid">
          <div style="color: #999; font-size: 0.9rem;">Select a garment first</div>
        </div>
      </div>
      
      <!-- Step 4: Graphics -->
      <div class="option-group" id="step4">
        <h3><span class="step-num">4</span> Choose Graphics</h3>
        <div class="graphics-grid" id="graphicsGrid"></div>
        
        <div class="additional-graphics" id="additionalGraphics" style="display: none;">
          <h4 style="margin: 0 0 12px; font-size: 0.85rem; color: #666;">Additional Graphics (+$10 small / +$15 full placement)</h4>
          <div id="additionalList"></div>
          <button class="add-graphic-btn" id="addGraphicBtn">
            <i class="fas fa-plus"></i> Add Another Graphic
          </button>
        </div>
      </div>
      
      <!-- Step 5: Placement -->
      <div class="option-group" id="step5">
        <h3><span class="step-num">5</span> Graphic Placement</h3>
        <div class="placement-grid" id="placementGrid"></div>
      </div>
    </div>
    
    <!-- Preview Section -->
    <div class="preview-section">
      <h3 style="margin: 0 0 20px; text-transform: uppercase; letter-spacing: 1px; font-size: 1rem;">Live Preview</h3>
      
      <div class="canvas-wrapper">
        <canvas id="previewCanvas" width="350" height="467"></canvas>
      </div>
      
      <div class="drag-hint" id="dragHint" style="display: none;">
        <i class="fas fa-hand-pointer"></i> Click and drag graphics to reposition. Use corners to resize.
      </div>
      
      <div class="view-toggle" id="viewToggle">
        <button class="view-btn active" data-view="front">Front</button>
        <button class="view-btn" data-view="back">Back</button>
      </div>
      
      <!-- Order Summary -->
      <div class="order-summary">
        <h3><i class="fas fa-shopping-cart"></i> Order Summary</h3>
        <div id="summaryContent">
          <div class="summary-line">
            <span>Select options above</span>
            <span>-</span>
          </div>
        </div>
        <div class="summary-total">
          <span>Total</span>
          <span id="totalPrice">$0.00</span>
        </div>
        <div style="text-align:center; margin-bottom:8px; padding:8px; background:rgba(76,175,80,0.08); border:1px solid rgba(76,175,80,0.2); border-radius:6px;">
          <div style="color:#2e7d32; font-size:0.78rem; font-weight:600;"><i class="fas fa-shield-alt"></i> All-Inclusive Pricing</div>
          <div style="color:#4CAF50; font-size:0.72rem;">Tax &amp; shipping included</div>
        </div>
        <button class="checkout-btn" id="checkoutBtn" disabled>
          <i class="fas fa-lock"></i> Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
  
  <!-- Add Graphic Modal -->
  <div class="modal-overlay" id="addGraphicModal">
    <div class="modal-content">
      <h3>Add Another Graphic</h3>
      <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">Select a graphic and choose where to place it. Each graphic adds to the total.</p>
      <div class="graphics-grid" id="modalGraphicsGrid"></div>
      <div style="margin-top: 20px;">
        <h4 style="margin: 0 0 10px; font-size: 0.9rem;">Placement</h4>
        <div class="placement-grid" id="modalPlacementGrid"></div>
      </div>
      <div class="modal-buttons">
        <button class="modal-cancel" id="modalCancelBtn">Cancel</button>
        <button class="modal-confirm" id="modalConfirmBtn">Add Graphic</button>
      </div>
    </div>
  </div>
  
  <!-- Mobile Navigation -->
  <nav class="mobile-nav" id="mobileNav">
    <div class="mobile-nav-inner">
      <button class="mobile-nav-btn active" data-step="1">
        <span class="step-circle">1</span>
        <span class="step-label">Garment</span>
      </button>
      <button class="mobile-nav-btn" data-step="2">
        <span class="step-circle">2</span>
        <span class="step-label">Size</span>
      </button>
      <button class="mobile-nav-btn" data-step="3">
        <span class="step-circle">3</span>
        <span class="step-label">Color</span>
      </button>
      <button class="mobile-nav-btn" data-step="4">
        <span class="step-circle">4</span>
        <span class="step-label">Graphics</span>
      </button>
      <button class="mobile-nav-btn" data-step="5">
        <span class="step-circle">5</span>
        <span class="step-label">Place</span>
      </button>
    </div>
  </nav>
  
  <script nonce="${nonce}">
    // Data from server (escaped to prevent XSS injection)
    const garments = ${garmentsJson.replace(/<\//g, '<\\/')};
    const graphics = ${graphicsJson.replace(/<\//g, '<\\/')};
    const placements = ${placementsJson.replace(/<\//g, '<\\/')};
    
    // State
    let state = {
      garment: null,
      size: null,
      color: 'black',
      graphic: null,
      placement: 'full-front',
      additionalGraphics: [],
      view: 'front'
    };
    
    let canvas;
    let modalSelectedGraphic = null;
    let modalSelectedPlacement = null;
    let previewUpdateId = 0; // Used to cancel stale async updates
    
    // Store user-customized graphic positions so they persist across preview refreshes.
    // Key: "graphicId::placementId", Value: { left, top, scaleX, scaleY, angle }
    var userGraphicPositions = {};
    
    // Mobile navigation - scroll to step
    function scrollToStep(stepNum) {
      var element = document.getElementById('step' + stepNum);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update active nav button
        document.querySelectorAll('.mobile-nav-btn').forEach(function(btn) {
          btn.classList.toggle('active', btn.dataset.step === String(stepNum));
        });
      }
    }
    
    // Update mobile nav active state on scroll
    function updateMobileNavOnScroll() {
      var steps = [1, 2, 3, 4, 5];
      var currentStep = 1;
      
      steps.forEach(function(step) {
        var element = document.getElementById('step' + step);
        if (element) {
          var rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            currentStep = step;
          }
        }
      });
      
      document.querySelectorAll('.mobile-nav-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.step === String(currentStep));
      });
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      initCanvas();
      renderGarments();
      renderGraphics();
      renderPlacements();
      
      // ---- Event delegation: all click handlers via container listeners ----
      // Garment grid
      document.getElementById('garmentGrid').addEventListener('click', function(e) {
        var option = e.target.closest('.garment-option');
        if (option && option.dataset.id) selectGarment(option.dataset.id);
      });
      
      // Size grid
      document.getElementById('sizeGrid').addEventListener('click', function(e) {
        var option = e.target.closest('.size-option');
        if (option && option.dataset.size) selectSize(option.dataset.size);
      });
      
      // Color grid (dynamic content)
      document.getElementById('colorGrid').addEventListener('click', function(e) {
        var option = e.target.closest('.color-option');
        if (option && option.dataset.color) selectColor(option.dataset.color);
      });
      
      // Graphics grid
      document.getElementById('graphicsGrid').addEventListener('click', function(e) {
        var option = e.target.closest('.graphic-option');
        if (option && option.dataset.id) selectGraphic(option.dataset.id);
      });
      
      // Placement grid
      document.getElementById('placementGrid').addEventListener('click', function(e) {
        var option = e.target.closest('.placement-option');
        if (option && option.dataset.id) selectPlacement(option.dataset.id);
      });
      
      // View toggle buttons (Front/Back)
      document.getElementById('viewToggle').addEventListener('click', function(e) {
        var btn = e.target.closest('.view-btn');
        if (btn && btn.dataset.view) setView(btn.dataset.view);
      });
      
      // Add Graphic button
      document.getElementById('addGraphicBtn').addEventListener('click', showAddGraphicModal);
      
      // Checkout button
      document.getElementById('checkoutBtn').addEventListener('click', checkout);
      
      // Modal: graphic selection (delegated since content is dynamic)
      document.getElementById('modalGraphicsGrid').addEventListener('click', function(e) {
        var option = e.target.closest('.graphic-option');
        if (option && option.dataset.id) modalSelectGraphic(option.dataset.id);
      });
      
      // Modal: placement selection (delegated since content is dynamic)
      document.getElementById('modalPlacementGrid').addEventListener('click', function(e) {
        var option = e.target.closest('.placement-option');
        if (option && option.dataset.id) modalSelectPlacement(option.dataset.id);
      });
      
      // Modal: Cancel / Confirm buttons
      document.getElementById('modalCancelBtn').addEventListener('click', closeAddGraphicModal);
      document.getElementById('modalConfirmBtn').addEventListener('click', confirmAddGraphic);
      
      // Additional graphics: remove buttons (delegated since content is dynamic)
      document.getElementById('additionalList').addEventListener('click', function(e) {
        var btn = e.target.closest('[data-remove-index]');
        if (btn) removeAdditionalGraphic(parseInt(btn.dataset.removeIndex, 10));
      });
      
      // Mobile nav buttons
      document.getElementById('mobileNav').addEventListener('click', function(e) {
        var btn = e.target.closest('.mobile-nav-btn');
        if (btn && btn.dataset.step) scrollToStep(parseInt(btn.dataset.step, 10));
      });
      
      // Add scroll listener for mobile nav
      window.addEventListener('scroll', updateMobileNavOnScroll);
      
      // Check URL params
      var params = new URLSearchParams(window.location.search);
      if (params.get('garment')) {
        selectGarment(params.get('garment'));
      } else {
        // Auto-select first garment (T-Shirt) if none specified
        selectGarment('tshirt');
      }
      if (params.get('graphic')) {
        selectGraphic(params.get('graphic'));
      }

    });
    
    function initCanvas() {
      canvas = new fabric.Canvas('previewCanvas', {
        width: 350,
        height: 467,
        selection: true,
        backgroundColor: '#ffffff'
      });
      
      // Add visual feedback for selected objects
      canvas.on('object:selected', function(e) {
        var obj = e.target;
        if (obj && obj.isGraphic) {
          obj.set({
            borderColor: '#8B0000',
            cornerColor: '#8B0000',
            cornerSize: 10,
            transparentCorners: false
          });
          canvas.renderAll();
        }
      });
      
      // Enforce max/min scale and uniform aspect ratio during graphic scaling
      canvas.on('object:scaling', function(e) {
        var obj = e.target;
        if (!obj || !obj.isGraphic || !obj.maxScale) return;
        
        // Clamp to [minScale, maxScale] and enforce uniform scaling
        var clamped = Math.max(obj.minScale, Math.min(obj.maxScale, (obj.scaleX + obj.scaleY) / 2));
        obj.scaleX = clamped;
        obj.scaleY = clamped;
      });
      
      // Constrain graphics to printable area during move/scale
      // Prevents dragging outside garment, over zippers, and off seams
      canvas.on('object:moving', function(e) {
        var obj = e.target;
        if (!obj || !obj.isGraphic) return;
        
        var bounds = getGraphicBounds(obj.placementId, state.garment);
        var halfW = (obj.width * obj.scaleX) / 2;
        var halfH = (obj.height * obj.scaleY) / 2;
        
        // Clamp position to keep graphic within printable bounds
        if (obj.left - halfW < bounds.minX) obj.left = bounds.minX + halfW;
        if (obj.left + halfW > bounds.maxX) obj.left = bounds.maxX - halfW;
        if (obj.top - halfH < bounds.minY) obj.top = bounds.minY + halfH;
        if (obj.top + halfH > bounds.maxY) obj.top = bounds.maxY - halfH;
      });
      
      // Save user position after any move, scale, or rotate
      canvas.on('object:modified', function(e) {
        var obj = e.target;
        if (!obj || !obj.isGraphic || !obj.graphicId || !obj.placementId) return;
        
        var key = obj.graphicId + '::' + obj.placementId;
        userGraphicPositions[key] = {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle || 0
        };
      });
    }
    
    // ---- Render functions (no inline onclick — uses event delegation) ----
    function renderGarments() {
      var grid = document.getElementById('garmentGrid');
      var colorKey = state.color || 'black';
      grid.innerHTML = garments.map(function(g) {
        var imgSrc = (g.images[colorKey] || g.images.black || {}).front || '';
        return '<div class="garment-option" data-id="' + g.id + '">' +
          '<img src="' + imgSrc + '" alt="' + g.name + '" loading="lazy">' +
          '<div class="name">' + g.name + '</div>' +
          '<div class="price">$' + g.basePrice.toFixed(2) + '</div>' +
        '</div>';
      }).join('');
    }
    
    function renderSizes(garmentId) {
      var grid = document.getElementById('sizeGrid');
      var g = garments.find(function(x) { return x.id === garmentId; });
      if (!g) return;
      grid.innerHTML = g.sizes.map(function(s) {
        return '<div class="size-option" data-size="' + s + '">' + s + '</div>';
      }).join('');
    }
    
    // Dynamic color rendering based on garment's available images
    // Note: pink is excluded from selectable garment colors for tank-womens.
    // Pink/purple are graphic-specific color variants (e.g. Thumpin' Is Lovin'),
    // not garment fabric colors. The garment itself comes in black/white/grey.
    function renderColors(garmentId) {
      var grid = document.getElementById('colorGrid');
      var g = garments.find(function(x) { return x.id === garmentId; });
      if (!g) {
        grid.innerHTML = '<div style="color: #999; font-size: 0.9rem;">Select a garment first</div>';
        return;
      }
      // Filter out non-garment colors (pink is a graphic color option, not fabric)
      var excludedColors = ['pink'];
      var colors = Object.keys(g.images).filter(function(c) {
        return excludedColors.indexOf(c) === -1;
      });
      grid.innerHTML = colors.map(function(c) {
        var sel = (state.color === c) ? ' selected' : '';
        // Map color names to CSS background values
        var bgMap = { white: '#fff', black: '#1a1a1a', grey: '#808080', pink: '#FF69B4', red: '#c0392b', navy: '#2c3e50', blue: '#3498db' };
        var bg = bgMap[c] || c;
        return '<div class="color-option' + sel + '" data-color="' + c + '" style="background:' + bg + ';">' +
          '<span class="color-name">' + c.charAt(0).toUpperCase() + c.slice(1) + '</span>' +
        '</div>';
      }).join('');
    }
    
    function renderGraphics() {
      var grid = document.getElementById('graphicsGrid');
      // Filter graphics based on current garment selection
      var availableGraphics = graphics.filter(function(g) {
        if (!g.restrictToGarments || g.restrictToGarments.length === 0) return true;
        if (state.garment) return g.restrictToGarments.includes(state.garment);
        return true;
      });
      
      grid.innerHTML = availableGraphics.map(function(g) {
        return '<div class="graphic-option" data-id="' + g.id + '">' +
          '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
          '<div class="name">' + g.name + '</div>' +
        '</div>';
      }).join('');
      
      // If current selected graphic is no longer available, deselect it and notify user
      if (state.graphic) {
        var stillAvailable = availableGraphics.find(function(g) { return g.id === state.graphic; });
        if (!stillAvailable) {
          var oldGraphic = graphics.find(function(g) { return g.id === state.graphic; });
          state.graphic = null;
          updatePreview();
          updateSummary();
          updateDragHint();
          // Toast notification (P3 fix)
          if (oldGraphic) {
            showToast('"' + oldGraphic.name + '" is not available for this garment and was removed.');
          }
        }
      }
    }
    
    function renderPlacements() {
      var grid = document.getElementById('placementGrid');
      var isHeadwear = state.garment === 'trucker-hat' || state.garment === 'beanie';
      
      var available = placements.filter(function(p) {
        return isHeadwear ? p.forHats : !p.forHats;
      });
      
      grid.innerHTML = available.map(function(p) {
        var selected = state.placement === p.id ? ' selected' : '';
        return '<div class="placement-option' + selected + '" data-id="' + p.id + '">' + p.name + '</div>';
      }).join('');
      
      document.getElementById('viewToggle').style.display = isHeadwear ? 'none' : 'flex';
    }
    
    // ---- Toast notification system ----
    function showToast(message) {
      var existing = document.getElementById('builderToast');
      if (existing) existing.remove();
      var toast = document.createElement('div');
      toast.id = 'builderToast';
      toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 24px;border-radius:8px;font-size:0.9rem;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:90vw;text-align:center;opacity:0;transition:opacity 0.3s;';
      toast.textContent = message;
      document.body.appendChild(toast);
      // Fade in
      requestAnimationFrame(function() { toast.style.opacity = '1'; });
      // Fade out and remove after 4 seconds
      setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 300);
      }, 4000);
    }
    
    // Helper function to get price for a graphic based on placement
    // Every graphic is charged individually: small placements (chest, hat): $10, Full placements (front/back): $15
    function getGraphicPrice(placementId) {
      var p = placements.find(function(x) { return x.id === placementId; });
      return (p && p.isSmall) ? 10 : 15;
    }
    
    function renderAdditionalGraphics() {
      var container = document.getElementById('additionalGraphics');
      var list = document.getElementById('additionalList');
      
      if (state.graphic) {
        container.style.display = 'block';
        
        if (state.additionalGraphics.length > 0) {
          list.innerHTML = state.additionalGraphics.map(function(ag, i) {
            var g = graphics.find(function(x) { return x.id === ag.graphic; });
            var p = placements.find(function(x) { return x.id === ag.placement; });
            if (!g || !p) return ''; // Defensive: skip orphaned entries
            var price = getGraphicPrice(ag.placement);
            return '<div class="additional-item">' +
              '<div class="info">' +
                '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
                '<div>' +
                  '<div style="font-weight: 600; font-size: 0.85rem;">' + g.name + '</div>' +
                  '<div style="font-size: 0.75rem; color: #666;">' + p.name + ' &bull; +$' + price.toFixed(2) + '</div>' +
                '</div>' +
              '</div>' +
              '<button class="remove-btn" data-remove-index="' + i + '">' +
                '<i class="fas fa-times"></i>' +
              '</button>' +
            '</div>';
          }).join('');
        } else {
          list.innerHTML = '';
        }
      } else {
        container.style.display = 'none';
      }
    }
    
    // ---- Selection handlers ----
    function selectGarment(id) {
      state.garment = id;
      state.size = null;
      preloadGarmentImages(id);
      
      document.querySelectorAll('.garment-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.id === id);
      });
      
      renderSizes(id);
      
      // Render dynamic color options for this garment
      var g = garments.find(function(x) { return x.id === id; });
      if (g) {
        // If current color is not available for this garment, reset to first available
        var availableColors = Object.keys(g.images);
        if (availableColors.indexOf(state.color) === -1) {
          state.color = availableColors[0] || 'black';
        }
      }
      renderColors(id);
      
      var isHeadwear = id === 'trucker-hat' || id === 'beanie';
      state.placement = isHeadwear ? 'hat-front' : 'full-front';
      renderPlacements();
      
      // Re-render graphics to filter based on garment restrictions
      renderGraphics();
      
      // Re-apply selected state to graphic if still available
      if (state.graphic) {
        document.querySelectorAll('.graphic-option').forEach(function(el) {
          el.classList.toggle('selected', el.dataset.id === state.graphic);
        });
      }
      
      updatePreview();
      updateSummary();
    }
    
    function selectSize(size) {
      state.size = size;
      
      document.querySelectorAll('.size-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.size === size);
      });
      
      updateSummary();
    }
    
    function selectColor(color) {
      state.color = color;
      
      document.querySelectorAll('.color-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.color === color);
      });
      
      // Update garment thumbnails to reflect new color
      document.querySelectorAll('.garment-option').forEach(function(el) {
        var g = garments.find(function(x) { return x.id === el.dataset.id; });
        if (g && g.images[color]) {
          var imgEl = el.querySelector('img');
          if (imgEl) imgEl.src = g.images[color].front;
        }
      });
      
      updatePreview();
      updateSummary();
    }
    
    function selectGraphic(id) {
      state.graphic = id;
      
      // Preload graphic image for instant rendering
      var g = graphics.find(function(x) { return x.id === id; });
      if (g && g.fullImage && !imageCache[g.fullImage]) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = g.fullImage;
        imageCache[g.fullImage] = img;
      }
      
      document.querySelectorAll('#graphicsGrid .graphic-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.id === id);
      });
      
      renderAdditionalGraphics();
      updatePreview();
      updateSummary();
      updateDragHint();
    }
    
    function updateDragHint() {
      var dragHint = document.getElementById('dragHint');
      var hasGraphics = state.graphic !== null;
      dragHint.style.display = hasGraphics ? 'block' : 'none';
    }
    
    function selectPlacement(id) {
      state.placement = id;
      
      document.querySelectorAll('#placementGrid .placement-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.id === id);
      });
      
      // Auto-switch view based on placement
      if (id === 'full-back') {
        state.view = 'back';
        document.querySelectorAll('.view-btn').forEach(function(el) {
          el.classList.toggle('active', el.dataset.view === 'back');
        });
      } else if (id === 'full-front' || id === 'left-chest' || id === 'right-chest') {
        state.view = 'front';
        document.querySelectorAll('.view-btn').forEach(function(el) {
          el.classList.toggle('active', el.dataset.view === 'front');
        });
      }
      
      updatePreview();
      updateSummary();
    }
    
    function setView(view) {
      state.view = view;
      
      document.querySelectorAll('.view-btn').forEach(function(el) {
        el.classList.toggle('active', el.dataset.view === view);
      });
      
      updatePreview();
    }
    
    // Modal functions
    function showAddGraphicModal() {
      modalSelectedGraphic = null;
      modalSelectedPlacement = null;
      
      // Filter modal graphics by garment restrictions (same logic as renderGraphics)
      var availableGraphics = graphics.filter(function(g) {
        if (!g.restrictToGarments || g.restrictToGarments.length === 0) return true;
        return state.garment ? g.restrictToGarments.includes(state.garment) : true;
      });
      
      var graphicsGrid = document.getElementById('modalGraphicsGrid');
      graphicsGrid.innerHTML = availableGraphics.map(function(g) {
        return '<div class="graphic-option" data-id="' + g.id + '">' +
          '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
          '<div class="name">' + g.name + '</div>' +
        '</div>';
      }).join('');
      
      var usedPlacements = [state.placement].concat(state.additionalGraphics.map(function(ag) { return ag.placement; }));
      var isHeadwear = state.garment === 'trucker-hat' || state.garment === 'beanie';
      var available = placements.filter(function(p) {
        return isHeadwear ? p.forHats : !p.forHats;
      });
      
      var placementGrid = document.getElementById('modalPlacementGrid');
      placementGrid.innerHTML = available.map(function(p) {
        var isUsed = usedPlacements.indexOf(p.id) !== -1;
        var price = getGraphicPrice(p.id);
        return '<div class="placement-option" data-id="' + p.id + '">' +
          p.name +
          (isUsed ? '<span style="font-size:0.7rem; display:block; color:#999;">+ additional graphic</span>' : '') +
          '<span style="font-size:0.7rem; display:block; color:#8B0000;">+$' + price.toFixed(2) + '</span>' +
        '</div>';
      }).join('');
      
      document.getElementById('addGraphicModal').classList.add('active');
    }
    
    function closeAddGraphicModal() {
      document.getElementById('addGraphicModal').classList.remove('active');
    }
    
    function modalSelectGraphic(id) {
      modalSelectedGraphic = id;
      document.querySelectorAll('#modalGraphicsGrid .graphic-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.id === id);
      });
    }
    
    function modalSelectPlacement(id) {
      modalSelectedPlacement = id;
      document.querySelectorAll('#modalPlacementGrid .placement-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.id === id);
      });
    }
    
    function confirmAddGraphic() {
      if (!modalSelectedGraphic || !modalSelectedPlacement) {
        alert('Please select both a graphic and placement');
        return;
      }
      
      state.additionalGraphics.push({
        graphic: modalSelectedGraphic,
        placement: modalSelectedPlacement
      });
      
      closeAddGraphicModal();
      renderAdditionalGraphics();
      updatePreview();
      updateSummary();
    }
    
    function removeAdditionalGraphic(index) {
      state.additionalGraphics.splice(index, 1);
      renderAdditionalGraphics();
      updatePreview();
      updateSummary();
    }
    
    // Image preload cache for instant garment color/view switching
    var imageCache = {};
    
    function preloadGarmentImages(garmentId) {
      var g = garments.find(function(x) { return x.id === garmentId; });
      if (!g) return;
      Object.keys(g.images).forEach(function(color) {
        var imgs = g.images[color];
        Object.keys(imgs).forEach(function(view) {
          var url = imgs[view];
          if (!imageCache[url]) {
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            imageCache[url] = img;
          }
        });
      });
    }
    
    // Canvas preview - rewritten for stability with debouncing to prevent
    // race conditions when multiple rapid state changes fire updatePreview()
    var _previewDebounceTimer = null;
    
    function updatePreview() {
      // Debounce rapid calls (e.g. selectGarment -> renderGraphics -> updatePreview cascade)
      // This ensures only the LAST call within 30ms actually executes,
      // eliminating the stale-update-ID race condition entirely.
      if (_previewDebounceTimer) clearTimeout(_previewDebounceTimer);
      _previewDebounceTimer = setTimeout(_doUpdatePreview, 30);
    }
    
    function _doUpdatePreview() {
      _previewDebounceTimer = null;
      
      // Increment update ID to cancel any in-flight async image loads
      var currentUpdateId = ++previewUpdateId;
      
      // Clear canvas and set white background
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
      
      if (!state.garment || !state.color) return;
      
      var garment = garments.find(function(g) { return g.id === state.garment; });
      if (!garment) return;
      
      var colorImages = garment.images[state.color];
      if (!colorImages) return;
      
      // Resolve image URL for current view (fallback to front)
      var imageUrl = colorImages[state.view] || colorImages.front;
      if (!imageUrl) return;
      
      // Snapshot entire state at call time (async callbacks reference this, not live state)
      var capturedState = {
        graphic: state.graphic,
        placement: state.placement,
        view: state.view,
        garment: state.garment,
        additionalGraphics: state.additionalGraphics.slice()
      };
      
      // Load garment image
      fabric.Image.fromURL(imageUrl, function(garmentImg, isError) {
        // Stale check: if another updatePreview was called after us, bail out
        if (currentUpdateId !== previewUpdateId) return;
        
        if (!garmentImg || isError || !garmentImg.width || !garmentImg.height) {
          // Show error state on canvas
          canvas.add(new fabric.Text('Preview unavailable', {
            left: canvas.width / 2, top: canvas.height / 2 - 15,
            originX: 'center', originY: 'center',
            fontSize: 16, fill: '#999', fontFamily: 'Arial, sans-serif',
            selectable: false, evented: false
          }));
          canvas.add(new fabric.Text('Image could not be loaded', {
            left: canvas.width / 2, top: canvas.height / 2 + 10,
            originX: 'center', originY: 'center',
            fontSize: 12, fill: '#bbb', fontFamily: 'Arial, sans-serif',
            selectable: false, evented: false
          }));
          canvas.renderAll();
          return;
        }
        
        // Scale garment to 90% of canvas
        var garmentScale = Math.min(canvas.width / garmentImg.width, canvas.height / garmentImg.height) * 0.9;
        garmentImg.scale(garmentScale);
        garmentImg.set({
          left: canvas.width / 2, top: canvas.height / 2,
          originX: 'center', originY: 'center',
          selectable: false, evented: false,
          objectCaching: false
        });
        canvas.add(garmentImg);
        
        // Load graphics on top of garment using snapshotted state
        loadGraphicsOnTop(currentUpdateId, garmentScale, capturedState);
      }, { crossOrigin: 'anonymous' });
    }
    
    // Determine if a placement should be visible for the given view
    function isPlacementVisibleForView(placementId, view) {
      if (placementId === 'hat-front') return true;
      if (placementId === 'full-back') return view === 'back';
      // full-front, left-chest, right-chest are all front placements
      return view === 'front';
    }
    
    // Graphic print area dimensions by placement type (as fraction of canvas)
    // Headwear: compact print area on hat front panel
    // Small placements (chest, hat): modest print area.
    // Full placements (front/back): large print area for primary designs.
    var PRINT_AREA = {
      headwear:  { wFrac: 0.25, hFrac: 0.18 },
      small:     { wFrac: 0.18, hFrac: 0.13 },
      full:      { wFrac: 0.40, hFrac: 0.35 }
    };
    
    function loadGraphicsOnTop(updateId, garmentScale, cs) {
      // Build list of graphics visible in this view
      var graphicsToShow = [];
      
      if (cs.graphic && cs.placement && isPlacementVisibleForView(cs.placement, cs.view)) {
        graphicsToShow.push({ graphicId: cs.graphic, placementId: cs.placement });
      }
      cs.additionalGraphics.forEach(function(ag) {
        if (isPlacementVisibleForView(ag.placement, cs.view)) {
          graphicsToShow.push({ graphicId: ag.graphic, placementId: ag.placement });
        }
      });
      
      if (graphicsToShow.length === 0) {
        canvas.renderAll();
        return;
      }
      
      var isHeadwear = cs.garment === 'trucker-hat' || cs.garment === 'beanie';
      var loadedCount = 0;
      var totalToLoad = graphicsToShow.length;
      
      graphicsToShow.forEach(function(item) {
        var graphic = graphics.find(function(g) { return g.id === item.graphicId; });
        var placement = placements.find(function(p) { return p.id === item.placementId; });
        
        if (!graphic || !placement) {
          loadedCount++;
          if (loadedCount === totalToLoad) canvas.renderAll();
          return;
        }
        
        fabric.Image.fromURL(graphic.fullImage, function(graphicImg, isError) {
          if (updateId !== previewUpdateId) return; // Stale check
          loadedCount++;
          
          if (!graphicImg || isError || !graphicImg.width || !graphicImg.height) {
            if (loadedCount === totalToLoad) canvas.renderAll();
            return;
          }
          
          // Determine print area bounds based on placement type
          var area = isHeadwear ? PRINT_AREA.headwear :
                     placement.isSmall ? PRINT_AREA.small : PRINT_AREA.full;
          var maxPrintW = canvas.width * area.wFrac;
          var maxPrintH = canvas.height * area.hFrac;
          
          var maxScale = Math.min(maxPrintW / graphicImg.width, maxPrintH / graphicImg.height);
          var initialScale = maxScale * 0.9;
          
          graphicImg.maxScale = maxScale;
          graphicImg.minScale = maxScale * 0.15;
          
          // Restore user-saved position if available, otherwise use default placement
          var posKey = item.graphicId + '::' + item.placementId;
          var saved = userGraphicPositions[posKey];
          var pos = getPlacementPosition(item.placementId, canvas.width, canvas.height);
          
          if (saved) {
            graphicImg.scale(saved.scaleX);
            graphicImg.scaleY = saved.scaleY;
            graphicImg.angle = saved.angle || 0;
          } else {
            graphicImg.scale(initialScale);
          }
          
          graphicImg.set({
            left: saved ? saved.left : pos.x,
            top: saved ? saved.top : pos.y,
            originX: 'center', originY: 'center',
            selectable: true, hasControls: true, hasBorders: true,
            lockRotation: false, lockScalingFlip: true,
            borderColor: '#8B0000', cornerColor: '#8B0000',
            cornerSize: 10, cornerStyle: 'circle', transparentCorners: false,
            padding: 5, objectCaching: false,
            isGraphic: true, graphicId: item.graphicId, placementId: item.placementId
          });
          
          canvas.add(graphicImg);
          if (loadedCount === totalToLoad) canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
      });
    }
    
    // Placement position map (center coordinates as fraction of canvas dimensions)
    // These are calibrated for 350x467 canvas with 90%-scaled garment images.
    var PLACEMENT_POSITIONS = {
      'full-front':  { xFrac: 0.50, yFrac: 0.45 },
      'full-back':   { xFrac: 0.50, yFrac: 0.45 },
      'left-chest':  { xFrac: 0.35, yFrac: 0.32 },
      'right-chest': { xFrac: 0.65, yFrac: 0.32 },
      'hat-front':   { xFrac: 0.50, yFrac: 0.42 }
    };
    
    function getPlacementPosition(placementId, w, h) {
      var pos = PLACEMENT_POSITIONS[placementId];
      if (!pos) return { x: w / 2, y: h / 2 };
      return { x: w * pos.xFrac, y: h * pos.yFrac };
    }
    
    // Printable area bounds per placement — restricts graphics to garment body,
    // avoiding zippers, seams, and off-garment areas.
    // Values are fractions of canvas dimensions [minXFrac, minYFrac, maxXFrac, maxYFrac].
    // Calibrated for 350x467 canvas with 90%-scaled garment images.
    var PRINTABLE_BOUNDS = {
      'full-front':  { minX: 0.22, minY: 0.18, maxX: 0.78, maxY: 0.72 },
      'full-back':   { minX: 0.22, minY: 0.18, maxX: 0.78, maxY: 0.72 },
      'left-chest':  { minX: 0.22, minY: 0.20, maxX: 0.48, maxY: 0.45 },
      'right-chest': { minX: 0.52, minY: 0.20, maxX: 0.78, maxY: 0.45 },
      'hat-front':   { minX: 0.25, minY: 0.25, maxX: 0.75, maxY: 0.60 }
    };
    
    // Zip-up hoodies have a center zipper — split the printable area to avoid it
    var PRINTABLE_BOUNDS_ZIPUP = {
      'full-front':  { minX: 0.22, minY: 0.18, maxX: 0.78, maxY: 0.72 },
      'left-chest':  { minX: 0.22, minY: 0.20, maxX: 0.45, maxY: 0.45 },
      'right-chest': { minX: 0.55, minY: 0.20, maxX: 0.78, maxY: 0.45 }
    };
    
    function getGraphicBounds(placementId, garmentId) {
      var isZipUp = garmentId === 'zip-up-hoodie';
      var boundsMap = isZipUp ? PRINTABLE_BOUNDS_ZIPUP : PRINTABLE_BOUNDS;
      var b = boundsMap[placementId] || PRINTABLE_BOUNDS[placementId] || { minX: 0.10, minY: 0.10, maxX: 0.90, maxY: 0.90 };
      var w = canvas.width;
      var h = canvas.height;
      return {
        minX: w * b.minX,
        minY: h * b.minY,
        maxX: w * b.maxX,
        maxY: h * b.maxY
      };
    }
    
    // Order summary
    function updateSummary() {
      var content = document.getElementById('summaryContent');
      var totalEl = document.getElementById('totalPrice');
      var checkoutBtn = document.getElementById('checkoutBtn');
      
      var lines = [];
      var total = 0;
      
      if (state.garment) {
        var g = garments.find(function(x) { return x.id === state.garment; });
        if (g) {
          var sizeText = state.size ? ' (' + state.size + ')' : '';
          var colorText = state.color ? ', ' + state.color.charAt(0).toUpperCase() + state.color.slice(1) : '';
          lines.push({ label: g.name + sizeText + colorText, price: g.basePrice });
          total += g.basePrice;
        }
      }
      
      if (state.graphic) {
        var gr = graphics.find(function(x) { return x.id === state.graphic; });
        var pl = placements.find(function(x) { return x.id === state.placement; });
        if (gr && pl) {
          var graphicPrice = getGraphicPrice(state.placement);
          lines.push({ label: gr.name + ' (' + pl.name + ')', price: graphicPrice });
          total += graphicPrice;
        }
      }
      
      state.additionalGraphics.forEach(function(ag) {
        var gr = graphics.find(function(x) { return x.id === ag.graphic; });
        var pl = placements.find(function(x) { return x.id === ag.placement; });
        if (gr && pl) {
          var price = getGraphicPrice(ag.placement);
          lines.push({ label: '+ ' + gr.name + ' (' + pl.name + ')', price: price });
          total += price;
        }
      });
      
      if (lines.length === 0) {
        content.innerHTML = '<div class="summary-line"><span>Select options above</span><span>-</span></div>';
      } else {
        content.innerHTML = lines.map(function(l) {
          return '<div class="summary-line"><span>' + l.label + '</span><span>' + (l.note || ('$' + l.price.toFixed(2))) + '</span></div>';
        }).join('');
      }
      
      totalEl.textContent = '$' + total.toFixed(2);
      
      var isComplete = state.garment && state.size && state.color && state.graphic;
      checkoutBtn.disabled = !isComplete;
    }
    
    // Checkout
    function checkout() {
      var checkoutBtn = document.getElementById('checkoutBtn');
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      
      fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garment: state.garment,
          size: state.size,
          color: state.color,
          graphic: state.graphic,
          placement: state.placement,
          additionalGraphics: state.additionalGraphics
        })
      })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        if (data.url) {
          window.location.href = data.url;
        } else if (data.demo && data.orderDetails) {
          // Demo mode - show order summary
          var details = data.orderDetails;
          var msg = 'Demo Mode - Order Summary\\n\\n' +
            'Garment: ' + details.garment + '\\n' +
            'Size: ' + details.size + '\\n' +
            'Color: ' + details.color + '\\n' +
            'Graphic: ' + details.graphic + '\\n' +
            'Placement: ' + details.placement + '\\n' +
            'Total: $' + details.total + '\\n\\n' +
            'Stripe checkout will activate when API key is configured.';
          alert(msg);
          checkoutBtn.disabled = false;
          checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Checkout';
        } else if (data.error) {
          alert(data.error);
          checkoutBtn.disabled = false;
          checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Checkout';
        }
      })
      .catch(function(error) {
        /* Checkout error - handled by alert */
        alert('An error occurred. Please try again.');
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Checkout';
      });
    }
  </script>
</body>
</html>`)
})

// ============================================
// API ROUTES (extracted to src/routes/api.ts)
// ============================================
app.route('/api', apiRoutes)

// ============================================
// STATIC PAGE ROUTES (extracted to src/routes/pages.ts)
// Includes: favicon, robots.txt, checkout success, privacy policy, cookie policy, 404
// ============================================
app.route('/', pageRoutes)

export default app
