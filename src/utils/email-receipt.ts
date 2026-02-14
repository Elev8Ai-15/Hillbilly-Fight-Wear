// ============================================
// Email Receipt Generator
// Generates HTML email receipts for order confirmations.
// Designed to work with any email API (Stripe receipts, SendGrid, etc.)
// ============================================
import { type PricingBreakdown, type BuilderPricing } from './pricing'

// ============================================
// TYPES
// ============================================

export type OrderInfo = {
  orderId: string
  orderDate: string              // ISO date string
  customerEmail: string
  customerName?: string
  orderTotal?: string            // e.g. "45.00" — used in owner notification subject
  orderSource?: string           // 'shop' | 'builder' — source of the order
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

// ============================================
// HTML EMAIL TEMPLATE GENERATOR
// ============================================

/**
 * Generate a professional HTML email receipt for shop orders.
 * Compatible with most email clients (table-based layout, inline styles).
 */
export function generateShopReceipt(
  orderInfo: OrderInfo,
  pricing: PricingBreakdown,
): string {
  const orderDate = new Date(orderInfo.orderDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const lineItemsHtml = pricing.lineItems.map(item => {
    const details = [item.size, item.style, item.color].filter(Boolean).join(', ')
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
          <strong>${escHtml(item.title)}</strong>
          ${details ? `<br><span style="color: #666; font-size: 12px;">${escHtml(details)}</span>` : ''}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; font-size: 14px; color: #333;">${item.qty}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; color: #333;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #333;">$${item.subtotal.toFixed(2)}</td>
      </tr>`
  }).join('')

  const discountsHtml = pricing.discountDetails.length > 0 ? pricing.discountDetails.map(d => `
      <tr>
        <td colspan="3" style="padding: 8px 0; font-size: 14px; color: #28a745;">
          <i>&#10003;</i> ${escHtml(d.description)}
        </td>
        <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 600; color: #28a745;">-$${d.amount.toFixed(2)}</td>
      </tr>`).join('') : ''

  const freeItemsHtml = pricing.freeItems.length > 0 ? pricing.freeItems.map(f => `
      <tr>
        <td colspan="4" style="padding: 8px 0; font-size: 13px; color: #28a745;">
          &#127873; <strong>${escHtml(f.title)}</strong> - ${escHtml(f.reason)}
        </td>
      </tr>`).join('') : ''

  const shippingHtml = orderInfo.shippingAddress ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
      <tr>
        <td style="padding: 16px; background: #f8f8f8; border-radius: 6px;">
          <strong style="font-size: 14px; color: #333; display: block; margin-bottom: 8px;">Shipping Address</strong>
          <span style="font-size: 13px; color: #555; line-height: 1.6;">
            ${orderInfo.customerName ? escHtml(orderInfo.customerName) + '<br>' : ''}
            ${escHtml(orderInfo.shippingAddress.line1)}<br>
            ${orderInfo.shippingAddress.line2 ? escHtml(orderInfo.shippingAddress.line2) + '<br>' : ''}
            ${escHtml(orderInfo.shippingAddress.city)}, ${escHtml(orderInfo.shippingAddress.state)} ${escHtml(orderInfo.shippingAddress.postalCode)}<br>
            ${escHtml(orderInfo.shippingAddress.country)}
          </span>
        </td>
      </tr>
    </table>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Hillbilly Fightwear</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B0000 0%, #4a0000 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0 0 8px; font-size: 24px; color: #ffffff; font-weight: 700; letter-spacing: 2px;">HILLBILLY FIGHTWEAR</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8); letter-spacing: 1px;">ORDER CONFIRMATION</p>
            </td>
          </tr>

          <!-- Thank You Message -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #333;">Thank you for your order!</h2>
              <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                ${orderInfo.customerName ? `Hi ${escHtml(orderInfo.customerName)}, ` : ''}We've received your order and are getting it ready. You'll receive a shipping notification once your order is on its way.
              </p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f8f8; border-radius: 6px; padding: 16px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px;">Order Number</td>
                        <td style="text-align: right; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px;">Order Date</td>
                      </tr>
                      <tr>
                        <td style="font-size: 16px; color: #333; font-weight: 700;">${escHtml(orderInfo.orderId)}</td>
                        <td style="text-align: right; font-size: 14px; color: #333;">${orderDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Line Items -->
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr style="border-bottom: 2px solid #333;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 1px;">Item</td>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 1px; text-align: center;">Qty</td>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Price</td>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Total</td>
                </tr>
                ${lineItemsHtml}
                ${discountsHtml}
                ${freeItemsHtml}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f8f8; border-radius: 6px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #555;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #555;">$${pricing.subtotal.toFixed(2)}</td>
                      </tr>
                      ${pricing.discount > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #28a745;">Discount</td>
                        <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #28a745; font-weight: 600;">-$${pricing.discount.toFixed(2)}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #28a745;">
                          &#128666; Shipping
                        </td>
                        <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #28a745; font-weight: 600;">FREE</td>
                      </tr>
                      ${pricing.tax > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #555;">Tax</td>
                        <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #555;">$${pricing.tax.toFixed(2)}</td>
                      </tr>` : ''}
                      <tr>
                        <td colspan="2" style="padding: 8px 0 0;"><hr style="border: none; border-top: 2px solid #8B0000;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 18px; font-weight: 700; color: #333;">TOTAL</td>
                        <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: 700; color: #8B0000;">$${pricing.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${shippingHtml ? `<tr><td style="padding: 0 32px 24px;">${shippingHtml}</td></tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #1a1a1a; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #fff; font-weight: 600; letter-spacing: 1px;">HILLBILLY FIGHTWEAR</p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #888;">Official MMA & Combat Sports Apparel</p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://hillbillyfightwear.com" style="color: #8B0000; font-size: 12px; text-decoration: none;">Shop</a>
                  </td>
                  <td style="padding: 0 8px; color: #444;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="https://hillbilly-fightwear.pages.dev/build" style="color: #8B0000; font-size: 12px; text-decoration: none;">Build Y'Own</a>
                  </td>
                  <td style="padding: 0 8px; color: #444;">|</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:brian@hillbillyfightwear.com" style="color: #8B0000; font-size: 12px; text-decoration: none;">Contact</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; font-size: 11px; color: #555;">
                Questions about your order? Reply to this email or contact brian@hillbillyfightwear.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Generate a plain text email receipt (fallback for email clients that don't render HTML).
 */
export function generateShopReceiptPlainText(
  orderInfo: OrderInfo,
  pricing: PricingBreakdown,
): string {
  const orderDate = new Date(orderInfo.orderDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  let text = `HILLBILLY FIGHTWEAR - ORDER CONFIRMATION\n`
  text += `${'='.repeat(50)}\n\n`

  if (orderInfo.customerName) {
    text += `Hi ${orderInfo.customerName},\n\n`
  }

  text += `Thank you for your order! We've received it and are getting it ready.\n\n`

  text += `Order Number: ${orderInfo.orderId}\n`
  text += `Order Date: ${orderDate}\n\n`

  text += `ITEMS:\n`
  text += `${'-'.repeat(50)}\n`

  for (const item of pricing.lineItems) {
    const details = [item.size, item.style, item.color].filter(Boolean).join(', ')
    text += `${item.title}${details ? ` (${details})` : ''}\n`
    text += `  ${item.qty} x $${item.unitPrice.toFixed(2)} = $${item.subtotal.toFixed(2)}\n`
  }

  if (pricing.discountDetails.length > 0) {
    text += `\nDISCOUNTS:\n`
    for (const d of pricing.discountDetails) {
      text += `  ${d.description}: -$${d.amount.toFixed(2)}\n`
    }
  }

  if (pricing.freeItems.length > 0) {
    text += `\nFREE ITEMS:\n`
    for (const f of pricing.freeItems) {
      text += `  ${f.title} - ${f.reason}\n`
    }
  }

  text += `\n${'-'.repeat(50)}\n`
  text += `Subtotal:  $${pricing.subtotal.toFixed(2)}\n`
  if (pricing.discount > 0) text += `Discount:  -$${pricing.discount.toFixed(2)}\n`
  text += `Shipping:  FREE\n`
  if (pricing.tax > 0) text += `Tax:       $${pricing.tax.toFixed(2)}\n`
  text += `TOTAL:     $${pricing.total.toFixed(2)}\n`

  if (orderInfo.shippingAddress) {
    text += `\nSHIPPING ADDRESS:\n`
    if (orderInfo.customerName) text += `${orderInfo.customerName}\n`
    text += `${orderInfo.shippingAddress.line1}\n`
    if (orderInfo.shippingAddress.line2) text += `${orderInfo.shippingAddress.line2}\n`
    text += `${orderInfo.shippingAddress.city}, ${orderInfo.shippingAddress.state} ${orderInfo.shippingAddress.postalCode}\n`
    text += `${orderInfo.shippingAddress.country}\n`
  }

  text += `\n${'='.repeat(50)}\n`
  text += `Questions? Contact brian@hillbillyfightwear.com\n`
  text += `Visit: https://hillbillyfightwear.com\n`

  return text
}

/**
 * Generate HTML receipt for the Custom Builder orders.
 */
export function generateBuilderReceipt(
  orderInfo: OrderInfo,
  builderPricing: BuilderPricing,
): string {
  const orderDate = new Date(orderInfo.orderDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const additionalGraphicsHtml = builderPricing.additionalGraphics.map(ag => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
        + ${escHtml(ag.name)} <span style="color: #666; font-size: 12px;">(${escHtml(ag.placement)})</span>
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #333;">$${ag.price.toFixed(2)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Order Confirmation - Hillbilly Fightwear</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B0000 0%, #4a0000 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0 0 8px; font-size: 24px; color: #ffffff; font-weight: 700; letter-spacing: 2px;">HILLBILLY FIGHTWEAR</h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8); letter-spacing: 1px;">CUSTOM ORDER CONFIRMATION</p>
            </td>
          </tr>

          <!-- Thank You -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #333;">Your custom design is on its way!</h2>
              <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                ${orderInfo.customerName ? `Hi ${escHtml(orderInfo.customerName)}, ` : ''}Your custom-designed apparel has been ordered. We'll start creating it right away.
              </p>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f8f8; border-radius: 6px; padding: 16px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 12px; color: #888; text-transform: uppercase;">Order Number</td>
                        <td style="text-align: right; font-size: 12px; color: #888; text-transform: uppercase;">Date</td>
                      </tr>
                      <tr>
                        <td style="font-size: 16px; color: #333; font-weight: 700;">${escHtml(orderInfo.orderId)}</td>
                        <td style="text-align: right; font-size: 14px; color: #333;">${orderDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Custom Design Details -->
          <tr>
            <td style="padding: 24px 32px;">
              <h3 style="margin: 0 0 16px; font-size: 16px; color: #8B0000; text-transform: uppercase; letter-spacing: 1px;">Your Custom Design</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
                    <strong>${escHtml(builderPricing.garmentName)}</strong>
                    <br><span style="color: #666; font-size: 12px;">Size: ${escHtml(builderPricing.size)} | Color: ${escHtml(builderPricing.color)}</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #333;">$${builderPricing.garmentPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
                    ${escHtml(builderPricing.primaryGraphic.name)}
                    <br><span style="color: #666; font-size: 12px;">${escHtml(builderPricing.primaryGraphic.placement)}</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #333;">$${builderPricing.primaryGraphic.price.toFixed(2)}</td>
                </tr>
                ${additionalGraphicsHtml}
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f8f8; border-radius: 6px;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 14px; color: #28a745;">Shipping</td>
                        <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #28a745; font-weight: 600;">FREE</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0 0;"><hr style="border: none; border-top: 2px solid #8B0000;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 18px; font-weight: 700; color: #333;">TOTAL</td>
                        <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: 700; color: #8B0000;">$${builderPricing.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #1a1a1a; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #fff; font-weight: 600; letter-spacing: 1px;">HILLBILLY FIGHTWEAR</p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #888;">Official MMA & Combat Sports Apparel</p>
              <p style="margin: 0; font-size: 11px; color: #555;">
                Questions? Contact brian@hillbillyfightwear.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ============================================
// HELPER: HTML escape for email content
// ============================================
function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
