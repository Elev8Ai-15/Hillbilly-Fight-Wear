import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  STRIPE_SECRET_KEY?: string
  STRIPE_PUBLISHABLE_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ============================================
// DATA: Garments, Graphics, Placements
// ============================================

const garments = [
  {
    id: 'tshirt',
    name: 'T-Shirt (Unisex)',
    basePrice: 23.00,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: 'https://www.genspark.ai/api/files/s/bWaOBkHP',
      black: 'https://www.genspark.ai/api/files/s/e9QbrtJN',
      grey: 'https://www.genspark.ai/api/files/s/dnEiOvNT'
    }
  },
  {
    id: 'sweatshirt',
    name: 'Sweatshirt',
    basePrice: 45.00,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: 'https://www.genspark.ai/api/files/s/Vw3O8hq6',
      black: 'https://www.genspark.ai/api/files/s/CyYg2IkN',
      grey: 'https://www.genspark.ai/api/files/s/Rp7aeKGQ'
    }
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    basePrice: 55.00,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: 'https://www.genspark.ai/api/files/s/PH5iyThW',
      black: 'https://www.genspark.ai/api/files/s/r7DDqVnj',
      grey: 'https://www.genspark.ai/api/files/s/YeSyYMBJ'
    }
  },
  {
    id: 'tank-mens',
    name: "Tank Top (Men's)",
    basePrice: 20.00,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: 'https://www.genspark.ai/api/files/s/q4o1NRtU',
      black: 'https://www.genspark.ai/api/files/s/qwm3EzNA',
      grey: 'https://www.genspark.ai/api/files/s/B072UQue'
    }
  },
  {
    id: 'tank-womens',
    name: "Tank Top (Women's)",
    basePrice: 20.00,
    category: 'tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: 'https://www.genspark.ai/api/files/s/aPtosQ7I',
      black: 'https://www.genspark.ai/api/files/s/cCJlUVtO',
      grey: 'https://www.genspark.ai/api/files/s/0zmiQQdj'
    }
  },
  {
    id: 'trucker-hat',
    name: 'Trucker Hat',
    basePrice: 25.00,
    category: 'headwear',
    sizes: ['One Size', 'S/M', 'L/XL'],
    supportsPlacement: true,
    images: {
      white: 'https://www.genspark.ai/api/files/s/6IHlrrTk',
      black: 'https://www.genspark.ai/api/files/s/pJEHMEGL',
      grey: 'https://www.genspark.ai/api/files/s/WcabuxqX'
    }
  }
]

const graphics = [
  {
    id: 'hfw-main',
    name: 'Hillbilly Fightwear',
    thumbnail: 'https://www.genspark.ai/api/files/s/UsYMsP4o',
    fullImage: 'https://www.genspark.ai/api/files/s/UsYMsP4o'
  },
  {
    id: 'hfw-logo',
    name: 'HFW Logo',
    thumbnail: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/hfwf_300x300.png?v=1541520222',
    fullImage: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/hfwf_300x300.png?v=1541520222'
  },
  {
    id: 'human-cockfighter',
    name: 'Human Cockfighter',
    thumbnail: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/hcff_300x300.png?v=1541521169',
    fullImage: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/human_cockfighter_logo_1950x.jpg?v=1613509348'
  },
  {
    id: 'thump-a-stranger',
    name: 'Thump A Stranger',
    thumbnail: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/thumpf_300x300.png?v=1541521247',
    fullImage: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/Thump_A_Stranger_logo_1950x.jpg?v=1613509348'
  },
  {
    id: 'gpg-design',
    name: 'GPG Design',
    thumbnail: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/gnff_300x300.png?v=1541520600',
    fullImage: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/Imes_GPG_announcement_9734a02f-5320-47b8-9429-e95437e29d9d_1950x.jpg?v=1613509348'
  },
  {
    id: 'yycf-logo',
    name: 'YYCF Logo',
    thumbnail: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/yycf_300x300.png?v=1541520348',
    fullImage: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/yycf_300x300.png?v=1541520348'
  },
  {
    id: 'fun-logo',
    name: 'FUN Logo',
    thumbnail: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/funf_300x300.png?v=1541520465',
    fullImage: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/funf_300x300.png?v=1541520465'
  }
]

const placements = [
  { id: 'full-front', name: 'Full Front', isSmall: false, forHats: false },
  { id: 'full-back', name: 'Full Back', isSmall: false, forHats: false },
  { id: 'left-chest', name: 'Left Chest', isSmall: true, forHats: false },
  { id: 'right-chest', name: 'Right Chest', isSmall: true, forHats: false },
  { id: 'hat-front', name: 'Hat Front', isSmall: true, forHats: true }
]

const products = [
  { id: 1, title: 'Short Sleeve T-Shirt', vendor: 'Hillbilly Fightwear', price: '$23.00', image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/hfwf_300x300.png?v=1541520222', url: '/build?garment=tshirt&graphic=hfw-logo' },
  { id: 2, title: 'Short Sleeve T-Shirt', vendor: 'Hillbilly Fightwear', price: '$23.00', image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/yycf_300x300.png?v=1541520348', url: '/build?garment=tshirt&graphic=yycf-logo' },
  { id: 3, title: 'Short Sleeve T-Shirt', vendor: 'Hillbilly Fightwear', price: '$23.00', image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/funf_300x300.png?v=1541520465', url: '/build?garment=tshirt&graphic=fun-logo' },
  { id: 4, title: 'Short Sleeve T-Shirt', vendor: 'Hillbilly Fightwear', price: '$23.00', image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/gnff_300x300.png?v=1541520600', url: '/build?garment=tshirt&graphic=gpg-design' },
  { id: 5, title: 'Short Sleeve T-Shirt', vendor: 'Hillbilly Fightwear', price: '$23.00', image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/hcff_300x300.png?v=1541521169', url: '/build?garment=tshirt&graphic=human-cockfighter' },
  { id: 6, title: 'Short Sleeve T-Shirt', vendor: 'Hillbilly Fightwear', price: '$23.00', image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/thumpf_300x300.png?v=1541521247', url: '/build?garment=tshirt&graphic=thump-a-stranger' }
]

const slides = [
  { id: 0, image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/Imes_GPG_announcement_9734a02f-5320-47b8-9429-e95437e29d9d_1950x.jpg?v=1613509348', title: 'Official Store', subtitle: 'Check Out Products Below', hasOverlay: true },
  { id: 1, image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/IMG_1414_1950x.JPG?v=1615922396', title: '', subtitle: '', hasOverlay: false },
  { id: 2, image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/human_cockfighter_logo_1950x.jpg?v=1613509348', title: '', subtitle: '', hasOverlay: false },
  { id: 3, image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/Thump_A_Stranger_logo_1950x.jpg?v=1613509348', title: '', subtitle: '', hasOverlay: false }
]

// ============================================
// ROUTE: Homepage
// ============================================

app.get('/', (c) => {
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
    <button class="dot ${index === 0 ? 'active' : ''}" data-dot="${index}" onclick="goToSlide(${index})"></button>
  `).join('')

  const productsHtml = products.map(product => `
    <a href="${product.url}" class="product-card">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
      </div>
      <h4 class="product-title">${product.title}</h4>
      <div class="product-vendor">${product.vendor}</div>
      <div class="product-price">${product.price}</div>
    </a>
  `).join('')

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hillbilly Fightwear - Official Store</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; }
    
    body {
      font-family: 'Oswald', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    
    .announcement-bar {
      background-color: #1a1a1a;
      color: #fff;
      text-align: center;
      padding: 10px 20px;
      font-size: 14px;
      letter-spacing: 1px;
    }
    
    .slideshow-wrapper {
      position: relative;
      width: 100%;
      height: 60vh;
      min-height: 400px;
      overflow: hidden;
    }
    
    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
      background-size: cover;
      background-position: center center;
    }
    
    .slide.active { opacity: 1; }
    
    .slide-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    
    .slide-title {
      color: #fff;
      font-size: 4rem;
      font-weight: 700;
      text-transform: uppercase;
      text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
      margin: 0;
      letter-spacing: 3px;
    }
    
    .slide-subtitle {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 400;
      text-shadow: 1px 1px 4px rgba(0,0,0,0.5);
      margin-top: 10px;
      letter-spacing: 2px;
    }
    
    .slideshow-dots {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 10;
    }
    
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      cursor: pointer;
      border: 2px solid #fff;
      transition: all 0.3s;
    }
    
    .dot.active { background: #fff; }
    
    .slideshow-pause {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.5);
      color: #fff;
      border: none;
      padding: 10px 15px;
      cursor: pointer;
      z-index: 10;
      border-radius: 4px;
    }
    
    /* MAIN HERO Section - Fighter background with logo overlay */
    .main-hero {
      position: relative;
      min-height: 80vh;
      background-image: url('https://hillbilly-fightwear.myshopify.com/cdn/shop/files/Croom_finishing_MrD_w_Luttrell_in_corner_540x.jpg?v=1613509348');
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .main-hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.5) 0%,
        rgba(0, 0, 0, 0.3) 50%,
        rgba(0, 0, 0, 0.6) 100%
      );
      z-index: 1;
    }
    
    .main-hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
      padding: 40px 20px;
      max-width: 900px;
    }
    
    .main-hero-logo {
      width: 100%;
      max-width: 750px;
      margin: 0 auto;
    }
    
    .main-hero-logo img {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 10px 40px rgba(0, 0, 0, 0.8))
              drop-shadow(0 0 60px rgba(139, 0, 0, 0.5));
    }
    
    .main-hero-tagline {
      color: #fff;
      font-size: 1.8rem;
      text-transform: uppercase;
      letter-spacing: 6px;
      margin-top: 30px;
      text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.8);
      font-weight: 500;
    }
    
    .main-hero-cta {
      margin-top: 40px;
    }
    
    .main-hero-cta a {
      display: inline-block;
      background: #8B0000;
      color: #fff;
      padding: 18px 50px;
      font-size: 1.2rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.3s ease;
      box-shadow: 0 8px 30px rgba(139, 0, 0, 0.4);
    }
    
    .main-hero-cta a:hover {
      background: #a50000;
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(139, 0, 0, 0.6);
    }
    
    @media (max-width: 768px) {
      .main-hero {
        min-height: 70vh;
      }
      .main-hero-content {
        padding: 30px 15px;
      }
      .main-hero-logo {
        max-width: 90%;
      }
      .main-hero-tagline {
        font-size: 1.2rem;
        letter-spacing: 3px;
        margin-top: 20px;
      }
      .main-hero-cta a {
        padding: 14px 35px;
        font-size: 1rem;
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
      .slide-title { font-size: 2.5rem; }
      .slide-subtitle { font-size: 1rem; }
    }
    
    @media (max-width: 480px) {
      .product-grid { grid-template-columns: 1fr; }
    }
    
    .product-card {
      text-align: center;
      text-decoration: none;
      color: inherit;
      display: block;
      transition: transform 0.3s;
    }
    
    .product-card:hover { transform: translateY(-5px); }
    
    .product-image-wrapper {
      background: #f7f7f7;
      padding: 20px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    .product-image {
      width: 100%;
      height: auto;
      max-width: 280px;
      margin: 0 auto;
      display: block;
    }
    
    .product-title { font-size: 1.1rem; font-weight: 600; margin: 10px 0 5px; color: #333; }
    .product-vendor { font-size: 0.9rem; color: #666; margin-bottom: 8px; }
    .product-price { font-size: 1rem; font-weight: 600; color: #333; }
    
    .section-header { text-align: center; padding: 50px 20px 20px; }
    .section-header h2 { font-size: 1.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #333; margin: 0; }
    
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
  </style>
</head>
<body>
  <!-- Announcement Bar -->
  <div class="announcement-bar">
    <p style="margin: 0;">🔥 NEW: Build Your Own Custom Apparel! 🔥</p>
  </div>
  
  <!-- MAIN HERO - Fighter Background + Logo Banner Overlay -->
  <section class="main-hero">
    <div class="main-hero-content">
      <div class="main-hero-logo">
        <img src="https://www.genspark.ai/api/files/s/UsYMsP4o" alt="Hillbilly Fightwear">
      </div>
      <p class="main-hero-tagline">Official Fight Gear</p>
      <div class="main-hero-cta">
        <a href="/build"><i class="fas fa-paint-brush"></i> Build Your Own</a>
      </div>
    </div>
  </section>
  
  <!-- Slideshow - Secondary -->
  <div class="slideshow-wrapper">
    <button class="slideshow-pause" id="pauseBtn" onclick="togglePause()">
      <i class="fas fa-pause" id="pauseIcon"></i>
    </button>
    ${slidesHtml}
    <div class="slideshow-dots">
      ${dotsHtml}
    </div>
  </div>
  
  <!-- Build Your Own CTA -->
  <section class="build-cta">
    <h2><i class="fas fa-tshirt"></i> Build Your Own</h2>
    <p>Design custom apparel with your favorite Hillbilly Fightwear graphics</p>
    <a href="/build" class="build-cta-btn">
      <i class="fas fa-paint-brush"></i> Start Designing
    </a>
  </section>
  
  <!-- Featured Collection -->
  <section>
    <div class="section-header">
      <h2>Featured collection</h2>
    </div>
    
    <div class="product-grid">
      ${productsHtml}
    </div>
    
    <hr class="divider">
    
    <div class="view-all-wrapper">
      <a href="/build" class="view-all-btn">Build Your Own</a>
    </div>
  </section>
  
  <!-- Feature Row -->
  <section class="feature-row">
    <div class="feature-image">
      <img src="https://hillbilly-fightwear.myshopify.com/cdn/shop/files/IMG_1414_1950x.JPG?v=1615922396" alt="Fighter image">
    </div>
    <div class="feature-text">
      <h2>Custom Apparel Builder</h2>
      <p>Now you can create your own custom apparel with all of our artwork and logos. Choose your garment style, size, color, and graphics to create something unique. T-shirts, hoodies, sweatshirts, tank tops, and trucker hats available!</p>
    </div>
  </section>
  
  <div style="height: 50px;"></div>
  
  <script>
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
  </script>
</body>
</html>`)
})

// ============================================
// ROUTE: Custom Garment Builder
// ============================================

app.get('/build', (c) => {
  // Pass data as JSON for client-side JavaScript
  const garmentsJson = JSON.stringify(garments)
  const graphicsJson = JSON.stringify(graphics)
  const placementsJson = JSON.stringify(placements)

  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Your Own - Hillbilly Fightwear</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
  <style>
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
      background: #f8f8f8;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    #previewCanvas {
      display: block;
      width: 100%;
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
      <div class="option-group">
        <h3><span class="step-num">1</span> Choose Your Garment</h3>
        <div class="garment-grid" id="garmentGrid"></div>
      </div>
      
      <!-- Step 2: Size -->
      <div class="option-group">
        <h3><span class="step-num">2</span> Select Size</h3>
        <div class="size-grid" id="sizeGrid">
          <div style="color: #999; font-size: 0.9rem;">Select a garment first</div>
        </div>
      </div>
      
      <!-- Step 3: Color -->
      <div class="option-group">
        <h3><span class="step-num">3</span> Select Color</h3>
        <div class="color-grid" id="colorGrid">
          <div class="color-option white" data-color="white" onclick="selectColor('white')">
            <span class="color-name">White</span>
          </div>
          <div class="color-option black selected" data-color="black" onclick="selectColor('black')">
            <span class="color-name">Black</span>
          </div>
          <div class="color-option grey" data-color="grey" onclick="selectColor('grey')">
            <span class="color-name">Grey</span>
          </div>
        </div>
      </div>
      
      <!-- Step 4: Graphics -->
      <div class="option-group">
        <h3><span class="step-num">4</span> Choose Graphics</h3>
        <div class="graphics-grid" id="graphicsGrid"></div>
        
        <div class="additional-graphics" id="additionalGraphics" style="display: none;">
          <h4 style="margin: 0 0 12px; font-size: 0.85rem; color: #666;">Additional Graphics (+$10 each)</h4>
          <div id="additionalList"></div>
          <button class="add-graphic-btn" onclick="showAddGraphicModal()">
            <i class="fas fa-plus"></i> Add Another Graphic (+$10)
          </button>
        </div>
      </div>
      
      <!-- Step 5: Placement -->
      <div class="option-group" id="placementSection">
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
      
      <div class="view-toggle" id="viewToggle">
        <button class="view-btn active" data-view="front" onclick="setView('front')">Front</button>
        <button class="view-btn" data-view="back" onclick="setView('back')">Back</button>
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
        <button class="checkout-btn" id="checkoutBtn" onclick="checkout()" disabled>
          <i class="fas fa-lock"></i> Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
  
  <!-- Add Graphic Modal -->
  <div class="modal-overlay" id="addGraphicModal">
    <div class="modal-content">
      <h3>Add Another Graphic (+$10)</h3>
      <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">Select a graphic and placement location.</p>
      <div class="graphics-grid" id="modalGraphicsGrid"></div>
      <div style="margin-top: 20px;">
        <h4 style="margin: 0 0 10px; font-size: 0.9rem;">Placement</h4>
        <div class="placement-grid" id="modalPlacementGrid"></div>
      </div>
      <div class="modal-buttons">
        <button class="modal-cancel" onclick="closeAddGraphicModal()">Cancel</button>
        <button class="modal-confirm" onclick="confirmAddGraphic()">Add Graphic</button>
      </div>
    </div>
  </div>
  
  <script>
    // Data from server
    const garments = ${garmentsJson};
    const graphics = ${graphicsJson};
    const placements = ${placementsJson};
    
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
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      initCanvas();
      renderGarments();
      renderGraphics();
      renderPlacements();
      
      // Check URL params
      const params = new URLSearchParams(window.location.search);
      if (params.get('garment')) {
        selectGarment(params.get('garment'));
      }
      if (params.get('graphic')) {
        selectGraphic(params.get('graphic'));
      }
    });
    
    function initCanvas() {
      canvas = new fabric.Canvas('previewCanvas', {
        width: 350,
        height: 467,
        selection: false,
        backgroundColor: '#f8f8f8'
      });
    }
    
    function renderGarments() {
      const grid = document.getElementById('garmentGrid');
      grid.innerHTML = garments.map(function(g) {
        return '<div class="garment-option" data-id="' + g.id + '" onclick="selectGarment(\\'' + g.id + '\\')">' +
          '<img src="' + g.images.black + '" alt="' + g.name + '">' +
          '<div class="name">' + g.name + '</div>' +
          '<div class="price">$' + g.basePrice.toFixed(2) + '</div>' +
        '</div>';
      }).join('');
    }
    
    function renderSizes(garmentId) {
      const grid = document.getElementById('sizeGrid');
      const g = garments.find(function(x) { return x.id === garmentId; });
      if (!g) return;
      
      grid.innerHTML = g.sizes.map(function(s) {
        return '<div class="size-option" data-size="' + s + '" onclick="selectSize(\\'' + s + '\\')">' + s + '</div>';
      }).join('');
    }
    
    function renderGraphics() {
      const grid = document.getElementById('graphicsGrid');
      grid.innerHTML = graphics.map(function(g) {
        return '<div class="graphic-option" data-id="' + g.id + '" onclick="selectGraphic(\\'' + g.id + '\\')">' +
          '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
          '<div class="name">' + g.name + '</div>' +
        '</div>';
      }).join('');
    }
    
    function renderPlacements() {
      const grid = document.getElementById('placementGrid');
      const isHat = state.garment === 'trucker-hat';
      
      const available = placements.filter(function(p) {
        return isHat ? p.forHats : !p.forHats;
      });
      
      grid.innerHTML = available.map(function(p) {
        var selected = state.placement === p.id ? ' selected' : '';
        return '<div class="placement-option' + selected + '" data-id="' + p.id + '" onclick="selectPlacement(\\'' + p.id + '\\')">' + p.name + '</div>';
      }).join('');
      
      document.getElementById('viewToggle').style.display = isHat ? 'none' : 'flex';
    }
    
    function renderAdditionalGraphics() {
      const container = document.getElementById('additionalGraphics');
      const list = document.getElementById('additionalList');
      
      if (state.graphic) {
        container.style.display = 'block';
        
        if (state.additionalGraphics.length > 0) {
          list.innerHTML = state.additionalGraphics.map(function(ag, i) {
            var g = graphics.find(function(x) { return x.id === ag.graphic; });
            var p = placements.find(function(x) { return x.id === ag.placement; });
            return '<div class="additional-item">' +
              '<div class="info">' +
                '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
                '<div>' +
                  '<div style="font-weight: 600; font-size: 0.85rem;">' + g.name + '</div>' +
                  '<div style="font-size: 0.75rem; color: #666;">' + p.name + ' • +$10.00</div>' +
                '</div>' +
              '</div>' +
              '<button class="remove-btn" onclick="removeAdditionalGraphic(' + i + ')">' +
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
    
    // Selection handlers
    function selectGarment(id) {
      state.garment = id;
      state.size = null;
      
      document.querySelectorAll('.garment-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.id === id);
      });
      
      renderSizes(id);
      
      var isHat = id === 'trucker-hat';
      state.placement = isHat ? 'hat-front' : 'full-front';
      renderPlacements();
      
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
      
      // Update garment thumbnails
      document.querySelectorAll('.garment-option').forEach(function(el) {
        var g = garments.find(function(x) { return x.id === el.dataset.id; });
        if (g) {
          el.querySelector('img').src = g.images[color];
        }
      });
      
      updatePreview();
      updateSummary();
    }
    
    function selectGraphic(id) {
      state.graphic = id;
      
      document.querySelectorAll('#graphicsGrid .graphic-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.id === id);
      });
      
      renderAdditionalGraphics();
      updatePreview();
      updateSummary();
    }
    
    function selectPlacement(id) {
      state.placement = id;
      
      document.querySelectorAll('#placementGrid .placement-option').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.id === id);
      });
      
      if (id === 'full-back') {
        setView('back');
      } else if (id === 'full-front' || id === 'left-chest' || id === 'right-chest') {
        setView('front');
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
      
      var graphicsGrid = document.getElementById('modalGraphicsGrid');
      graphicsGrid.innerHTML = graphics.map(function(g) {
        return '<div class="graphic-option" data-id="' + g.id + '" onclick="modalSelectGraphic(\\'' + g.id + '\\')">' +
          '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
          '<div class="name">' + g.name + '</div>' +
        '</div>';
      }).join('');
      
      var usedPlacements = [state.placement].concat(state.additionalGraphics.map(function(ag) { return ag.placement; }));
      var isHat = state.garment === 'trucker-hat';
      var available = placements.filter(function(p) {
        return (isHat ? p.forHats : !p.forHats) && usedPlacements.indexOf(p.id) === -1;
      });
      
      var placementGrid = document.getElementById('modalPlacementGrid');
      placementGrid.innerHTML = available.map(function(p) {
        return '<div class="placement-option" data-id="' + p.id + '" onclick="modalSelectPlacement(\\'' + p.id + '\\')">' + p.name + '</div>';
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
    
    // Canvas preview
    function updatePreview() {
      canvas.clear();
      canvas.backgroundColor = '#f8f8f8';
      
      if (!state.garment || !state.color) {
        canvas.renderAll();
        return;
      }
      
      var garment = garments.find(function(g) { return g.id === state.garment; });
      if (!garment) return;
      
      var imageUrl = garment.images[state.color];
      
      fabric.Image.fromURL(imageUrl, function(img) {
        var scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
        
        img.scale(scale);
        img.set({
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          selectable: false
        });
        
        canvas.add(img);
        canvas.sendToBack(img);
        
        addGraphicsToCanvas(scale);
      }, { crossOrigin: 'anonymous' });
    }
    
    function addGraphicsToCanvas(garmentScale) {
      var graphicsToShow = [];
      
      if (state.graphic) {
        if (shouldShowPlacement(state.placement, state.view)) {
          graphicsToShow.push({ graphicId: state.graphic, placementId: state.placement });
        }
      }
      
      state.additionalGraphics.forEach(function(ag) {
        if (shouldShowPlacement(ag.placement, state.view)) {
          graphicsToShow.push({ graphicId: ag.graphic, placementId: ag.placement });
        }
      });
      
      graphicsToShow.forEach(function(item) {
        var graphic = graphics.find(function(g) { return g.id === item.graphicId; });
        var placement = placements.find(function(p) { return p.id === item.placementId; });
        if (!graphic || !placement) return;
        
        fabric.Image.fromURL(graphic.fullImage, function(img) {
          var pos = getPlacementPosition(item.placementId, canvas.width, canvas.height);
          var maxSize = placement.isSmall ? 70 : 150;
          
          var scale = Math.min(maxSize / img.width, maxSize / img.height);
          img.scale(scale * garmentScale);
          
          img.set({
            left: pos.x,
            top: pos.y,
            originX: 'center',
            originY: 'center',
            selectable: false
          });
          
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
      });
    }
    
    function shouldShowPlacement(placementId, view) {
      if (placementId === 'full-back') return view === 'back';
      if (placementId === 'full-front' || placementId === 'left-chest' || placementId === 'right-chest') return view === 'front';
      if (placementId === 'hat-front') return true;
      return true;
    }
    
    function getPlacementPosition(placementId, w, h) {
      var positions = {
        'full-front': { x: w / 2, y: h * 0.45 },
        'full-back': { x: w / 2, y: h * 0.45 },
        'left-chest': { x: w * 0.35, y: h * 0.32 },
        'right-chest': { x: w * 0.65, y: h * 0.32 },
        'hat-front': { x: w / 2, y: h * 0.45 }
      };
      return positions[placementId] || { x: w / 2, y: h / 2 };
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
          lines.push({ label: gr.name + ' (' + pl.name + ')', price: 0, note: 'Included' });
        }
      }
      
      state.additionalGraphics.forEach(function(ag) {
        var gr = graphics.find(function(x) { return x.id === ag.graphic; });
        var pl = placements.find(function(x) { return x.id === ag.placement; });
        if (gr && pl) {
          lines.push({ label: '+ ' + gr.name + ' (' + pl.name + ')', price: 10 });
          total += 10;
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
        } else if (data.error) {
          alert(data.error);
          if (data.demo) {
            alert('Demo Mode - Order Details:\\n' + JSON.stringify(data.orderDetails, null, 2));
          }
          checkoutBtn.disabled = false;
          checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Proceed to Checkout';
        }
      })
      .catch(function(error) {
        console.error('Checkout error:', error);
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
// API ROUTES
// ============================================

app.get('/api/garments', (c) => c.json(garments))
app.get('/api/graphics', (c) => c.json(graphics))
app.get('/api/placements', (c) => c.json(placements))
app.get('/api/products', (c) => c.json(products))
app.get('/api/slides', (c) => c.json(slides))

app.post('/api/calculate-price', async (c) => {
  const body = await c.req.json()
  const { garment, additionalGraphics = [] } = body
  
  const g = garments.find(x => x.id === garment)
  if (!g) return c.json({ error: 'Invalid garment' }, 400)
  
  const basePrice = g.basePrice
  const additionalCost = additionalGraphics.length * 10
  const total = basePrice + additionalCost
  
  return c.json({ basePrice, additionalCost, total })
})

app.post('/api/create-checkout', async (c) => {
  const body = await c.req.json()
  const { garment, size, color, graphic, placement, additionalGraphics = [] } = body
  
  const g = garments.find(x => x.id === garment)
  const gr = graphics.find(x => x.id === graphic)
  
  if (!g || !gr || !size || !color) {
    return c.json({ error: 'Invalid configuration' }, 400)
  }
  
  const basePrice = g.basePrice
  const additionalCost = additionalGraphics.length * 10
  const total = basePrice + additionalCost
  
  const stripeKey = c.env?.STRIPE_SECRET_KEY
  
  if (!stripeKey) {
    return c.json({
      error: 'Stripe is not configured. Demo mode - your order would be: $' + total.toFixed(2),
      demo: true,
      orderDetails: {
        garment: g.name,
        size,
        color,
        graphic: gr.name,
        placement,
        additionalGraphics: additionalGraphics.map(ag => ({
          graphic: graphics.find(x => x.id === ag.graphic)?.name,
          placement: ag.placement
        })),
        total: total.toFixed(2)
      }
    })
  }
  
  try {
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'success_url': `${new URL(c.req.url).origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${new URL(c.req.url).origin}/build`,
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `${g.name} - ${gr.name}`,
        'line_items[0][price_data][product_data][description]': `Size: ${size}, Color: ${color}, Placement: ${placement}`,
        'line_items[0][price_data][unit_amount]': String(Math.round(total * 100)),
        'line_items[0][quantity]': '1',
        'metadata[garment]': garment,
        'metadata[size]': size,
        'metadata[color]': color,
        'metadata[graphic]': graphic,
        'metadata[placement]': placement,
        'metadata[additionalGraphics]': JSON.stringify(additionalGraphics)
      })
    })
    
    const session = await stripeResponse.json()
    
    if (session.error) {
      return c.json({ error: session.error.message }, 400)
    }
    
    return c.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return c.json({ error: 'Failed to create checkout session' }, 500)
  }
})

// Favicon route
app.get('/favicon.ico', (c) => {
  return new Response(null, { status: 204 })
})

app.get('/checkout/success', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed - Hillbilly Fightwear</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    body { font-family: 'Oswald', sans-serif; background: #f5f5f5; }
    .success-container { max-width: 600px; margin: 100px auto; padding: 40px; text-align: center; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .success-icon { width: 80px; height: 80px; background: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; font-size: 2.5rem; color: #fff; }
    h1 { font-size: 2rem; margin: 0 0 15px; }
    p { color: #666; margin: 0 0 30px; line-height: 1.6; }
    .btn { display: inline-block; padding: 15px 40px; background: #8B0000; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; border-radius: 4px; transition: all 0.3s; }
    .btn:hover { background: #a00000; }
  </style>
</head>
<body>
  <div class="success-container">
    <div class="success-icon"><i class="fas fa-check"></i></div>
    <h1>Order Confirmed!</h1>
    <p>Thank you for your order! You'll receive an email confirmation shortly with your order details and tracking information.</p>
    <a href="/" class="btn">Continue Shopping</a>
  </div>
</body>
</html>`)
})

// Catch-all for undefined routes (must be last)
app.all('*', (c) => {
  return c.redirect('/')
})

export default app
