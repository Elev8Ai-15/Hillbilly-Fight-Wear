"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useDesignerStore } from "@/store/designer-store";
import { DesignElement, TextElementData, ImageElementData, ShapeElementData } from "@/types";
import { cn } from "@/lib/utils";

// SVG garment templates for each view
const garmentTemplates = {
  tshirts: {
    front: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M120,60 L180,60 L200,80 L240,70 L250,120 L220,110 L220,280 L80,280 L80,110 L50,120 L60,70 L100,80 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        {/* Collar */}
        <path
          d="M120,60 C130,75 170,75 180,60"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2"
        />
        {/* Sleeve lines */}
        <line x1="80" y1="110" x2="100" y2="80" stroke={secondaryColor} strokeWidth="1" opacity="0.3" />
        <line x1="220" y1="110" x2="200" y2="80" stroke={secondaryColor} strokeWidth="1" opacity="0.3" />
      </g>
    ),
    back: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M120,60 L180,60 L200,80 L240,70 L250,120 L220,110 L220,280 L80,280 L80,110 L50,120 L60,70 L100,80 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        <path
          d="M120,60 C140,70 160,70 180,60"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
    left: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M100,60 L160,60 L180,80 L200,75 L200,120 L180,110 L180,280 L100,280 L100,110 L60,120 L70,70 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
    right: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M140,60 L200,60 L230,70 L240,120 L200,110 L200,280 L120,280 L120,110 L100,120 L100,75 L120,80 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
  },
  shorts: {
    front: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M70,80 L230,80 L230,120 L240,260 L170,260 L150,180 L130,260 L60,260 L70,120 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        {/* Waistband */}
        <rect x="70" y="80" width="160" height="15" fill={secondaryColor} opacity="0.3" rx="2" />
        {/* Center seam */}
        <line x1="150" y1="95" x2="150" y2="180" stroke={secondaryColor} strokeWidth="1" opacity="0.3" />
      </g>
    ),
    back: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M70,80 L230,80 L230,120 L240,260 L170,260 L150,180 L130,260 L60,260 L70,120 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        <rect x="70" y="80" width="160" height="15" fill={secondaryColor} opacity="0.3" rx="2" />
      </g>
    ),
    left: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M100,80 L200,80 L200,120 L210,260 L140,260 L130,180 L120,260 L90,260 L100,120 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
    right: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M100,80 L200,80 L200,120 L210,260 L180,260 L170,180 L160,260 L90,260 L100,120 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
  },
  rashguards: {
    front: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M120,50 L180,50 L200,70 L260,60 L265,180 L220,170 L220,290 L80,290 L80,170 L35,180 L40,60 L100,70 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        <path
          d="M120,50 C130,65 170,65 180,50"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2"
        />
        {/* Compression panel lines */}
        <line x1="100" y1="120" x2="100" y2="290" stroke={secondaryColor} strokeWidth="1" opacity="0.2" />
        <line x1="200" y1="120" x2="200" y2="290" stroke={secondaryColor} strokeWidth="1" opacity="0.2" />
      </g>
    ),
    back: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M120,50 L180,50 L200,70 L260,60 L265,180 L220,170 L220,290 L80,290 L80,170 L35,180 L40,60 L100,70 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        <path
          d="M120,50 C140,60 160,60 180,50"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
    left: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M100,50 L160,50 L180,70 L220,65 L220,180 L180,170 L180,290 L100,290 L100,170 L60,180 L65,65 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
    right: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M140,50 L200,50 L235,65 L240,180 L200,170 L200,290 L120,290 L120,170 L80,180 L80,65 L120,70 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
  },
  hoodies: {
    front: (baseColor: string, secondaryColor: string) => (
      <g>
        {/* Hood */}
        <path
          d="M110,30 C110,10 190,10 190,30 L195,60 L105,60 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
          opacity="0.8"
        />
        {/* Body */}
        <path
          d="M105,60 L195,60 L210,80 L255,70 L260,140 L225,130 L225,300 L75,300 L75,130 L40,140 L45,70 L90,80 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        {/* Pocket */}
        <rect x="110" y="200" width="80" height="50" rx="5" fill={secondaryColor} opacity="0.15" stroke={secondaryColor} strokeWidth="1" />
        {/* Center zip line */}
        <line x1="150" y1="60" x2="150" y2="300" stroke={secondaryColor} strokeWidth="1" opacity="0.2" />
      </g>
    ),
    back: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M110,30 C110,10 190,10 190,30 L195,60 L105,60 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          d="M105,60 L195,60 L210,80 L255,70 L260,140 L225,130 L225,300 L75,300 L75,130 L40,140 L45,70 L90,80 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
    left: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M100,30 C100,10 160,10 160,30 L165,60 L95,60 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          d="M95,60 L165,60 L185,80 L220,70 L220,140 L185,130 L185,300 L95,300 L95,130 L60,140 L65,70 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
    right: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M140,30 C140,10 200,10 200,30 L205,60 L135,60 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          d="M135,60 L205,60 L225,70 L235,140 L205,130 L205,300 L115,300 L115,130 L80,140 L80,70 L115,80 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
  },
  spats: {
    front: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M90,60 L210,60 L210,100 L220,320 L165,320 L150,200 L135,320 L80,320 L90,100 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        <rect x="90" y="60" width="120" height="15" fill={secondaryColor} opacity="0.3" rx="2" />
      </g>
    ),
    back: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M90,60 L210,60 L210,100 L220,320 L165,320 L150,200 L135,320 L80,320 L90,100 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
        <rect x="90" y="60" width="120" height="15" fill={secondaryColor} opacity="0.3" rx="2" />
      </g>
    ),
    left: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M110,60 L190,60 L190,100 L195,320 L150,320 L145,200 L140,320 L105,320 L110,100 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
    right: (baseColor: string, secondaryColor: string) => (
      <g>
        <path
          d="M110,60 L190,60 L190,100 L195,320 L160,320 L155,200 L150,320 L105,320 L110,100 Z"
          fill={baseColor}
          stroke={secondaryColor}
          strokeWidth="2"
        />
      </g>
    ),
  },
};

// Fallback template for garment types without specific SVG
const fallbackTemplate = (baseColor: string, secondaryColor: string) => (
  <g>
    <rect x="60" y="60" width="180" height="220" rx="10" fill={baseColor} stroke={secondaryColor} strokeWidth="2" />
  </g>
);

function getTemplate(
  garmentType: string,
  viewAngle: string,
  baseColor: string,
  secondaryColor: string
) {
  const templates = garmentTemplates[garmentType as keyof typeof garmentTemplates];
  if (!templates) return fallbackTemplate(baseColor, secondaryColor);
  const viewFn = templates[viewAngle as keyof typeof templates];
  if (!viewFn) return fallbackTemplate(baseColor, secondaryColor);
  return viewFn(baseColor, secondaryColor);
}

function renderDesignElement(element: DesignElement) {
  const style = {
    opacity: element.opacity,
  };

  if (element.type === "text") {
    const data = element.data as TextElementData;
    // Native SVG text (not foreignObject) so PNG export doesn't taint the canvas
    const anchorX =
      data.textAlign === "center"
        ? element.x + element.width / 2
        : data.textAlign === "right"
          ? element.x + element.width
          : element.x;
    return (
      <text
        key={element.id}
        x={anchorX}
        y={element.y + element.height / 2}
        textAnchor={
          data.textAlign === "center"
            ? "middle"
            : data.textAlign === "right"
              ? "end"
              : "start"
        }
        dominantBaseline="central"
        fontFamily={data.fontFamily}
        fontSize={data.fontSize}
        fontWeight={data.fontWeight}
        fill={data.color}
        stroke={data.stroke}
        strokeWidth={data.stroke ? data.strokeWidth || 1 : undefined}
        style={style}
      >
        {data.content}
      </text>
    );
  }

  if (element.type === "image") {
    const data = element.data as ImageElementData;
    return (
      <image
        key={element.id}
        href={data.src}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        style={style}
        preserveAspectRatio={
          data.fit === "contain"
            ? "xMidYMid meet"
            : data.fit === "cover"
              ? "xMidYMid slice"
              : "none"
        }
      />
    );
  }

  if (element.type === "shape") {
    const data = element.data as ShapeElementData;
    switch (data.shape) {
      case "rectangle":
        return (
          <rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={data.fill}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
            style={style}
            rx="4"
          />
        );
      case "circle":
        return (
          <ellipse
            key={element.id}
            cx={element.x + element.width / 2}
            cy={element.y + element.height / 2}
            rx={element.width / 2}
            ry={element.height / 2}
            fill={data.fill}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
            style={style}
          />
        );
      case "star": {
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;
        const outerR = Math.min(element.width, element.height) / 2;
        const innerR = outerR * 0.4;
        const points = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        return (
          <polygon
            key={element.id}
            points={points.join(" ")}
            fill={data.fill}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
            style={style}
          />
        );
      }
      case "triangle": {
        const x = element.x;
        const y = element.y;
        const w = element.width;
        const h = element.height;
        return (
          <polygon
            key={element.id}
            points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`}
            fill={data.fill}
            stroke={data.stroke}
            strokeWidth={data.strokeWidth}
            style={style}
          />
        );
      }
    }
  }

  return null;
}

type GestureMode = "drag" | "resize";

interface GestureState {
  mode: GestureMode;
  elementId: string;
  // drag: pointer offset from element origin; resize: element origin
  offsetX: number;
  offsetY: number;
}

export default function GarmentCanvas() {
  const {
    garmentType,
    baseColor,
    secondaryColor,
    viewAngle,
    zoom,
    setZoom,
    elements,
    selectedElementId,
    selectElement,
    beginTransform,
    moveElement,
    resizeElement,
    nudgeElement,
    removeElement,
    undo,
    redo,
  } = useDesignerStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const gestureRef = useRef<GestureState | null>(null);
  const [isGesturing, setIsGesturing] = useState(false);

  const visibleElements = elements.filter(
    (el) => (el.view ?? "front") === viewAngle
  );

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return point.matrixTransform(ctm.inverse());
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent, element: DesignElement) => {
      selectElement(element.id);
      if (element.locked) return;
      e.stopPropagation();
      const svgPoint = clientToSvg(e.clientX, e.clientY);
      if (!svgPoint) return;

      beginTransform();
      gestureRef.current = {
        mode: "drag",
        elementId: element.id,
        offsetX: svgPoint.x - element.x,
        offsetY: svgPoint.y - element.y,
      };
      setIsGesturing(true);
      svgRef.current?.setPointerCapture(e.pointerId);
    },
    [selectElement, clientToSvg, beginTransform]
  );

  const startResize = useCallback(
    (e: React.PointerEvent, element: DesignElement) => {
      if (element.locked) return;
      e.stopPropagation();
      beginTransform();
      gestureRef.current = {
        mode: "resize",
        elementId: element.id,
        offsetX: element.x,
        offsetY: element.y,
      };
      setIsGesturing(true);
      svgRef.current?.setPointerCapture(e.pointerId);
    },
    [beginTransform]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      const svgPoint = clientToSvg(e.clientX, e.clientY);
      if (!svgPoint) return;

      if (gesture.mode === "drag") {
        moveElement(
          gesture.elementId,
          svgPoint.x - gesture.offsetX,
          svgPoint.y - gesture.offsetY
        );
      } else {
        resizeElement(
          gesture.elementId,
          svgPoint.x - gesture.offsetX,
          svgPoint.y - gesture.offsetY
        );
      }
    },
    [clientToSvg, moveElement, resizeElement]
  );

  const endGesture = useCallback(() => {
    gestureRef.current = null;
    setIsGesturing(false);
  }, []);

  // Keyboard: delete, nudge with arrows, undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      const { selectedElementId: selectedId } = useDesignerStore.getState();
      if (!selectedId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeElement(selectedId);
        return;
      }
      if (e.key === "Escape") {
        selectElement(null);
        return;
      }

      const step = e.shiftKey ? 10 : 2;
      const nudges: Record<string, [number, number]> = {
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
      };
      const nudge = nudges[e.key];
      if (nudge) {
        e.preventDefault();
        nudgeElement(selectedId, nudge[0], nudge[1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [removeElement, selectElement, nudgeElement, undo, redo]);

  return (
    <div className="relative bg-gray-100 rounded-xl overflow-hidden garment-canvas">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* View angle label */}
      <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10">
        {viewAngle} View
      </div>

      {/* Zoom controls on the canvas */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm z-10">
        <button
          onClick={() => setZoom(zoom - 0.25)}
          className="px-2.5 py-1.5 text-sm font-bold hover:bg-gray-100 rounded-l-lg"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => setZoom(1)}
          className="px-1.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 min-w-[3rem]"
          aria-label="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom(zoom + 0.25)}
          className="px-2.5 py-1.5 text-sm font-bold hover:bg-gray-100 rounded-r-lg"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      {/* Empty-state hint */}
      {visibleElements.length === 0 && (
        <div className="absolute inset-x-0 bottom-14 flex justify-center z-10 pointer-events-none">
          <span className="bg-white/80 backdrop-blur-sm text-gray-500 text-xs px-3 py-1.5 rounded-full">
            Add text, shapes or a logo from the panel — drag to position
          </span>
        </div>
      )}

      <svg
        id="garment-canvas-svg"
        ref={svgRef}
        viewBox="0 0 300 340"
        className="w-full h-full"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center",
          transition: isGesturing ? "none" : "transform 0.2s ease",
          touchAction: "none",
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onClick={(e) => {
          if (e.target === svgRef.current) selectElement(null);
        }}
      >
        {/* Garment template */}
        {getTemplate(garmentType, viewAngle, baseColor, secondaryColor)}

        {/* Design elements (only for the active view) */}
        {visibleElements.map((element) => {
          const cx = element.x + element.width / 2;
          const cy = element.y + element.height / 2;
          const isSelected = selectedElementId === element.id;
          return (
            <g
              key={element.id}
              transform={`rotate(${element.rotation} ${cx} ${cy})`}
              onPointerDown={(e) => startDrag(e, element)}
              style={{ cursor: element.locked ? "not-allowed" : "move" }}
            >
              {renderDesignElement(element)}

              {/* Selection indicator + resize handle */}
              {isSelected && (
                <g data-export-ignore="true">
                  <rect
                    x={element.x - 2}
                    y={element.y - 2}
                    width={element.width + 4}
                    height={element.height + 4}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    rx="2"
                    className={cn(isGesturing ? "" : "animate-pulse")}
                  />
                  {!element.locked && (
                    <circle
                      cx={element.x + element.width + 2}
                      cy={element.y + element.height + 2}
                      r="7"
                      fill="#ffffff"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      style={{ cursor: "nwse-resize" }}
                      onPointerDown={(e) => startResize(e, element)}
                    />
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
