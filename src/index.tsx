import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

type Bindings = {
  STRIPE_SECRET_KEY?: string
  STRIPE_PUBLISHABLE_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================
// SECURITY: Comprehensive Security Headers
// ============================================
app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
    connectSrc: ["'self'", "https://api.stripe.com", "https://cdn.shopify.com"],
    frameSrc: ["'self'", "https://js.stripe.com"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: []
  },
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
  xXssProtection: '1; mode=block',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: ['self']
  }
}))

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
  {
    id: 'hfw-black-3d',
    name: 'HFW 3D Black',
    thumbnail: '/images/graphics/hfw-logo-black-3d.png?v=8',
    fullImage: '/images/graphics/hfw-logo-black-3d.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'hfw-black-shadow',
    name: 'HFW Black Shadow',
    thumbnail: '/images/graphics/hfw-logo-black-shadow.png?v=8',
    fullImage: '/images/graphics/hfw-logo-black-shadow.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'hfw-metal-gloves',
    name: 'HFW Metal Gloves',
    thumbnail: '/images/graphics/hfw-logo-metal-gloves.png?v=8',
    fullImage: '/images/graphics/hfw-logo-metal-gloves.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'hfw-white-outline',
    name: 'HFW White Outline',
    thumbnail: '/images/graphics/hfw-logo-white-outline.png?v=8',
    fullImage: '/images/graphics/hfw-logo-white-outline.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'hfw-logo',
    name: 'HFW Logo',
    thumbnail: '/images/graphics/hfw-logo-original.png?v=8',
    fullImage: '/images/graphics/hfw-logo-original.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'human-cockfighter',
    name: 'Human Cockfighter',
    thumbnail: '/images/graphics/human-cockfighter.png?v=8',
    fullImage: '/images/graphics/human-cockfighter.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'thump-a-stranger',
    name: 'Thump A Stranger',
    thumbnail: '/images/graphics/thump-a-stranger.png?v=8',
    fullImage: '/images/graphics/thump-a-stranger.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'gpg-design',
    name: 'GPG Design',
    thumbnail: '/images/graphics/gpg-design.png?v=8',
    fullImage: '/images/graphics/gpg-design.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'yycf-logo',
    name: 'YYCF Logo',
    thumbnail: '/images/graphics/yycf-logo.png?v=8',
    fullImage: '/images/graphics/yycf-logo.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'fun-logo',
    name: 'FUN Logo',
    thumbnail: '/images/graphics/fun-logo.png?v=8',
    fullImage: '/images/graphics/fun-logo.png?v=8',
    restrictToGarments: []
  },
  // NEW GRAPHICS - Added from Shop Now products
  {
    id: 'myob',
    name: 'MYOB (Mind Y\'own Business)',
    thumbnail: '/images/graphics/myob.png?v=8',
    fullImage: '/images/graphics/myob.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'gnf',
    name: 'GNF',
    thumbnail: '/images/graphics/gnf.png?v=8',
    fullImage: '/images/graphics/gnf.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'wimb',
    name: 'WIMB (What\'s It Mean To You?)',
    thumbnail: '/images/graphics/wimb.png?v=8',
    fullImage: '/images/graphics/wimb.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'cling-to-guns',
    name: 'Cling to Guns',
    thumbnail: '/images/graphics/cling-to-guns.png?v=8',
    fullImage: '/images/graphics/cling-to-guns.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'yes-you-can',
    name: 'Yes, You Can',
    thumbnail: '/images/graphics/yes-you-can.png?v=8',
    fullImage: '/images/graphics/yes-you-can.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'put-it-on-em',
    name: 'Put It On Em',
    thumbnail: '/images/graphics/put-it-on-em.png?v=8',
    fullImage: '/images/graphics/put-it-on-em.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'obama-tap',
    name: 'Obama Tap',
    thumbnail: '/images/graphics/obama-tap.png?v=8',
    fullImage: '/images/graphics/obama-tap.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'good-for-community',
    name: 'Good for Community',
    thumbnail: '/images/graphics/good-for-community.png?v=8',
    fullImage: '/images/graphics/good-for-community.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'hard-hittin',
    name: 'Hard Hittin\'',
    thumbnail: '/images/graphics/hard-hittin.png?v=8',
    fullImage: '/images/graphics/hard-hittin.png?v=8',
    restrictToGarments: []
  },
  {
    id: 'staunch-chm',
    name: 'Staunch Properties (CHM)',
    thumbnail: '/images/graphics/staunch-chm.png?v=8',
    fullImage: '/images/graphics/staunch-chm.png?v=8',
    restrictToGarments: []
  },
  // SPECIAL: Thumpin' Is Lovin' - Women's Only (Tanks and T-Shirts)
  {
    id: 'thumpin-is-lovin-pink',
    name: 'Thumpin\' Is Lovin\' (Pink)',
    thumbnail: '/images/graphics/thumpin-is-lovin-pink.png?v=8',
    fullImage: '/images/graphics/thumpin-is-lovin-pink.png?v=8',
    restrictToGarments: ['tank-womens', 'tshirt']  // Women's tanks and unisex t-shirts
  },
  {
    id: 'thumpin-is-lovin-purple',
    name: 'Thumpin\' Is Lovin\' (Purple)',
    thumbnail: '/images/graphics/thumpin-is-lovin-purple.png?v=8',
    fullImage: '/images/graphics/thumpin-is-lovin-purple.png?v=8',
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
  { id: 1, title: 'Decal - GNF', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/IMG_2906.jpg?v=1590966250', url: 'https://hillbillyfightwear.com/products/decal' },
  { id: 2, title: 'Decal - Cling to Guns', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s1.png?v=1761930946', url: 'https://hillbillyfightwear.com/products/decal-1' },
  { id: 3, title: 'Decal - Human Cockfighter', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s2.png?v=1761931036', url: 'https://hillbillyfightwear.com/products/decal-2' },
  { id: 4, title: 'Decal - Fun Ride', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s3.png?v=1761931065', url: 'https://hillbillyfightwear.com/products/decal-3' },
  { id: 5, title: 'Decal - Put It On Em', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s4.png?v=1761931096', url: 'https://hillbillyfightwear.com/products/decal-4' },
  { id: 6, title: 'Decal - Thump a Stranger', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s5.png?v=1761931143', url: 'https://hillbillyfightwear.com/products/decal-5' },
  { id: 7, title: 'Decal - Yes You Can', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s6.png?v=1761931168', url: 'https://hillbillyfightwear.com/products/decal-6' },
  { id: 8, title: 'Decal - Obama Tap', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s7.png?v=1761931192', url: 'https://hillbillyfightwear.com/products/decal-7' },
  { id: 9, title: 'Decal - CHM', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s8_d2e4786c-9d02-4bc7-bd2a-dab7d55b7007.png?v=1761931285', url: 'https://hillbillyfightwear.com/products/decal-8' },
  { id: 10, title: 'Decal - HFW', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s9.png?v=1761931297', url: 'https://hillbillyfightwear.com/products/decal-9' },
  { id: 11, title: 'Decal - GNF Red/Blue', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s10.png?v=1761931324', url: 'https://hillbillyfightwear.com/products/decal-10' },
  { id: 12, title: 'Decal - Thumpin Is Lovin', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/s11.png?v=1761931349', url: 'https://hillbillyfightwear.com/products/decal-11' },
  { id: 13, title: 'Decal - Good for Community', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/files/g1.png?v=1762085215', url: 'https://hillbillyfightwear.com/products/decal-12' },
  { id: 14, title: 'Decals - Mind Yown Business', vendor: 'Hillbilly Fightwear', price: '$7.00', image: 'https://cdn.shopify.com/s/files/1/2978/1770/products/8a141392-0eeb-45c2-823b-0a40a220777e.jpg?v=1593784509', url: 'https://hillbillyfightwear.com/products/decals' }
]

// Combined shopProducts for API endpoint
const shopProducts = [...mensClothing, ...womensClothing, ...kidsClothing, ...hats, ...decals]

// Featured products for Build Your Own section (internal links)
const products = [
  { id: 1, title: 'T-Shirt - HFW Logo', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/hfw-logo-original.png', url: '/build?garment=tshirt&graphic=hfw-logo' },
  { id: 2, title: 'T-Shirt - YYCF Logo', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/yycf-logo.png', url: '/build?garment=tshirt&graphic=yycf-logo' },
  { id: 3, title: 'T-Shirt - Fun Logo', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/fun-logo.png', url: '/build?garment=tshirt&graphic=fun-logo' },
  { id: 4, title: 'T-Shirt - GPG Design', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/gpg-design.png', url: '/build?garment=tshirt&graphic=gpg-design' },
  { id: 5, title: 'T-Shirt - Human Cockfighter', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/human-cockfighter.png', url: '/build?garment=tshirt&graphic=human-cockfighter' },
  { id: 6, title: 'T-Shirt - Thump a Stranger', vendor: 'Hillbilly Fightwear', price: '$23.00', image: '/images/graphics/thump-a-stranger.png', url: '/build?garment=tshirt&graphic=thump-a-stranger' }
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
  
  <!-- Announcement Bar -->
  <header role="banner">
    <div class="announcement-bar" aria-label="Announcement">
      <p style="margin: 0;">🔥 NEW: Build Your Own Custom Apparel! 🔥</p>
    </div>
  </header>
  
  <!-- HERO CAROUSEL - Full screen background carousel with content overlay -->
  <section class="hero-carousel" aria-label="Featured images slideshow" role="region">
    <!-- Carousel Slides -->
    ${slidesHtml}
    
    <!-- Hero Content Overlay -->
    <div class="hero-content">
      <div class="hero-logo">
        <img src="/images/graphics/hillbilly-fightwear-logo.png?v=3" alt="Hillbilly Fightwear - Official MMA and Combat Sports Apparel" width="300" height="auto">
      </div>
      <p class="hero-tagline">Official Fight Gear</p>
      <nav class="hero-cta" aria-label="Primary navigation">
        <a href="/build" class="btn-primary" aria-label="Build your own custom apparel"><i class="fas fa-paint-brush" aria-hidden="true"></i> Build Your Own</a>
        <a href="#shop" class="btn-secondary" aria-label="Shop now - browse products"><i class="fas fa-shopping-bag" aria-hidden="true"></i> Shop Now</a>
      </nav>
    </div>
    
    <!-- Slideshow Controls -->
    <button class="slideshow-pause" id="pauseBtn" onclick="togglePause()" aria-label="Pause slideshow" aria-pressed="false">
      <i class="fas fa-pause" id="pauseIcon" aria-hidden="true"></i>
    </button>
    
    <div class="slideshow-dots">
      ${dotsHtml}
    </div>
    
    <!-- Scroll Indicator -->
    <div class="scroll-indicator">
      Scroll Down
      <i class="fas fa-chevron-down"></i>
    </div>
  </section>
  
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
  <section id="products">
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
  <section class="feature-row">
    <div class="feature-image">
      <img src="/images/slides/slide-cage-grapple.jpg" alt="Fighter image">
    </div>
    <div class="feature-text">
      <h2>Custom Apparel Builder</h2>
      <p>Now you can create your own custom apparel with all of our artwork and logos. Choose your garment style, size, color, and graphics to create something unique. T-shirts, hoodies, sweatshirts, tank tops, and trucker hats available!</p>
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
    </div>
  </footer>
  
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
          <h4 style="margin: 0 0 12px; font-size: 0.85rem; color: #666;">Additional Graphics (+$10 small / +$20 full)</h4>
          <div id="additionalList"></div>
          <button class="add-graphic-btn" onclick="showAddGraphicModal()">
            <i class="fas fa-plus"></i> Add Another Graphic
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
      
      var colorImages = garment.images[state.color];
      var imageUrl = colorImages[state.view] || colorImages.front;
      
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
      
      // Check if current garment is headwear (hat/beanie)
      var isHeadwear = state.garment === 'trucker-hat' || state.garment === 'beanie';
      
      graphicsToShow.forEach(function(item) {
        var graphic = graphics.find(function(g) { return g.id === item.graphicId; });
        var placement = placements.find(function(p) { return p.id === item.placementId; });
        if (!graphic || !placement) return;
        
        fabric.Image.fromURL(graphic.fullImage, function(img) {
          var pos = getPlacementPosition(item.placementId, canvas.width, canvas.height);
          
          // Calculate max print area based on garment type
          // For headwear: much smaller area (front panel only ~25% of width)
          // For clothing full placements: ~40% of garment preview
          // For small placements (chest): ~18%
          var maxPrintWidth, maxPrintHeight;
          
          if (isHeadwear) {
            // Headwear: small front panel area only
            maxPrintWidth = canvas.width * 0.25;
            maxPrintHeight = canvas.height * 0.18;
          } else if (placement.isSmall) {
            // Small placements (left/right chest)
            maxPrintWidth = canvas.width * 0.18;
            maxPrintHeight = canvas.height * 0.13;
          } else {
            // Full front/back placements
            maxPrintWidth = canvas.width * 0.40;
            maxPrintHeight = canvas.height * 0.35;
          }
          
          // Calculate scale to fit within max print area
          var scaleToFitWidth = maxPrintWidth / img.width;
          var scaleToFitHeight = maxPrintHeight / img.height;
          var maxScale = Math.min(scaleToFitWidth, scaleToFitHeight);
          
          // Start at 90% of max size to give room for slight adjustment
          var initialScale = maxScale * 0.9;
          
          img.scale(initialScale);
          
          // Store the max scale for limiting resize
          img.maxScale = maxScale;
          img.minScale = maxScale * 0.15; // Allow shrinking to 15% of max
          
          // Mark as graphic for event handling and make interactive
          img.set({
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
            isGraphic: true,
            graphicId: item.graphicId,
            placementId: item.placementId
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

export default app
