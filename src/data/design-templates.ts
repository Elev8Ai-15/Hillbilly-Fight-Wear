import {
  DesignElement,
  TextElementData,
  ClipartElementData,
  ShapeElementData,
} from "@/types";

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

const text = (
  content: string,
  overrides: BoxOverrides & { data?: Partial<TextElementData> } = {}
): TemplateElement => {
  const { data, ...box } = overrides;
  return {
    type: "text",
    view: "front",
    x: 60,
    y: 100,
    width: 180,
    height: 44,
    rotation: 0,
    opacity: 1,
    locked: false,
    ...box,
    data: {
      content,
      fontFamily: "Anton, system-ui",
      fontSize: 28,
      fontWeight: "bold",
      color: "#ffffff",
      textAlign: "center",
      ...data,
    },
  };
};

const clipart = (
  clipartId: string,
  overrides: BoxOverrides & { data?: Partial<ClipartElementData> } = {}
): TemplateElement => {
  const { data, ...box } = overrides;
  return {
    type: "clipart",
    view: "front",
    x: 100,
    y: 140,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    locked: false,
    ...box,
    data: {
      clipartId,
      fill: "#ffffff",
      secondaryFill: "#0a0a0a",
      ...data,
    },
  };
};

const shape = (
  shapeKind: ShapeElementData["shape"],
  overrides: BoxOverrides & { data?: Partial<ShapeElementData> } = {}
): TemplateElement => {
  const { data, ...box } = overrides;
  return {
    type: "shape",
    view: "front",
    x: 120,
    y: 140,
    width: 60,
    height: 60,
    rotation: 0,
    opacity: 1,
    locked: false,
    ...box,
    data: {
      shape: shapeKind,
      fill: "#b91c1c",
      stroke: "none",
      strokeWidth: 0,
      ...data,
    },
  };
};

export const designTemplates: DesignTemplate[] = [
  {
    id: "rattler",
    label: "Rattler",
    description: "Black & red viper strike",
    baseColor: "#0a0a0a",
    secondaryColor: "#b91c1c",
    elements: [
      text("HILLBILLY", {
        y: 96,
        data: { color: "#b91c1c", arc: 30, fontSize: 30 },
      }),
      clipart("viper", {
        x: 112,
        y: 132,
        width: 76,
        height: 96,
        data: { fill: "#b91c1c", secondaryFill: "#0a0a0a" },
      }),
      text("FIGHT WEAR", {
        y: 236,
        height: 30,
        data: { fontSize: 18, color: "#ffffff" },
      }),
    ],
  },
  {
    id: "bone-collector",
    label: "Bone Collector",
    description: "Skull & barbed wire",
    baseColor: "#1a1a1a",
    secondaryColor: "#f8fafc",
    elements: [
      clipart("skull", {
        x: 108,
        y: 104,
        width: 84,
        height: 84,
        data: { fill: "#f8fafc", secondaryFill: "#1a1a1a" },
      }),
      clipart("barbed-wire", {
        x: 75,
        y: 192,
        width: 150,
        height: 34,
        data: { fill: "#f8fafc", secondaryFill: "#1a1a1a" },
      }),
      text("NO MERCY", {
        y: 228,
        height: 34,
        data: { fontSize: 22, color: "#f8fafc", fontFamily: "'Black Ops One', system-ui" },
      }),
    ],
  },
  {
    id: "moonshine-runner",
    label: "Moonshine Runner",
    description: "Jug & holler pride",
    baseColor: "#14532d",
    secondaryColor: "#f59e0b",
    elements: [
      text("MOONSHINE", {
        y: 98,
        data: { color: "#f59e0b", arc: 26, fontSize: 26, fontFamily: "Rye, serif" },
      }),
      clipart("jug", {
        x: 110,
        y: 142,
        width: 80,
        height: 84,
        data: { fill: "#e7d8b8", secondaryFill: "#14532d" },
      }),
      text("RUNNER", {
        y: 236,
        height: 30,
        data: { fontSize: 20, color: "#f59e0b", fontFamily: "Rye, serif" },
      }),
    ],
  },
  {
    id: "side-stripe",
    label: "Side Stripe",
    description: "Classic twin racing stripes",
    baseColor: "#1e3a5f",
    secondaryColor: "#f59e0b",
    elements: [
      shape("rectangle", {
        x: 86,
        y: 90,
        width: 12,
        height: 190,
        data: { fill: "#f59e0b" },
      }),
      shape("rectangle", {
        x: 202,
        y: 90,
        width: 12,
        height: 190,
        data: { fill: "#f59e0b" },
      }),
      text("HFW", {
        y: 150,
        height: 60,
        data: { fontSize: 44, color: "#ffffff" },
      }),
    ],
  },
  {
    id: "thunder-holler",
    label: "Thunder Holler",
    description: "Storm-built power",
    baseColor: "#111827",
    secondaryColor: "#facc15",
    elements: [
      clipart("lightning", {
        x: 118,
        y: 108,
        width: 64,
        height: 96,
        data: { fill: "#facc15", secondaryFill: "#111827" },
      }),
      text("THUNDER", {
        y: 210,
        height: 34,
        data: { fontSize: 24, color: "#facc15", arc: -20 },
      }),
      text("HOLLER", {
        y: 244,
        height: 30,
        data: { fontSize: 20, color: "#ffffff" },
      }),
    ],
  },
  {
    id: "backwoods",
    label: "Backwoods",
    description: "Mountain country roots",
    baseColor: "#3f2a1d",
    secondaryColor: "#e7d8b8",
    elements: [
      text("BACKWOODS", {
        y: 100,
        data: { color: "#e7d8b8", arc: 24, fontSize: 24, fontFamily: "'Special Elite', monospace" },
      }),
      clipart("mountains", {
        x: 96,
        y: 142,
        width: 108,
        height: 74,
        data: { fill: "#e7d8b8", secondaryFill: "#3f2a1d" },
      }),
      clipart("hatchets", {
        x: 128,
        y: 222,
        width: 44,
        height: 44,
        data: { fill: "#e7d8b8", secondaryFill: "#8a6d4f" },
      }),
    ],
  },
  {
    id: "lucky-brawler",
    label: "Lucky Brawler",
    description: "Horseshoe & star",
    baseColor: "#166534",
    secondaryColor: "#f8fafc",
    elements: [
      clipart("horseshoe", {
        x: 108,
        y: 100,
        width: 84,
        height: 84,
        data: { fill: "#f8fafc", secondaryFill: "#166534" },
      }),
      shape("star", {
        x: 132,
        y: 130,
        width: 36,
        height: 36,
        data: { fill: "#f8fafc" },
      }),
      text("LUCKY", {
        y: 196,
        height: 40,
        data: { fontSize: 28, color: "#f8fafc", fontFamily: "'Alfa Slab One', serif" },
      }),
    ],
  },
  {
    id: "clean-slate",
    label: "Clean Slate",
    description: "Blank canvas — build it your way",
    baseColor: "#0a0a0a",
    secondaryColor: "#b91c1c",
    elements: [],
  },
];
