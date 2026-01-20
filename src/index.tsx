import { Hono } from 'hono'
import { html } from 'hono/html'

const app = new Hono()

// Product data extracted from the original site
const products = [
  {
    id: 1,
    title: 'Short Sleeve T-Shirt',
    vendor: 'Hillbilly Fightwear',
    price: '$23.00',
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/hfwf_300x300.png?v=1541520222',
    url: '#'
  },
  {
    id: 2,
    title: 'Short Sleeve T-Shirt',
    vendor: 'Hillbilly Fightwear',
    price: '$23.00',
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/yycf_300x300.png?v=1541520348',
    url: '#'
  },
  {
    id: 3,
    title: 'Short Sleeve T-Shirt',
    vendor: 'Hillbilly Fightwear',
    price: '$23.00',
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/funf_300x300.png?v=1541520465',
    url: '#'
  },
  {
    id: 4,
    title: 'Short Sleeve T-Shirt',
    vendor: 'Hillbilly Fightwear',
    price: '$23.00',
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/gnff_300x300.png?v=1541520600',
    url: '#'
  },
  {
    id: 5,
    title: 'Short Sleeve T-Shirt',
    vendor: 'Hillbilly Fightwear',
    price: '$23.00',
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/hcff_300x300.png?v=1541521169',
    url: '#'
  },
  {
    id: 6,
    title: 'Short Sleeve T-Shirt',
    vendor: 'Hillbilly Fightwear',
    price: '$23.00',
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/products/thumpf_300x300.png?v=1541521247',
    url: '#'
  }
]

// Slideshow images extracted from original site
const slides = [
  {
    id: 0,
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/Imes_GPG_announcement_9734a02f-5320-47b8-9429-e95437e29d9d_1950x.jpg?v=1613509348',
    title: 'Official Store',
    subtitle: 'Check Out Products Below',
    hasOverlay: true
  },
  {
    id: 1,
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/IMG_1414_1950x.JPG?v=1615922396',
    title: '',
    subtitle: '',
    hasOverlay: false
  },
  {
    id: 2,
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/human_cockfighter_logo_1950x.jpg?v=1613509348',
    title: '',
    subtitle: '',
    hasOverlay: false
  },
  {
    id: 3,
    image: 'https://hillbilly-fightwear.myshopify.com/cdn/shop/files/Thump_A_Stranger_logo_1950x.jpg?v=1613509348',
    title: '',
    subtitle: '',
    hasOverlay: false
  }
]

app.get('/', (c) => {
  return c.html(
    html`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hillbilly Fightwear - Official Store</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Oswald', Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        
        /* Announcement Bar */
        .announcement-bar {
          background-color: #1a1a1a;
          color: #fff;
          text-align: center;
          padding: 10px 20px;
          font-size: 14px;
          letter-spacing: 1px;
        }
        
        /* Slideshow */
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
        
        .slide.active {
          opacity: 1;
        }
        
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
        
        /* Slideshow dots */
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
        
        .dot.active {
          background: #fff;
        }
        
        /* Pause button */
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
        
        /* Product Grid */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .slide-title {
            font-size: 2.5rem;
          }
          
          .slide-subtitle {
            font-size: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .product-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .product-card {
          text-align: center;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.3s;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
        }
        
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
        
        .product-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 10px 0 5px;
          color: #333;
        }
        
        .product-vendor {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 8px;
        }
        
        .product-price {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
        }
        
        /* Section Header */
        .section-header {
          text-align: center;
          padding: 50px 20px 20px;
        }
        
        .section-header h2 {
          font-size: 1.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #333;
          margin: 0;
        }
        
        /* View All Button */
        .view-all-wrapper {
          text-align: center;
          padding: 30px 20px 50px;
        }
        
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
        
        .view-all-btn:hover {
          background: #333;
          color: #fff;
        }
        
        /* Feature Row */
        .feature-row {
          display: flex;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 50px 20px;
          gap: 50px;
        }
        
        @media (max-width: 768px) {
          .feature-row {
            flex-direction: column;
            text-align: center;
          }
        }
        
        .feature-image {
          flex: 1;
          max-width: 500px;
        }
        
        .feature-image img {
          width: 100%;
          height: auto;
          border-radius: 4px;
        }
        
        .feature-text {
          flex: 1;
        }
        
        .feature-text h2 {
          font-size: 1.8rem;
          font-weight: 600;
          margin: 0 0 20px;
          color: #333;
        }
        
        .feature-text p {
          font-size: 1rem;
          line-height: 1.8;
          color: #666;
          margin: 0;
        }
        
        /* Divider */
        .divider {
          border: none;
          border-top: 1px solid #e0e0e0;
          margin: 0 20px;
          max-width: 1160px;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Search Drawer */
        .search-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: #fff;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          transform: translateY(-100%);
          transition: transform 0.3s;
        }
        
        .search-drawer.open {
          transform: translateY(0);
        }
        
        .search-form {
          display: flex;
          max-width: 800px;
          margin: 0 auto;
          gap: 10px;
        }
        
        .search-input {
          flex: 1;
          padding: 12px 20px;
          border: 1px solid #ddd;
          font-size: 1rem;
          outline: none;
        }
        
        .search-btn {
          padding: 12px 20px;
          background: #333;
          color: #fff;
          border: none;
          cursor: pointer;
        }
        
        .close-search {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <!-- Search Drawer -->
      <div id="searchDrawer" class="search-drawer">
        <form class="search-form" action="/search" method="get">
          <button type="submit" class="search-btn">
            <i class="fas fa-search"></i>
          </button>
          <input type="search" name="q" class="search-input" placeholder="Search" aria-label="Search">
        </form>
        <button class="close-search" onclick="toggleSearch()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Announcement Bar -->
      <div class="announcement-bar">
        <p style="margin: 0;">Additional Products Coming Soon</p>
      </div>
      
      <!-- Slideshow -->
      <div class="slideshow-wrapper">
        <button class="slideshow-pause" id="pauseBtn" onclick="togglePause()">
          <i class="fas fa-pause" id="pauseIcon"></i>
          <span class="sr-only">Pause slideshow</span>
        </button>
        
        ${slides.map((slide, index) => html`
          <div class="slide ${index === 0 ? 'active' : ''}" 
               style="background-image: url('${slide.image}')"
               data-slide="${index}">
            ${slide.hasOverlay ? html`
              <div class="slide-overlay">
                <h2 class="slide-title">${slide.title}</h2>
                <span class="slide-subtitle">${slide.subtitle}</span>
              </div>
            ` : ''}
          </div>
        `)}
        
        <div class="slideshow-dots">
          ${slides.map((_, index) => html`
            <button class="dot ${index === 0 ? 'active' : ''}" 
                    data-dot="${index}" 
                    onclick="goToSlide(${index})">
            </button>
          `)}
        </div>
      </div>
      
      <!-- Featured Collection -->
      <section>
        <div class="section-header">
          <h2>Featured collection</h2>
        </div>
        
        <div class="product-grid">
          ${products.map(product => html`
            <a href="${product.url}" class="product-card">
              <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
              </div>
              <h4 class="product-title">${product.title}</h4>
              <div class="product-vendor">${product.vendor}</div>
              <div class="product-price">${product.price}</div>
            </a>
          `)}
        </div>
        
        <hr class="divider">
        
        <div class="view-all-wrapper">
          <a href="#" class="view-all-btn">View all</a>
        </div>
      </section>
      
      <!-- Feature Row -->
      <section class="feature-row">
        <div class="feature-image">
          <img src="https://hillbilly-fightwear.myshopify.com/cdn/shop/files/Croom_finishing_MrD_w_Luttrell_in_corner_540x.jpg?v=1613509348" alt="Fighter image">
        </div>
        <div class="feature-text">
          <h2>More Coming Soon</h2>
          <p>Coming soon a variety of customizable options utilizing all of our artwork and logos. Check back frequently for more products.</p>
        </div>
      </section>
      
      <!-- Footer spacer -->
      <div style="height: 50px;"></div>
      
      <script>
        // Slideshow functionality
        let currentSlide = 0;
        let isPaused = false;
        let slideInterval;
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const totalSlides = slides.length;
        
        function showSlide(index) {
          slides.forEach(slide => slide.classList.remove('active'));
          dots.forEach(dot => dot.classList.remove('active'));
          
          slides[index].classList.add('active');
          dots[index].classList.add('active');
          currentSlide = index;
        }
        
        function nextSlide() {
          const next = (currentSlide + 1) % totalSlides;
          showSlide(next);
        }
        
        function goToSlide(index) {
          showSlide(index);
          resetInterval();
        }
        
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
        
        function startInterval() {
          slideInterval = setInterval(nextSlide, 5000);
        }
        
        function resetInterval() {
          if (!isPaused) {
            clearInterval(slideInterval);
            startInterval();
          }
        }
        
        // Search functionality
        function toggleSearch() {
          const drawer = document.getElementById('searchDrawer');
          drawer.classList.toggle('open');
        }
        
        // Start slideshow
        startInterval();
      </script>
    </body>
    </html>`
  )
})

// API endpoint for products
app.get('/api/products', (c) => {
  return c.json(products)
})

// API endpoint for slides
app.get('/api/slides', (c) => {
  return c.json(slides)
})

export default app
