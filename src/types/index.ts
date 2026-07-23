export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  subcategory?: string;
  images: string[];
  sizes: Size[];
  colors: ColorOption[];
  features: string[];
  inStock: boolean;
  stockCount: number;
  customizable: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
}

export type ProductCategory =
  | "shorts"
  | "rashguards"
  | "gloves"
  | "headgear"
  | "spats"
  | "hoodies"
  | "tshirts"
  | "accessories";

export type Size = "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL";

export interface ColorOption {
  name: string;
  hex: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: Size;
  color: ColorOption;
  customization?: GarmentCustomization;
}

export interface GarmentCustomization {
  baseColor: string;
  secondaryColor: string;
  text?: CustomText;
  logo?: CustomLogo;
  pattern?: string;
  placement: DesignPlacement[];
  elements?: DesignElement[];
  previewImage?: string;
}

export interface CustomText {
  content: string;
  font: string;
  color: string;
  size: number;
  position: Position;
  rotation: number;
}

export interface CustomLogo {
  url: string;
  width: number;
  height: number;
  position: Position;
  rotation: number;
  opacity: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface DesignPlacement {
  type: "text" | "logo" | "pattern";
  area: "front" | "back" | "left-sleeve" | "right-sleeve";
  data: CustomText | CustomLogo | string;
}

export interface AIRecommendation {
  productId: string;
  score: number;
  reason: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface GarmentPreviewState {
  garmentType: ProductCategory;
  baseColor: string;
  secondaryColor: string;
  viewAngle: "front" | "back" | "left" | "right";
  zoom: number;
  elements: DesignElement[];
  selectedElementId: string | null;
  isDirty: boolean;
}

export type ViewAngle = "front" | "back" | "left" | "right";

export interface DesignElement {
  id: string;
  type: "text" | "image" | "shape";
  /** Which garment view this element belongs to. Older designs default to "front". */
  view?: ViewAngle;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  data: TextElementData | ImageElementData | ShapeElementData;
}

export interface TextElementData {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  stroke?: string;
  strokeWidth?: number;
}

export interface ImageElementData {
  src: string;
  alt: string;
  fit: "contain" | "cover" | "fill";
}

export interface ShapeElementData {
  shape: "rectangle" | "circle" | "triangle" | "star";
  fill: string;
  stroke: string;
  strokeWidth: number;
}
