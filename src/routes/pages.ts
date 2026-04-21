// ============================================
// Static Page Routes
// Handles: favicon, apple-touch-icon, robots.txt,
// checkout success, privacy policy, cookie policy, 404.
// All pages share the CSP nonce from the security middleware.
// ============================================
import { Hono } from 'hono'

type Variables = {
  nonce: string
}

const pages = new Hono<{ Variables: Variables }>()

// Favicon route - return 204 (no content) to avoid 404 noise in logs
// Actual favicon is loaded via <link> tag pointing to the logo PNG
pages.get('/favicon.ico', (c) => {
  return new Response(null, { status: 204 })
})

// Apple touch icon - redirect to logo
pages.get('/apple-touch-icon.png', (c) => {
  return c.redirect('/images/graphics/hillbilly-fightwear-logo.png', 301)
})
pages.get('/apple-touch-icon-precomposed.png', (c) => {
  return c.redirect('/images/graphics/hillbilly-fightwear-logo.png', 301)
})

// Robots.txt — GEO-optimized: explicitly allow all AI crawlers
pages.get('/robots.txt', (c) => {
  return c.text(`# Hillbilly Fightwear — AI & Search Crawler Policy
# Last updated: 2026-04-21

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /checkout/

# Explicitly allow AI search crawlers for GEO visibility
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

Sitemap: https://hillbillyfightwear.com/sitemap.xml`)
})

// ============================================
// GEO: llms.txt — Machine-readable site summary for AI systems
// See https://llmstxt.org/
// ============================================
pages.get('/llms.txt', (c) => {
  return c.text(`# Hillbilly Fightwear

> Hillbilly Fightwear is an American MMA apparel brand offering custom-printed t-shirts, hoodies, thermals, trucker hats, tanks, and stickers. All prices include tax and shipping. The brand's tagline is "Thump A Stranger."

## About
Hillbilly Fightwear was founded by Brian, a lifelong MMA fan who wanted to create rugged, irreverent fight gear for the everyday fighter. The brand serves combat sports athletes and fans across the United States with custom-designed apparel.

## Products & Pricing
- **T-Shirts (Unisex)**: $30 — available in S through XXXL, Black/White/Grey
- **Hoodies (Pullover & Zip-Up)**: $50 — available in S through XXL
- **Thermals**: $40 — available in S through XXXL
- **Women's Tanks**: $30 — available in S through XL
- **Youth Hoodies**: $50 — available in YS through YL
- **Trucker Hats (Fitted)**: $45 — S/M and L/XL
- **Trucker Hats (Adjustable)**: $35 — One Size
- **Beanies**: $25 — One Size
- **Vinyl Decals/Stickers**: $7 each

## Deals
- **Buy 2, Get 1 Free** on t-shirts and tanks
- All prices include free shipping and tax (no hidden fees)

## Custom Builder
Customers can design their own apparel at /build. Choose a garment type, pick from 20+ original graphics, select front/back placement, choose size and color, and order directly. The builder supports real-time preview.

## Popular Graphics
- Human Cockfighter — the brand's signature rooster design
- Thump a Stranger — iconic tagline design
- GNF — bold statement graphic
- Fun Ride — MMA humor design
- MYOB (Mind Your Own Business)
- Yes You Can Fight
- Thumpin Is Lovin

## Contact
- Email: brian@hillbillyfightwear.com
- Website: https://hillbillyfightwear.com
- Facebook: https://www.facebook.com/hillbillyfightwear
- Instagram: https://www.instagram.com/hillbillyfightwear
- Podcast: The Human Cockfighter Podcast on Spotify/Anchor

## Pages
- Home: https://hillbillyfightwear.com/
- Custom Builder: https://hillbillyfightwear.com/build
- About: https://hillbillyfightwear.com/about
- Contact: https://hillbillyfightwear.com/contact
- Privacy Policy: https://hillbillyfightwear.com/privacy-policy
- Cookie Policy: https://hillbillyfightwear.com/cookie-policy

## Technical
- Hosted on Cloudflare Pages (edge-deployed globally)
- Payments processed securely via Stripe
- No user accounts required — guest checkout only
- GDPR and CCPA compliant
`)
})

// ============================================
// SEO: XML Sitemap
// ============================================
pages.get('/sitemap.xml', (c) => {
  const now = new Date().toISOString().split('T')[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hillbillyfightwear.com/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hillbillyfightwear.com/build</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://hillbillyfightwear.com/contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://hillbillyfightwear.com/about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hillbillyfightwear.com/privacy-policy</loc>
    <lastmod>2026-02-11</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://hillbillyfightwear.com/cookie-policy</loc>
    <lastmod>2026-02-11</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  })
})

pages.get('/checkout/success', (c) => {
  const nonce = c.get('nonce')
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed - Hillbilly Fightwear</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="/static/tailwind.css">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous">
  <style nonce="${nonce}">
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    body { font-family: 'Oswald', sans-serif; background: #f5f5f5; }
    .success-container { max-width: 600px; margin: 100px auto; padding: 40px; text-align: center; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .success-icon { width: 80px; height: 80px; background: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; font-size: 2.5rem; color: #fff; }
    h1 { font-size: 2rem; margin: 0 0 15px; }
    p { color: #666; margin: 0 0 30px; line-height: 1.6; }
    .order-details { text-align: left; background: #f8f8f8; border-radius: 8px; padding: 20px; margin: 0 0 25px; font-size: 0.95rem; }
    .order-details .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
    .order-details .detail-row:last-child { border-bottom: none; }
    .order-details .label { color: #888; }
    .order-details .value { font-weight: 600; color: #333; }
    .email-status { font-size: 0.85rem; color: #28a745; margin: 10px 0 20px; }
    .email-status.pending { color: #888; }
    .btn { display: inline-block; padding: 15px 40px; background: #8B0000; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; border-radius: 4px; transition: all 0.3s; }
    .btn:hover { background: #a00000; }
  </style>
</head>
<body>
  <div class="success-container">
    <div class="success-icon"><i class="fas fa-check"></i></div>
    <h1>Order Confirmed!</h1>
    <p>Thank you for your order! We're preparing it now.</p>
    <div id="orderDetails" class="order-details" style="display:none;"></div>
    <p id="emailStatus" class="email-status pending"><i class="fas fa-spinner fa-spin"></i> Sending confirmation email...</p>
    <a href="/" class="btn">Continue Shopping</a>
  </div>
  <script nonce="${nonce}">
    (function() {
      // SEC: HTML-escape helper to prevent XSS from API response data
      function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

      var params = new URLSearchParams(window.location.search);
      var sessionId = params.get('session_id');
      if (!sessionId) return;

      // SEC: Validate session_id format before sending to API (Stripe session IDs are alphanumeric + underscores)
      if (!/^cs_[a-zA-Z0-9_]{10,200}$/.test(sessionId)) return;

      var detailsEl = document.getElementById('orderDetails');
      var statusEl = document.getElementById('emailStatus');

      fetch('/api/order/receipt/' + encodeURIComponent(sessionId))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.error) {
            statusEl.innerHTML = '<i class="fas fa-envelope"></i> A confirmation email will be sent shortly.';
            statusEl.className = 'email-status';
            return;
          }

          // Show order details (all values HTML-escaped)
          var html = '';
          if (data.orderId) html += '<div class="detail-row"><span class="label">Order #</span><span class="value">' + esc(data.orderId) + '</span></div>';
          if (data.total) html += '<div class="detail-row"><span class="label">Total</span><span class="value">$' + esc(data.total) + '</span></div>';
          if (data.customerEmail) html += '<div class="detail-row"><span class="label">Email</span><span class="value">' + esc(data.customerEmail) + '</span></div>';

          if (html) {
            detailsEl.innerHTML = html;
            detailsEl.style.display = 'block';
          }

          if (data.emailsSent) {
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Confirmation email sent to ' + esc(data.customerEmail || 'your email');
            statusEl.className = 'email-status';
          } else {
            statusEl.innerHTML = '<i class="fas fa-envelope"></i> A confirmation email will be sent shortly.';
            statusEl.className = 'email-status';
          }
        })
        .catch(function() {
          statusEl.innerHTML = '<i class="fas fa-envelope"></i> A confirmation email will be sent shortly.';
          statusEl.className = 'email-status';
        });
    })();
  </script>
</body>
</html>`)
})

// Note: Static files from /images/* are served by Cloudflare Pages automatically

// ============================================
// GDPR COMPLIANCE: Privacy Policy Page
// ============================================
pages.get('/privacy-policy', (c) => {
  const nonce = c.get('nonce')
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Hillbilly Fightwear</title>
  <meta name="description" content="Hillbilly Fightwear Privacy Policy — how we collect, use, and protect your personal data. GDPR & CCPA compliant. Payments secured by Stripe.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://hillbillyfightwear.com/privacy-policy">
  <link rel="stylesheet" href="/static/tailwind.css">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous">
  <style nonce="${nonce}">
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    body { font-family: 'Oswald', sans-serif; background: #f5f5f5; }
    .policy-container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
    .policy-header { background: #1a1a1a; color: #fff; padding: 40px 20px; text-align: center; }
    .policy-header h1 { font-size: 2.5rem; margin: 0; }
    .policy-header p { color: #888; margin: 10px 0 0; }
    .policy-content { background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: -20px; }
    .policy-content h2 { font-size: 1.4rem; color: #8B0000; margin: 30px 0 15px; border-bottom: 2px solid #8B0000; padding-bottom: 10px; }
    .policy-content h2:first-child { margin-top: 0; }
    .policy-content p, .policy-content li { color: #555; line-height: 1.8; font-size: 1rem; }
    .policy-content ul { padding-left: 20px; margin: 15px 0; }
    .policy-content li { margin: 8px 0; }
    .policy-content a { color: #8B0000; }
    .back-link { display: inline-block; margin: 30px 0; color: #8B0000; text-decoration: none; font-weight: 600; }
    .back-link:hover { text-decoration: underline; }
    .last-updated { color: #888; font-size: 0.9rem; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="policy-header">
    <h1><i class="fas fa-shield-alt"></i> Privacy Policy</h1>
    <p>Your privacy is important to us</p>
  </div>
  
  <div class="policy-container">
    <div class="policy-content">
      <a href="/" class="back-link"><i class="fas fa-arrow-left"></i> Back to Home</a>
      
      <h2>1. Introduction</h2>
      <p>Hillbilly Fightwear ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website hillbilly-fightwear.pages.dev and hillbillyfightwear.com (the "Site") or make a purchase from us.</p>
      <p>Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Site.</p>
      
      <h2>2. Information We Collect</h2>
      <p>We may collect information about you in various ways:</p>
      <ul>
        <li><strong>Personal Data:</strong> When you make a purchase, we collect your name, email address, shipping address, billing address, and payment information (processed securely by Stripe — we never store your full card number).</li>
        <li><strong>Order Data:</strong> We retain records of your order details including items purchased, customization choices, order total, and transaction reference numbers.</li>
        <li><strong>Usage Data:</strong> We automatically collect certain information when you visit the Site, including your IP address, browser type and version, operating system, referring URL, access times, pages viewed, and interactions with content.</li>
        <li><strong>Device Data:</strong> We may collect information about the device you use to access the Site, including device type, screen resolution, and unique device identifiers.</li>
        <li><strong>Cookies &amp; Tracking:</strong> We use cookies and similar tracking technologies. See our <a href="/cookie-policy">Cookie Policy</a> for full details on what cookies we use and how to manage them.</li>
      </ul>
      
      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process, fulfill, and ship your orders</li>
        <li>Send you order confirmations, shipping updates, and receipts</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Process returns, exchanges, and refunds</li>
        <li>Detect and prevent fraud or unauthorized transactions</li>
        <li>Improve our website, products, and services</li>
        <li>Send promotional communications (only with your consent; you can opt out at any time)</li>
        <li>Comply with legal obligations and enforce our terms</li>
      </ul>
      
      <h2>4. Payment Information</h2>
      <p>All payments are processed securely through <strong>Stripe</strong>. When you complete a purchase:</p>
      <ul>
        <li>Your payment card details are sent directly to Stripe's secure servers and are <strong>never stored on our systems</strong>.</li>
        <li>Stripe is PCI DSS Level 1 certified, the highest level of security certification available.</li>
        <li>We only receive a confirmation token and the last four digits of your card for order reference purposes.</li>
        <li>For more information, see <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe's Privacy Policy</a>.</li>
      </ul>
      
      <h2>5. Legal Basis for Processing (GDPR)</h2>
      <p>If you are from the European Economic Area (EEA), our legal basis for collecting and using your personal information depends on the data concerned and the context in which we collect it:</p>
      <ul>
        <li><strong>Contract:</strong> Processing is necessary for the performance of a contract with you (e.g., fulfilling orders, processing payments)</li>
        <li><strong>Consent:</strong> You have given consent for specific purposes (e.g., marketing communications, non-essential cookies)</li>
        <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests (e.g., fraud prevention, website improvement)</li>
        <li><strong>Legal Obligation:</strong> Processing is necessary to comply with the law (e.g., tax records, consumer protection)</li>
      </ul>
      
      <h2>6. Your Data Protection Rights (GDPR)</h2>
      <p>If you are a resident of the EEA, you have the following data protection rights:</p>
      <ul>
        <li><strong>Right to Access:</strong> You can request copies of your personal data</li>
        <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
        <li><strong>Right to Erasure:</strong> You can request deletion of your personal data</li>
        <li><strong>Right to Restrict Processing:</strong> You can request we limit how we use your data</li>
        <li><strong>Right to Data Portability:</strong> You can request a copy of your data in a machine-readable format</li>
        <li><strong>Right to Object:</strong> You can object to our processing of your personal data</li>
        <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time without affecting the lawfulness of prior processing</li>
      </ul>
      <p>To exercise any of these rights, please contact us at privacy@hillbillyfightwear.com. We will respond to your request within 30 days.</p>
      
      <h2>7. California Privacy Rights (CCPA)</h2>
      <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
      <ul>
        <li><strong>Right to Know:</strong> You can request that we disclose what personal information we have collected, used, disclosed, and sold about you in the past 12 months.</li>
        <li><strong>Right to Delete:</strong> You can request that we delete any personal information we have collected from you, subject to certain exceptions.</li>
        <li><strong>Right to Opt-Out:</strong> You have the right to opt out of the sale of your personal information. <strong>We do not sell your personal information.</strong></li>
        <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights.</li>
      </ul>
      <p>To exercise your rights, contact us at privacy@hillbillyfightwear.com or call us. We will verify your identity before fulfilling your request.</p>
      
      <h2>8. Data Retention</h2>
      <p>We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements:</p>
      <ul>
        <li><strong>Order data:</strong> Retained for 5 years for tax and legal compliance</li>
        <li><strong>Account data:</strong> Retained for the life of your account plus 2 years after deletion</li>
        <li><strong>Usage/analytics data:</strong> Retained for up to 26 months</li>
        <li><strong>Cookie consent records:</strong> Retained for 1 year</li>
      </ul>
      
      <h2>9. Data Security</h2>
      <p>We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction, including:</p>
      <ul>
        <li>HTTPS/TLS encryption for all data in transit</li>
        <li>Content Security Policy (CSP) headers to prevent cross-site scripting</li>
        <li>Cloudflare DDoS protection and Web Application Firewall</li>
        <li>PCI-compliant payment processing through Stripe</li>
      </ul>
      <p>However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal data, we cannot guarantee its absolute security.</p>
      
      <h2>10. Third-Party Services</h2>
      <p>We may share your information with third parties that help us operate our business:</p>
      <ul>
        <li><strong>Payment Processors:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe</a> processes payments securely</li>
        <li><strong>Shipping Partners:</strong> Carriers who deliver your orders (USPS, UPS, FedEx)</li>
        <li><strong>Hosting &amp; CDN:</strong> <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare</a> hosts and protects our website</li>
      </ul>
      <p>These third parties have their own privacy policies and are contractually required to protect your data. We do not sell your personal information to any third party.</p>
      
      <h2>11. International Data Transfers</h2>
      <p>Your information may be transferred to and processed in countries other than your own, including the United States. We ensure appropriate safeguards are in place to protect your data in compliance with applicable data protection laws, including standard contractual clauses where required.</p>
      
      <h2>12. Do Not Track Signals</h2>
      <p>Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Because there is no accepted standard for how to respond to DNT signals, we currently do not respond to them. However, you can manage your cookie preferences through our <a href="/cookie-policy">Cookie Policy</a> and the cookie settings banner on our site.</p>
      
      <h2>13. Children's Privacy</h2>
      <p>Our Site is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete it.</p>
      
      <h2>14. Links to Other Websites</h2>
      <p>Our Site may contain links to third-party websites. We are not responsible for the privacy practices of those websites. We encourage you to read the privacy policy of every website you visit.</p>
      
      <h2>15. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date below. Your continued use of the Site after any changes constitutes your acceptance of the updated policy.</p>
      
      <h2>16. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, wish to exercise your rights, or want to make a complaint, please contact us:</p>
      <ul>
        <li><strong>Email:</strong> privacy@hillbillyfightwear.com</li>
        <li><strong>Website:</strong> <a href="https://hillbillyfightwear.com">hillbillyfightwear.com</a></li>
      </ul>
      <p>If you are in the EEA and are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority.</p>
      
      <p class="last-updated"><strong>Last Updated:</strong> February 11, 2026</p>
    </div>
  </div>
</body>
</html>`)
})

// ============================================
// GDPR COMPLIANCE: Cookie Policy Page
// ============================================
pages.get('/cookie-policy', (c) => {
  const nonce = c.get('nonce')
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cookie Policy - Hillbilly Fightwear</title>
  <meta name="description" content="Hillbilly Fightwear Cookie Policy — learn how we use cookies to improve your shopping experience. Manage your cookie preferences here.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://hillbillyfightwear.com/cookie-policy">
  <link rel="stylesheet" href="/static/tailwind.css">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous">
  <style nonce="${nonce}">
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    body { font-family: 'Oswald', sans-serif; background: #f5f5f5; }
    .policy-container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
    .policy-header { background: #1a1a1a; color: #fff; padding: 40px 20px; text-align: center; }
    .policy-header h1 { font-size: 2.5rem; margin: 0; }
    .policy-header p { color: #888; margin: 10px 0 0; }
    .policy-content { background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-top: -20px; }
    .policy-content h2 { font-size: 1.4rem; color: #8B0000; margin: 30px 0 15px; border-bottom: 2px solid #8B0000; padding-bottom: 10px; }
    .policy-content h2:first-child { margin-top: 0; }
    .policy-content p, .policy-content li { color: #555; line-height: 1.8; font-size: 1rem; }
    .policy-content ul { padding-left: 20px; margin: 15px 0; }
    .policy-content li { margin: 8px 0; }
    .policy-content a { color: #8B0000; }
    .back-link { display: inline-block; margin: 30px 0; color: #8B0000; text-decoration: none; font-weight: 600; }
    .back-link:hover { text-decoration: underline; }
    .last-updated { color: #888; font-size: 0.9rem; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .cookie-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .cookie-table th, .cookie-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    .cookie-table th { background: #8B0000; color: #fff; }
    .cookie-table tr:nth-child(even) { background: #f9f9f9; }
    .manage-btn { display: inline-block; margin: 20px 0; padding: 12px 24px; background: #8B0000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .manage-btn:hover { background: #a00000; }
  </style>
</head>
<body>
  <div class="policy-header">
    <h1><i class="fas fa-cookie-bite"></i> Cookie Policy</h1>
    <p>How we use cookies on our website</p>
  </div>
  
  <div class="policy-container">
    <div class="policy-content">
      <a href="/" class="back-link"><i class="fas fa-arrow-left"></i> Back to Home</a>
      
      <h2>1. What Are Cookies?</h2>
      <p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.</p>
      
      <h2>2. How We Use Cookies</h2>
      <p>We use cookies and similar technologies to:</p>
      <ul>
        <li>Remember your preferences and settings</li>
        <li>Understand how you use our website</li>
        <li>Improve your browsing experience</li>
        <li>Enable certain functions of the website</li>
      </ul>
      
      <h2>3. Types of Cookies We Use</h2>
      
      <h3 style="font-size: 1.1rem; margin: 20px 0 10px; color: #333;">Necessary Cookies (Always Active)</h3>
      <p>These cookies are essential for the website to function properly. They cannot be disabled.</p>
      <table class="cookie-table">
        <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
        <tr><td>cookieConsent</td><td>Stores your cookie preferences</td><td>1 year</td></tr>
        <tr><td>__cf_bm</td><td>Cloudflare bot protection</td><td>30 minutes</td></tr>
      </table>
      
      <h3 style="font-size: 1.1rem; margin: 20px 0 10px; color: #333;">Analytics Cookies (Optional)</h3>
      <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
      <table class="cookie-table">
        <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
        <tr><td colspan="3" style="text-align: center; color: #888;">Currently, we do not use analytics cookies</td></tr>
      </table>
      
      <h3 style="font-size: 1.1rem; margin: 20px 0 10px; color: #333;">Marketing Cookies (Optional)</h3>
      <p>These cookies are used to deliver advertisements more relevant to you and your interests.</p>
      <table class="cookie-table">
        <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
        <tr><td colspan="3" style="text-align: center; color: #888;">Currently, we do not use marketing cookies</td></tr>
      </table>
      
      <h2>4. Managing Your Cookie Preferences</h2>
      <p>You can manage your cookie preferences at any time by clicking the button below or visiting the "Cookie Settings" link in our website footer.</p>
      <a href="/?showCookieSettings=true" class="manage-btn"><i class="fas fa-cog"></i> Manage Cookie Settings</a>
      
      <h2>5. Browser Cookie Controls</h2>
      <p>Most web browsers allow you to control cookies through their settings. You can:</p>
      <ul>
        <li>Delete all cookies from your browser</li>
        <li>Block all cookies by default</li>
        <li>Allow cookies from specific websites</li>
        <li>Delete cookies when you close your browser</li>
      </ul>
      <p>Note: Blocking all cookies may affect the functionality of this and other websites.</p>
      
      <h2>6. Third-Party Cookies</h2>
      <p>Some cookies may be set by third-party services that appear on our pages:</p>
      <ul>
        <li><strong>Cloudflare:</strong> Security and performance services</li>
        <li><strong>Stripe:</strong> Secure payment processing (only during checkout)</li>
      </ul>
      <p>These third parties have their own cookie policies.</p>
      
      <h2>7. Changes to This Policy</h2>
      <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
      
      <h2>8. Contact Us</h2>
      <p>If you have questions about our use of cookies, please contact us at privacy@hillbillyfightwear.com</p>
      
      <p class="last-updated"><strong>Last Updated:</strong> February 11, 2026</p>
    </div>
  </div>
  
</body>
</html>`)
})

// ============================================
// CONTACT US PAGE
// ============================================
pages.get('/contact', (c) => {
  const nonce = c.get('nonce')
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us - Hillbilly Fightwear | Custom MMA Gear Questions</title>
  <meta name="description" content="Contact Hillbilly Fightwear for custom MMA apparel, wholesale orders, sponsorships & more. Email brian@hillbillyfightwear.com — we respond within 24 hours.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://hillbillyfightwear.com/contact">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://hillbillyfightwear.com/contact">
  <meta property="og:title" content="Contact Us - Hillbilly Fightwear">
  <meta property="og:description" content="Got a question about custom MMA apparel? Reach out — we respond within 24 hours.">
  <meta property="og:image" content="https://hillbillyfightwear.com/images/graphics/hillbilly-fightwear-logo.png">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Contact Us - Hillbilly Fightwear">
  <meta name="twitter:description" content="Got a question about custom MMA apparel? Reach out — we respond within 24 hours.">
  <link rel="stylesheet" href="/static/tailwind.css">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous">
  <style nonce="${nonce}">
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Oswald', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    
    .contact-nav {
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
    .contact-nav a {
      color: #fff;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .contact-nav a:hover { color: #ccc; }
    .contact-nav .nav-links {
      display: flex;
      gap: 6px;
    }
    .contact-nav .nav-tab {
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
    }
    .contact-nav .nav-tab:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.6);
    }
    
    .contact-header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%);
      color: #fff;
      padding: 50px 20px;
      text-align: center;
    }
    .contact-header h1 { font-size: 2.5rem; margin: 0; text-transform: uppercase; letter-spacing: 3px; }
    .contact-header p { color: #aaa; margin: 10px 0 0; font-size: 1.1rem; }
    
    .contact-container {
      max-width: 900px;
      margin: -30px auto 40px;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    @media (max-width: 768px) {
      .contact-container { grid-template-columns: 1fr; margin-top: -20px; }
    }
    
    .contact-form-card {
      background: #fff;
      padding: 35px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .contact-form-card h2 {
      font-size: 1.3rem;
      color: #8B0000;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #8B0000;
    }
    
    .form-group { margin-bottom: 18px; }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 12px 14px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-family: 'Oswald', Arial, sans-serif;
      font-size: 0.95rem;
      transition: border-color 0.3s;
      background: #fff;
    }
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #8B0000;
    }
    .form-group textarea { resize: vertical; min-height: 120px; }
    
    .submit-btn {
      width: 100%;
      padding: 16px;
      background: #8B0000;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-family: 'Oswald', Arial, sans-serif;
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .submit-btn:hover { background: #a50000; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(139,0,0,0.4); }
    .submit-btn:disabled { background: #999; cursor: not-allowed; transform: none; box-shadow: none; }
    
    .contact-info-card {
      background: #fff;
      padding: 35px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      height: fit-content;
    }
    .contact-info-card h2 {
      font-size: 1.3rem;
      color: #8B0000;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #8B0000;
    }
    
    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #eee;
    }
    .info-item:last-child { border-bottom: none; }
    .info-item .icon-circle {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #8B0000, #c0392b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .info-item h3 { margin: 0 0 4px; font-size: 0.95rem; color: #333; }
    .info-item p { margin: 0; font-size: 0.9rem; color: #666; line-height: 1.5; }
    .info-item a { color: #8B0000; text-decoration: none; }
    .info-item a:hover { text-decoration: underline; }
    
    .social-links {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .social-link {
      width: 44px;
      height: 44px;
      background: #1a1a1a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.1rem;
      text-decoration: none;
      transition: all 0.3s;
    }
    .social-link:hover { background: #8B0000; transform: translateY(-3px); }
    
    .form-status {
      padding: 14px 18px;
      border-radius: 6px;
      margin-top: 15px;
      font-size: 0.9rem;
      display: none;
    }
    .form-status.success { display: block; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .form-status.error { display: block; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

    .contact-footer {
      background: #1a1a1a;
      color: #fff;
      padding: 30px 20px;
      text-align: center;
      margin-top: 40px;
    }
    .contact-footer p { margin: 0; font-size: 0.85rem; color: #999; }
    .contact-footer a { color: #8B0000; text-decoration: none; }
    .contact-footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <nav class="contact-nav">
    <a href="/">Hillbilly Fightwear</a>
    <div class="nav-links">
      <a href="/" class="nav-tab"><i class="fas fa-home"></i> Home</a>
      <a href="/#shop" class="nav-tab"><i class="fas fa-shopping-bag"></i> Shop</a>
      <a href="/build" class="nav-tab"><i class="fas fa-paint-brush"></i> Build</a>
    </div>
  </nav>

  <div class="contact-header">
    <h1><i class="fas fa-envelope"></i> Contact Us</h1>
    <p>Got a question? We'd love to hear from you. Send us a message!</p>
  </div>

  <div class="contact-container">
    <!-- Contact Form -->
    <div class="contact-form-card">
      <h2><i class="fas fa-paper-plane"></i> Send Us a Message</h2>
      <form id="contactForm">
        <div class="form-group">
          <label for="contactName"><i class="fas fa-user"></i> Your Name *</label>
          <input type="text" id="contactName" name="name" required placeholder="Enter your full name" maxlength="100">
        </div>
        <div class="form-group">
          <label for="contactEmail"><i class="fas fa-envelope"></i> Email Address *</label>
          <input type="email" id="contactEmail" name="email" required placeholder="your@email.com" maxlength="200">
        </div>
        <div class="form-group">
          <label for="contactPhone"><i class="fas fa-phone"></i> Phone Number</label>
          <input type="tel" id="contactPhone" name="phone" placeholder="(optional)" maxlength="20">
        </div>
        <div class="form-group">
          <label for="contactSubject"><i class="fas fa-tag"></i> Subject *</label>
          <select id="contactSubject" name="subject" required>
            <option value="">Select a topic...</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Order Question">Order Question</option>
            <option value="Custom Design Request">Custom Design Request</option>
            <option value="Wholesale / Bulk Order">Wholesale / Bulk Order</option>
            <option value="Sponsorship">Sponsorship</option>
            <option value="Returns / Exchange">Returns / Exchange</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="contactMessage"><i class="fas fa-comment-alt"></i> Message *</label>
          <textarea id="contactMessage" name="message" required placeholder="Tell us what's on your mind..." maxlength="2000"></textarea>
        </div>
        <button type="submit" class="submit-btn" id="submitBtn">
          <i class="fas fa-paper-plane"></i> Send Message
        </button>
        <div id="formStatus" class="form-status"></div>
      </form>
    </div>

    <!-- Contact Info -->
    <div class="contact-info-card">
      <h2><i class="fas fa-info-circle"></i> Get In Touch</h2>
      
      <div class="info-item">
        <div class="icon-circle"><i class="fas fa-envelope"></i></div>
        <div>
          <h3>Email Us</h3>
          <p><a href="mailto:brian@hillbillyfightwear.com">brian@hillbillyfightwear.com</a></p>
          <p style="font-size: 0.8rem; color: #999; margin-top: 4px;">We typically respond within 24 hours</p>
        </div>
      </div>
      
      <div class="info-item">
        <div class="icon-circle"><i class="fas fa-globe"></i></div>
        <div>
          <h3>Website</h3>
          <p><a href="https://hillbillyfightwear.com" target="_blank" rel="noopener">hillbillyfightwear.com</a></p>
        </div>
      </div>
      
      <div class="info-item">
        <div class="icon-circle"><i class="fas fa-podcast"></i></div>
        <div>
          <h3>Podcast</h3>
          <p><a href="https://anchor.fm/hillbillyfightwear" target="_blank" rel="noopener">Listen on Spotify / Anchor</a></p>
          <p style="font-size: 0.8rem; color: #999; margin-top: 4px;">The Human Cockfighter Podcast</p>
        </div>
      </div>
      
      <div class="info-item">
        <div class="icon-circle"><i class="fas fa-clock"></i></div>
        <div>
          <h3>Response Time</h3>
          <p>We aim to respond to all inquiries within 24-48 hours during business days.</p>
        </div>
      </div>
      
      <div class="social-links">
        <a href="https://www.facebook.com/hillbillyfightwear" target="_blank" rel="noopener" class="social-link" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="https://www.instagram.com/hillbillyfightwear" target="_blank" rel="noopener" class="social-link" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="https://anchor.fm/hillbillyfightwear" target="_blank" rel="noopener" class="social-link" aria-label="Podcast"><i class="fas fa-podcast"></i></a>
      </div>
    </div>
  </div>

  <footer class="contact-footer">
    <p>&copy; ${new Date().getFullYear()} Hillbilly Fightwear. All rights reserved.</p>
    <p style="margin-top: 8px;">
      <a href="/">Home</a> &bull;
      <a href="/#shop">Shop</a> &bull;
      <a href="/build">Build Y'Own</a> &bull;
      <a href="/privacy-policy">Privacy Policy</a>
    </p>
  </footer>

  <script nonce="${nonce}">
    document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      var btn = document.getElementById('submitBtn');
      var status = document.getElementById('formStatus');
      
      // Validate
      var name = document.getElementById('contactName').value.trim();
      var email = document.getElementById('contactEmail').value.trim();
      var subject = document.getElementById('contactSubject').value;
      var message = document.getElementById('contactMessage').value.trim();
      
      if (!name || !email || !subject || !message) {
        status.className = 'form-status error';
        status.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields.';
        return;
      }
      
      // Email validation
      var emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(email)) {
        status.className = 'form-status error';
        status.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address.';
        return;
      }
      
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      status.className = 'form-status';
      status.style.display = 'none';
      
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: document.getElementById('contactPhone').value.trim(),
          subject: subject,
          message: message
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        // SEC: Escape API response before inserting into DOM
        function escTxt(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
        if (data.success) {
          status.className = 'form-status success';
          status.innerHTML = '<i class="fas fa-check-circle"></i> ' + escTxt(data.message);
          document.getElementById('contactForm').reset();
        } else {
          status.className = 'form-status error';
          status.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + escTxt(data.error || 'Something went wrong. Please try again.');
        }
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      })
      .catch(function(err) {
        status.className = 'form-status error';
        status.innerHTML = '<i class="fas fa-exclamation-circle"></i> Network error. Please try again later.';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      });
    });
  </script>
</body>
</html>`)
})

// ============================================
// GEO: About Page — E-E-A-T Authority + Organization Schema
// ============================================
pages.get('/about', (c) => {
  const nonce = c.get('nonce')
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Hillbilly Fightwear | MMA Apparel Brand Story</title>
  <meta name="description" content="Hillbilly Fightwear is an American MMA apparel brand founded by Brian. We make custom t-shirts, hoodies, hats &amp; stickers for combat sports fans. All prices include free shipping &amp; tax.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://hillbillyfightwear.com/about">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://hillbillyfightwear.com/about">
  <meta property="og:title" content="About Hillbilly Fightwear | MMA Apparel Brand Story">
  <meta property="og:description" content="The working man and woman's MMA apparel brand. Custom fight gear, free shipping, all prices include tax.">
  <meta property="og:image" content="https://hillbillyfightwear.com/images/graphics/hillbilly-fightwear-logo.png">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="About Hillbilly Fightwear">
  <meta name="twitter:description" content="The working man and woman's MMA apparel brand. Custom fight gear, free shipping, tax included.">

  <!-- GEO: Organization + Person + BreadcrumbList + FAQPage Schema -->
  <script type="application/ld+json" nonce="${nonce}">
  [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Hillbilly Fightwear",
      "alternateName": "HFW",
      "url": "https://hillbillyfightwear.com",
      "logo": "https://hillbillyfightwear.com/images/graphics/hillbilly-fightwear-logo.png",
      "description": "American MMA apparel brand offering custom-printed t-shirts, hoodies, thermals, trucker hats, tanks, and vinyl stickers for combat sports athletes and fans.",
      "foundingDate": "2024",
      "founder": {
        "@type": "Person",
        "name": "Brian",
        "jobTitle": "Founder & Owner",
        "url": "https://hillbillyfightwear.com/about"
      },
      "address": { "@type": "PostalAddress", "addressCountry": "US" },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "brian@hillbillyfightwear.com",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://www.facebook.com/hillbillyfightwear",
        "https://www.instagram.com/hillbillyfightwear",
        "https://anchor.fm/hillbillyfightwear"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hillbillyfightwear.com/" },
        { "@type": "ListItem", "position": 2, "name": "About", "item": "https://hillbillyfightwear.com/about" }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Hillbilly Fightwear?",
          "acceptedAnswer": { "@type": "Answer", "text": "Hillbilly Fightwear is an American MMA apparel brand that makes custom-printed t-shirts, hoodies, thermals, trucker hats, tanks, and vinyl stickers for combat sports athletes and fans. All prices include free shipping and tax." }
        },
        {
          "@type": "Question",
          "name": "Who founded Hillbilly Fightwear?",
          "acceptedAnswer": { "@type": "Answer", "text": "Hillbilly Fightwear was founded by Brian, a lifelong MMA fan who wanted to create rugged, irreverent fight gear for the everyday fighter." }
        },
        {
          "@type": "Question",
          "name": "Does Hillbilly Fightwear offer free shipping?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. Every item at Hillbilly Fightwear includes free shipping and tax in the listed price. There are no hidden fees at checkout." }
        },
        {
          "@type": "Question",
          "name": "Can I design my own custom MMA apparel?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. The Build Y'Own custom builder at hillbillyfightwear.com/build lets you pick a garment, choose from 20+ original graphics, select front or back placement, and preview your design in real time before ordering." }
        },
        {
          "@type": "Question",
          "name": "What is the Hillbilly Fightwear Buy 2 Get 1 Free deal?",
          "acceptedAnswer": { "@type": "Answer", "text": "Hillbilly Fightwear offers a Buy 2, Get 1 Free promotion on t-shirts and tanks. Add 3 qualifying items to your cart and the cheapest is free." }
        },
        {
          "@type": "Question",
          "name": "What sizes does Hillbilly Fightwear carry?",
          "acceptedAnswer": { "@type": "Answer", "text": "T-shirts come in S through XXXL. Hoodies come in S through XXL. Women's tanks come in S through XL. Youth sizes (YS, YM, YL) are available for kids' hoodies. Fitted hats come in S/M and L/XL. Adjustable hats and beanies are one size fits all." }
        },
        {
          "@type": "Question",
          "name": "How do I contact Hillbilly Fightwear?",
          "acceptedAnswer": { "@type": "Answer", "text": "Email brian@hillbillyfightwear.com or use the contact form at hillbillyfightwear.com/contact. The team typically responds within 24 hours." }
        }
      ]
    }
  ]
  </script>

  <link rel="stylesheet" href="/static/tailwind.css">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous">
  <style nonce="${nonce}">
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Oswald', Arial, sans-serif; background: #f5f5f5; margin: 0; }
    .about-nav { background: #0a0a0a; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 44px; position: sticky; top: 0; z-index: 100; }
    .about-nav a { color: #fff; text-decoration: none; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .about-nav .nav-links { display: flex; gap: 6px; }
    .about-nav .nav-tab { display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 3px; color: #fff; background: transparent; border: 1.5px solid rgba(255,255,255,0.3); transition: all 0.25s; }
    .about-nav .nav-tab:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.6); }
    .about-hero { background: linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%); color: #fff; padding: 60px 20px; text-align: center; }
    .about-hero h1 { font-size: 2.5rem; margin: 0; text-transform: uppercase; letter-spacing: 3px; }
    .about-hero p { color: #aaa; margin: 12px 0 0; font-size: 1.15rem; max-width: 700px; margin-left: auto; margin-right: auto; }
    .about-container { max-width: 900px; margin: -30px auto 40px; padding: 0 20px; }
    .about-card { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 30px; }
    .about-card h2 { font-size: 1.4rem; color: #8B0000; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 2px solid #8B0000; }
    .about-card p, .about-card li { color: #555; line-height: 1.8; font-size: 1rem; }
    .about-card ul { padding-left: 20px; margin: 12px 0; }
    .about-card li { margin: 6px 0; }
    .about-card a { color: #8B0000; text-decoration: none; font-weight: 600; }
    .about-card a:hover { text-decoration: underline; }
    .brand-values { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin: 20px 0; }
    .value-item { background: #f8f8f8; padding: 20px; border-radius: 8px; text-align: center; }
    .value-item i { font-size: 2rem; color: #8B0000; margin-bottom: 10px; display: block; }
    .value-item h3 { font-size: 1rem; margin: 0 0 8px; color: #333; }
    .value-item p { font-size: 0.9rem; margin: 0; color: #666; }
    .faq-item { border-bottom: 1px solid #eee; padding: 18px 0; }
    .faq-item:last-child { border-bottom: none; }
    .faq-item h3 { font-size: 1.05rem; color: #333; margin: 0 0 8px; }
    .faq-item p { margin: 0; }
    .about-footer { background: #1a1a1a; color: #fff; padding: 30px 20px; text-align: center; margin-top: 20px; }
    .about-footer p { margin: 0; font-size: 0.85rem; color: #999; }
    .about-footer a { color: #8B0000; text-decoration: none; }
    .last-updated { color: #888; font-size: 0.85rem; text-align: right; margin-top: 20px; }
  </style>
</head>
<body>
  <nav class="about-nav">
    <a href="/">Hillbilly Fightwear</a>
    <div class="nav-links">
      <a href="/" class="nav-tab"><i class="fas fa-home"></i> Home</a>
      <a href="/#shop" class="nav-tab"><i class="fas fa-shopping-bag"></i> Shop</a>
      <a href="/build" class="nav-tab"><i class="fas fa-paint-brush"></i> Build</a>
      <a href="/contact" class="nav-tab"><i class="fas fa-envelope"></i> Contact</a>
    </div>
  </nav>

  <header class="about-hero">
    <h1><i class="fas fa-fist-raised"></i> About Hillbilly Fightwear</h1>
    <p>The working man and woman's MMA apparel brand. Rugged custom fight gear, free shipping, tax included — no hidden fees, no BS.</p>
  </header>

  <main class="about-container">
    <!-- TL;DR / Summary Block — optimized for AI extraction -->
    <div class="about-card">
      <h2><i class="fas fa-bolt"></i> TL;DR</h2>
      <p><strong>Hillbilly Fightwear is an American MMA apparel brand</strong> that makes custom-printed t-shirts ($30), hoodies ($50), thermals ($40), trucker hats ($25–$45), women's tanks ($30), and vinyl stickers ($7). Every price includes free shipping and tax. We offer a Buy 2, Get 1 Free deal on t-shirts and tanks. Customers can design their own gear at <a href="/build">hillbillyfightwear.com/build</a>.</p>
    </div>

    <!-- Brand Story -->
    <div class="about-card">
      <h2><i class="fas fa-book-open"></i> Our Story</h2>
      <p>Hillbilly Fightwear was founded by Brian, a lifelong MMA fan who got tired of overpriced, generic fight gear that didn't say anything real. He wanted to build a brand for the working man and woman — the kind of people who train after a long shift, tape up their hands in a garage gym, and live the fight life on their own terms.</p>
      <p>What started as a handful of t-shirt designs has grown into a full apparel line with hoodies, thermals, tanks, trucker hats, beanies, and vinyl decals. Every design is original, every item ships free, and every price includes tax — because hidden fees are for people who fight dirty.</p>
      <p>The brand's signature tagline, <strong>"Thump A Stranger,"</strong> captures the irreverent, no-nonsense attitude that Hillbilly Fightwear customers live by.</p>
    </div>

    <!-- Brand Values — AI-extractable blocks -->
    <div class="about-card">
      <h2><i class="fas fa-star"></i> What Sets Us Apart</h2>
      <div class="brand-values">
        <div class="value-item">
          <i class="fas fa-truck"></i>
          <h3>Free Shipping</h3>
          <p>Every item ships free to all U.S. addresses. No minimum order.</p>
        </div>
        <div class="value-item">
          <i class="fas fa-dollar-sign"></i>
          <h3>Tax Included</h3>
          <p>The price you see is the price you pay. Zero hidden fees at checkout.</p>
        </div>
        <div class="value-item">
          <i class="fas fa-paint-brush"></i>
          <h3>Custom Builder</h3>
          <p>Design your own apparel with 20+ graphics, multiple garments, and real-time preview.</p>
        </div>
        <div class="value-item">
          <i class="fas fa-tags"></i>
          <h3>Buy 2 Get 1 Free</h3>
          <p>Stock up on tees and tanks — every third item is on the house.</p>
        </div>
        <div class="value-item">
          <i class="fas fa-lock"></i>
          <h3>Secure Checkout</h3>
          <p>Payments processed by Stripe (PCI Level 1 certified). We never store card data.</p>
        </div>
        <div class="value-item">
          <i class="fas fa-globe-americas"></i>
          <h3>Edge-Fast Delivery</h3>
          <p>Website served from Cloudflare's global edge network for instant page loads worldwide.</p>
        </div>
      </div>
    </div>

    <!-- Product Catalog Summary — table for AI extractability -->
    <div class="about-card">
      <h2><i class="fas fa-tshirt"></i> Product Catalog &amp; Pricing</h2>
      <p>All prices include free shipping and tax. No hidden fees.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#8B0000;color:#fff;">
            <th style="padding:10px 12px;text-align:left;">Product</th>
            <th style="padding:10px 12px;text-align:left;">Price</th>
            <th style="padding:10px 12px;text-align:left;">Sizes</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 12px;">T-Shirts (Unisex)</td><td style="padding:10px 12px;">$30</td><td style="padding:10px 12px;">S – XXXL</td></tr>
          <tr style="border-bottom:1px solid #eee;background:#f9f9f9;"><td style="padding:10px 12px;">Hoodies (Pullover &amp; Zip-Up)</td><td style="padding:10px 12px;">$50</td><td style="padding:10px 12px;">S – XXL</td></tr>
          <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 12px;">Thermals</td><td style="padding:10px 12px;">$40</td><td style="padding:10px 12px;">S – XXXL</td></tr>
          <tr style="border-bottom:1px solid #eee;background:#f9f9f9;"><td style="padding:10px 12px;">Women's Tanks</td><td style="padding:10px 12px;">$30</td><td style="padding:10px 12px;">S – XL</td></tr>
          <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 12px;">Youth Hoodies</td><td style="padding:10px 12px;">$50</td><td style="padding:10px 12px;">YS – YL</td></tr>
          <tr style="border-bottom:1px solid #eee;background:#f9f9f9;"><td style="padding:10px 12px;">Fitted Trucker Hats</td><td style="padding:10px 12px;">$45</td><td style="padding:10px 12px;">S/M, L/XL</td></tr>
          <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 12px;">Adjustable Trucker Hats</td><td style="padding:10px 12px;">$35</td><td style="padding:10px 12px;">One Size</td></tr>
          <tr style="border-bottom:1px solid #eee;background:#f9f9f9;"><td style="padding:10px 12px;">Beanies</td><td style="padding:10px 12px;">$25</td><td style="padding:10px 12px;">One Size</td></tr>
          <tr><td style="padding:10px 12px;">Vinyl Decals &amp; Stickers</td><td style="padding:10px 12px;">$7</td><td style="padding:10px 12px;">—</td></tr>
        </tbody>
      </table>
    </div>

    <!-- FAQ Section — GEO-optimized for AI extraction -->
    <div class="about-card">
      <h2><i class="fas fa-question-circle"></i> Frequently Asked Questions</h2>

      <div class="faq-item">
        <h3>What is Hillbilly Fightwear?</h3>
        <p>Hillbilly Fightwear is an American MMA apparel brand that makes custom-printed t-shirts, hoodies, thermals, trucker hats, tanks, and vinyl stickers for combat sports athletes and fans. All prices include free shipping and tax.</p>
      </div>

      <div class="faq-item">
        <h3>Who founded Hillbilly Fightwear?</h3>
        <p>Hillbilly Fightwear was founded by Brian, a lifelong MMA fan who wanted to create rugged, irreverent fight gear for the everyday fighter.</p>
      </div>

      <div class="faq-item">
        <h3>Does Hillbilly Fightwear offer free shipping?</h3>
        <p>Yes. Every item at Hillbilly Fightwear includes free shipping and tax in the listed price. There are no hidden fees at checkout.</p>
      </div>

      <div class="faq-item">
        <h3>Can I design my own custom MMA apparel?</h3>
        <p>Yes. The <a href="/build">Build Y'Own</a> custom builder lets you pick a garment type (t-shirt, hoodie, thermal, tank, or hat), choose from 20+ original graphics, select front or back placement, pick your size and color, and preview your design in real time before ordering.</p>
      </div>

      <div class="faq-item">
        <h3>What is the Buy 2, Get 1 Free deal?</h3>
        <p>Hillbilly Fightwear offers a Buy 2, Get 1 Free promotion on t-shirts and tanks. Add 3 qualifying items to your cart and the cheapest one is automatically free.</p>
      </div>

      <div class="faq-item">
        <h3>What sizes does Hillbilly Fightwear carry?</h3>
        <p>T-shirts: S–XXXL. Hoodies: S–XXL. Women's tanks: S–XL. Youth sizes (YS, YM, YL) are available for kids' hoodies. Fitted hats: S/M and L/XL. Adjustable hats and beanies: one size fits all.</p>
      </div>

      <div class="faq-item">
        <h3>How are payments processed?</h3>
        <p>All payments are securely processed through <strong>Stripe</strong>, which is PCI DSS Level 1 certified — the highest security standard. We never store credit card information on our servers.</p>
      </div>

      <div class="faq-item">
        <h3>How do I contact Hillbilly Fightwear?</h3>
        <p>Email <a href="mailto:brian@hillbillyfightwear.com">brian@hillbillyfightwear.com</a> or use the <a href="/contact">contact form</a>. The team typically responds within 24 hours.</p>
      </div>
    </div>

    <p class="last-updated"><i class="fas fa-clock"></i> Last updated: April 2026</p>
  </main>

  <footer class="about-footer">
    <p>&copy; ${new Date().getFullYear()} Hillbilly Fightwear. All rights reserved.</p>
    <p style="margin-top:8px;">
      <a href="/">Home</a> &bull;
      <a href="/#shop">Shop</a> &bull;
      <a href="/build">Build Y'Own</a> &bull;
      <a href="/contact">Contact</a> &bull;
      <a href="/privacy-policy">Privacy Policy</a>
    </p>
  </footer>
</body>
</html>`)
})

// ============================================
// Catch-All Route - 404 handler for unmatched paths
// ============================================
pages.all('*', (c) => {
  const nonce = c.get('nonce')
  return c.html(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page Not Found - Hillbilly Fightwear</title><meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="/static/tailwind.css">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous">
<style nonce="${nonce}">body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;}.c{max-width:600px;margin:100px auto;padding:40px;text-align:center;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);}.icon{width:80px;height:80px;background:#8B0000;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 30px;font-size:2.5rem;color:#fff;}h1{font-size:2rem;margin:0 0 15px;}p{color:#666;margin:0 0 30px;line-height:1.6;}.btn{display:inline-block;padding:15px 40px;background:#8B0000;color:#fff;text-decoration:none;text-transform:uppercase;letter-spacing:2px;font-weight:600;border-radius:4px;transition:all 0.3s;margin:5px;}.btn:hover{background:#a00000;}.btn-o{background:transparent;color:#333;border:2px solid #333;}.btn-o:hover{background:#333;color:#fff;}</style>
</head><body><div class="c"><div class="icon"><i class="fas fa-map-signs"></i></div><h1>Page Not Found</h1><p>Sorry, the page you are looking for does not exist or has been moved.</p><a href="/" class="btn">Go Home</a><a href="/build" class="btn btn-o">Build Y'Own</a></div></body></html>`, 404)
})

export default pages
