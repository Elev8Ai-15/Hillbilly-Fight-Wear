import { DesignElement, ImageElementData, ShapeElementData } from "@/types";

export type TemplateElement = Omit<DesignElement, "id">;

export interface DesignTemplate {
  id: string;
  label: string;
  description: string;
  baseColor: string;
  secondaryColor: string;
  elements: TemplateElement[];
}

type BoxOverrides = Partial<
  Pick<DesignElement, "view" | "x" | "y" | "width" | "height" | "rotation" | "opacity">
>;

const graphic = (
  graphicId: string,
  src: string,
  overrides: BoxOverrides & { data?: Partial<ImageElementData> } = {}
): TemplateElement => {
  const { data, ...box } = overrides;
  return {
    type: "image",
    view: "front",
    x: 75,
    y: 130,
    width: 150,
    height: 64,
    rotation: 0,
    opacity: 1,
    locked: false,
    ...box,
    data: {
      src,
      alt: graphicId,
      fit: "contain",
      graphicId,
      ...data,
    },
  };
};

const stripe = (
  overrides: BoxOverrides & { data?: Partial<ShapeElementData> } = {}
): TemplateElement => {
  const { data, ...box } = overrides;
  return {
    type: "shape",
    view: "front",
    x: 86,
    y: 90,
    width: 12,
    height: 190,
    rotation: 0,
    opacity: 1,
    locked: false,
    ...box,
    data: {
      shape: "rectangle",
      fill: "#f59e0b",
      stroke: "none",
      strokeWidth: 0,
      ...data,
    },
  };
};

const HFW_LOGO = "/graphics/hfw-logo.png";

export const designTemplates: DesignTemplate[] = [
  {
    id: "classic-logo",
    label: "Classic Logo",
    description: "The official HFW wordmark, front and center",
    baseColor: "#0a0a0a",
    secondaryColor: "#b91c1c",
    elements: [
      graphic("hfw-wordmark", HFW_LOGO, {
        x: 62,
        y: 120,
        width: 176,
        height: 75,
      }),
    ],
  },
  {
    id: "rattler-red",
    label: "Rattler Red",
    description: "Black & red with the wordmark low",
    baseColor: "#0a0a0a",
    secondaryColor: "#b91c1c",
    elements: [
      graphic("hfw-wordmark", HFW_LOGO, {
        x: 75,
        y: 210,
        width: 150,
        height: 64,
      }),
    ],
  },
  {
    id: "side-stripe",
    label: "Side Stripe",
    description: "Twin racing stripes, logo chest",
    baseColor: "#1e3a5f",
    secondaryColor: "#f59e0b",
    elements: [
      stripe({ x: 86, y: 90, data: { fill: "#f59e0b" } }),
      stripe({ x: 202, y: 90, data: { fill: "#f59e0b" } }),
      graphic("hfw-wordmark", HFW_LOGO, {
        x: 80,
        y: 140,
        width: 140,
        height: 60,
      }),
    ],
  },
  {
    id: "od-green",
    label: "Military OD",
    description: "OD green with gold trim",
    baseColor: "#14532d",
    secondaryColor: "#f59e0b",
    elements: [
      graphic("hfw-wordmark", HFW_LOGO, {
        x: 70,
        y: 128,
        width: 160,
        height: 68,
      }),
    ],
  },
  {
    id: "stealth",
    label: "Stealth",
    description: "Gray on gray, subtle logo",
    baseColor: "#374151",
    secondaryColor: "#1a1a1a",
    elements: [
      graphic("hfw-wordmark", HFW_LOGO, {
        x: 90,
        y: 136,
        width: 120,
        height: 51,
        opacity: 0.85,
      }),
    ],
  },
  {
    id: "clean-slate",
    label: "Clean Slate",
    description: "Blank garment — pick your colors and graphics",
    baseColor: "#0a0a0a",
    secondaryColor: "#b91c1c",
    elements: [],
  },
];
