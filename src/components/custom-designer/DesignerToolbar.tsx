"use client";

import { useState } from "react";
import {
  Type,
  Image,
  Shirt,
  RotateCcw,
  Eye,
  Copy,
  Trash2,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Palette,
  Wand2,
} from "lucide-react";
import { useDesignerStore } from "@/store/designer-store";
import { ProductCategory, ShapeElementData, TextElementData } from "@/types";
import { cliparts } from "@/data/cliparts";
import { designTemplates } from "@/data/design-templates";
import { cn } from "@/lib/utils";

const garmentTypes: { value: ProductCategory; label: string }[] = [
  { value: "tshirts", label: "T-Shirt" },
  { value: "shorts", label: "Fight Shorts" },
  { value: "rashguards", label: "Rashguard" },
  { value: "hoodies", label: "Hoodie" },
  { value: "spats", label: "Spats" },
];

const viewAngles = [
  { value: "front" as const, label: "Front" },
  { value: "back" as const, label: "Back" },
  { value: "left" as const, label: "Left" },
  { value: "right" as const, label: "Right" },
];

const colorPresets = [
  "#0a0a0a",
  "#1a1a1a",
  "#374151",
  "#ffffff",
  "#b91c1c",
  "#dc2626",
  "#f59e0b",
  "#facc15",
  "#14532d",
  "#166534",
  "#1e3a5f",
  "#3b82f6",
  "#7c3aed",
  "#8B4513",
  "#92400e",
  "#3f2a1d",
];

const colorSchemes = [
  { label: "Aggressive Red & Black", base: "#0a0a0a", secondary: "#b91c1c" },
  { label: "Military OD Green", base: "#14532d", secondary: "#f59e0b" },
  { label: "Royal Blue & Gold", base: "#1e3a5f", secondary: "#f59e0b" },
  { label: "Stealth Gray", base: "#374151", secondary: "#ffffff" },
  { label: "Classic White", base: "#ffffff", secondary: "#0a0a0a" },
];

const fontOptions = [
  { label: "Anton (Block)", value: "Anton, system-ui" },
  { label: "Alfa Slab One (Slab)", value: "'Alfa Slab One', serif" },
  { label: "Black Ops One (Stencil)", value: "'Black Ops One', system-ui" },
  { label: "Rye (Western)", value: "Rye, serif" },
  { label: "Special Elite (Distressed)", value: "'Special Elite', monospace" },
  { label: "Impact", value: "Impact, system-ui" },
  { label: "Arial Black", value: "'Arial Black', system-ui" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "System", value: "system-ui" },
];

function ClipartThumb({ clipartId }: { clipartId: string }) {
  const art = cliparts.find((c) => c.id === clipartId);
  if (!art) return null;
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10">
      {art.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.use === "primary" ? "#374151" : "#9ca3af"}
        />
      ))}
    </svg>
  );
}

export default function DesignerToolbar() {
  const store = useDesignerStore();
  const [activePanel, setActivePanel] = useState<string | null>("style");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const selectedElement = store.elements.find(
    (el) => el.id === store.selectedElementId
  );
  const selectedTextData =
    selectedElement?.type === "text"
      ? (selectedElement.data as TextElementData)
      : null;

  const elementCountForView = (view: string) =>
    store.elements.filter((el) => (el.view ?? "front") === view).length;

  const handleImageUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large — max 2MB. Try a smaller file.");
      return;
    }
    // Data URL (not blob URL) so the design survives refresh and can be saved
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        store.addImageElement(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiSuggestion = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/garment-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          garmentType: store.garmentType,
          currentColors: {
            base: store.baseColor,
            secondary: store.secondaryColor,
          },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions) {
          if (data.suggestions.baseColor)
            store.setBaseColor(data.suggestions.baseColor);
          if (data.suggestions.secondaryColor)
            store.setSecondaryColor(data.suggestions.secondaryColor);
          if (data.suggestions.text) store.addTextElement(data.suggestions.text);
        }
      }
    } catch {
      // Silently handle - AI suggestions are non-critical
    } finally {
      setAiLoading(false);
      setAiPrompt("");
    }
  };

  const addShape = (shape: ShapeElementData["shape"]) => {
    const id = store.generateId();
    store.addElement({
      id,
      type: "shape",
      x: 120,
      y: 140,
      width: 60,
      height: 60,
      rotation: 0,
      opacity: 1,
      locked: false,
      data: {
        shape,
        fill: store.secondaryColor,
        stroke: "none",
        strokeWidth: 0,
      },
    });
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* Panel tabs — ordered like a wizard */}
      <div className="flex border-b overflow-x-auto">
        {[
          { id: "style", label: "1. Style", icon: Shirt },
          { id: "colors", label: "2. Colors", icon: Palette },
          { id: "text", label: "3. Text", icon: Type },
          { id: "art", label: "4. Art", icon: Image },
          { id: "ai", label: "AI", icon: Wand2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActivePanel(activePanel === tab.id ? null : tab.id)
            }
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-3 text-xs font-medium whitespace-nowrap transition-colors",
              activePanel === tab.id
                ? "bg-primary text-white"
                : "hover:bg-gray-50"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* Style panel: garment + view + templates */}
        {activePanel === "style" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Garment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {garmentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => store.setGarmentType(type.value)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg border transition-colors",
                      store.garmentType === type.value
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                View Angle
              </label>
              <div className="flex gap-2">
                {viewAngles.map((angle) => {
                  const count = elementCountForView(angle.value);
                  return (
                    <button
                      key={angle.value}
                      onClick={() => store.setViewAngle(angle.value)}
                      className={cn(
                        "flex-1 px-2 py-2 text-xs rounded-lg border transition-colors flex items-center justify-center gap-1 relative",
                        store.viewAngle === angle.value
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Eye size={12} />
                      {angle.label}
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Each view holds its own design — switch views to design the
                back or sleeves.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Start From a Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {designTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => store.applyTemplate(t)}
                    className="border border-gray-200 rounded-lg p-2 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex gap-1 mb-1.5">
                      <span
                        className="w-4 h-4 rounded-sm border"
                        style={{ backgroundColor: t.baseColor }}
                      />
                      <span
                        className="w-4 h-4 rounded-sm border"
                        style={{ backgroundColor: t.secondaryColor }}
                      />
                    </div>
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[10px] text-gray-400 block leading-tight">
                      {t.description}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Templates replace the current design (Ctrl+Z undoes).
              </p>
            </div>
          </div>
        )}

        {/* Colors panel */}
        {activePanel === "colors" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Base Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={`base-${color}`}
                    onClick={() => store.setBaseColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all",
                      store.baseColor === color
                        ? "border-primary ring-2 ring-primary/30 scale-110"
                        : "border-gray-200 hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={store.baseColor}
                onChange={(e) => store.setBaseColor(e.target.value)}
                className="mt-2 w-full h-8 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Trim / Accent Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={`secondary-${color}`}
                    onClick={() => store.setSecondaryColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all",
                      store.secondaryColor === color
                        ? "border-primary ring-2 ring-primary/30 scale-110"
                        : "border-gray-200 hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={store.secondaryColor}
                onChange={(e) => store.setSecondaryColor(e.target.value)}
                className="mt-2 w-full h-8 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Color Schemes
              </label>
              <div className="space-y-2">
                {colorSchemes.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      store.setBaseColor(preset.base);
                      store.setSecondaryColor(preset.secondary);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-5 h-5 rounded border"
                        style={{ backgroundColor: preset.base }}
                      />
                      <div
                        className="w-5 h-5 rounded border"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-sm">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text panel */}
        {activePanel === "text" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Add Text
              </label>
              <div className="space-y-2">
                {["HILLBILLY", "FIGHT WEAR", "YOUR NAME", "TEAM NAME"].map(
                  (preset) => (
                    <button
                      key={preset}
                      onClick={() => store.addTextElement(preset)}
                      className="block w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      + {preset}
                    </button>
                  )
                )}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Custom text..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      store.addTextElement(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">Press Enter to add</p>
              </div>
            </div>

            {selectedTextData && selectedElement && (
              <div className="border-t pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                  Edit Selected Text
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={selectedTextData.content}
                    onChange={(e) =>
                      store.updateElement(selectedElement.id, {
                        data: { ...selectedTextData, content: e.target.value },
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Text content"
                  />
                  <select
                    value={selectedTextData.fontFamily}
                    onChange={(e) =>
                      store.updateElement(selectedElement.id, {
                        data: { ...selectedTextData, fontFamily: e.target.value },
                      })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <div>
                    <label className="text-xs text-gray-500">
                      Size: {selectedTextData.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="72"
                      value={selectedTextData.fontSize}
                      onChange={(e) =>
                        store.updateElement(selectedElement.id, {
                          data: {
                            ...selectedTextData,
                            fontSize: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Arch: {selectedTextData.arc || 0}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={selectedTextData.arc || 0}
                      onChange={(e) =>
                        store.updateElement(selectedElement.id, {
                          data: {
                            ...selectedTextData,
                            arc: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1.5 mt-1"
                    />
                  </div>
                  <input
                    type="color"
                    value={selectedTextData.color}
                    onChange={(e) =>
                      store.updateElement(selectedElement.id, {
                        data: { ...selectedTextData, color: e.target.value },
                      })
                    }
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Art panel: clipart, shapes, upload */}
        {activePanel === "art" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Clipart
              </label>
              <div className="grid grid-cols-4 gap-2">
                {cliparts.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => store.addClipartElement(art.id)}
                    className="border border-gray-200 rounded-lg p-1.5 flex flex-col items-center hover:border-primary hover:bg-primary/5 transition-colors"
                    title={art.label}
                  >
                    <ClipartThumb clipartId={art.id} />
                    <span className="text-[9px] text-gray-500 leading-tight text-center mt-0.5">
                      {art.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Clipart picks up your trim color — change its colors after
                adding via the element controls below.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Shapes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { shape: "rectangle" as const, label: "Rectangle" },
                    { shape: "circle" as const, label: "Circle" },
                    { shape: "triangle" as const, label: "Triangle" },
                    { shape: "star" as const, label: "Star" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.shape}
                    onClick={() => addShape(s.shape)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Upload Logo
              </label>
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <Image size={20} className="text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-500">
                  Click to upload logo or graphic
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  PNG, JPG, or SVG (max 2MB)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {/* AI Assist panel */}
        {activePanel === "ai" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                AI Design Assistant
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Describe what you want and let AI help create your design.
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., A fierce copperhead snake design with red and black colors, team name 'BACKWOODS MMA'..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={3}
              />
              <button
                onClick={handleAiSuggestion}
                disabled={!aiPrompt.trim() || aiLoading}
                className="mt-2 w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Wand2 size={14} />
                {aiLoading ? "Generating..." : "Generate Design Suggestions"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Element controls (always visible when element selected) */}
      {selectedElement && (
        <div className="border-t p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Selected: {selectedElement.type}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => store.duplicateElement(selectedElement.id)}
              className="p-2 border rounded hover:bg-white transition-colors"
              title="Duplicate"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() =>
                store.updateElement(selectedElement.id, {
                  locked: !selectedElement.locked,
                })
              }
              className="p-2 border rounded hover:bg-white transition-colors"
              title={selectedElement.locked ? "Unlock" : "Lock"}
            >
              {selectedElement.locked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <button
              onClick={() => store.reorderElement(selectedElement.id, "up")}
              className="p-2 border rounded hover:bg-white transition-colors"
              title="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => store.reorderElement(selectedElement.id, "down")}
              className="p-2 border rounded hover:bg-white transition-colors"
              title="Move down"
            >
              <ArrowDown size={14} />
            </button>
            <button
              onClick={() =>
                store.rotateElement(
                  selectedElement.id,
                  selectedElement.rotation + 15
                )
              }
              className="p-2 border rounded hover:bg-white transition-colors"
              title="Rotate"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => store.removeElement(selectedElement.id)}
              className="p-2 border rounded hover:bg-white transition-colors text-red-500"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Clipart colors */}
          {selectedElement.type === "clipart" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Main</label>
                <input
                  type="color"
                  value={
                    (selectedElement.data as { fill: string }).fill
                  }
                  onChange={(e) =>
                    store.updateElement(selectedElement.id, {
                      data: { ...selectedElement.data, fill: e.target.value },
                    })
                  }
                  className="w-full h-7 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Detail</label>
                <input
                  type="color"
                  value={
                    (selectedElement.data as { secondaryFill?: string })
                      .secondaryFill || "#0a0a0a"
                  }
                  onChange={(e) =>
                    store.updateElement(selectedElement.id, {
                      data: {
                        ...selectedElement.data,
                        secondaryFill: e.target.value,
                      },
                    })
                  }
                  className="w-full h-7 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Rotation slider */}
          <div className="mt-2">
            <label className="text-xs text-gray-500">
              Rotation: {selectedElement.rotation}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedElement.rotation}
              onChange={(e) =>
                store.rotateElement(selectedElement.id, parseInt(e.target.value))
              }
              className="w-full h-1.5 mt-1"
            />
          </div>

          {/* Opacity slider */}
          <div className="mt-2">
            <label className="text-xs text-gray-500">
              Opacity: {Math.round(selectedElement.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedElement.opacity * 100}
              onChange={(e) =>
                store.updateElement(selectedElement.id, {
                  opacity: parseInt(e.target.value) / 100,
                })
              }
              className="w-full h-1.5 mt-1"
            />
          </div>

          <p className="text-[11px] text-gray-400 mt-2">
            Tip: drag the corner dot to resize · arrow keys nudge · Delete
            removes · Ctrl+Z undoes
          </p>
        </div>
      )}

      {/* Clear design */}
      <div className="border-t p-3 flex gap-2">
        <button
          onClick={store.clearDesign}
          className="flex-1 py-2 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
