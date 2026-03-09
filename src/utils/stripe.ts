// ============================================
// Stripe Integration Module
// Handles: product creation, price management, checkout sessions,
// webhook verification, and Stripe-native email receipts.
//
// ACTIVATION: Set STRIPE_SECRET_KEY as a Cloudflare secret.
// Once set, all checkout endpoints will use Stripe automatically.
// ============================================
import { shopProducts, garments, graphics } from '../data/catalog'
import {
  type PricingBreakdown,
  type BuilderPricing,
  type CartItem,
  calculateCartPricing,
  calculateBuilderPricing,
  roundCurrency,
  generateStripeCheckoutParams,
} from './pricing'
import { type OrderInfo } from './email-receipt'

const STRIPE_API = 'https://api.stripe.com/v1'

// ============================================
// TYPES
// ============================================

type StripeProduct = {
  id: string
  name: string
  metadata: Record<string, string>
  default_price?: string
}

type StripePrice = {
  id: string
  unit_amount: number
  currency: string
  product: string
}

type StripeSession = {
  id: string
  url?: string
  payment_intent?: string
  payment_status?: string
  customer_email?: string
  customer_details?: {
    email?: string
    name?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
    phone?: string
  }
  metadata?: Record<string, string>
  amount_total?: number
  error?: { message: string }
}

type StripeLineItem = {
  id: string
  description?: string
  amount_total: number
  quantity: number
  price?: {
    unit_amount: number
    product_data?: { name: string; description?: string }
  }
}

type StripeWebhookEvent = {
  id: string
  type: string
  data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stripe webhook data object
    object: any
  }
}

// ============================================
// STRIPE API HELPER
// ============================================

async function stripeRequest(
  method: string,
  endpoint: string,
  secretKey: string,
  body?: URLSearchParams | string,
): Promise<any> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${secretKey}`,
  }

  if (body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  const response = await fetch(`${STRIPE_API}${endpoint}`, {
    method,
    headers,
    ...(body ? { body: body.toString() } : {}),
  })

  return response.json()
}

// ============================================
// SHOP CHECKOUT (Cart → Stripe Checkout Session)
// ============================================

/**
 * Create a Stripe Checkout Session for the shop cart.
 * Applies promotions, validates pricing, and handles email receipts.
 */
export async function createShopCheckoutSession(
  secretKey: string,
  cartItems: CartItem[],
  origin: string,
): Promise<{ url?: string; error?: string; pricing?: PricingBreakdown }> {
  // Calculate server-side pricing with promotions
  const pricing = calculateCartPricing(cartItems)

  if (pricing.total <= 0 || pricing.total > 50000) {
    return { error: 'Invalid order total' }
  }

  // Build Stripe checkout params
  const params = generateStripeCheckoutParams(
    pricing,
    `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    `${origin}/#shop`,
  )

  // If there are discounts, we need to adjust line item prices
  // Stripe doesn't support negative line items, so we distribute
  // the discount proportionally across all items
  if (pricing.discount > 0) {
    // Clear existing line items and rebuild with discounted prices
    const adjustedParams = new URLSearchParams()
    adjustedParams.append('mode', 'payment')
    adjustedParams.append('success_url', `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`)
    adjustedParams.append('cancel_url', `${origin}/#shop`)
    adjustedParams.append('shipping_address_collection[allowed_countries][]', 'US')
    adjustedParams.append('phone_number_collection[enabled]', 'true')

    // Calculate discount ratio
    const discountRatio = pricing.discount / pricing.subtotal

    pricing.lineItems.forEach((item, i) => {
      const desc = [item.size, item.style, item.color].filter(Boolean).join(', ')
      const discountedUnitPrice = roundCurrency(item.unitPrice * (1 - discountRatio))
      
      adjustedParams.append(`line_items[${i}][price_data][currency]`, 'usd')
      adjustedParams.append(`line_items[${i}][price_data][product_data][name]`, item.title)
      if (desc) {
        adjustedParams.append(`line_items[${i}][price_data][product_data][description]`, desc)
      }
      adjustedParams.append(`line_items[${i}][price_data][unit_amount]`, String(Math.max(1, Math.round(discountedUnitPrice * 100))))
      adjustedParams.append(`line_items[${i}][quantity]`, String(item.qty))
    })

    // Copy metadata
    adjustedParams.append('metadata[order_source]', 'hillbilly-fightwear-shop')
    adjustedParams.append('metadata[subtotal]', pricing.subtotal.toFixed(2))
    adjustedParams.append('metadata[discount]', pricing.discount.toFixed(2))
    adjustedParams.append('metadata[promotions]', pricing.discountDetails.map(d => d.type).join(','))
    if (pricing.freeItems.length > 0) {
      adjustedParams.append('metadata[free_items]', pricing.freeItems.map(f => f.title).join(', '))
    }

      // Store full cart data in metadata so webhook can reconstruct the order
    adjustedParams.append('metadata[cart_json]', JSON.stringify(cartItems.map(item => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      size: item.size,
      color: item.color,
      style: item.style,
      qty: item.qty,
    }))))
    adjustedParams.append('metadata[pricing_json]', JSON.stringify({
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      total: pricing.total,
      discounts: pricing.discountDetails,
      freeItems: pricing.freeItems,
      lineItems: pricing.lineItems.map(li => ({
        title: li.title,
        unitPrice: li.unitPrice,
        qty: li.qty,
        subtotal: li.subtotal,
        size: li.size,
        color: li.color,
        style: li.style,
      })),
    }))

    const session = await stripeRequest('POST', '/checkout/sessions', secretKey, adjustedParams) as StripeSession

    if (session.error) {
      return { error: session.error.message }
    }

    return { url: session.url, pricing }
  }

  // Store cart data in metadata for webhook receipt generation (no-discount path)
  params.append('metadata[cart_json]', JSON.stringify(cartItems.map(item => ({
    productId: item.productId,
    title: item.title,
    price: item.price,
    size: item.size,
    color: item.color,
    style: item.style,
    qty: item.qty,
  }))))
  params.append('metadata[pricing_json]', JSON.stringify({
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    total: pricing.total,
    discounts: pricing.discountDetails,
    freeItems: pricing.freeItems,
    lineItems: pricing.lineItems.map(li => ({
      title: li.title,
      unitPrice: li.unitPrice,
      qty: li.qty,
      subtotal: li.subtotal,
      size: li.size,
      color: li.color,
      style: li.style,
    })),
  }))

  // No discounts — use standard params
  const session = await stripeRequest('POST', '/checkout/sessions', secretKey, params) as StripeSession

  if (session.error) {
    return { error: session.error.message }
  }

  return { url: session.url, pricing }
}

// ============================================
// BUILDER CHECKOUT (Custom Design → Stripe Checkout)
// ============================================

/**
 * Create a Stripe Checkout Session for a custom builder order.
 */
export async function createBuilderCheckoutSession(
  secretKey: string,
  order: { garment: string; size: string; color: string; graphic: string; placement: string; additionalGraphics: { graphic: string; placement: string }[] },
  origin: string,
): Promise<{ url?: string; error?: string; pricing?: BuilderPricing }> {
  const pricing = calculateBuilderPricing(order)

  if ('error' in pricing) {
    return { error: pricing.error }
  }

  const g = garments.find(x => x.id === order.garment)!
  const gr = graphics.find(x => x.id === order.graphic)!

  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`)
  params.append('cancel_url', `${origin}/build`)
  params.append('shipping_address_collection[allowed_countries][]', 'US')
  params.append('phone_number_collection[enabled]', 'true')

  // Single line item: garment with front logo + mandatory back HFW logo (all included in base price)
  params.append('line_items[0][price_data][currency]', 'usd')
  params.append('line_items[0][price_data][product_data][name]', `${g.name} - Custom Design`)
  params.append('line_items[0][price_data][product_data][description]', `Size: ${order.size}, Color: ${order.color} | Front: ${gr.name} | Back Neck: HFW Logo (3")`)
  params.append('line_items[0][price_data][unit_amount]', String(Math.round(g.basePrice * 100)))
  params.append('line_items[0][quantity]', '1')

  // Additional back graphics (+$15 each)
  pricing.additionalGraphics.forEach((ag, i) => {
    const idx = i + 1
    params.append(`line_items[${idx}][price_data][currency]`, 'usd')
    params.append(`line_items[${idx}][price_data][product_data][name]`, `+ Back Graphic: ${ag.name}`)
    params.append(`line_items[${idx}][price_data][product_data][description]`, `Placement: ${ag.placement}`)
    params.append(`line_items[${idx}][price_data][unit_amount]`, String(Math.round(ag.price * 100)))
    params.append(`line_items[${idx}][quantity]`, '1')
  })

  // Metadata for order tracking and receipt generation
  params.append('metadata[order_source]', 'hillbilly-fightwear-builder')
  params.append('metadata[garment]', order.garment)
  params.append('metadata[size]', order.size)
  params.append('metadata[color]', order.color)
  params.append('metadata[graphic]', order.graphic)
  params.append('metadata[placement]', order.placement)
  if (order.additionalGraphics.length > 0) {
    params.append('metadata[additional_graphics]', JSON.stringify(order.additionalGraphics))
  }
  // Store pricing data for receipt email generation
  params.append('metadata[pricing_json]', JSON.stringify({
    garmentName: pricing.garmentName,
    garmentPrice: pricing.garmentPrice,
    size: pricing.size,
    color: pricing.color,
    primaryGraphic: pricing.primaryGraphic,
    backHfwLogo: pricing.backHfwLogo,
    additionalGraphics: pricing.additionalGraphics,
    subtotal: pricing.subtotal,
    total: pricing.total,
  }))

  const session = await stripeRequest('POST', '/checkout/sessions', secretKey, params) as StripeSession

  if (session.error) {
    return { error: session.error.message }
  }

  return { url: session.url, pricing }
}

// ============================================
// STRIPE PRODUCT CATALOG SYNC
// Pushes all products + prices to Stripe
// ============================================

/**
 * Push entire product catalog to Stripe.
 * Creates products and prices, skipping existing ones.
 * Returns summary of created/skipped items.
 */
export async function syncProductCatalog(secretKey: string): Promise<{
  created: string[]
  updated: string[]
  skipped: string[]
  errors: string[]
}> {
  const created: string[] = []
  const updated: string[] = []
  const skipped: string[] = []
  const errors: string[] = []

  // First, fetch existing products to avoid duplicates
  const existingProducts = await stripeRequest('GET', '/products?limit=100&active=true', secretKey) as { data?: StripeProduct[] }
  const existingByMetaId = new Map<string, StripeProduct>()

  if (existingProducts.data) {
    for (const p of existingProducts.data) {
      if (p.metadata?.product_id) {
        existingByMetaId.set(p.metadata.product_id, p)
      }
    }
  }

  // Create or update each catalog product
  for (const product of shopProducts) {
    if (existingByMetaId.has(product.id)) {
      // Check if price needs updating
      const existingProduct = existingByMetaId.get(product.id)!
      const expectedAmountCents = Math.round(product.priceNum * 100)
      
      // Update the product's default price if it has changed
      try {
        // Create a new price for this product with the updated amount
        const newPriceParams = new URLSearchParams()
        newPriceParams.append('currency', 'usd')
        newPriceParams.append('unit_amount', String(expectedAmountCents))
        newPriceParams.append('product', existingProduct.id)
        
        const newPrice = await stripeRequest('POST', '/prices', secretKey, newPriceParams) as { id?: string; error?: { message: string } }
        
        if (newPrice.id) {
          // Set this as the default price
          const updateParams = new URLSearchParams()
          updateParams.append('default_price', newPrice.id)
          updateParams.append('name', product.title)  // Also update name in case it changed
          await stripeRequest('POST', `/products/${existingProduct.id}`, secretKey, updateParams)
          updated.push(`${product.title} (price updated to $${product.priceNum.toFixed(2)})`)
        } else {
          skipped.push(`${product.title} (already exists)`)
        }
      } catch (e) {
        skipped.push(`${product.title} (already exists, price update failed)`)
      }
      continue
    }

    try {
      const desc = [
        product.type === 'garment' ? 'Apparel' : 'Decal/Sticker',
        product.sizes ? `Sizes: ${product.sizes.join(', ')}` : '',
        product.colors ? `Colors: ${product.colors.join(', ')}` : '',
      ].filter(Boolean).join(' | ')

      const params = new URLSearchParams()
      params.append('name', product.title)
      params.append('description', desc || `${product.vendor} - ${product.title}`)
      params.append('metadata[product_id]', product.id)
      params.append('metadata[type]', product.type)
      params.append('metadata[vendor]', product.vendor)
      if (product.garmentType) params.append('metadata[garment_type]', product.garmentType)

      // Set default price
      params.append('default_price_data[currency]', 'usd')
      params.append('default_price_data[unit_amount]', String(Math.round(product.priceNum * 100)))

      // Add image if it's an absolute URL
      if (product.image.startsWith('http')) {
        params.append('images[]', product.image)
      }

      const result = await stripeRequest('POST', '/products', secretKey, params) as StripeProduct & { error?: { message: string } }

      if (result.error) {
        errors.push(`${product.title}: ${result.error.message}`)
      } else {
        created.push(product.title)
      }
    } catch (e) {
      errors.push(`${product.title}: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  return { created, updated, skipped, errors }
}

// ============================================
// WEBHOOK: Retrieve session details for receipt generation
// ============================================

/**
 * Retrieve a completed checkout session to generate receipt data.
 * Called after successful payment to get customer details.
 */
export async function getSessionForReceipt(
  secretKey: string,
  sessionId: string,
): Promise<{ orderInfo: OrderInfo; session: StripeSession; pricing: PricingBreakdown | null } | { error: string }> {
  const session = await stripeRequest(
    'GET',
    `/checkout/sessions/${sessionId}?expand[]=customer_details`,
    secretKey,
  ) as StripeSession

  if (session.error) {
    return { error: session.error.message }
  }

  const orderInfo: OrderInfo = {
    orderId: session.id.replace('cs_', 'HFW-').substring(0, 20).toUpperCase(),
    orderDate: new Date().toISOString(),
    customerEmail: session.customer_details?.email || session.customer_email || '',
    customerName: session.customer_details?.name || undefined,
    shippingAddress: session.customer_details?.address ? {
      line1: session.customer_details.address.line1 || '',
      line2: session.customer_details.address.line2 || undefined,
      city: session.customer_details.address.city || '',
      state: session.customer_details.address.state || '',
      postalCode: session.customer_details.address.postal_code || '',
      country: session.customer_details.address.country || 'US',
    } : undefined,
  }

  // Reconstruct pricing from metadata if available
  let pricing: PricingBreakdown | null = null
  if (session.metadata?.cart_json) {
    try {
      const cartItems = JSON.parse(session.metadata.cart_json) as CartItem[]
      pricing = calculateCartPricing(cartItems)
    } catch { /* cart_json parse failed, try pricing_json */ }
  }
  if (!pricing && session.metadata?.pricing_json) {
    try {
      const pData = JSON.parse(session.metadata.pricing_json)
      pricing = {
        subtotal: pData.subtotal || 0,
        discount: pData.discount || 0,
        discountDetails: pData.discounts || [],
        shipping: 0,
        tax: 0,
        total: pData.total || (session.amount_total ? session.amount_total / 100 : 0),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stripe metadata is parsed JSON
        lineItems: (pData.lineItems || []).map((li: any) => ({
          productId: li.productId || '',
          title: li.title || 'Item',
          unitPrice: li.unitPrice || 0,
          qty: li.qty || 1,
          subtotal: li.subtotal || 0,
          size: li.size,
          color: li.color,
          style: li.style,
        })),
        freeItems: pData.freeItems || [],
      }
    } catch { /* pricing_json parse failed */ }
  }

  // Fallback: if no metadata pricing, retrieve line items from Stripe
  if (!pricing) {
    const lineItemsResponse = await stripeRequest(
      'GET',
      `/checkout/sessions/${sessionId}/line_items?limit=100`,
      secretKey,
    ) as { data?: StripeLineItem[] }

    if (lineItemsResponse.data && lineItemsResponse.data.length > 0) {
      const total = session.amount_total ? session.amount_total / 100 : 0
      const lineItems = lineItemsResponse.data.map(li => ({
        productId: '',
        title: li.description || 'Item',
        unitPrice: li.price?.unit_amount ? li.price.unit_amount / 100 : li.amount_total / 100 / (li.quantity || 1),
        qty: li.quantity || 1,
        subtotal: li.amount_total / 100,
      }))
      pricing = {
        subtotal: total,
        discount: 0,
        discountDetails: [],
        shipping: 0,
        tax: 0,
        total,
        lineItems,
        freeItems: [],
      }
    }
  }

  return { orderInfo, session, pricing }
}

// ============================================
// GENERATE ORDER ID
// ============================================

/**
 * Generate a unique order ID (HFW-YYYYMMDD-XXXXX format)
 */
export function generateOrderId(): string {
  const now = new Date()
  const date = now.toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `HFW-${date}-${random}`
}
