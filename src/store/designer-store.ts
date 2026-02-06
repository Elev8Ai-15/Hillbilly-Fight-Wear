import { create } from "zustand";
import {
  GarmentPreviewState,
  DesignElement,
  ProductCategory,
  TextElementData,
} from "@/types";

interface DesignerStore extends GarmentPreviewState {
  setGarmentType: (type: ProductCategory) => void;
  setBaseColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setViewAngle: (angle: GarmentPreviewState["viewAngle"]) => void;
  setZoom: (zoom: number) => void;
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  duplicateElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  rotateElement: (id: string, rotation: number) => void;
  reorderElement: (id: string, direction: "up" | "down") => void;
  clearDesign: () => void;
  addTextElement: (text: string) => void;
  addImageElement: (src: string) => void;
  generateId: () => string;
}

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  garmentType: "tshirts",
  baseColor: "#0a0a0a",
  secondaryColor: "#b91c1c",
  viewAngle: "front",
  zoom: 1,
  elements: [],
  selectedElementId: null,
  isDirty: false,

  setGarmentType: (type) => set({ garmentType: type, isDirty: true }),
  setBaseColor: (color) => set({ baseColor: color, isDirty: true }),
  setSecondaryColor: (color) => set({ secondaryColor: color, isDirty: true }),
  setViewAngle: (angle) => set({ viewAngle: angle }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      selectedElementId: element.id,
      isDirty: true,
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      isDirty: true,
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
      isDirty: true,
    })),

  selectElement: (id) => set({ selectedElementId: id }),

  duplicateElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (!element) return;
    const newElement: DesignElement = {
      ...element,
      id: state.generateId(),
      x: element.x + 20,
      y: element.y + 20,
    };
    set((s) => ({
      elements: [...s.elements, newElement],
      selectedElementId: newElement.id,
      isDirty: true,
    }));
  },

  moveElement: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      ),
      isDirty: true,
    })),

  rotateElement: (id, rotation) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation } : el
      ),
      isDirty: true,
    })),

  reorderElement: (id, direction) =>
    set((state) => {
      const index = state.elements.findIndex((el) => el.id === id);
      if (index === -1) return state;

      const newIndex = direction === "up" ? index + 1 : index - 1;
      if (newIndex < 0 || newIndex >= state.elements.length) return state;

      const newElements = [...state.elements];
      [newElements[index], newElements[newIndex]] = [
        newElements[newIndex],
        newElements[index],
      ];
      return { elements: newElements, isDirty: true };
    }),

  clearDesign: () =>
    set({
      elements: [],
      selectedElementId: null,
      isDirty: false,
    }),

  addTextElement: (text: string) => {
    const id = get().generateId();
    const element: DesignElement = {
      id,
      type: "text",
      x: 150,
      y: 200,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      locked: false,
      data: {
        content: text,
        fontFamily: "system-ui",
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
      } as TextElementData,
    };
    get().addElement(element);
  },

  addImageElement: (src: string) => {
    const id = get().generateId();
    const element: DesignElement = {
      id,
      type: "image",
      x: 150,
      y: 150,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 1,
      locked: false,
      data: {
        src,
        alt: "Custom design element",
        fit: "contain",
      },
    };
    get().addElement(element);
  },

  generateId: () =>
    `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
}));
