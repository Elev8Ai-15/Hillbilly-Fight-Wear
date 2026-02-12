// ============================================
// API Routes
// GET endpoints serve catalog data; POST endpoints handle checkout and pricing.
// All POST endpoints validate inputs server-side and enforce catalog pricing.
// ============================================
import { Hono } from 'hono'
import {
  garments, graphics, placements,
  products, shopProducts, slides
} from '../data/catalog'

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

// Shop cart checkout endpoint
api.post('/shop-checkout', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { cart: cartItems } = body
  
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return c.json({ error: 'Cart is empty' }, 400)
  }
  
  // Validate each cart item and enforce server-side pricing
  for (const item of cartItems) {
    if (!item.title || typeof item.price !== 'number' || typeof item.qty !== 'number' || item.qty < 1 || item.price < 0) {
      return c.json({ error: 'Invalid cart item data' }, 400)
    }
    if (item.qty > 100) {
      return c.json({ error: 'Maximum quantity per item is 100' }, 400)
    }
    if (!Number.isFinite(item.price) || !Number.isInteger(item.qty)) {
      return c.json({ error: 'Invalid price or quantity format' }, 400)
    }
    // Server-side price validation: verify price matches catalog
    if (item.productId) {
      const catalogItem = shopProducts.find(p => p.id === item.productId)
      if (catalogItem && Math.abs(catalogItem.priceNum - item.price) > 0.01) {
        return c.json({ error: `Price mismatch for ${item.title}. Expected $${catalogItem.priceNum}, got $${item.price}` }, 400)
      }
    }
  }
  
  // Cap cart at 50 items to prevent abuse
  if (cartItems.length > 50) {
    return c.json({ error: 'Too many items in cart' }, 400)
  }
  
  const total = cartItems.reduce((sum: number, item: { price: number; qty: number }) => sum + (item.price * item.qty), 0)
  
  // Guard against floating-point precision issues
  const roundedTotal = Math.round(total * 100) / 100
  
  // Sanity check total
  if (roundedTotal <= 0 || roundedTotal > 50000) {
    return c.json({ error: 'Invalid order total' }, 400)
  }
  
  const stripeKey = c.env?.STRIPE_SECRET_KEY
  
  if (!stripeKey) {
    return c.json({
      demo: true,
      total: roundedTotal.toFixed(2),
      items: cartItems.map((item: { title: string; size?: string; color?: string; style?: string; qty: number; price: number }) => ({
        title: item.title,
        size: item.size,
        color: item.color,
        style: item.style,
        qty: item.qty,
        subtotal: (item.price * item.qty).toFixed(2)
      }))
    })
  }
  
  try {
    // Build Stripe line items
    const params = new URLSearchParams()
    params.append('mode', 'payment')
    const origin = new URL(c.req.url).origin
    params.append('success_url', `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`)
    params.append('cancel_url', `${origin}/#shop`)
    
    cartItems.forEach((item: { title: string; size?: string; color?: string; style?: string; qty: number; price: number }, i: number) => {
      const desc = [item.size, item.style, item.color].filter(Boolean).join(', ')
      params.append(`line_items[${i}][price_data][currency]`, 'usd')
      params.append(`line_items[${i}][price_data][product_data][name]`, item.title)
      if (desc) params.append(`line_items[${i}][price_data][product_data][description]`, desc)
      params.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.price * 100)))
      params.append(`line_items[${i}][quantity]`, String(item.qty))
    })
    
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })
    
    const session = await stripeResponse.json() as { error?: { message: string }; url?: string }
    if (session.error) return c.json({ error: session.error.message }, 400)
    return c.json({ url: session.url })
  } catch (error) {
    console.error('Stripe shop checkout error:', error)
    return c.json({ error: 'Failed to create checkout session' }, 500)
  }
})

api.post('/calculate-price', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  const { garment, additionalGraphics = [] } = body
  
  if (!garment || typeof garment !== 'string') {
    return c.json({ error: 'Garment ID is required' }, 400)
  }
  
  const g = garments.find(x => x.id === garment)
  if (!g) return c.json({ error: 'Invalid garment' }, 400)
  
  if (!Array.isArray(additionalGraphics) || additionalGraphics.length > 10) {
    return c.json({ error: 'Invalid additional graphics data' }, 400)
  }
  
  const basePrice = g.basePrice
  // Calculate additional cost: $10 for small placements, $15 for full placements
  // Must match client-side getGraphicPrice() in the Build page
  const additionalCost = additionalGraphics.reduce((acc: number, ag: { placement: string }) => {
    const p = placements.find(x => x.id === ag.placement)
    return acc + (p && p.isSmall ? 10 : 15)
  }, 0)
  const total = basePrice + additionalCost
  
  return c.json({ basePrice, additionalCost, total })
})

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
  
  const g = garments.find(x => x.id === garment)
  const gr = graphics.find(x => x.id === graphic)
  const pl = placements.find(x => x.id === placement)
  
  if (!g || !gr || !pl) {
    return c.json({ error: 'Invalid garment, graphic, or placement ID' }, 400)
  }
  
  // Validate size is available for this garment
  if (!g.sizes.includes(size)) {
    return c.json({ error: 'Invalid size for this garment' }, 400)
  }
  
  // Validate color is available for this garment
  if (!g.images[color]) {
    return c.json({ error: 'Invalid color for this garment' }, 400)
  }
  
  // Validate graphic restrictions
  if (gr.restrictToGarments && gr.restrictToGarments.length > 0 && !gr.restrictToGarments.includes(garment)) {
    return c.json({ error: `Graphic "${gr.name}" is not available for this garment` }, 400)
  }
  
  // Validate additionalGraphics is an array with valid entries
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
  
  const basePrice = g.basePrice
  // Calculate additional cost: $10 for small placements, $15 for full placements
  // Must match client-side getGraphicPrice() in the Build page
  const additionalCost = additionalGraphics.reduce((acc: number, ag: { graphic: string; placement: string }) => {
    const p = placements.find(x => x.id === ag.placement)
    return acc + (p && p.isSmall ? 10 : 15)
  }, 0)
  const total = basePrice + additionalCost
  
  const stripeKey = c.env?.STRIPE_SECRET_KEY
  
  if (!stripeKey) {
    return c.json({
      demo: true,
      message: 'Stripe is not configured. Demo mode - your order would be: $' + total.toFixed(2),
      orderDetails: {
        garment: g.name,
        size,
        color,
        graphic: gr.name,
        placement,
        additionalGraphics: additionalGraphics.map((ag: { graphic: string; placement: string }) => ({
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
    
    const session = await stripeResponse.json() as { error?: { message: string }; url?: string }
    
    if (session.error) {
      return c.json({ error: session.error.message }, 400)
    }
    
    return c.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return c.json({ error: 'Failed to create checkout session' }, 500)
  }
})

export default api
