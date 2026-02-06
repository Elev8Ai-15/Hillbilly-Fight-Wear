import { create } from "zustand";
import { CartItem, Product, Size, ColorOption, GarmentCustomization } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    product: Product,
    size: Size,
    color: ColorOption,
    quantity?: number,
    customization?: GarmentCustomization
  ) => void;
  removeItem: (productId: string, size: Size, colorName: string) => void;
  updateQuantity: (
    productId: string,
    size: Size,
    colorName: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product, size, color, quantity = 1, customization) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color.name === color.name &&
          !item.customization &&
          !customization
      );

      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        };
        return { items: newItems };
      }

      return {
        items: [
          ...state.items,
          { product, quantity, size, color, customization },
        ],
      };
    });
  },

  removeItem: (productId, size, colorName) => {
    set((state) => ({
      items: state.items.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.size === size &&
            item.color.name === colorName
          )
      ),
    }));
  },

  updateQuantity: (productId, size, colorName, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, size, colorName);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId &&
        item.size === size &&
        item.color.name === colorName
          ? { ...item, quantity }
          : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: () =>
    get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ),
}));
