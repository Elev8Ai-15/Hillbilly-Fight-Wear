import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GarmentPreviewState,
  DesignElement,
  ProductCategory,
  TextElementData,
  ViewAngle,
} from "@/types";

interface DesignSnapshot {
  garmentType: ProductCategory;
  baseColor: string;
  secondaryColor: string;
  elements: DesignElement[];
}

export interface SharedDesign extends DesignSnapshot {
  v: number;
}

const HISTORY_LIMIT = 50;
/** Rapid same-tag changes (color picker drags, slider moves) collapse into one undo step. */
const COALESCE_MS = 800;

interface DesignerStore extends GarmentPreviewState {
  past: DesignSnapshot[];
  future: DesignSnapshot[];
  setGarmentType: (type: ProductCategory) => void;
  setBaseColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setViewAngle: (angle: ViewAngle) => void;
  setZoom: (zoom: number) => void;
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  duplicateElement: (id: string) => void;
  /** Snapshot history once at the start of a drag/resize gesture. */
  beginTransform: () => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  nudgeElement: (id: string, dx: number, dy: number) => void;
  rotateElement: (id: string, rotation: number) => void;
  reorderElement: (id: string, direction: "up" | "down") => void;
  clearDesign: () => void;
  loadDesign: (design: DesignSnapshot) => void;
  addTextElement: (text: string) => void;
  addImageElement: (src: string) => void;
  undo: () => void;
  redo: () => void;
  generateId: () => string;
}

// Canvas viewBox is 300x340 — keep elements at least half-visible.
const CANVAS_W = 300;
const CANVAS_H = 340;

function clampPosition(el: { width: number; height: number }, x: number, y: number) {
  return {
    x: Math.max(-el.width / 2, Math.min(CANVAS_W - el.width / 2, x)),
    y: Math.max(-el.height / 2, Math.min(CANVAS_H - el.height / 2, y)),
  };
}

let lastPushTag: string | null = null;
let lastPushTime = 0;

export const useDesignerStore = create<DesignerStore>()(
  persist(
    (set, get) => {
      const takeSnapshot = (): DesignSnapshot => {
        const s = get();
        return {
          garmentType: s.garmentType,
          baseColor: s.baseColor,
          secondaryColor: s.secondaryColor,
          elements: s.elements,
        };
      };

      const pushHistory = (tag?: string) => {
        const now = Date.now();
        if (tag && tag === lastPushTag && now - lastPushTime < COALESCE_MS) {
          lastPushTime = now;
          return;
        }
        lastPushTag = tag ?? null;
        lastPushTime = now;
        set((state) => ({
          past: [...state.past, takeSnapshot()].slice(-HISTORY_LIMIT),
          future: [],
        }));
      };

      return {
        garmentType: "tshirts",
        baseColor: "#0a0a0a",
        secondaryColor: "#b91c1c",
        viewAngle: "front",
        zoom: 1,
        elements: [],
        selectedElementId: null,
        isDirty: false,
        past: [],
        future: [],

        setGarmentType: (type) => {
          pushHistory("garment");
          set({ garmentType: type, isDirty: true });
        },
        setBaseColor: (color) => {
          pushHistory("baseColor");
          set({ baseColor: color, isDirty: true });
        },
        setSecondaryColor: (color) => {
          pushHistory("secondaryColor");
          set({ secondaryColor: color, isDirty: true });
        },
        setViewAngle: (angle) => set({ viewAngle: angle, selectedElementId: null }),
        setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),

        addElement: (element) => {
          pushHistory();
          set((state) => ({
            elements: [
              ...state.elements,
              { ...element, view: element.view ?? state.viewAngle },
            ],
            selectedElementId: element.id,
            isDirty: true,
          }));
        },

        updateElement: (id, updates) => {
          pushHistory(`update-${id}`);
          set((state) => ({
            elements: state.elements.map((el) =>
              el.id === id ? { ...el, ...updates } : el
            ),
            isDirty: true,
          }));
        },

        removeElement: (id) => {
          pushHistory();
          set((state) => ({
            elements: state.elements.filter((el) => el.id !== id),
            selectedElementId:
              state.selectedElementId === id ? null : state.selectedElementId,
            isDirty: true,
          }));
        },

        selectElement: (id) => set({ selectedElementId: id }),

        duplicateElement: (id) => {
          const state = get();
          const element = state.elements.find((el) => el.id === id);
          if (!element) return;
          pushHistory();
          const pos = clampPosition(element, element.x + 20, element.y + 20);
          const newElement: DesignElement = {
            ...element,
            id: state.generateId(),
            ...pos,
          };
          set((s) => ({
            elements: [...s.elements, newElement],
            selectedElementId: newElement.id,
            isDirty: true,
          }));
        },

        beginTransform: () => pushHistory(),

        moveElement: (id, x, y) =>
          set((state) => ({
            elements: state.elements.map((el) =>
              el.id === id ? { ...el, ...clampPosition(el, x, y) } : el
            ),
            isDirty: true,
          })),

        resizeElement: (id, width, height) =>
          set((state) => ({
            elements: state.elements.map((el) => {
              if (el.id !== id) return el;
              const w = Math.max(20, Math.min(CANVAS_W, width));
              const h = Math.max(16, Math.min(CANVAS_H, height));
              // Text scales its font with the box so resizing feels natural
              if (el.type === "text") {
                const data = el.data as TextElementData;
                const ratio = h / el.height;
                const fontSize = Math.max(
                  8,
                  Math.min(96, Math.round(data.fontSize * ratio))
                );
                return { ...el, width: w, height: h, data: { ...data, fontSize } };
              }
              return { ...el, width: w, height: h };
            }),
            isDirty: true,
          })),

        nudgeElement: (id, dx, dy) => {
          pushHistory(`nudge-${id}`);
          const el = get().elements.find((e) => e.id === id);
          if (!el || el.locked) return;
          get().moveElement(id, el.x + dx, el.y + dy);
        },

        rotateElement: (id, rotation) => {
          pushHistory(`rotate-${id}`);
          set((state) => ({
            elements: state.elements.map((el) =>
              el.id === id ? { ...el, rotation } : el
            ),
            isDirty: true,
          }));
        },

        reorderElement: (id, direction) => {
          const state = get();
          const index = state.elements.findIndex((el) => el.id === id);
          if (index === -1) return;
          const newIndex = direction === "up" ? index + 1 : index - 1;
          if (newIndex < 0 || newIndex >= state.elements.length) return;
          pushHistory();
          const newElements = [...state.elements];
          [newElements[index], newElements[newIndex]] = [
            newElements[newIndex],
            newElements[index],
          ];
          set({ elements: newElements, isDirty: true });
        },

        clearDesign: () => {
          if (get().elements.length === 0) return;
          pushHistory();
          set({
            elements: [],
            selectedElementId: null,
            isDirty: false,
          });
        },

        loadDesign: (design) => {
          pushHistory();
          set({
            garmentType: design.garmentType,
            baseColor: design.baseColor,
            secondaryColor: design.secondaryColor,
            elements: design.elements,
            selectedElementId: null,
            isDirty: true,
          });
        },

        addTextElement: (text: string) => {
          const id = get().generateId();
          const element: DesignElement = {
            id,
            type: "text",
            view: get().viewAngle,
            x: 50,
            y: 150,
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
            view: get().viewAngle,
            x: 75,
            y: 110,
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

        undo: () => {
          const { past, future } = get();
          if (past.length === 0) return;
          const previous = past[past.length - 1];
          const current = takeSnapshot();
          lastPushTag = null;
          set({
            past: past.slice(0, -1),
            future: [...future, current].slice(-HISTORY_LIMIT),
            ...previous,
            selectedElementId: null,
            isDirty: true,
          });
        },

        redo: () => {
          const { past, future } = get();
          if (future.length === 0) return;
          const next = future[future.length - 1];
          const current = takeSnapshot();
          lastPushTag = null;
          set({
            future: future.slice(0, -1),
            past: [...past, current].slice(-HISTORY_LIMIT),
            ...next,
            selectedElementId: null,
            isDirty: true,
          });
        },

        generateId: () =>
          `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };
    },
    {
      name: "hfw-designer",
      partialize: (state) => ({
        garmentType: state.garmentType,
        baseColor: state.baseColor,
        secondaryColor: state.secondaryColor,
        viewAngle: state.viewAngle,
        zoom: state.zoom,
        elements: state.elements,
      }),
    }
  )
);
