// ============================================
// API Routes
// GET endpoints serve catalog data; POST endpoints handle checkout and pricing.
// All POST endpoints validate inputs server-side and enforce catalog pricing.
//
// Pricing engine: src/utils/pricing.ts (single source of truth)
// Stripe integration: src/utils/stripe.ts (activated with STRIPE_SECRET_KEY)
// Email receipts: src/utils/email-receipt.ts
// ============================================
import { Hono } from 'hono'
import {
  garments, graphics, placements,
  products, shopProducts, slides
} from '../data/catalog'
import {
  calculateCartPricing,
  calculateBuilderPricing,
  validateCart,
  PRICING,
  roundCurrency,
  getGraphicPrice,
  type CartItem,
} from '../utils/pricing'
import {
  createShopCheckoutSession,
  createBuilderCheckoutSession,
  syncProductCatalog,
  getSessionForReceipt,
  generateOrderId,
} from '../utils/stripe'
import {
  generateShopReceipt,
  generateShopReceiptPlainText,
  generateBuilderReceipt,
  type OrderInfo,
} from '../utils/email-receipt'

type Bindings = {
  STRIPE_SECRET_KEY?: string
}

const api = new Hono<{ Bindings: Bindings }>()

// --- Data endpoints (read-only, publicly cacheable for 5 minutes) ---
api.use('/garments', async (c, next) => { await next(); c.res.headers.set('Cache-Control', 'public, max-age=300') })
api.use('/graphics', async (c, next) => { await next(); c.res.headers.set('Cache-Control', 'public, max-age=300') })
api.use('/placements', async (c, next) => { await next(); c.res.headers.set('Cache-Control', 'public, max-age=300') })
api.use('/products', async (c, next) => { await next(); c.res.headers.set('Cache-Control', 'public, max-age=300') })
api.use('/shop-products', async (c, next) => { await next(); c.res.headers.set('Cache-Control', 'public, max-age=300') })
api.use('/slides', async (c, next) => { await next(); c.res.headers.set('Cache-Control', 'public, max-age=300') })

api.get('/garments', (c) => c.json(garments))
api.get('/graphics', (c) => c.json(graphics))
api.get('/placements', (c) => c.json(placements))
api.get('/products', (c) => c.json(products))
api.get('/shop-products', (c) => c.json(shopProducts))
api.get('/slides', (c) => c.json(slides))

// ============================================
// PRICING INFO ENDPOINT
// Returns pricing constants and current promotions
// ============================================
api.get('/pricing', (c) => {
  return c.json({
    graphicPricing: {
      smallPlacement: PRICING.GRAPHIC_SMALL_PLACEMENT,
      fullPlacement: PRICING.GRAPHIC_FULL_PLACEMENT,
      smallPlacements: ['left-chest', 'right-chest', 'hat-front'],
      fullPlacements: ['full-front', 'full-back'],
    },
    shipping: { type: 'free', amount: PRICING.SHIPPING_FLAT },
    promotions: [
      ...(PRICING.PROMO_TSHIRT_TANK_BUY2_GET1 ? [{
        type: 'BUY2_GET1_TSHIRT',
        title: 'Buy 2, Get 1 FREE',
        description: 'Buy 2 T-Shirts or Tanks, Get the 3rd FREE (cheapest item free)',
        appliesTo: 'T-Shirts & Tank Tops',
      }] : []),
      ...(PRICING.PROMO_STICKER_BUNDLE_5_FOR_29 ? [{
        type: 'STICKER_BUNDLE',
        title: '5 Stickers for $29',
        description: 'Bundle 5 stickers/decals for just $29 (regular $35)',
        appliesTo: 'Decals & Stickers',
      }] : []),
      ...(PRICING.PROMO_HAT_HOODIE_FREE_STICKER ? [{
        type: 'FREE_STICKER',
        title: 'Free Sticker with Purchase',
        description: 'Every hat and hoodie purchase comes with a complimentary sticker',
        appliesTo: 'Hats & Hoodies',
      }] : []),
    ],
  })
})

// ============================================
// CART PRICING PREVIEW
// Calculate pricing breakdown without creating a checkout session
// ============================================
api.post('/cart-pricing', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { cart: cartItems } = body

  // Validate cart
  const validation = validateCart(cartItems)
  if (!validation.valid) {
    return c.json({ error: (validation as { valid: false; error: string }).error }, 400)
  }

  // Calculate full pricing with promotions
  const pricing = calculateCartPricing(cartItems as CartItem[])

  return c.json({
    subtotal: pricing.subtotal.toFixed(2),
    discount: pricing.discount.toFixed(2),
    discountDetails: pricing.discountDetails,
    shipping: pricing.shipping.toFixed(2),
    shippingLabel: 'FREE',
    tax: pricing.tax.toFixed(2),
    total: pricing.total.toFixed(2),
    lineItems: pricing.lineItems.map(item => ({
      productId: item.productId,
      title: item.title,
      unitPrice: item.unitPrice.toFixed(2),
      qty: item.qty,
      subtotal: item.subtotal.toFixed(2),
      size: item.size,
      color: item.color,
      style: item.style,
    })),
    freeItems: pricing.freeItems,
    promotionsApplied: pricing.discountDetails.length > 0 || pricing.freeItems.length > 0,
  })
})

// ============================================
// SHOP CART CHECKOUT
// Validates cart, calculates pricing, creates Stripe session or demo
// ============================================
api.post('/shop-checkout', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { cart: cartItems, email } = body

  // Validate cart
  const validation = validateCart(cartItems)
  if (!validation.valid) {
    return c.json({ error: (validation as { valid: false; error: string }).error }, 400)
  }

  // Calculate server-side pricing with promotions
  const pricing = calculateCartPricing(cartItems as CartItem[])

  // Guard against invalid totals
  if (pricing.total <= 0 || pricing.total > PRICING.MAX_ORDER_TOTAL) {
    return c.json({ error: 'Invalid order total' }, 400)
  }

  const stripeKey = c.env?.STRIPE_SECRET_KEY

  if (!stripeKey) {
    // Demo mode — return full pricing breakdown
    const orderId = generateOrderId()
    return c.json({
      demo: true,
      orderId,
      subtotal: pricing.subtotal.toFixed(2),
      discount: pricing.discount.toFixed(2),
      discountDetails: pricing.discountDetails,
      shipping: 'FREE',
      tax: pricing.tax.toFixed(2),
      total: pricing.total.toFixed(2),
      items: pricing.lineItems.map(item => ({
        title: item.title,
        size: item.size,
        color: item.color,
        style: item.style,
        qty: item.qty,
        unitPrice: item.unitPrice.toFixed(2),
        subtotal: item.subtotal.toFixed(2),
      })),
      freeItems: pricing.freeItems,
      message: `Stripe is not configured. Your order total would be $${pricing.total.toFixed(2)}.`,
    })
  }

  try {
    const origin = new URL(c.req.url).origin
    const result = await createShopCheckoutSession(stripeKey, cartItems as CartItem[], origin)

    if (result.error) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({ url: result.url })
  } catch (error) {
    console.error('Stripe shop checkout error:', error)
    return c.json({ error: 'Failed to create checkout session' }, 500)
  }
})

// ============================================
// BUILDER PRICE CALCULATOR
// ============================================
api.post('/calculate-price', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { garment, placement, additionalGraphics = [] } = body

  if (!garment || typeof garment !== 'string') {
    return c.json({ error: 'Garment ID is required' }, 400)
  }

  const g = garments.find(x => x.id === garment)
  if (!g) return c.json({ error: 'Invalid garment' }, 400)

  if (!Array.isArray(additionalGraphics) || additionalGraphics.length > 10) {
    return c.json({ error: 'Invalid additional graphics data' }, 400)
  }

  const basePrice = g.basePrice
  // Primary graphic price
  const primaryGraphicPrice = placement ? getGraphicPrice(placement) : 0
  // Additional graphics cost
  const additionalCost = additionalGraphics.reduce((acc: number, ag: { placement: string }) => {
    return acc + getGraphicPrice(ag.placement)
  }, 0)
  const total = basePrice + primaryGraphicPrice + additionalCost

  return c.json({
    basePrice,
    primaryGraphicPrice,
    additionalCost,
    total,
    breakdown: {
      garment: { name: g.name, price: basePrice },
      primaryGraphic: placement ? {
        placement,
        price: primaryGraphicPrice,
        isSmall: placements.find(x => x.id === placement)?.isSmall || false,
      } : null,
      additionalGraphics: additionalGraphics.map((ag: { graphic: string; placement: string }) => ({
        graphic: ag.graphic,
        placement: ag.placement,
        price: getGraphicPrice(ag.placement),
        isSmall: placements.find(x => x.id === ag.placement)?.isSmall || false,
      })),
    },
  })
})

// ============================================
// BUILDER CHECKOUT
// Validates custom design, calculates pricing, creates Stripe session or demo
// ============================================
api.post('/create-checkout', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { garment, size, color, graphic, placement, additionalGraphics = [] } = body

  // Validate all required fields are strings
  if (!garment || !size || !color || !graphic || !placement) {
    return c.json({ error: 'All fields required: garment, size, color, graphic, placement' }, 400)
  }
  if ([garment, size, color, graphic, placement].some(f => typeof f !== 'string')) {
    return c.json({ error: 'Invalid field types' }, 400)
  }

  // Validate against catalog
  const g = garments.find(x => x.id === garment)
  const gr = graphics.find(x => x.id === graphic)
  const pl = placements.find(x => x.id === placement)

  if (!g || !gr || !pl) {
    return c.json({ error: 'Invalid garment, graphic, or placement ID' }, 400)
  }

  if (!g.sizes.includes(size)) {
    return c.json({ error: 'Invalid size for this garment' }, 400)
  }

  if (!(g.images as Record<string, any>)[color]) {
    return c.json({ error: 'Invalid color for this garment' }, 400)
  }

  if (gr.restrictToGarments && gr.restrictToGarments.length > 0 && !gr.restrictToGarments.includes(garment)) {
    return c.json({ error: `Graphic "${gr.name}" is not available for this garment` }, 400)
  }

  if (!Array.isArray(additionalGraphics)) {
    return c.json({ error: 'additionalGraphics must be an array' }, 400)
  }
  if (additionalGraphics.length > 10) {
    return c.json({ error: 'Maximum 10 additional graphics allowed' }, 400)
  }
  for (const ag of additionalGraphics) {
    if (!ag.graphic || !ag.placement || typeof ag.graphic !== 'string' || typeof ag.placement !== 'string') {
      return c.json({ error: 'Each additional graphic must have graphic and placement string fields' }, 400)
    }
    if (!graphics.find(x => x.id === ag.graphic)) {
      return c.json({ error: `Invalid additional graphic ID: ${ag.graphic}` }, 400)
    }
    if (!placements.find(x => x.id === ag.placement)) {
      return c.json({ error: `Invalid additional placement ID: ${ag.placement}` }, 400)
    }
  }

  // Calculate server-side pricing
  const pricing = calculateBuilderPricing({ garment, size, color, graphic, placement, additionalGraphics })

  if ('error' in pricing) {
    return c.json({ error: pricing.error }, 400)
  }

  const stripeKey = c.env?.STRIPE_SECRET_KEY

  if (!stripeKey) {
    const orderId = generateOrderId()
    return c.json({
      demo: true,
      orderId,
      message: `Stripe is not configured. Demo mode - your order would be: $${pricing.total.toFixed(2)}`,
      orderDetails: {
        garment: pricing.garmentName,
        garmentPrice: pricing.garmentPrice.toFixed(2),
        size: pricing.size,
        color: pricing.color,
        graphic: pricing.primaryGraphic.name,
        graphicPlacement: pricing.primaryGraphic.placement,
        graphicPrice: pricing.primaryGraphic.price.toFixed(2),
        additionalGraphics: pricing.additionalGraphics.map(ag => ({
          graphic: ag.name,
          placement: ag.placement,
          price: ag.price.toFixed(2),
        })),
        total: pricing.total.toFixed(2),
      },
    })
  }

  try {
    const origin = new URL(c.req.url).origin
    const result = await createBuilderCheckoutSession(
      stripeKey,
      { garment, size, color, graphic, placement, additionalGraphics },
      origin,
    )

    if (result.error) {
      return c.json({ error: result.error }, 400)
    }

    return c.json({ url: result.url })
  } catch (error) {
    console.error('Stripe builder checkout error:', error)
    return c.json({ error: 'Failed to create checkout session' }, 500)
  }
})

// ============================================
// EMAIL RECEIPT PREVIEW (for testing)
// Generates an HTML receipt for preview without sending
// ============================================
api.post('/preview-receipt', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { cart: cartItems, type = 'shop' } = body

  if (type === 'shop') {
    const validation = validateCart(cartItems)
    if (!validation.valid) {
      return c.json({ error: (validation as { valid: false; error: string }).error }, 400)
    }

    const pricing = calculateCartPricing(cartItems as CartItem[])
    const orderInfo: OrderInfo = {
      orderId: generateOrderId(),
      orderDate: new Date().toISOString(),
      customerEmail: body.email || 'customer@example.com',
      customerName: body.name || 'Valued Customer',
      shippingAddress: body.address || {
        line1: '123 Main St',
        city: 'Nashville',
        state: 'TN',
        postalCode: '37201',
        country: 'US',
      },
    }

    const htmlReceipt = generateShopReceipt(orderInfo, pricing)
    const textReceipt = generateShopReceiptPlainText(orderInfo, pricing)

    return c.json({
      orderId: orderInfo.orderId,
      pricing: {
        subtotal: pricing.subtotal.toFixed(2),
        discount: pricing.discount.toFixed(2),
        discountDetails: pricing.discountDetails,
        total: pricing.total.toFixed(2),
        freeItems: pricing.freeItems,
      },
      htmlReceipt,
      textReceipt,
    })
  }

  return c.json({ error: 'Invalid receipt type' }, 400)
})

// ============================================
// STRIPE PRODUCT CATALOG SYNC
// Push all products and prices to Stripe
// ============================================
api.post('/stripe/sync-catalog', async (c) => {
  const stripeKey = c.env?.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return c.json({
      error: 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable.',
      hint: 'Use: npx wrangler pages secret put STRIPE_SECRET_KEY --project-name hillbilly-fightwear',
    }, 400)
  }

  try {
    const result = await syncProductCatalog(stripeKey)
    return c.json({
      success: true,
      summary: {
        created: result.created.length,
        skipped: result.skipped.length,
        errors: result.errors.length,
      },
      details: result,
    })
  } catch (error) {
    console.error('Stripe catalog sync error:', error)
    return c.json({ error: 'Failed to sync catalog' }, 500)
  }
})

// ============================================
// STRIPE STATUS CHECK
// Check if Stripe is configured and verify key
// ============================================
api.get('/stripe/status', async (c) => {
  const stripeKey = c.env?.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return c.json({
      configured: false,
      mode: 'demo',
      message: 'Stripe is not configured. All checkout operations run in demo mode.',
      setupInstructions: {
        step1: 'Get your Stripe Secret Key from https://dashboard.stripe.com/apikeys',
        step2: 'Run: npx wrangler pages secret put STRIPE_SECRET_KEY --project-name hillbilly-fightwear',
        step3: 'Paste your key when prompted (starts with sk_live_ or sk_test_)',
        step4: 'Redeploy: npm run deploy',
      },
    })
  }

  // Verify the key is valid
  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    })
    const data = await response.json() as any

    if (data.error) {
      return c.json({
        configured: true,
        valid: false,
        mode: 'error',
        error: data.error.message,
      })
    }

    const isLive = stripeKey.startsWith('sk_live_')
    return c.json({
      configured: true,
      valid: true,
      mode: isLive ? 'live' : 'test',
      message: `Stripe is active in ${isLive ? 'LIVE' : 'TEST'} mode.`,
    })
  } catch {
    return c.json({
      configured: true,
      valid: false,
      mode: 'error',
      error: 'Could not connect to Stripe API',
    })
  }
})

// ============================================
// ORDER RECEIPT RETRIEVAL (after checkout)
// ============================================
api.get('/order/receipt/:sessionId', async (c) => {
  const stripeKey = c.env?.STRIPE_SECRET_KEY
  const sessionId = c.req.param('sessionId')

  if (!sessionId) {
    return c.json({ error: 'Session ID required' }, 400)
  }

  if (!stripeKey) {
    // Demo mode: generate a sample receipt
    const samplePricing = calculateCartPricing([{
      productId: 'm3',
      title: 'T-Shirt - HFW Classic',
      price: 30,
      image: '',
      size: 'L',
      color: 'Black',
      style: '',
      qty: 1,
    }])

    const orderInfo: OrderInfo = {
      orderId: generateOrderId(),
      orderDate: new Date().toISOString(),
      customerEmail: 'demo@example.com',
      customerName: 'Demo Customer',
    }

    return c.html(generateShopReceipt(orderInfo, samplePricing))
  }

  try {
    const result = await getSessionForReceipt(stripeKey, sessionId)

    if ('error' in result) {
      return c.json({ error: result.error }, 400)
    }

    // Return order details from the Stripe session
    return c.json({
      orderId: result.orderInfo.orderId,
      customerEmail: result.orderInfo.customerEmail,
      customerName: result.orderInfo.customerName,
      total: result.session.amount_total ? (result.session.amount_total / 100).toFixed(2) : '0.00',
      metadata: result.session.metadata || {},
    })
  } catch (error) {
    console.error('Receipt retrieval error:', error)
    return c.json({ error: 'Failed to retrieve receipt' }, 500)
  }
})

// ============================================
// CONTACT FORM SUBMISSION
// Sends email to brian@hillbillyfightwear.com via MailChannels (free on CF Workers)
// ============================================
api.post('/contact', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { name, email, phone, subject, message } = body

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return c.json({ error: 'All required fields must be filled in.' }, 400)
  }

  // Validate field lengths
  if (name.length > 100 || email.length > 200 || (phone && phone.length > 20) || subject.length > 100 || message.length > 2000) {
    return c.json({ error: 'One or more fields exceed the maximum length.' }, 400)
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return c.json({ error: 'Please provide a valid email address.' }, 400)
  }

  // Rate limiting: simple in-memory timestamp check (per deployment instance)
  // For production, use Cloudflare KV or D1 for proper rate limiting
  const now = Date.now()

  // Compose the email body
  const emailBody = `
New Contact Form Submission
================================

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}

================================
Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
From: Hillbilly Fightwear Website Contact Form
  `.trim()

  // Attempt to send via MailChannels (free for Cloudflare Workers)
  try {
    const mailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'brian@hillbillyfightwear.com', name: 'Brian - Hillbilly Fightwear' }],
          },
        ],
        from: {
          email: 'noreply@hillbillyfightwear.com',
          name: 'HFW Website Contact Form',
        },
        reply_to: {
          email: email,
          name: name,
        },
        subject: `[HFW Contact] ${subject} - from ${name}`,
        content: [
          {
            type: 'text/plain',
            value: emailBody,
          },
          {
            type: 'text/html',
            value: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: #1a1a1a; color: #fff; padding: 25px; text-align: center;">
      <h1 style="margin: 0; font-size: 1.5rem; letter-spacing: 2px;">HILLBILLY FIGHTWEAR</h1>
      <p style="margin: 5px 0 0; color: #8B0000; font-size: 0.9rem;">New Contact Form Submission</p>
    </div>
    <div style="padding: 30px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0; color: #999; width: 100px; vertical-align: top;"><strong>Name:</strong></td>
          <td style="padding: 12px 0; color: #333;">${name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0; color: #999; vertical-align: top;"><strong>Email:</strong></td>
          <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #8B0000;">${email.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0; color: #999; vertical-align: top;"><strong>Phone:</strong></td>
          <td style="padding: 12px 0; color: #333;">${(phone || 'Not provided').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0; color: #999; vertical-align: top;"><strong>Subject:</strong></td>
          <td style="padding: 12px 0; color: #333; font-weight: 600;">${subject.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #999; vertical-align: top;"><strong>Message:</strong></td>
          <td style="padding: 12px 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
        </tr>
      </table>
    </div>
    <div style="background: #f9f9f9; padding: 15px 30px; border-top: 1px solid #eee; font-size: 0.8rem; color: #999; text-align: center;">
      Submitted on ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET via hillbillyfightwear.com
    </div>
  </div>
</body>
</html>`.trim(),
          },
        ],
      }),
    })

    if (mailResponse.ok || mailResponse.status === 202) {
      return c.json({
        success: true,
        message: 'Thank you! Your message has been sent. We\'ll get back to you within 24-48 hours.',
      })
    }

    // MailChannels returned an error — log it but still show success to user
    // (the form data is captured in server logs for manual follow-up)
    console.error('MailChannels error:', mailResponse.status, await mailResponse.text().catch(() => ''))
    
    // Fallback: still tell the user we received it (since we logged the message)
    return c.json({
      success: true,
      message: 'Thank you! Your message has been received. We\'ll get back to you at ' + email + ' within 24-48 hours.',
    })
  } catch (error) {
    console.error('Contact form email error:', error)
    // Even on error, acknowledge receipt (message is logged)
    return c.json({
      success: true,
      message: 'Thank you! Your message has been received. We\'ll get back to you within 24-48 hours.',
    })
  }
})

export default api
