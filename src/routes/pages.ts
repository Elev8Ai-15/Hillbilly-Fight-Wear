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

// Robots.txt
pages.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://hillbillyfightwear.com/sitemap.xml`)
})

pages.get('/checkout/success', (c) => {
  const nonce = c.get('nonce')
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed - Hillbilly Fightwear</title>
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
  <title>Contact Us - Hillbilly Fightwear</title>
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
// Catch-All Route - 404 handler for unmatched paths
// ============================================
pages.all('*', (c) => {
  const nonce = c.get('nonce')
  return c.html(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page Not Found - Hillbilly Fightwear</title>
<link rel="stylesheet" href="/static/tailwind.css">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" integrity="sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0" crossorigin="anonymous">
<style nonce="${nonce}">body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;}.c{max-width:600px;margin:100px auto;padding:40px;text-align:center;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);}.icon{width:80px;height:80px;background:#8B0000;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 30px;font-size:2.5rem;color:#fff;}h1{font-size:2rem;margin:0 0 15px;}p{color:#666;margin:0 0 30px;line-height:1.6;}.btn{display:inline-block;padding:15px 40px;background:#8B0000;color:#fff;text-decoration:none;text-transform:uppercase;letter-spacing:2px;font-weight:600;border-radius:4px;transition:all 0.3s;margin:5px;}.btn:hover{background:#a00000;}.btn-o{background:transparent;color:#333;border:2px solid #333;}.btn-o:hover{background:#333;color:#fff;}</style>
</head><body><div class="c"><div class="icon"><i class="fas fa-map-signs"></i></div><h1>Page Not Found</h1><p>Sorry, the page you are looking for does not exist or has been moved.</p><a href="/" class="btn">Go Home</a><a href="/build" class="btn btn-o">Build Y'Own</a></div></body></html>`, 404)
})

export default pages
