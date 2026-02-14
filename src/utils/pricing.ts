// ============================================
// Pricing Engine - Single source of truth for all price calculations
// Used by: API routes, Stripe integration, email receipts
// ============================================
import { garments, graphics, placements, shopProducts, type ShopProduct } from '../data/catalog'

// ============================================
// PRICING CONSTANTS
// ============================================
export const PRICING = {
  // Graphic placement pricing (custom builder)
  GRAPHIC_SMALL_PLACEMENT: 10.00,   // Left chest, right chest, hat front
  GRAPHIC_FULL_PLACEMENT: 15.00,    // Full front, full back

  // Shipping: FREE on all orders (included in product price)
  SHIPPING_FLAT: 0.00,

  // Tax rate: 0% — the client should set their own tax rate in Stripe
  // Stripe handles tax calculation via Stripe Tax or manual setup
  TAX_RATE: 0.00,

  // Promotions
  PROMO_TSHIRT_TANK_BUY2_GET1: true,       // Buy 2 T-Shirts/Tanks, Get 1 FREE
  PROMO_STICKER_BUNDLE_5_FOR_29: true,      // 5 Stickers for $29
  PROMO_HAT_HOODIE_FREE_STICKER: true,      // Free sticker with hat/hoodie purchase

  // Cart limits
  MAX_ITEMS_PER_PRODUCT: 100,
  MAX_CART_ITEMS: 50,
  MAX_ORDER_TOTAL: 50000.00,
  MIN_ORDER_TOTAL: 0.01,
} as const

// ============================================
// TYPES
// ============================================

export type CartItem = {
  productId: string
  title: string
  price: number          // unit price in dollars
  image: string
  size: string
  color: string
  style: string
  qty: number
  type?: 'garment' | 'decal'
  garmentType?: string
}

export type BuilderOrder = {
  garment: string
  size: string
  color: string
  graphic: string
  placement: string
  additionalGraphics: { graphic: string; placement: string }[]
}

export type PricingBreakdown = {
  subtotal: number         // Sum of all items before discounts
  discount: number         // Total discount amount
  discountDetails: DiscountDetail[]  // Itemized discounts
  shipping: number         // Shipping cost
  tax: number              // Tax amount
  total: number            // Final total
  lineItems: LineItem[]    // Itemized line items with unit prices
  freeItems: FreeItem[]    // Free items added by promotions
}

export type LineItem = {
  productId: string
  title: string
  unitPrice: number
  qty: number
  subtotal: number
  size?: string
  color?: string
  style?: string
  type?: string
}

export type DiscountDetail = {
  type: string
  description: string
  amount: number
}

export type FreeItem = {
  title: string
  reason: string
}

export type BuilderPricing = {
  garmentName: string
  garmentPrice: number
  size: string
  color: string
  primaryGraphic: { name: string; placement: string; price: number }
  additionalGraphics: { name: string; placement: string; price: number }[]
  subtotal: number
  total: number
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/** Round to 2 decimal places (currency-safe) */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}

/** Get the graphic price based on placement type */
export function getGraphicPrice(placementId: string): number {
  const p = placements.find(x => x.id === placementId)
  return (p && p.isSmall) ? PRICING.GRAPHIC_SMALL_PLACEMENT : PRICING.GRAPHIC_FULL_PLACEMENT
}

/** Look up a shop product by ID with server-side pricing */
export function getProductById(productId: string): ShopProduct | undefined {
  return shopProducts.find(p => p.id === productId)
}

/** Determine if a product is a T-shirt or Tank (for buy 2 get 1 promo) */
function isTshirtOrTank(item: CartItem): boolean {
  const gt = item.garmentType || ''
  return gt === 'tshirt' || gt === 'tank-womens' || gt === 'tank-mens'
}

/** Determine if a product is a decal/sticker */
function isDecal(item: CartItem): boolean {
  return item.type === 'decal' || item.productId.startsWith('d')
}

/** Determine if a product is a hat or hoodie (for free sticker promo) */
function isHatOrHoodie(item: CartItem): boolean {
  const gt = item.garmentType || ''
  return gt === 'hoodie' || gt === 'trucker-hat' || gt === 'beanie' ||
    item.productId.startsWith('h') ||
    item.title.toLowerCase().includes('hoodie')
}

// ============================================
// CART PRICING CALCULATOR
// ============================================

/**
 * Calculate complete pricing breakdown for a shopping cart.
 * Enforces server-side catalog prices and applies promotions.
 */
export function calculateCartPricing(cartItems: CartItem[]): PricingBreakdown {
  const lineItems: LineItem[] = []
  const discountDetails: DiscountDetail[] = []
  const freeItems: FreeItem[] = []
  let subtotal = 0
  let discount = 0

  // Step 1: Validate and build line items with server-side prices
  for (const item of cartItems) {
    // Enforce catalog price (ignore client-submitted price)
    const catalogProduct = getProductById(item.productId)
    const serverPrice = catalogProduct ? catalogProduct.priceNum : item.price

    const itemSubtotal = roundCurrency(serverPrice * item.qty)
    subtotal += itemSubtotal

    lineItems.push({
      productId: item.productId,
      title: item.title,
      unitPrice: serverPrice,
      qty: item.qty,
      subtotal: itemSubtotal,
      size: item.size || undefined,
      color: item.color || undefined,
      style: item.style || undefined,
      type: item.type || (item.productId.startsWith('d') ? 'decal' : 'garment'),
    })
  }

  // Step 2: Apply promotions

  // PROMO 1: Buy 2 T-Shirts/Tanks, Get 1 FREE
  if (PRICING.PROMO_TSHIRT_TANK_BUY2_GET1) {
    const tshirtTankItems = cartItems.filter(i => isTshirtOrTank(i))
    const totalTshirtTankQty = tshirtTankItems.reduce((sum, i) => sum + i.qty, 0)
    const freeCount = Math.floor(totalTshirtTankQty / 3) // For every 3, 1 is free

    if (freeCount > 0) {
      // Find the cheapest T-shirt/tank items to make free
      const expandedPrices: number[] = []
      for (const item of tshirtTankItems) {
        const catalogProduct = getProductById(item.productId)
        const price = catalogProduct ? catalogProduct.priceNum : item.price
        for (let i = 0; i < item.qty; i++) {
          expandedPrices.push(price)
        }
      }
      expandedPrices.sort((a, b) => a - b) // cheapest first
      
      let freeDiscount = 0
      for (let i = 0; i < freeCount && i < expandedPrices.length; i++) {
        freeDiscount += expandedPrices[i]
      }

      if (freeDiscount > 0) {
        discount += freeDiscount
        discountDetails.push({
          type: 'BUY2_GET1_TSHIRT',
          description: `Buy 2, Get 1 FREE (T-Shirts & Tanks) - ${freeCount} free item${freeCount > 1 ? 's' : ''}`,
          amount: roundCurrency(freeDiscount),
        })
      }
    }
  }

  // PROMO 2: 5 Stickers for $29
  if (PRICING.PROMO_STICKER_BUNDLE_5_FOR_29) {
    const decalItems = cartItems.filter(i => isDecal(i))
    const totalDecalQty = decalItems.reduce((sum, i) => sum + i.qty, 0)
    const bundleCount = Math.floor(totalDecalQty / 5)

    if (bundleCount > 0) {
      // Calculate what the decals would cost at regular price
      const expandedDecalPrices: number[] = []
      for (const item of decalItems) {
        const catalogProduct = getProductById(item.productId)
        const price = catalogProduct ? catalogProduct.priceNum : item.price
        for (let i = 0; i < item.qty; i++) {
          expandedDecalPrices.push(price)
        }
      }
      expandedDecalPrices.sort((a, b) => b - a) // most expensive first

      // For each bundle of 5, replace regular price with $29
      const bundledQty = bundleCount * 5
      let regularPriceForBundled = 0
      for (let i = 0; i < bundledQty && i < expandedDecalPrices.length; i++) {
        regularPriceForBundled += expandedDecalPrices[i]
      }
      const bundlePrice = bundleCount * 29
      const bundleDiscount = regularPriceForBundled - bundlePrice

      if (bundleDiscount > 0) {
        discount += bundleDiscount
        discountDetails.push({
          type: 'STICKER_BUNDLE_5_FOR_29',
          description: `Sticker Bundle (5 for $29) - ${bundleCount} bundle${bundleCount > 1 ? 's' : ''}`,
          amount: roundCurrency(bundleDiscount),
        })
      }
    }
  }

  // PROMO 3: Free sticker with hat or hoodie purchase
  if (PRICING.PROMO_HAT_HOODIE_FREE_STICKER) {
    const hatHoodieItems = cartItems.filter(i => isHatOrHoodie(i))
    const totalHatHoodieQty = hatHoodieItems.reduce((sum, i) => sum + i.qty, 0)

    if (totalHatHoodieQty > 0) {
      freeItems.push({
        title: `Free Sticker${totalHatHoodieQty > 1 ? 's' : ''} (${totalHatHoodieQty})`,
        reason: `Complimentary sticker with each hat & hoodie purchase`,
      })
    }
  }

  // Step 3: Calculate totals
  subtotal = roundCurrency(subtotal)
  discount = roundCurrency(discount)
  const afterDiscount = roundCurrency(subtotal - discount)
  const shipping = PRICING.SHIPPING_FLAT
  const tax = roundCurrency(afterDiscount * PRICING.TAX_RATE)
  const total = roundCurrency(afterDiscount + shipping + tax)

  return {
    subtotal,
    discount,
    discountDetails,
    shipping,
    tax,
    total,
    lineItems,
    freeItems,
  }
}

// ============================================
// BUILDER PRICING CALCULATOR
// ============================================

/**
 * Calculate pricing for the custom garment builder.
 * Returns full breakdown including garment base price and graphic costs.
 */
export function calculateBuilderPricing(order: BuilderOrder): BuilderPricing | { error: string } {
  const g = garments.find(x => x.id === order.garment)
  if (!g) return { error: 'Invalid garment' }

  const gr = graphics.find(x => x.id === order.graphic)
  if (!gr) return { error: 'Invalid graphic' }

  const pl = placements.find(x => x.id === order.placement)
  if (!pl) return { error: 'Invalid placement' }

  // Validate size
  if (!g.sizes.includes(order.size)) return { error: 'Invalid size for this garment' }

  // Validate color
  if (!(g.images as Record<string, any>)[order.color]) return { error: 'Invalid color for this garment' }

  // Validate graphic restrictions
  if (gr.restrictToGarments?.length > 0 && !gr.restrictToGarments.includes(order.garment)) {
    return { error: `Graphic "${gr.name}" is not available for this garment` }
  }

  const primaryPrice = getGraphicPrice(order.placement)

  const additionalGraphicDetails = order.additionalGraphics.map(ag => {
    const agGraphic = graphics.find(x => x.id === ag.graphic)
    const agPlacement = placements.find(x => x.id === ag.placement)
    const price = getGraphicPrice(ag.placement)
    return {
      name: agGraphic?.name || ag.graphic,
      placement: agPlacement?.name || ag.placement,
      price,
    }
  })

  const additionalCost = additionalGraphicDetails.reduce((sum, ag) => sum + ag.price, 0)
  const subtotal = g.basePrice + primaryPrice + additionalCost
  const total = roundCurrency(subtotal)

  return {
    garmentName: g.name,
    garmentPrice: g.basePrice,
    size: order.size,
    color: order.color,
    primaryGraphic: {
      name: gr.name,
      placement: pl.name,
      price: primaryPrice,
    },
    additionalGraphics: additionalGraphicDetails,
    subtotal: total,
    total,
  }
}

// ============================================
// CART VALIDATION
// ============================================

export type ValidationResult = { valid: true } | { valid: false; error: string }

/**
 * Validate cart items for checkout.
 * Checks: non-empty, valid quantities, valid products, price matches, limits.
 */
export function validateCart(cartItems: any[]): ValidationResult {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return { valid: false, error: 'Cart is empty' }
  }

  if (cartItems.length > PRICING.MAX_CART_ITEMS) {
    return { valid: false, error: `Too many items in cart (max ${PRICING.MAX_CART_ITEMS})` }
  }

  for (const item of cartItems) {
    if (!item.title || typeof item.title !== 'string') {
      return { valid: false, error: 'Invalid cart item: missing title' }
    }
    if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0) {
      return { valid: false, error: `Invalid price for "${item.title}"` }
    }
    if (typeof item.qty !== 'number' || !Number.isInteger(item.qty) || item.qty < 1) {
      return { valid: false, error: `Invalid quantity for "${item.title}"` }
    }
    if (item.qty > PRICING.MAX_ITEMS_PER_PRODUCT) {
      return { valid: false, error: `Maximum quantity per item is ${PRICING.MAX_ITEMS_PER_PRODUCT}` }
    }

    // Validate against catalog price
    if (item.productId) {
      const catalogItem = getProductById(item.productId)
      if (catalogItem && Math.abs(catalogItem.priceNum - item.price) > 0.01) {
        return {
          valid: false,
          error: `Price mismatch for "${item.title}". Expected $${catalogItem.priceNum.toFixed(2)}, got $${item.price.toFixed(2)}`,
        }
      }
    }
  }

  return { valid: true }
}

// ============================================
// STRIPE PRODUCT/PRICE GENERATION
// ============================================

/**
 * Generate Stripe-compatible line items from a pricing breakdown.
 * Each line item includes product_data with name, description, and unit_amount in cents.
 */
export function generateStripeLineItems(pricing: PricingBreakdown): Array<{
  price_data: {
    currency: string
    product_data: { name: string; description?: string }
    unit_amount: number
  }
  quantity: number
}> {
  const stripeItems = pricing.lineItems.map(item => {
    const desc = [item.size, item.style, item.color].filter(Boolean).join(', ')
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          ...(desc ? { description: desc } : {}),
        },
        unit_amount: Math.round(item.unitPrice * 100), // cents
      },
      quantity: item.qty,
    }
  })

  // Add discount as a negative line item (or coupon)
  // Stripe doesn't support negative line items, so we'll use a discount coupon approach
  // For now, we'll adjust the last item or add it as metadata

  return stripeItems
}

/**
 * Generate Stripe checkout params for the entire cart including discounts.
 * Returns URLSearchParams ready for the Stripe API.
 */
export function generateStripeCheckoutParams(
  pricing: PricingBreakdown,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string
): URLSearchParams {
  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', successUrl)
  params.append('cancel_url', cancelUrl)
  params.append('shipping_address_collection[allowed_countries][]', 'US')
  params.append('phone_number_collection[enabled]', 'true')

  if (customerEmail) {
    params.append('customer_email', customerEmail)
  }

  // Add line items
  pricing.lineItems.forEach((item, i) => {
    const desc = [item.size, item.style, item.color].filter(Boolean).join(', ')
    params.append(`line_items[${i}][price_data][currency]`, 'usd')
    params.append(`line_items[${i}][price_data][product_data][name]`, item.title)
    if (desc) {
      params.append(`line_items[${i}][price_data][product_data][description]`, desc)
    }
    params.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.unitPrice * 100)))
    params.append(`line_items[${i}][quantity]`, String(item.qty))
  })

  // Note: Discount handling is done in stripe.ts createShopCheckoutSession()
  // by distributing discounts proportionally across line item prices.

  // Add order metadata
  params.append('metadata[order_source]', 'hillbilly-fightwear-shop')
  params.append('metadata[subtotal]', pricing.subtotal.toFixed(2))
  params.append('metadata[discount]', pricing.discount.toFixed(2))
  params.append('metadata[shipping]', pricing.shipping.toFixed(2))

  if (pricing.discountDetails.length > 0) {
    params.append('metadata[promotions]', pricing.discountDetails.map(d => d.type).join(','))
  }

  if (pricing.freeItems.length > 0) {
    params.append('metadata[free_items]', pricing.freeItems.map(f => f.title).join(', '))
  }

  return params
}

/**
 * Generate Stripe product catalog data for bulk creation.
 * Used when pushing products to Stripe.
 */
export function generateStripeProductCatalog(): Array<{
  name: string
  description: string
  metadata: Record<string, string>
  default_price_data: {
    currency: string
    unit_amount: number
  }
  images?: string[]
}> {
  return shopProducts.map(product => {
    const desc = [
      product.type === 'garment' ? 'Apparel' : 'Decal/Sticker',
      product.sizes ? `Sizes: ${product.sizes.join(', ')}` : '',
      product.colors ? `Colors: ${product.colors.join(', ')}` : '',
    ].filter(Boolean).join(' | ')

    return {
      name: product.title,
      description: desc || `${product.vendor} - ${product.title}`,
      metadata: {
        product_id: product.id,
        type: product.type,
        vendor: product.vendor,
        ...(product.garmentType ? { garment_type: product.garmentType } : {}),
      },
      default_price_data: {
        currency: 'usd',
        unit_amount: Math.round(product.priceNum * 100),
      },
      ...(product.image.startsWith('http') ? { images: [product.image] } : {}),
    }
  })
}
