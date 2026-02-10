import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  STRIPE_SECRET_KEY?: string
  STRIPE_PUBLISHABLE_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// SECURITY: Comprehensive Security Headers
// (X-Frame-Options removed to allow iframe embedding for previews;
//  Cross-Origin policies relaxed for sandbox/preview compatibility)
// ============================================
app.use('*', async (c, next) => {
  await next()
  // Set security headers manually for full control
  c.res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https://api.stripe.com https://cdn.shopify.com; frame-src 'self' https://js.stripe.com; frame-ancestors *; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests")
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
app.use('/api/*', cors({
  origin: ['https://hillbillyfightwear.com', 'https://www.hillbillyfightwear.com'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true
}))

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
      white: { front: '/images/garments/tshirt-white-front.png', back: '/images/garments/tshirt-white-back.png' },
      black: { front: '/images/garments/tshirt-black-front.png', back: '/images/garments/tshirt-black-back.png' },
      grey: { front: '/images/garments/tshirt-grey-front.png', back: '/images/garments/tshirt-grey-back.png' }
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
      white: { front: '/images/garments/sweatshirt-white-front.png', back: '/images/garments/sweatshirt-white-back.png' },
      black: { front: '/images/garments/sweatshirt-black-front.png', back: '/images/garments/sweatshirt-black-back.png' },
      grey: { front: '/images/garments/sweatshirt-grey-front.png', back: '/images/garments/sweatshirt-grey-back.png' }
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
      white: { front: '/images/garments/hoodie-white-front.png', back: '/images/garments/hoodie-white-back.png' },
      black: { front: '/images/garments/hoodie-black-front.png', back: '/images/garments/hoodie-black-back.png' },
      grey: { front: '/images/garments/hoodie-grey-front.png', back: '/images/garments/hoodie-grey-back.png' }
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
      white: { front: '/images/garments/tank-mens-white-front.png', back: '/images/garments/tank-mens-white-back.png' },
      black: { front: '/images/garments/tank-mens-black-front.png', back: '/images/garments/tank-mens-black-back.png' },
      grey: { front: '/images/garments/tank-mens-grey-front.png', back: '/images/garments/tank-mens-grey-back.png' }
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
      white: { front: '/images/garments/tank-womens-white-front.png', back: '/images/garments/tank-womens-white-back.png' },
      black: { front: '/images/garments/tank-womens-black-front.png', back: '/images/garments/tank-womens-black-back.png' },
      grey: { front: '/images/garments/tank-womens-grey-front.png', back: '/images/garments/tank-womens-grey-back.png' }
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
      white: { front: '/images/garments/trucker-hat-white.png' },
      black: { front: '/images/garments/trucker-hat-black.png' },
      grey: { front: '/images/garments/trucker-hat-grey.png' }
    }
  },
  {
    id: 'beanie',
    name: 'Beanie',
    basePrice: 22.00,
    category: 'headwear',
    sizes: ['One Size'],
    supportsPlacement: true,
    images: {
      white: { front: '/images/garments/beanie-white.png' },
      black: { front: '/images/garments/beanie-black.png' },
      grey: { front: '/images/garments/beanie-grey.png' }
    }
  }
]

// Graphics with optional restrictions for specific garments
// restrictToGarments: array of garment IDs this graphic is available for (empty = all)
const graphics = [
  // HILLBILLY FIGHTWEAR LOGOS
  {
    id: 'hfw-black-shadow',
    name: 'HFW Black Shadow',
    thumbnail: '/images/graphics/hfw-logo-black-shadow.png?v=11',
    fullImage: '/images/graphics/hfw-logo-black-shadow.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'hfw-white-outline',
    name: 'HFW White Outline',
    thumbnail: '/images/graphics/hfw-logo-white-outline.png?v=11',
    fullImage: '/images/graphics/hfw-logo-white-outline.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'hfw-logo',
    name: 'HFW Logo',
    thumbnail: '/images/graphics/hfw-logo-original.png?v=11',
    fullImage: '/images/graphics/hfw-logo-original.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'human-cockfighter',
    name: 'Human Cockfighter',
    thumbnail: '/images/stickers/sticker-hcf.png?v=12',
    fullImage: '/images/stickers/sticker-hcf.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'thump-a-stranger',
    name: 'Thump A Stranger',
    thumbnail: '/images/stickers/sticker-thump.png?v=12',
    fullImage: '/images/stickers/sticker-thump.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'gpg-design',
    name: 'GPG Design',
    thumbnail: '/images/graphics/gpg-design.png?v=11',
    fullImage: '/images/graphics/gpg-design.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'yycf-logo',
    name: 'YYCF Logo',
    thumbnail: '/images/graphics/yycf-logo.png?v=11',
    fullImage: '/images/graphics/yycf-logo.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'fun-logo',
    name: 'FUN Logo',
    thumbnail: '/images/stickers/sticker-fun-ride.png?v=12',
    fullImage: '/images/stickers/sticker-fun-ride.png?v=12',
    restrictToGarments: []
  },
  // NEW GRAPHICS - Added from Shop Now products
  {
    id: 'myob',
    name: 'MYOB (Mind Y\'own Business)',
    thumbnail: '/images/stickers/sticker-myob.png?v=12',
    fullImage: '/images/stickers/sticker-myob.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'gnf',
    name: 'GNF',
    thumbnail: '/images/stickers/sticker-gnf.png?v=12',
    fullImage: '/images/stickers/sticker-gnf.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'wimb',
    name: 'WIMB (What\'s It Mean To You?)',
    thumbnail: '/images/stickers/sticker-hfw.png?v=12',
    fullImage: '/images/stickers/sticker-hfw.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'cling-to-guns',
    name: 'Cling to Guns',
    thumbnail: '/images/stickers/sticker-your-neck.png?v=12',
    fullImage: '/images/stickers/sticker-your-neck.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'yes-you-can',
    name: 'Yes, You Can',
    thumbnail: '/images/stickers/sticker-yes-you-can.png?v=12',
    fullImage: '/images/stickers/sticker-yes-you-can.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'put-it-on-em',
    name: 'Put It On Em',
    thumbnail: '/images/stickers/sticker-put-it-on-em.png?v=12',
    fullImage: '/images/stickers/sticker-put-it-on-em.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'obama-tap',
    name: 'Obama Tap',
    thumbnail: '/images/stickers/sticker-obama-tap.png?v=12',
    fullImage: '/images/stickers/sticker-obama-tap.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'good-for-community',
    name: 'Good for Community',
    thumbnail: '/images/stickers/sticker-community.png?v=12',
    fullImage: '/images/stickers/sticker-community.png?v=12',
    restrictToGarments: []
  },
  {
    id: 'hard-hittin',
    name: 'Hard Hittin\'',
    thumbnail: '/images/graphics/hard-hittin.png?v=11',
    fullImage: '/images/graphics/hard-hittin.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'staunch-chm',
    name: 'Staunch Properties (CHM)',
    thumbnail: '/images/stickers/sticker-cunt.png?v=12',
    fullImage: '/images/stickers/sticker-cunt.png?v=12',
    restrictToGarments: []
  },
  // SPECIAL: Thumpin' Is Lovin' - Women's Only (Tanks and T-Shirts)
  {
    id: 'thumpin-is-lovin',
    name: 'Thumpin\' Is Lovin\'',
    thumbnail: '/images/stickers/sticker-thumpin-is-lovin.png?v=12',
    fullImage: '/images/stickers/sticker-thumpin-is-lovin.png?v=12',
    restrictToGarments: ['tank-womens', 'tshirt']  // Women's tanks and unisex t-shirts
  }
]

const placements = [
  { id: 'full-front', name: 'Full Front', isSmall: false, forHats: false },
  { id: 'full-back', name: 'Full Back', isSmall: false, forHats: false },
  { id: 'left-chest', name: 'Left Chest', isSmall: true, forHats: false },
  { id: 'right-chest', name: 'Right Chest', isSmall: true, forHats: false },
  { id: 'hat-front', name: 'Hat Front', isSmall: true, forHats: true }
]

// Shop products organized by category from hillbillyfightwear.com (external links)
// MENS CLOTHING - T-Shirts and Hoodies
const mensClothing = [
  { id: 1, title: 'MYOB Hoodie', vendor: 'Hillbilly Fightwear', price: '$50.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/Screenshot2025-12-05at1.50.03PM_6c519925-dfd5-4982-b8c8-c01f4c572668.png?v=1764960913', url: 'https://hillbillyfightwear.com/products/myob-hoodie' },
  { id: 2, title: 'Thump a Stranger Hoodie', vendor: 'Hillbilly Fightwear', price: '$50.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/Screenshot2025-12-05at1.39.09PM.png?v=1764959976', url: 'https://hillbillyfightwear.com/products/thump-a-stranger-hoodie' },
  { id: 3, title: 'T-Shirt - HFW Classic', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/hfwf.png?v=1541520222', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-1' },
  { id: 4, title: 'T-Shirt - YYCF', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/yycf.png?v=1541520348', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-2' },
  { id: 5, title: 'T-Shirt - Fun Ride', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/funf.png?v=1541520465', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-3' },
  { id: 6, title: 'T-Shirt - GNF', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/gnff.png?v=1541520600', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-4' },
  { id: 7, title: 'T-Shirt - Human Cockfighter', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/hcff.png?v=1541521169', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-5' },
  { id: 8, title: 'T-Shirt - Thump a Stranger', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/thumpf.png?v=1541521247', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-6' },
  { id: 9, title: 'T-Shirt - WIMB', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/wimb.png?v=1541521448', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-7' },
  { id: 10, title: 'T-Shirt - Cling to Guns', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/FullSizeRender.jpg?v=1593877737', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-9' },
  { id: 11, title: 'T-Shirt - MYOB', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/myobf_1a40e805-dc40-4499-a8f7-b35cb8876393.png?v=1544660076', url: 'https://hillbillyfightwear.com/products/short-sleeve-t-shirt-10' },
  { id: 12, title: 'Staunch Properties - CHM Edition', vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/ch1.png?v=1608731816', url: 'https://hillbillyfightwear.com/products/staunch-properties-chm-edition' }
]

// WOMENS CLOTHING - Tank Tops
const womensClothing = [
  { id: 1, title: "Women's Tank - It's A Fun Ride", vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/Screen_Shot_2019-04-30_at_11.20.06_PM.png?v=1556680844', url: 'https://hillbillyfightwear.com/products/womens-tank-top' },
  { id: 2, title: "Women's Tank - HFW", vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/Screen_Shot_2019-04-30_at_11.21.43_PM.png?v=1556681023', url: 'https://hillbillyfightwear.com/products/womens-tank-top-1' },
  { id: 3, title: "Women's Tank - Thump a Stranger", vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/Screen_Shot_2019-04-30_at_11.25.19_PM.png?v=1556681368', url: 'https://hillbillyfightwear.com/products/womens-tank-top-2' },
  { id: 4, title: "Women's Tank - Thumpin Is Lovin", vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/Screen_Shot_2019-04-30_at_11.25.41_PM.png?v=1556681516', url: 'https://hillbillyfightwear.com/products/womens-tank-top-3' },
  { id: 5, title: "Women's Tank - Yes You Can", vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/Screen_Shot_2019-04-30_at_11.33.06_PM.png?v=1556681691', url: 'https://hillbillyfightwear.com/products/womens-tank-top-4' },
  { id: 6, title: "Women's Tank - GNF", vendor: 'Hillbilly Fightwear', price: '$28.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/GNF_-_tank_-_10_15.jpg?v=1556681770', url: 'https://hillbillyfightwear.com/products/womens-tank-top-5' }
]

// KIDS CLOTHING - Youth Hoodie
const kidsClothing = [
  { id: 1, title: 'Youth Hoodie', vendor: 'Hillbilly Fightwear', price: '$50.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/Screenshot2025-12-05at1.50.03PM.png?v=1764960668', url: 'https://hillbillyfightwear.com/products/youth-hoodie' }
]

// HATS - Trucker Hats and Beanies
const hats = [
  { id: 1, title: 'Beanie', vendor: 'Hillbilly Fightwear', price: '$30.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/Screenshot2025-12-05at1.59.43PM.png?v=1764961239', url: 'https://hillbillyfightwear.com/products/beanie' },
  { id: 2, title: 'Fitted Hat - GNF White', vendor: 'Hillbilly Fightwear', price: '$45.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/GNF_Hat_-white.jpg?v=1544660186', url: 'https://hillbillyfightwear.com/products/fitted-trucker-hat' },
  { id: 3, title: 'Fitted Hat - GNF Black', vendor: 'Hillbilly Fightwear', price: '$45.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/GNF_Hat_site_pic.jpg?v=1544660239', url: 'https://hillbillyfightwear.com/products/fitted-trucker-hat-1' },
  { id: 4, title: 'Fitted Hat - Cockfighter', vendor: 'Hillbilly Fightwear', price: '$45.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/cockfighter_fitted.jpg?v=1556679360', url: 'https://hillbillyfightwear.com/products/fitted-trucker-hat-2' },
  { id: 5, title: 'Fitted Hat - HFW', vendor: 'Hillbilly Fightwear', price: '$45.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/HFW_fitted.jpg?v=1556679540', url: 'https://hillbillyfightwear.com/products/fitted-trucker-hat-3' },
  { id: 6, title: 'Fitted Hat - Hard Hittin', vendor: 'Hillbilly Fightwear', price: '$45.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/IMG_9227.JPG?v=1559137116', url: 'https://hillbillyfightwear.com/products/fitted-trucker-hat-4' },
  { id: 7, title: 'Adjustable Hat - Fun Ride', vendor: 'Hillbilly Fightwear', price: '$35.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/It_s_A_Fun_Ride_adjustable_trucker.jpg?v=1556678568', url: 'https://hillbillyfightwear.com/products/adjustable-trucker-hat' },
  { id: 8, title: 'Adjustable Hat - HFW', vendor: 'Hillbilly Fightwear', price: '$35.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/HFW_adjusted.jpg?v=1556679508', url: 'https://hillbillyfightwear.com/products/adjustable-trucker-hat-1' },
  { id: 9, title: 'Adjustable Hat - Cockfighter', vendor: 'Hillbilly Fightwear', price: '$35.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/cockfigher_adjustable.jpg?v=1556679321', url: 'https://hillbillyfightwear.com/products/adjustable-trucker-hat-2' },
  { id: 10, title: 'Adjustable Hat - GNF', vendor: 'Hillbilly Fightwear', price: '$35.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/GNF_adjustable_trucker.jpg?v=1556678861', url: 'https://hillbillyfightwear.com/products/adjustable-trucker-hat-3' },
  { id: 11, title: 'Adjustable Hat - Cockfighter Grey', vendor: 'Hillbilly Fightwear', price: '$35.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/IMG_4304.JPG?v=1559137530', url: 'https://hillbillyfightwear.com/products/adjustable-trucker-hat-4' },
  { id: 12, title: 'Adjustable Hat - Cockfighter Black', vendor: 'Hillbilly Fightwear', price: '$35.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/IMG_1265.JPG?v=1559137825', url: 'https://hillbillyfightwear.com/products/adjustable-trucker-hat-5' },
  { id: 13, title: 'Adjustable Hat - Hard Hittin', vendor: 'Hillbilly Fightwear', price: '$35.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/IMG_6519.JPG?v=1559137929', url: 'https://hillbillyfightwear.com/products/adjustable-trucker-hat-6' }
]

// DECALS / STICKERS
const decals = [
  { id: 1, title: 'Decal - GNF', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-gnf.png?v=12', url: 'https://hillbillyfightwear.com/products/decal' },
  { id: 2, title: 'Decal - Cling to Guns', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-your-neck.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-1' },
  { id: 3, title: 'Decal - Human Cockfighter', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-hcf.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-2' },
  { id: 4, title: 'Decal - Fun Ride', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-fun-ride.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-3' },
  { id: 5, title: 'Decal - Put It On Em', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-put-it-on-em.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-4' },
  { id: 6, title: 'Decal - Thump a Stranger', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-thump.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-5' },
  { id: 7, title: 'Decal - Yes You Can', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-yes-you-can.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-6' },
  { id: 8, title: 'Decal - Obama Tap', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-obama-tap.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-7' },
  { id: 9, title: 'Decal - CHM', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-cunt.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-8' },
  { id: 10, title: 'Decal - HFW', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-hfw.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-9' },
  { id: 11, title: 'Decal - GNF Red/Blue', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-gnf.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-10' },
  { id: 12, title: 'Decal - Thumpin Is Lovin', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-thumpin-is-lovin.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-11' },
  { id: 13, title: 'Decal - Good for Community', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-community.png?v=12', url: 'https://hillbillyfightwear.com/products/decal-12' },
  { id: 14, title: 'Decals - Mind Yown Business', vendor: 'Hillbilly Fightwear', price: '$7.00', image: '/images/stickers/sticker-myob.png?v=12', url: 'https://hillbillyfightwear.com/products/decals' }
]

// Combined shopProducts for API endpoint
const shopProducts = [...mensClothing, ...womensClothing, ...kidsClothing, ...hats, ...decals]

// Featured products for Build Your Own section (internal links)
const products = [
  { id: 1, title: 'T-Shirt - HFW Logo', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/hfw-logo-original.png', url: '/build?garment=tshirt&graphic=hfw-logo' },
  { id: 2, title: 'T-Shirt - YYCF Logo', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/yycf-logo.png', url: '/build?garment=tshirt&graphic=yycf-logo' },
  { id: 3, title: 'T-Shirt - Fun Ride', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/stickers/sticker-fun-ride.png', url: '/build?garment=tshirt&graphic=fun-logo' },
  { id: 4, title: 'T-Shirt - GPG Design', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/gpg-design.png', url: '/build?garment=tshirt&graphic=gpg-design' },
  { id: 5, title: 'T-Shirt - Human Cockfighter', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/stickers/sticker-hcf.png', url: '/build?garment=tshirt&graphic=human-cockfighter' },
  { id: 6, title: 'T-Shirt - Thump a Stranger', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/stickers/sticker-thump.png', url: '/build?garment=tshirt&graphic=thump-a-stranger' }
]

const slides = [
  { id: 0, image: '/images/slides/slide-cage-coach.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 1, image: '/images/slides/slide-gpg-handshake.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 2, image: '/images/slides/slide-backstage.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 3, image: '/images/slides/slide-cage-grapple.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 4, image: '/images/slides/slide-ring-fight.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 5, image: '/images/slides/slide-bullrider.jpg', title: '', subtitle: '', hasOverlay: false }
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

  // Helper function to generate product cards with accessibility
  const generateProductCards = (products: any[]) => products.map(product => `
    <a href="${product.url}" target="_blank" rel="noopener noreferrer" class="product-card" role="listitem" aria-label="${product.title} - ${product.price} (opens in new window)">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" width="280" height="280">
      </div>
      <h4 class="product-title">${product.title}</h4>
      <div class="product-vendor">${product.vendor}</div>
      <div class="product-price" aria-label="Price: ${product.price}">${product.price}</div>
      <span class="external-link" aria-hidden="true"><i class="fas fa-external-link-alt"></i></span>
    </a>
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
  <link rel="icon" type="image/png" href="/images/graphics/hillbilly-fightwear-logo.png">
  <link rel="apple-touch-icon" href="/images/graphics/hillbilly-fightwear-logo.png">
  
  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
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
      "@type": "SearchAction",
      "target": "https://hillbillyfightwear.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>
  
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
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
    
    .announcement-bar {
      background-color: #1a1a1a;
      color: #fff;
      text-align: center;
      padding: 10px 20px;
      font-size: 14px;
      letter-spacing: 1px;
    }
    
    /* HERO CAROUSEL - Full screen background carousel */
    .hero-carousel {
      position: relative;
      width: 100%;
      height: 100vh;
      min-height: 600px;
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
      transition: transform 0.3s;
      border-radius: 8px;
      padding: 10px;
    }
    
    .product-card:hover { transform: translateY(-5px); }
    .product-card:focus-visible { 
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
    }
    
    .product-image-wrapper {
      background: #f7f7f7;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .product-image {
      width: 100%;
      height: auto;
      max-width: 280px;
      margin: 0 auto;
      display: block;
      object-fit: contain;
    }
    
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
    
    .product-card {
      position: relative;
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
    
    .section-header { text-align: center; padding: 50px 20px 20px; }
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
      margin: 30px 0 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #8B0000;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .category-title i {
      font-size: 1.2rem;
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
  </style>
</head>
<body>
  <!-- Accessibility: Skip to main content link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- Announcement Bar + Logo Header -->
  <header role="banner">
    <div class="announcement-bar" aria-label="Announcement">
      <p style="margin: 0;">🔥 NEW: Build Your Own Custom Apparel! 🔥</p>
    </div>
    <div style="background: #0a0a0a; padding: 20px; text-align: center;">
      <a href="/" style="display: inline-block;">
        <img src="/images/graphics/hillbilly-fightwear-logo.png?v=3" alt="Hillbilly Fightwear - Official MMA and Combat Sports Apparel" style="max-width: 280px; width: 100%; height: auto; filter: drop-shadow(0 4px 20px rgba(139, 0, 0, 0.5));">
      </a>
      <p style="color: #fff; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 6px; margin: 12px 0 0; font-weight: 500; opacity: 0.85;">Official Fight Gear</p>
      <nav style="margin-top: 15px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;" aria-label="Primary navigation">
        <a href="#shop" class="btn-secondary" style="display: inline-block; padding: 12px 30px; font-size: 0.95rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 4px; background: #8B0000; color: #fff; transition: all 0.3s;" aria-label="Shop now - browse products"><i class="fas fa-shopping-bag" aria-hidden="true"></i> Shop Now</a>
        <a href="/build" style="display: inline-block; padding: 12px 30px; font-size: 0.95rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 4px; background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.8); transition: all 0.3s;" aria-label="Build your own custom apparel"><i class="fas fa-paint-brush" aria-hidden="true"></i> Build Your Own</a>
      </nav>
    </div>
  </header>
  
  <!-- Main Content -->
  <main id="main-content" role="main">
  
  <!-- Shop Now Section - All Products from Official Store (Organized by Category) -->
  <section id="shop" style="background: #f5f5f5; padding: 40px 0;" aria-labelledby="shop-heading">
    <div class="section-header">
      <h2 id="shop-heading"><i class="fas fa-shopping-bag" aria-hidden="true"></i> Shop Now</h2>
      <p style="color: #666; margin-top: 10px; font-size: 0.95rem;">Official Hillbilly Fightwear merchandise - 46 products available</p>
    </div>
    
    <!-- MENS CLOTHING -->
    <div class="category-section" role="region" aria-labelledby="mens-heading">
      <h3 class="category-title" id="mens-heading"><i class="fas fa-male" aria-hidden="true"></i> Men's Clothing</h3>
      <div class="product-grid shop-grid" role="list">
        ${mensClothingHtml}
      </div>
    </div>
    
    <!-- WOMENS CLOTHING -->
    <div class="category-section" role="region" aria-labelledby="womens-heading">
      <h3 class="category-title" id="womens-heading"><i class="fas fa-female" aria-hidden="true"></i> Women's Clothing</h3>
      <div class="product-grid shop-grid" role="list">
        ${womensClothingHtml}
      </div>
    </div>
    
    <!-- KIDS CLOTHING -->
    <div class="category-section" role="region" aria-labelledby="kids-heading">
      <h3 class="category-title" id="kids-heading"><i class="fas fa-child" aria-hidden="true"></i> Kids' Clothing</h3>
      <div class="product-grid shop-grid" role="list">
        ${kidsClothingHtml}
      </div>
    </div>
    
    <!-- HATS -->
    <div class="category-section" role="region" aria-labelledby="hats-heading">
      <h3 class="category-title" id="hats-heading"><i class="fas fa-hat-cowboy" aria-hidden="true"></i> Hats</h3>
      <div class="product-grid shop-grid" role="list">
        ${hatsHtml}
      </div>
    </div>
    
    <!-- DECALS / STICKERS -->
    <div class="category-section" role="region" aria-labelledby="decals-heading">
      <h3 class="category-title" id="decals-heading"><i class="fas fa-sticky-note" aria-hidden="true"></i> Decals & Stickers</h3>
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
    <h2><i class="fas fa-tshirt"></i> Build Your Own</h2>
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
      <a href="/build" class="view-all-btn"><i class="fas fa-paint-brush"></i> Build Your Own</a>
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
    <button class="slideshow-pause" id="pauseBtn" onclick="togglePause()" aria-label="Pause slideshow" aria-pressed="false" style="top: 20px;">
      <i class="fas fa-pause" id="pauseIcon" aria-hidden="true"></i>
    </button>
    
    <div class="slideshow-dots">
      ${dotsHtml}
    </div>
  </section>
  
  </main>
  
  <!-- Footer -->
  <footer role="contentinfo" style="background: #1a1a1a; color: #fff; padding: 40px 20px; text-align: center;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <p style="margin: 0 0 10px;"><strong>Hillbilly Fightwear</strong> - Official MMA & Combat Sports Apparel</p>
      <p style="margin: 0; font-size: 0.9rem; color: #999;">© ${new Date().getFullYear()} Hillbilly Fightwear. All rights reserved.</p>
      <nav aria-label="Footer navigation" style="margin-top: 20px;">
        <a href="/build" style="color: #8B0000; margin: 0 15px; text-decoration: none;">Build Your Own</a>
        <a href="#shop" style="color: #8B0000; margin: 0 15px; text-decoration: none;">Shop Now</a>
        <a href="https://hillbillyfightwear.com" target="_blank" rel="noopener noreferrer" style="color: #8B0000; margin: 0 15px; text-decoration: none;">Official Store</a>
      </nav>
      <nav aria-label="Legal navigation" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">
        <a href="/privacy-policy" style="color: #888; margin: 0 15px; text-decoration: none; font-size: 0.85rem;">Privacy Policy</a>
        <a href="/cookie-policy" style="color: #888; margin: 0 15px; text-decoration: none; font-size: 0.85rem;">Cookie Policy</a>
        <a href="javascript:void(0)" onclick="showCookieSettings()" style="color: #888; margin: 0 15px; text-decoration: none; font-size: 0.85rem;">Cookie Settings</a>
      </nav>
    </div>
  </footer>
  
  <!-- GDPR Cookie Consent Banner -->
  <div id="cookieConsent" class="cookie-consent" style="display: none;">
    <div class="cookie-content">
      <div class="cookie-text">
        <h3><i class="fas fa-cookie-bite"></i> Cookie Preferences</h3>
        <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. <a href="/cookie-policy">Learn more</a></p>
      </div>
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
      <div class="cookie-buttons">
        <button onclick="acceptAllCookies()" class="cookie-btn accept-all">Accept All</button>
        <button onclick="savePreferences()" class="cookie-btn save-prefs">Save Preferences</button>
        <button onclick="rejectNonEssential()" class="cookie-btn reject">Reject Non-Essential</button>
      </div>
    </div>
  </div>
  
  <style>
    .cookie-consent {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1a1a1a;
      color: #fff;
      padding: 20px;
      z-index: 9999;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
    }
    .cookie-content {
      max-width: 1200px;
      margin: 0 auto;
    }
    .cookie-text h3 {
      margin: 0 0 10px;
      font-size: 1.2rem;
    }
    .cookie-text h3 i { color: #8B0000; margin-right: 8px; }
    .cookie-text p {
      margin: 0 0 15px;
      font-size: 0.9rem;
      color: #ccc;
    }
    .cookie-text a { color: #8B0000; }
    .cookie-options {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }
    .cookie-option {
      flex: 1;
      min-width: 200px;
      background: #2a2a2a;
      padding: 12px;
      border-radius: 6px;
    }
    .cookie-option label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .cookie-option label span { color: #888; font-size: 0.8rem; }
    .cookie-option p {
      margin: 8px 0 0;
      font-size: 0.8rem;
      color: #888;
    }
    .cookie-option input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #8B0000;
    }
    .cookie-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .cookie-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-family: 'Oswald', sans-serif;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .accept-all {
      background: #8B0000;
      color: #fff;
    }
    .accept-all:hover { background: #a00000; }
    .save-prefs {
      background: #333;
      color: #fff;
    }
    .save-prefs:hover { background: #444; }
    .reject {
      background: transparent;
      color: #888;
      border: 1px solid #444;
    }
    .reject:hover { color: #fff; border-color: #666; }
    
    @media (max-width: 768px) {
      .cookie-options { flex-direction: column; }
      .cookie-buttons { flex-direction: column; }
      .cookie-btn { width: 100%; }
    }
  </style>
  
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
    
    // ========================================
    // GDPR Cookie Consent Management
    // ========================================
    function getCookieConsent() {
      try {
        const consent = localStorage.getItem('cookieConsent');
        return consent ? JSON.parse(consent) : null;
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
    }
    
    function hideCookieBanner() {
      document.getElementById('cookieConsent').style.display = 'none';
    }
    
    function showCookieSettings() {
      const consent = getCookieConsent();
      if (consent) {
        document.getElementById('cookieAnalytics').checked = consent.analytics || false;
        document.getElementById('cookieMarketing').checked = consent.marketing || false;
      }
      showCookieBanner();
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
      // This function would enable/disable tracking scripts based on consent
      // Currently, Hillbilly Fightwear doesn't use analytics/marketing cookies
      // This is a placeholder for future integrations
      console.log('Cookie consent applied:', prefs);
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
    });
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
      
      <!-- Step 3: Color -->
      <div class="option-group" id="step3">
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
      <div class="option-group" id="step4">
        <h3><span class="step-num">4</span> Choose Graphics</h3>
        <div class="graphics-grid" id="graphicsGrid"></div>
        
        <div class="additional-graphics" id="additionalGraphics" style="display: none;">
          <h4 style="margin: 0 0 12px; font-size: 0.85rem; color: #666;">Additional Graphics (+$10 small / +$20 full)</h4>
          <div id="additionalList"></div>
          <button class="add-graphic-btn" onclick="showAddGraphicModal()">
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
      <h3>Add Another Graphic</h3>
      <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">Select a graphic and placement. Small placements (chest/hat): +$10 | Full placements (front/back): +$20</p>
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
  
  <!-- Mobile Navigation -->
  <nav class="mobile-nav" id="mobileNav">
    <div class="mobile-nav-inner">
      <button class="mobile-nav-btn active" onclick="scrollToStep(1)" data-step="1">
        <span class="step-circle">1</span>
        <span class="step-label">Garment</span>
      </button>
      <button class="mobile-nav-btn" onclick="scrollToStep(2)" data-step="2">
        <span class="step-circle">2</span>
        <span class="step-label">Size</span>
      </button>
      <button class="mobile-nav-btn" onclick="scrollToStep(3)" data-step="3">
        <span class="step-circle">3</span>
        <span class="step-label">Color</span>
      </button>
      <button class="mobile-nav-btn" onclick="scrollToStep(4)" data-step="4">
        <span class="step-circle">4</span>
        <span class="step-label">Graphics</span>
      </button>
      <button class="mobile-nav-btn" onclick="scrollToStep(5)" data-step="5">
        <span class="step-circle">5</span>
        <span class="step-label">Place</span>
      </button>
    </div>
  </nav>
  
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
    let previewUpdateId = 0; // Used to cancel stale async updates
    
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
      
      // Add scroll listener for mobile nav
      window.addEventListener('scroll', updateMobileNavOnScroll);
      
      // Check URL params
      const params = new URLSearchParams(window.location.search);
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
        backgroundColor: '#f8f8f8'
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
      
      // Update graphic positions after moving
      canvas.on('object:modified', function(e) {
        var obj = e.target;
        if (obj && obj.isGraphic) {
          // Graphic position updated
        }
      });
      
      // Enforce max/min scale limits during scaling
      canvas.on('object:scaling', function(e) {
        var obj = e.target;
        if (obj && obj.isGraphic && obj.maxScale) {
          var currentScaleX = obj.scaleX;
          var currentScaleY = obj.scaleY;
          
          // Enforce maximum scale (cannot enlarge beyond max print area)
          if (currentScaleX > obj.maxScale) {
            obj.scaleX = obj.maxScale;
          }
          if (currentScaleY > obj.maxScale) {
            obj.scaleY = obj.maxScale;
          }
          
          // Enforce minimum scale (15% of max)
          if (currentScaleX < obj.minScale) {
            obj.scaleX = obj.minScale;
          }
          if (currentScaleY < obj.minScale) {
            obj.scaleY = obj.minScale;
          }
          
          // Keep uniform scaling
          var avgScale = (obj.scaleX + obj.scaleY) / 2;
          obj.scaleX = avgScale;
          obj.scaleY = avgScale;
        }
      });
    }
    
    function renderGarments() {
      const grid = document.getElementById('garmentGrid');
      grid.innerHTML = garments.map(function(g) {
        return '<div class="garment-option" data-id="' + g.id + '" onclick="selectGarment(\\'' + g.id + '\\')">' +
          '<img src="' + g.images.black.front + '" alt="' + g.name + '">' +
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
      // Filter graphics based on current garment selection
      const availableGraphics = graphics.filter(function(g) {
        // If no restrictions, available for all garments
        if (!g.restrictToGarments || g.restrictToGarments.length === 0) {
          return true;
        }
        // If garment is selected, check if it's in the allowed list
        if (state.garment) {
          return g.restrictToGarments.includes(state.garment);
        }
        // If no garment selected yet, show all
        return true;
      });
      
      grid.innerHTML = availableGraphics.map(function(g) {
        return '<div class="graphic-option" data-id="' + g.id + '" onclick="selectGraphic(\\'' + g.id + '\\')">' +
          '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
          '<div class="name">' + g.name + '</div>' +
        '</div>';
      }).join('');
      
      // If current selected graphic is no longer available, deselect it
      if (state.graphic) {
        var stillAvailable = availableGraphics.find(function(g) { return g.id === state.graphic; });
        if (!stillAvailable) {
          state.graphic = null;
          updatePreview();
          updateSummary();
        }
      }
    }
    
    function renderPlacements() {
      const grid = document.getElementById('placementGrid');
      const isHeadwear = state.garment === 'trucker-hat' || state.garment === 'beanie';
      
      const available = placements.filter(function(p) {
        return isHeadwear ? p.forHats : !p.forHats;
      });
      
      grid.innerHTML = available.map(function(p) {
        var selected = state.placement === p.id ? ' selected' : '';
        return '<div class="placement-option' + selected + '" data-id="' + p.id + '" onclick="selectPlacement(\\'' + p.id + '\\')">' + p.name + '</div>';
      }).join('');
      
      document.getElementById('viewToggle').style.display = isHeadwear ? 'none' : 'flex';
    }
    
    // Helper function to get price for additional graphic based on placement
    function getAdditionalGraphicPrice(placementId) {
      var p = placements.find(function(x) { return x.id === placementId; });
      // Small placements (chest, hat): $10, Full placements (front/back): $20
      return (p && p.isSmall) ? 10 : 20;
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
            var price = getAdditionalGraphicPrice(ag.placement);
            return '<div class="additional-item">' +
              '<div class="info">' +
                '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
                '<div>' +
                  '<div style="font-weight: 600; font-size: 0.85rem;">' + g.name + '</div>' +
                  '<div style="font-size: 0.75rem; color: #666;">' + p.name + ' • +$' + price.toFixed(2) + '</div>' +
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
      
      // Update garment thumbnails
      document.querySelectorAll('.garment-option').forEach(function(el) {
        var g = garments.find(function(x) { return x.id === el.dataset.id; });
        if (g && g.images[color]) {
          el.querySelector('img').src = g.images[color].front;
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
      
      // Auto-switch view based on placement (skip updatePreview since we'll call it below)
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
      
      var graphicsGrid = document.getElementById('modalGraphicsGrid');
      graphicsGrid.innerHTML = graphics.map(function(g) {
        return '<div class="graphic-option" data-id="' + g.id + '" onclick="modalSelectGraphic(\\'' + g.id + '\\')">' +
          '<img src="' + g.thumbnail + '" alt="' + g.name + '">' +
          '<div class="name">' + g.name + '</div>' +
        '</div>';
      }).join('');
      
      var usedPlacements = [state.placement].concat(state.additionalGraphics.map(function(ag) { return ag.placement; }));
      var isHeadwear = state.garment === 'trucker-hat' || state.garment === 'beanie';
      var available = placements.filter(function(p) {
        return (isHeadwear ? p.forHats : !p.forHats) && usedPlacements.indexOf(p.id) === -1;
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
    
    // Canvas preview - completely rewritten for stability
    function updatePreview() {
      // Increment update ID to cancel any pending async operations
      var currentUpdateId = ++previewUpdateId;
      
      // Clear canvas completely and force render
      canvas.clear();
      canvas.backgroundColor = '#f8f8f8';
      canvas.renderAll(); // Force render after clear
      
      if (!state.garment || !state.color) {
        return;
      }
      
      var garment = garments.find(function(g) { return g.id === state.garment; });
      if (!garment) {
        canvas.renderAll();
        return;
      }
      
      var colorImages = garment.images[state.color];
      if (!colorImages) {
        canvas.renderAll();
        return;
      }
      
      // Get the correct image URL based on current view
      var imageUrl = colorImages[state.view];
      if (!imageUrl) {
        imageUrl = colorImages.front; // Fallback to front
      }
      
      // Load garment image first
      fabric.Image.fromURL(imageUrl, function(garmentImg) {
        // Check if this update is still current
        if (currentUpdateId !== previewUpdateId) return;
        if (!garmentImg) {
          canvas.renderAll();
          return;
        }
        
        var garmentScale = Math.min(canvas.width / garmentImg.width, canvas.height / garmentImg.height) * 0.9;
        
        garmentImg.scale(garmentScale);
        garmentImg.set({
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          objectCaching: false // Disable caching to prevent render artifacts
        });
        
        // Add garment to canvas
        canvas.add(garmentImg);
        
        // Now load and add graphics ON TOP of garment
        loadGraphicsOnTop(currentUpdateId, garmentScale);
        
      }, { crossOrigin: 'anonymous' });
    }
    
    function loadGraphicsOnTop(updateId, garmentScale) {
      // Determine which graphics to show based on current view
      var graphicsToShow = [];
      
      // Check main graphic
      if (state.graphic && state.placement) {
        // Only show if placement matches current view
        var shouldShow = (state.placement === 'full-back' && state.view === 'back') ||
            ((state.placement === 'full-front' || state.placement === 'left-chest' || state.placement === 'right-chest') && state.view === 'front') ||
            (state.placement === 'hat-front');
        if (shouldShow) {
          graphicsToShow.push({ graphicId: state.graphic, placementId: state.placement });
        }
      }
      
      // Check additional graphics - use same logic as main graphic
      state.additionalGraphics.forEach(function(ag) {
        var agShouldShow = (ag.placement === 'full-back' && state.view === 'back') ||
            ((ag.placement === 'full-front' || ag.placement === 'left-chest' || ag.placement === 'right-chest') && state.view === 'front') ||
            (ag.placement === 'hat-front');
        if (agShouldShow) {
          graphicsToShow.push({ graphicId: ag.graphic, placementId: ag.placement });
        }
      });
      
      // If no graphics to show, just render canvas
      if (graphicsToShow.length === 0) {
        canvas.renderAll();
        return;
      }
      
      // Load each graphic
      var isHeadwear = state.garment === 'trucker-hat' || state.garment === 'beanie';
      var loadedCount = 0;
      
      graphicsToShow.forEach(function(item, index) {
        var graphic = graphics.find(function(g) { return g.id === item.graphicId; });
        var placement = placements.find(function(p) { return p.id === item.placementId; });
        
        if (!graphic || !placement) {
          loadedCount++;
          if (loadedCount === graphicsToShow.length) canvas.renderAll();
          return;
        }
        
        fabric.Image.fromURL(graphic.fullImage, function(graphicImg) {
          // Check if still current update
          if (updateId !== previewUpdateId) return;
          
          loadedCount++;
          
          if (!graphicImg) {
            if (loadedCount === graphicsToShow.length) canvas.renderAll();
            return;
          }
          
          // Calculate position
          var pos = getPlacementPosition(item.placementId, canvas.width, canvas.height);
          
          // Calculate scale based on placement type
          var maxPrintWidth, maxPrintHeight;
          if (isHeadwear) {
            maxPrintWidth = canvas.width * 0.25;
            maxPrintHeight = canvas.height * 0.18;
          } else if (placement.isSmall) {
            maxPrintWidth = canvas.width * 0.18;
            maxPrintHeight = canvas.height * 0.13;
          } else {
            maxPrintWidth = canvas.width * 0.40;
            maxPrintHeight = canvas.height * 0.35;
          }
          
          var scaleToFitWidth = maxPrintWidth / graphicImg.width;
          var scaleToFitHeight = maxPrintHeight / graphicImg.height;
          var maxScale = Math.min(scaleToFitWidth, scaleToFitHeight);
          var initialScale = maxScale * 0.9;
          
          graphicImg.scale(initialScale);
          graphicImg.maxScale = maxScale;
          graphicImg.minScale = maxScale * 0.15;
          
          graphicImg.set({
            left: pos.x,
            top: pos.y,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            hasBorders: true,
            lockRotation: false,
            lockScalingFlip: true,
            borderColor: '#8B0000',
            cornerColor: '#8B0000',
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            padding: 5,
            objectCaching: false, // Disable caching to prevent render artifacts
            isGraphic: true,
            graphicId: item.graphicId,
            placementId: item.placementId
          });
          
          // Add graphic to canvas - it will be on top since garment was added first
          canvas.add(graphicImg);
          
          // Final render when all graphics loaded
          if (loadedCount === graphicsToShow.length) {
            canvas.renderAll();
          }
        }, { crossOrigin: 'anonymous' });
      });
    }
    
    // Keep old function name for compatibility but it's no longer used
    function addGraphicsToCanvas(garmentScale, updateId) {
      loadGraphicsOnTop(updateId, garmentScale);
    }
    
    function shouldShowPlacement(placementId, view) {
      // Full Back only shows on back view
      if (placementId === 'full-back') return view === 'back';
      // Front placements only show on front view
      if (placementId === 'full-front' || placementId === 'left-chest' || placementId === 'right-chest') return view === 'front';
      // Hat placements always show
      if (placementId === 'hat-front') return true;
      return true;
    }
    
    function getPlacementPosition(placementId, w, h) {
      // For headwear, position graphic in upper-center area (front panel)
      var isHeadwear = state.garment === 'trucker-hat' || state.garment === 'beanie';
      
      var positions = {
        'full-front': { x: w / 2, y: h * 0.45 },
        'full-back': { x: w / 2, y: h * 0.45 },
        'left-chest': { x: w * 0.35, y: h * 0.32 },
        'right-chest': { x: w * 0.65, y: h * 0.32 },
        'hat-front': { x: w / 2, y: isHeadwear ? h * 0.42 : h * 0.45 }
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
          var price = getAdditionalGraphicPrice(ag.placement);
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
app.get('/api/shop-products', (c) => c.json(shopProducts))
app.get('/api/slides', (c) => c.json(slides))

app.post('/api/calculate-price', async (c) => {
  const body = await c.req.json()
  const { garment, additionalGraphics = [] } = body
  
  const g = garments.find(x => x.id === garment)
  if (!g) return c.json({ error: 'Invalid garment' }, 400)
  
  const basePrice = g.basePrice
  // Calculate additional cost: $10 for small placements, $20 for full placements
  const additionalCost = additionalGraphics.reduce((acc: number, ag: { placement: string }) => {
    const p = placements.find(x => x.id === ag.placement)
    return acc + (p && p.isSmall ? 10 : 20)
  }, 0)
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
  // Calculate additional cost: $10 for small placements, $20 for full placements
  const additionalCost = additionalGraphics.reduce((acc: number, ag: { graphic: string; placement: string }) => {
    const p = placements.find(x => x.id === ag.placement)
    return acc + (p && p.isSmall ? 10 : 20)
  }, 0)
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

// Note: Static files from /images/* are served by Cloudflare Pages automatically

// ============================================
// GDPR COMPLIANCE: Privacy Policy Page
// ============================================
app.get('/privacy-policy', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Hillbilly Fightwear</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
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
      <p>Hillbilly Fightwear ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website hillbilly-fightwear.pages.dev and hillbillyfightwear.com (the "Site").</p>
      <p>Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Site.</p>
      
      <h2>2. Information We Collect</h2>
      <p>We may collect information about you in various ways:</p>
      <ul>
        <li><strong>Personal Data:</strong> When you make a purchase, we collect your name, email address, shipping address, and payment information.</li>
        <li><strong>Usage Data:</strong> We automatically collect certain information when you visit the Site, including your IP address, browser type, operating system, access times, and pages viewed.</li>
        <li><strong>Cookies:</strong> We use cookies and similar tracking technologies. See our <a href="/cookie-policy">Cookie Policy</a> for more details.</li>
      </ul>
      
      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Send you order confirmations and updates</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Improve our website and services</li>
        <li>Comply with legal obligations</li>
      </ul>
      
      <h2>4. Legal Basis for Processing (GDPR)</h2>
      <p>If you are from the European Economic Area (EEA), our legal basis for collecting and using your personal information depends on the data concerned and the context in which we collect it:</p>
      <ul>
        <li><strong>Contract:</strong> Processing is necessary for the performance of a contract with you (e.g., fulfilling orders)</li>
        <li><strong>Consent:</strong> You have given consent for specific purposes (e.g., marketing communications)</li>
        <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests</li>
        <li><strong>Legal Obligation:</strong> Processing is necessary to comply with the law</li>
      </ul>
      
      <h2>5. Your Data Protection Rights (GDPR)</h2>
      <p>If you are a resident of the EEA, you have the following data protection rights:</p>
      <ul>
        <li><strong>Right to Access:</strong> You can request copies of your personal data</li>
        <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
        <li><strong>Right to Erasure:</strong> You can request deletion of your personal data</li>
        <li><strong>Right to Restrict Processing:</strong> You can request we limit how we use your data</li>
        <li><strong>Right to Data Portability:</strong> You can request a copy of your data in a machine-readable format</li>
        <li><strong>Right to Object:</strong> You can object to our processing of your personal data</li>
        <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time</li>
      </ul>
      <p>To exercise any of these rights, please contact us at privacy@hillbillyfightwear.com</p>
      
      <h2>6. Data Retention</h2>
      <p>We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. Order data is typically retained for 5 years for tax and legal purposes.</p>
      
      <h2>7. Data Security</h2>
      <p>We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
      
      <h2>8. Third-Party Services</h2>
      <p>We may share your information with third parties that help us operate our business:</p>
      <ul>
        <li><strong>Payment Processors:</strong> Stripe processes payments securely</li>
        <li><strong>Shipping Partners:</strong> To deliver your orders</li>
        <li><strong>Hosting:</strong> Cloudflare hosts our website</li>
      </ul>
      <p>These third parties have their own privacy policies and are required to protect your data.</p>
      
      <h2>9. International Data Transfers</h2>
      <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in compliance with applicable data protection laws.</p>
      
      <h2>10. Children's Privacy</h2>
      <p>Our Site is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.</p>
      
      <h2>11. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
      
      <h2>12. Contact Us</h2>
      <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
      <ul>
        <li>Email: privacy@hillbillyfightwear.com</li>
        <li>Website: <a href="https://hillbillyfightwear.com">hillbillyfightwear.com</a></li>
      </ul>
      
      <p class="last-updated"><strong>Last Updated:</strong> January 26, 2026</p>
    </div>
  </div>
</body>
</html>`)
})

// ============================================
// GDPR COMPLIANCE: Cookie Policy Page
// ============================================
app.get('/cookie-policy', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cookie Policy - Hillbilly Fightwear</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
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
      <a href="javascript:void(0)" onclick="showCookieSettings()" class="manage-btn"><i class="fas fa-cog"></i> Manage Cookie Settings</a>
      
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
      
      <p class="last-updated"><strong>Last Updated:</strong> January 26, 2026</p>
    </div>
  </div>
  
  <script>
    function showCookieSettings() {
      window.location.href = '/?showCookieSettings=true';
    }
  </script>
</body>
</html>`)
})

export default app
