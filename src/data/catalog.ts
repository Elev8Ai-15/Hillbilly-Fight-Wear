// ============================================
// Product Catalog Data
// Single source of truth for all garments, graphics, placements,
// shop products, featured products, and carousel slides.
// Consumed by: homepage (index.tsx), API routes, build page.
// ============================================

// Type for shop products displayed in category grids and cart
export type ShopProduct = {
  id: string
  title: string
  vendor: string
  price: string
  priceNum: number
  image: string
  backImage?: string        // Back view product photo
  type: 'garment' | 'decal'
  garmentType?: string
  sizes?: string[]
  colors?: string[]
  styles?: string[]
  graphicId?: string        // Primary graphic overlay for front (maps to graphics[].id)
  backGraphicId?: string    // Back graphic overlay (maps to graphics[].id)
}

export const garments = [
  {
    id: 'tshirt',
    name: 'T-Shirt (Unisex)',
    basePrice: 30.00,
    category: 'tops',
    sizes: ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: { front: '/images/garments/tshirt-white-front.png', back: '/images/garments/tshirt-white-back.png' },
      black: { front: '/images/garments/tshirt-black-front.png', back: '/images/garments/tshirt-black-back.png' },
      grey: { front: '/images/garments/tshirt-grey-front.png', back: '/images/garments/tshirt-grey-back.png' }
    }
  },
  {
    id: 'thermal',
    name: 'Thermal',
    basePrice: 40.00,
    category: 'tops',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: { front: '/images/garments/thermal-white-front.png', back: '/images/garments/thermal-white-back.png' },
      black: { front: '/images/garments/thermal-black-front.png', back: '/images/garments/thermal-black-back.png' },
      grey: { front: '/images/garments/thermal-grey-front.png', back: '/images/garments/thermal-grey-back.png' }
    }
  },
  {
    id: 'hoodie',
    name: 'Pullover Hoodie',
    basePrice: 50.00,
    category: 'tops',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: { front: '/images/garments/hoodie-white-front.png', back: '/images/garments/hoodie-white-back.png' },
      black: { front: '/images/garments/hoodie-black-front.png', back: '/images/garments/hoodie-black-back.png' },
      grey: { front: '/images/garments/hoodie-grey-front.png', back: '/images/garments/hoodie-grey-back.png' }
    }
  },
  {
    id: 'zipup-hoodie',
    name: 'Zip-Up Hoodie',
    basePrice: 50.00,
    category: 'tops',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    supportsPlacement: true,
    images: {
      white: { front: '/images/garments/zipup-hoodie-white-front.png', back: '/images/garments/zipup-hoodie-white-back.png' },
      black: { front: '/images/garments/zipup-hoodie-black-front.png', back: '/images/garments/zipup-hoodie-black-back.png' },
      grey: { front: '/images/garments/zipup-hoodie-grey-front.png', back: '/images/garments/zipup-hoodie-grey-back.png' }
    }
  },
  {
    id: 'tank-mens',
    name: "Tank Top (Men's)",
    basePrice: 30.00,
    category: 'tops',
    sizes: ['S', 'M', 'L', 'XL'],
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
    basePrice: 30.00,
    category: 'tops',
    sizes: ['S', 'M', 'L', 'XL'],
    supportsPlacement: true,
    images: {
      white: { front: '/images/garments/tank-womens-white-front.png', back: '/images/garments/tank-womens-white-back.png' },
      black: { front: '/images/garments/tank-womens-black-front.png', back: '/images/garments/tank-womens-black-back.png' },
      grey: { front: '/images/garments/tank-womens-grey-front.png', back: '/images/garments/tank-womens-grey-back.png' },
      pink: { front: '/images/garments/tank-womens-pink-front.png', back: '/images/garments/tank-womens-pink-back.png' }
    }
  },
  // Trucker Hat and Beanie removed from Build Your Own section per request
  // Hats are still available in the Shop Now section
]

// Graphics with optional restrictions for specific garments
// restrictToGarments: array of garment IDs this graphic is available for (empty = all)
export const graphics = [
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
    thumbnail: '/images/stickers/sticker-hcf.png?v=13',
    fullImage: '/images/graphics/human-cockfighter.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'thump-a-stranger',
    name: 'Thump A Stranger',
    thumbnail: '/images/stickers/sticker-thump.png?v=13',
    fullImage: '/images/graphics/thump-a-stranger.png?v=11',
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
    thumbnail: '/images/stickers/sticker-fun-ride.png?v=13',
    fullImage: '/images/graphics/fun-logo.png?v=11',
    restrictToGarments: []
  },
  // NEW GRAPHICS - Added from Shop Now products
  {
    id: 'myob',
    name: 'MYOB (Mind Y\'own Business)',
    thumbnail: '/images/stickers/sticker-myob.png?v=15',
    fullImage: '/images/graphics/myob.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'gnf',
    name: 'GNF',
    thumbnail: '/images/stickers/sticker-gnf.png?v=15',
    fullImage: '/images/graphics/gnf.png?v=15',
    restrictToGarments: []
  },
  {
    id: 'wimb',
    name: 'WIMB (What\'s It Mean To You?)',
    thumbnail: '/images/graphics/wimb.png?v=11',
    fullImage: '/images/graphics/wimb.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'cling-to-guns',
    name: 'Cling to Guns',
    thumbnail: '/images/stickers/sticker-your-neck.png?v=13',
    fullImage: '/images/graphics/cling-to-guns.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'yes-you-can',
    name: 'Yes, You Can',
    thumbnail: '/images/stickers/sticker-yes-you-can.png?v=13',
    fullImage: '/images/graphics/yes-you-can.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'put-it-on-em',
    name: 'Put It On Em',
    thumbnail: '/images/stickers/sticker-put-it-on-em.png?v=15',
    fullImage: '/images/graphics/put-it-on-em.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'obama-tap',
    name: 'Obama Tap',
    thumbnail: '/images/stickers/sticker-obama-tap.png?v=13',
    fullImage: '/images/graphics/obama-tap.png?v=11',
    restrictToGarments: []
  },
  {
    id: 'good-for-community',
    name: 'Good for Community',
    thumbnail: '/images/stickers/sticker-community.png?v=13',
    fullImage: '/images/graphics/good-for-community.png?v=11',
    restrictToGarments: []
  },
  // Hard Hittin' graphic removed from Build Your Own per request
  {
    id: 'staunch-chm',
    name: 'Staunch Properties (CHM)',
    thumbnail: '/images/stickers/sticker-cunt.png?v=13',
    fullImage: '/images/graphics/staunch-chm.png?v=11',
    restrictToGarments: []
  },
  // SPECIAL: Thumpin' Is Lovin' - Women's Only (Tanks and T-Shirts)
  // Two color variants pointing to their correct color images (not the black sticker)
  {
    id: 'thumpin-is-lovin-pink',
    name: 'Thumpin\' Is Lovin\' (Pink)',
    thumbnail: '/images/graphics/thumpin-is-lovin-pink.png?v=12',
    fullImage: '/images/graphics/thumpin-is-lovin-pink.png?v=12',
    restrictToGarments: ['tank-womens', 'tshirt']  // Women's tanks and unisex t-shirts
  },
  {
    id: 'thumpin-is-lovin-purple',
    name: 'Thumpin\' Is Lovin\' (Purple)',
    thumbnail: '/images/graphics/thumpin-is-lovin-purple.png?v=12',
    fullImage: '/images/graphics/thumpin-is-lovin-purple.png?v=12',
    restrictToGarments: ['tank-womens', 'tshirt']  // Women's tanks and unisex t-shirts
  }
]

export const placements = [
  { id: 'full-front', name: 'Full Front', isSmall: false, forHats: false },
  { id: 'full-back', name: 'Full Back', isSmall: false, forHats: false },
  { id: 'left-chest', name: 'Left Chest', isSmall: true, forHats: false },
  { id: 'right-chest', name: 'Right Chest', isSmall: true, forHats: false },
  { id: 'hat-front', name: 'Hat Front', isSmall: true, forHats: true }
]

// Shop products organized by category
// type: 'garment' = clothing/hats (shows size→color flow), 'decal' = stickers/decals (shows expanded view)
// MENS CLOTHING - T-Shirts and Hoodies
export const mensClothing = [
  { id: 'm1', title: 'MYOB Hoodie', vendor: 'Hillbilly Fightwear', price: '$50.00', priceNum: 50, image: '/images/products/web/m1-myob-hoodie-front.png', backImage: '/images/products/web/m1-myob-hoodie-back.png', type: 'garment', garmentType: 'hoodie', sizes: ['S','M','L','XL','XXL'], colors: ['Black','White','Grey'], styles: ['Pullover','Zip-Up'], graphicId: 'myob', backGraphicId: 'hfw-black-shadow' },
  { id: 'm2', title: 'Thump a Stranger Hoodie', vendor: 'Hillbilly Fightwear', price: '$50.00', priceNum: 50, image: '/images/products/web/m2-thump-hoodie-back.png', backImage: '/images/products/web/m2-thump-hoodie-front.png', type: 'garment', garmentType: 'hoodie', sizes: ['S','M','L','XL','XXL'], colors: ['Black','White','Grey'], styles: ['Pullover','Zip-Up'], graphicId: 'thump-a-stranger', backGraphicId: 'hfw-black-shadow' },
  { id: 'm3', title: 'T-Shirt - HFW Classic', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m3-hfw-classic-front.png', backImage: '/images/products/web/m3-hfw-classic-back.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'hfw-logo' },
  { id: 'm4', title: 'T-Shirt - YYCF', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m4-yycf-front.png', backImage: '/images/products/web/m4-yycf-back.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'yycf-logo' },
  { id: 'm5', title: 'T-Shirt - Fun Ride', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m5-fun-ride-front.png', backImage: '/images/products/web/m5-fun-ride-back.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'fun-logo' },
  { id: 'm6', title: 'T-Shirt - GNF', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m6-gnf-front.png', backImage: '/images/products/web/m6-gnf-back.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'gnf' },
  { id: 'm7', title: 'T-Shirt - Human Cockfighter', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m7-hcf-front.png', backImage: '/images/products/web/m7-hcf-back.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'human-cockfighter' },
  { id: 'm8', title: 'T-Shirt - Thump a Stranger', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m8-thump-front.png', backImage: '/images/products/web/m8-thump-back.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'thump-a-stranger' },
  { id: 'm9', title: 'T-Shirt - WIMB', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m9-wimb-back.png', backImage: '/images/products/web/m9-wimb-front.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'wimb' },
  { id: 'm10', title: 'T-Shirt - Cling to Guns', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m10-cling-guns-back.png', backImage: '/images/products/web/m10-cling-guns-front.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'cling-to-guns' },
  { id: 'm11', title: 'T-Shirt - MYOB', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m11-myob-front.png', backImage: '/images/products/web/m11-myob-back.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'myob' },
  { id: 'm12', title: 'Staunch Properties - CHM Edition', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/chm-front-web.png', backImage: '/images/products/chm-back-web.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'], graphicId: 'staunch-chm' },
  { id: 'm13', title: 'T-Shirt - Goodwood', vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/m13-goodwood-front.png', backImage: '/images/products/web/m13-goodwood-back.png', type: 'garment', garmentType: 'tshirt', sizes: ['S','M','L','XL','XXL','XXXL'], colors: ['Black','White','Grey'] }
]

// WOMENS CLOTHING - Tank Tops
// Pink color option is available with garment preview images (pink-tinted variants)
export const womensClothing = [
  { id: 'w1', title: "Women's Tank - It's A Fun Ride", vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/w1-fun-ride-tank.png', backImage: '/images/products/web/womens-tank-back-universal.png', type: 'garment', garmentType: 'tank-womens', sizes: ['S','M','L','XL'], colors: ['Black','White','Grey'], graphicId: 'fun-logo' },
  { id: 'w2', title: "Women's Tank - HFW", vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/w2-hfw-tank.png', backImage: '/images/products/web/womens-tank-back-universal.png', type: 'garment', garmentType: 'tank-womens', sizes: ['S','M','L','XL'], colors: ['Black','White','Grey'], graphicId: 'hfw-logo' },
  { id: 'w3', title: "Women's Tank - Thump a Stranger", vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/w3-thump-tank.png', backImage: '/images/products/web/womens-tank-back-universal.png', type: 'garment', garmentType: 'tank-womens', sizes: ['S','M','L','XL'], colors: ['Black','White','Grey'], graphicId: 'thump-a-stranger' },
  { id: 'w4', title: "Women's Tank - Thumpin Is Lovin", vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/w4-thumpin-tank.png', backImage: '/images/products/web/womens-tank-back-universal.png', type: 'garment', garmentType: 'tank-womens', sizes: ['S','M','L','XL'], colors: ['Black','White','Grey'], graphicId: 'thumpin-is-lovin-pink' },
  { id: 'w5', title: "Women's Tank - Yes You Can", vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/w5-yesyoucan-tank.png', backImage: '/images/products/web/womens-tank-back-universal.png', type: 'garment', garmentType: 'tank-womens', sizes: ['S','M','L','XL'], colors: ['Black','White','Grey'], graphicId: 'yes-you-can' },
  { id: 'w6', title: "Women's Tank - GNF", vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/w6-gnf-tank.png', backImage: '/images/products/web/womens-tank-back-universal.png', type: 'garment', garmentType: 'tank-womens', sizes: ['S','M','L','XL'], colors: ['Black','White','Grey'], graphicId: 'gnf' },
  { id: 'w7', title: "Women's Tank - Thumpin Is Lovin (Hot Pink)", vendor: 'Hillbilly Fightwear', price: '$30.00', priceNum: 30, image: '/images/products/web/w7-thumpin-hotpink-tank.png', backImage: '/images/products/web/w7-thumpin-hotpink-tank-back.png', type: 'garment', garmentType: 'tank-womens', sizes: ['S','M','L','XL'], colors: ['Black','White','Grey'], graphicId: 'thumpin-is-lovin-pink' }
]

// KIDS CLOTHING - Youth Hoodie
export const kidsClothing = [
  { id: 'k1', title: 'Youth Hoodie', vendor: 'Hillbilly Fightwear', price: '$50.00', priceNum: 50, image: '/images/products/web/k1-youth-hoodie-front.png', backImage: '/images/products/web/k1-youth-hoodie-back.png', type: 'garment', garmentType: 'hoodie', sizes: ['YS','YM','YL'], colors: ['Black','White','Grey'], styles: ['Pullover','Zip-Up'], graphicId: 'hfw-black-shadow', backGraphicId: 'hfw-logo' }
]

// HATS - Trucker Hats and Beanies
export const hats = [
  { id: 'h1', title: 'Beanie', vendor: 'Hillbilly Fightwear', price: '$25.00', priceNum: 25, image: '/images/products/web/h1-beanie.png', type: 'garment', garmentType: 'beanie', sizes: ['One Size'], colors: ['Black','Grey','White'] },
  { id: 'h2', title: 'Fitted Hat - GNF White', vendor: 'Hillbilly Fightwear', price: '$45.00', priceNum: 45, image: '/images/products/web/h2-gnf-white-fitted.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['S/M','L/XL'], colors: ['White'] },
  { id: 'h3', title: 'Fitted Hat - GNF Black', vendor: 'Hillbilly Fightwear', price: '$45.00', priceNum: 45, image: '/images/products/web/h3-gnf-black-fitted.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['S/M','L/XL'], colors: ['Black'] },
  { id: 'h4', title: 'Fitted Hat - Cockfighter', vendor: 'Hillbilly Fightwear', price: '$45.00', priceNum: 45, image: '/images/products/web/h4-cockfighter-fitted.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['S/M','L/XL'], colors: ['Black'] },
  { id: 'h5', title: 'Fitted Hat - HFW', vendor: 'Hillbilly Fightwear', price: '$45.00', priceNum: 45, image: '/images/products/web/h5-hfw-fitted.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['S/M','L/XL'], colors: ['Black'] },
  // h6 Hard Hittin hat removed per request
  { id: 'h7', title: 'Adjustable Hat - Fun Ride', vendor: 'Hillbilly Fightwear', price: '$35.00', priceNum: 35, image: '/images/products/web/h7-fun-ride-adj.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['One Size'], colors: ['Black','White'] },
  { id: 'h8', title: 'Adjustable Hat - HFW', vendor: 'Hillbilly Fightwear', price: '$35.00', priceNum: 35, image: '/images/products/web/h8-hfw-adj.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['One Size'], colors: ['Black'] },
  { id: 'h9', title: 'Adjustable Hat - Cockfighter', vendor: 'Hillbilly Fightwear', price: '$35.00', priceNum: 35, image: '/images/products/web/h9-cockfighter-adj.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['One Size'], colors: ['Black'] },
  { id: 'h10', title: 'Adjustable Hat - GNF', vendor: 'Hillbilly Fightwear', price: '$35.00', priceNum: 35, image: '/images/products/web/h10-gnf-adj.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['One Size'], colors: ['Black','White'] },
  { id: 'h11', title: 'Adjustable Hat - Cockfighter Grey', vendor: 'Hillbilly Fightwear', price: '$35.00', priceNum: 35, image: '/images/products/web/h11-cockfighter-grey-adj.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['One Size'], colors: ['Grey'] },
  { id: 'h12', title: 'Adjustable Hat - Cockfighter Black', vendor: 'Hillbilly Fightwear', price: '$35.00', priceNum: 35, image: '/images/products/web/h12-cockfighter-black-adj.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['One Size'], colors: ['Black'] },
  { id: 'h13', title: 'Fitted Hat - GNF Patriotic', vendor: 'Hillbilly Fightwear', price: '$45.00', priceNum: 45, image: '/images/products/web/h13-gnf-patriotic-fitted.png', type: 'garment', garmentType: 'trucker-hat', sizes: ['S/M','L/XL'], colors: ['Black'] },
]

// DECALS / STICKERS
// image = local graphic for site display; backImage = product photography
export const decals = [
  // DECAL BACK IMAGE MAPPING (verified by visual analysis of each back photo):
  // d1-back-gnf.png = "Cling to Guns" text, d2-back-hfw.png = Human Cockfighter rooster,
  // d3-back-thump.png = "Fun Ride" text, d4-back-funride.png = "Put It On Em" text,
  // d5-back-cockfighter.png = "Thump A Stranger" text, d6-back-hcf.png = "Yes You Can" text,
  // d7-back-thumpin.png = "Obama Tap" text, d8-back-chm.png = "CHM" text,
  // d9-back-myob.png = HFW logo, d10-back-yesyoucan.png = GNF red/blue letters,
  // d11-back-community.png = "Thumpin Is Lovin" text, d12-back-goodwood.png = "Good For Community" text
  { id: 'd1', title: 'Decal - GNF', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-gnf.png?v=13', backImage: '/images/products/web/d10-back-yesyoucan.png', type: 'decal' },
  { id: 'd2', title: 'Decal - Cling to Guns', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-your-neck.png?v=13', backImage: '/images/products/web/d1-back-gnf.png', type: 'decal' },
  { id: 'd3', title: 'Decal - Human Cockfighter', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-hcf.png?v=13', backImage: '/images/products/web/d2-back-hfw.png', type: 'decal' },
  { id: 'd4', title: 'Decal - Fun Ride', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-fun-ride.png?v=13', backImage: '/images/products/web/d3-back-thump.png', type: 'decal' },
  { id: 'd5', title: 'Decal - Put It On Em', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-put-it-on-em.png?v=15', backImage: '/images/products/web/d4-back-funride.png', type: 'decal' },
  { id: 'd6', title: 'Decal - Thump a Stranger', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-thump.png?v=13', backImage: '/images/products/web/d5-back-cockfighter.png', type: 'decal' },
  { id: 'd7', title: 'Decal - Yes You Can', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-yes-you-can.png?v=13', backImage: '/images/products/web/d6-back-hcf.png', type: 'decal' },
  { id: 'd8', title: 'Decal - Obama Tap', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-obama-tap.png?v=13', backImage: '/images/products/web/d7-back-thumpin.png', type: 'decal' },
  { id: 'd9', title: 'Decal - CHM', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-cunt.png?v=13', backImage: '/images/products/web/d8-back-chm.png', type: 'decal' },
  { id: 'd10', title: 'Decal - HFW', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-hfw.png?v=13', backImage: '/images/products/web/d9-back-myob.png', type: 'decal' },
  { id: 'd11', title: 'Decal - GNF Red/Blue', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-gnf-redblue.png?v=15', backImage: '/images/products/web/d10-back-yesyoucan.png', type: 'decal' },
  { id: 'd12', title: 'Decal - Thumpin Is Lovin', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-thumpin-is-lovin.png?v=13', backImage: '/images/products/web/d11-back-community.png', type: 'decal' },
  { id: 'd13', title: 'Decal - Good for Community', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-community.png?v=13', backImage: '/images/products/web/d12-back-goodwood.png', type: 'decal' },
  { id: 'd14', title: 'Decals - Mind Yown Business', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-myob.png?v=15', type: 'decal' },
  { id: 'd15', title: 'Decal - HFW Logo', vendor: 'Hillbilly Fightwear', price: '$7.00', priceNum: 7, image: '/images/stickers/sticker-hfw-logo.png?v=1', type: 'decal' }
]

// Combined shopProducts for API endpoint and homepage rendering
// Order: mens → womens → kids → hats → decals (matches UI category order)
export const shopProducts: ShopProduct[] = [...mensClothing, ...womensClothing, ...kidsClothing, ...hats, ...decals]

// Featured products for Build Your Own section (internal links, prices reflect base T-shirt cost)
// Only 3 featured: GPG Design, Human Cockfighter, Thump a Stranger
export const products = [
  { id: 1, title: 'T-Shirt - GPG Design', vendor: 'Hillbilly Fightwear', price: '$30.00', image: '/images/graphics/gpg-design.png', url: '/build?garment=tshirt&graphic=gpg-design' },
  { id: 2, title: 'T-Shirt - Human Cockfighter', vendor: 'Hillbilly Fightwear', price: '$30.00', image: '/images/stickers/sticker-hcf.png', url: '/build?garment=tshirt&graphic=human-cockfighter' },
  { id: 3, title: 'T-Shirt - Thump a Stranger', vendor: 'Hillbilly Fightwear', price: '$30.00', image: '/images/stickers/sticker-thump.png', url: '/build?garment=tshirt&graphic=thump-a-stranger' }
]

// Carousel slides
export const slides = [
  { id: 0, image: '/images/slides/slide-cage-coach.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 1, image: '/images/slides/slide-gpg-handshake.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 2, image: '/images/slides/slide-backstage.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 3, image: '/images/slides/slide-cage-grapple.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 4, image: '/images/slides/slide-ring-fight.jpg', title: '', subtitle: '', hasOverlay: false },
  { id: 5, image: '/images/slides/slide-bullrider.jpg', title: '', subtitle: '', hasOverlay: false }
]

