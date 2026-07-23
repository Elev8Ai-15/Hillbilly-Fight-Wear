"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useDesignerStore } from "@/store/designer-store";
import {
  DesignElement,
  TextElementData,
  ImageElementData,
  ShapeElementData,
  ClipartElementData,
} from "@/types";
import { getClipart } from "@/data/cliparts";
import { cn } from "@/lib/utils";

/**
 * Garment art. Each view has:
 *  - outline: silhouette path(s) used for the base fill, shading and the
 *    clip path that keeps design elements on the garment
 *  - details: trim/seam art drawn on top (accent = secondaryColor)
 *  - shadow: soft floor shadow under the garment
 */
interface GarmentView {
  outlines: string[];
  details: (base: string, accent: string) => React.ReactNode;
  shadow: { cy: number; rx: number };
}

const seam = (d: string, w = 1.5, o = 0.25) => (
  <path key={d} d={d} fill="none" stroke="#000" strokeWidth={w} opacity={o} />
);
const stitch = (d: string) => (
  <path
    key={d}
    d={d}
    fill="none"
    stroke="#000"
    strokeWidth="1"
    opacity="0.2"
    strokeDasharray="4 3"
  />
);

const TEE_FRONT =
  "M118,58 C130,50 170,50 182,58 L210,72 C228,80 238,94 244,110 C247,118 249,126 246,132 C240,139 229,142 221,138 L216,126 C214,160 212,220 213,290 C213,296 209,300 203,300 L97,300 C91,300 87,296 87,290 C88,220 86,160 84,126 L79,138 C71,142 60,139 54,132 C51,126 53,118 56,110 C62,94 72,80 90,72 Z";
const SHORTS_FRONT =
  "M70,78 L230,78 L235,114 C243,158 250,208 254,252 C255,262 252,268 244,268 L172,268 C167,268 164,265 163,260 L152,190 L148,190 L137,260 C136,265 133,268 128,268 L56,268 C48,268 45,262 46,252 C50,208 57,158 65,114 Z";
const RASH_FRONT =
  "M124,52 C134,45 166,45 176,52 L200,66 C216,74 226,90 231,110 L249,208 C251,220 252,231 251,238 C245,243 233,244 227,240 C222,230 218,220 215,208 L206,146 C206,200 205,260 205,300 C205,304 201,306 197,306 L103,306 C99,306 95,304 95,300 C95,260 94,200 94,146 L85,208 C82,220 78,230 73,240 C67,244 55,243 49,238 C48,231 49,220 51,208 L69,110 C74,90 84,74 100,66 Z";
const HOODIE_HOOD =
  "M106,66 C100,32 126,12 150,12 C174,12 200,32 194,66 L182,72 L118,72 Z";
const HOODIE_BODY =
  "M106,66 L94,76 C76,84 66,98 60,116 L44,196 C42,206 43,214 46,218 C52,223 62,223 68,218 L82,180 L84,180 C83,220 83,258 84,288 C84,295 88,300 95,300 L205,300 C212,300 216,295 216,288 C217,258 217,220 216,180 L218,180 L232,218 C238,223 248,223 254,218 C257,214 258,206 256,196 L240,116 C234,98 224,84 206,76 L194,66 L180,64 C170,80 130,80 120,64 Z";
const SPATS_FRONT =
  "M94,70 L206,70 L209,102 C212,142 210,182 206,222 L201,318 C201,323 198,326 193,326 L163,326 C159,326 156,323 156,318 L152,186 L148,186 L144,318 C144,323 141,326 137,326 L107,326 C102,326 99,323 99,318 L94,222 C90,182 88,142 91,102 Z";

// Simple side profiles shared by left/right (mirrored via transform)
const TEE_SIDE =
  "M126,58 C140,50 168,52 176,60 C186,72 192,88 192,106 L192,290 C192,296 188,300 182,300 L118,300 C112,300 108,296 108,290 L108,106 C108,86 112,68 126,58 Z";
const SHORTS_SIDE =
  "M106,78 L194,78 L198,116 C202,160 204,210 204,252 C204,262 200,268 192,268 L108,268 C100,268 96,262 96,252 C96,210 98,160 102,116 Z";
const RASH_SIDE =
  "M128,52 C140,45 164,46 172,54 C182,66 188,84 188,104 L188,296 C188,302 184,306 178,306 L122,306 C116,306 112,302 112,296 L112,104 C112,84 116,64 128,52 Z";
const HOODIE_SIDE_HOOD =
  "M116,64 C110,32 132,12 152,12 C172,12 190,30 186,62 L176,70 L124,70 Z";
const HOODIE_SIDE_BODY =
  "M116,64 L106,76 C96,88 92,104 92,122 L92,286 C92,294 96,300 104,300 L196,300 C204,300 208,294 208,286 L208,122 C208,102 204,86 194,74 L186,62 L176,70 L124,70 Z";
const SPATS_SIDE =
  "M118,70 L182,70 L186,104 C188,146 187,188 184,226 L180,318 C180,323 177,326 172,326 L128,326 C123,326 120,323 120,318 L116,226 C113,188 112,146 114,104 Z";

function buildGarmentViews(): Record<string, Record<string, GarmentView>> {
  const tee = (isBack: boolean): GarmentView => ({
    outlines: [TEE_FRONT],
    shadow: { cy: 316, rx: 92 },
    details: (base, accent) => (
      <g>
        <path
          d={
            isBack
              ? "M118,58 C130,52 170,52 182,58 C170,66 130,66 118,58 Z"
              : "M118,58 C130,52 170,52 182,58 C172,76 128,76 118,58 Z"
          }
          fill="#000"
          opacity="0.45"
        />
        <path
          d={
            isBack
              ? "M118,58 C130,52 170,52 182,58 C170,66 130,66 118,58 Z"
              : "M118,58 C130,52 170,52 182,58 C172,76 128,76 118,58 Z"
          }
          fill="none"
          stroke={accent}
          strokeWidth="3"
          opacity="0.9"
        />
        {seam("M216,126 C213,108 212,90 210,72")}
        {seam("M84,126 C87,108 88,90 90,72")}
        <path
          d="M221,138 L246,132 C247,135 246,138 243,140 L224,145 Z"
          fill={accent}
          opacity="0.95"
        />
        <path
          d="M79,138 L54,132 C53,135 54,138 57,140 L76,145 Z"
          fill={accent}
          opacity="0.95"
        />
        {stitch("M89,292 L211,292")}
      </g>
    ),
  });

  const shorts = (isBack: boolean): GarmentView => ({
    outlines: [SHORTS_FRONT],
    shadow: { cy: 286, rx: 105 },
    details: (base, accent) => (
      <g>
        <path
          d="M65,114 C57,158 50,208 46,252 C45,262 48,268 56,268 L74,268 C68,212 68,158 72,114 L70,78 Z"
          fill={accent}
          opacity="0.9"
        />
        <path
          d="M235,114 C243,158 250,208 254,252 C255,262 252,268 244,268 L226,268 C232,212 232,158 228,114 L230,78 Z"
          fill={accent}
          opacity="0.9"
        />
        <path d="M70,78 L230,78 L232,96 L68,96 Z" fill="#000" opacity="0.55" />
        {!isBack && (
          <path
            d="M138,84 C144,90 156,90 162,84"
            stroke={accent}
            strokeWidth="2.5"
            fill="none"
          />
        )}
        {!isBack && seam("M150,96 L150,190")}
        {stitch("M58,258 L134,258")}
        {stitch("M166,258 L242,258")}
      </g>
    ),
  });

  const rash = (isBack: boolean): GarmentView => ({
    outlines: [RASH_FRONT],
    shadow: { cy: 316, rx: 88 },
    details: (base, accent) => (
      <g>
        <path
          d={
            isBack
              ? "M124,52 C134,47 166,47 176,52 C168,60 132,60 124,52 Z"
              : "M124,52 C134,47 166,47 176,52 C168,66 132,66 124,52 Z"
          }
          fill="#000"
          opacity="0.5"
        />
        <path
          d={
            isBack
              ? "M124,52 C134,47 166,47 176,52 C168,60 132,60 124,52 Z"
              : "M124,52 C134,47 166,47 176,52 C168,66 132,66 124,52 Z"
          }
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          opacity="0.9"
        />
        <path
          d="M227,240 C233,244 245,243 251,238 L252,246 C246,251 234,252 228,248 Z"
          fill={accent}
        />
        <path
          d="M73,240 C67,244 55,243 49,238 L48,246 C54,251 66,252 72,248 Z"
          fill={accent}
        />
        {seam("M112,70 C106,120 104,200 104,300", 1.2, 0.22)}
        {seam("M188,70 C194,120 196,200 196,300", 1.2, 0.22)}
        {seam("M206,146 C209,120 205,90 200,66", 1.8, 0.3)}
        {seam("M94,146 C91,120 95,90 100,66", 1.8, 0.3)}
        {stitch("M97,298 L203,298")}
      </g>
    ),
  });

  const hoodie = (isBack: boolean): GarmentView => ({
    outlines: [HOODIE_HOOD, HOODIE_BODY],
    shadow: { cy: 316, rx: 98 },
    details: (base, accent) => (
      <g>
        <path d={HOODIE_HOOD} fill="#000" opacity="0.12" />
        {!isBack && (
          <path
            d="M120,64 C120,40 132,30 150,30 C168,30 180,40 180,64 C170,74 130,74 120,64 Z"
            fill="#000"
            opacity="0.5"
          />
        )}
        {seam("M84,180 C84,150 86,120 94,76", 2, 0.3)}
        {seam("M216,180 C216,150 214,120 206,76", 2, 0.3)}
        {!isBack && (
          <>
            <path d="M112,210 L188,210 L196,256 L104,256 Z" fill="#000" opacity="0.18" />
            <path
              d="M112,210 L188,210 L196,256 L104,256 Z"
              fill="none"
              stroke="#000"
              strokeWidth="1.5"
              opacity="0.3"
            />
            <path
              d="M142,74 L140,100 M158,74 L160,100"
              stroke={accent}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        <path
          d="M84,284 L216,284 L216,288 C216,295 212,300 205,300 L95,300 C88,300 84,295 84,288 Z"
          fill="#000"
          opacity="0.3"
        />
        <path
          d="M46,218 C52,223 62,223 68,218 L70,226 C63,231 51,231 45,226 Z"
          fill={accent}
        />
        <path
          d="M254,218 C248,223 238,223 232,218 L230,226 C237,231 249,231 255,226 Z"
          fill={accent}
        />
      </g>
    ),
  });

  const spats = (isBack: boolean): GarmentView => ({
    outlines: [SPATS_FRONT],
    shadow: { cy: 330, rx: 75 },
    details: (base, accent) => (
      <g>
        <path d="M94,70 L206,70 L207,86 L93,86 Z" fill="#000" opacity="0.55" />
        <path
          d="M91,102 C88,142 90,182 94,222 L99,318 L106,318 L101,222 C97,182 95,142 98,102 L98,86 L93,86 Z"
          fill={accent}
          opacity="0.9"
        />
        <path
          d="M209,102 C212,142 210,182 206,222 L201,318 L194,318 L199,222 C203,182 205,142 202,102 L202,86 L207,86 Z"
          fill={accent}
          opacity="0.9"
        />
        {!isBack && seam("M150,86 L150,186")}
        {seam("M100,240 L143,240", 1, 0.18)}
        {seam("M157,240 L200,240", 1, 0.18)}
        <path
          d="M99,314 L144,314 L144,318 C144,323 141,326 137,326 L107,326 C102,326 99,323 99,318 Z"
          fill="#000"
          opacity="0.35"
        />
        <path
          d="M156,314 L201,314 L201,318 C201,323 198,326 193,326 L163,326 C159,326 156,323 156,318 Z"
          fill="#000"
          opacity="0.35"
        />
      </g>
    ),
  });

  const side = (
    outlines: string[],
    shadow: GarmentView["shadow"],
    details: GarmentView["details"]
  ): GarmentView => ({ outlines, shadow, details });

  const teeSide = side([TEE_SIDE], { cy: 316, rx: 55 }, (base, accent) => (
    <g>
      <path
        d="M112,80 C130,70 172,72 186,82 L188,150 C188,158 182,162 174,162 L128,162 C116,162 110,152 110,138 Z"
        fill="#000"
        opacity="0.12"
      />
      {seam("M110,160 L190,160", 1.5, 0.28)}
      <path d="M110,152 L190,152 L190,160 L110,160 Z" fill={accent} opacity="0.9" />
      {stitch("M110,292 L190,292")}
    </g>
  ));
  const shortsSide = side([SHORTS_SIDE], { cy: 286, rx: 62 }, (base, accent) => (
    <g>
      <path d="M106,78 L194,78 L195,96 L105,96 Z" fill="#000" opacity="0.55" />
      <path
        d="M142,96 L158,96 L160,268 L140,268 Z"
        fill={accent}
        opacity="0.9"
      />
      {stitch("M100,258 L200,258")}
    </g>
  ));
  const rashSide = side([RASH_SIDE], { cy: 316, rx: 50 }, (base, accent) => (
    <g>
      <path
        d="M116,84 C130,74 170,76 184,86 L184,236 C184,244 178,248 170,248 L130,248 C122,248 116,244 116,236 Z"
        fill="#000"
        opacity="0.12"
      />
      {seam("M116,246 L184,246", 1.5, 0.28)}
      <path d="M116,240 L184,240 L184,248 L116,248 Z" fill={accent} opacity="0.9" />
      {stitch("M115,298 L185,298")}
    </g>
  ));
  const hoodieSide = side(
    [HOODIE_SIDE_HOOD, HOODIE_SIDE_BODY],
    { cy: 316, rx: 68 },
    (base, accent) => (
      <g>
        <path d={HOODIE_SIDE_HOOD} fill="#000" opacity="0.18" />
        {seam("M124,70 L176,70", 1.5, 0.3)}
        <path
          d="M92,284 L208,284 L208,286 C208,294 204,300 196,300 L104,300 C96,300 92,294 92,286 Z"
          fill="#000"
          opacity="0.3"
        />
        <path
          d="M120,96 C132,88 168,90 180,98 L182,244 C182,252 176,256 168,256 L132,256 C124,256 118,252 118,244 Z"
          fill="#000"
          opacity="0.1"
        />
        <path d="M118,248 L182,248 L182,256 L118,256 Z" fill={accent} opacity="0.9" />
      </g>
    )
  );
  const spatsSide = side([SPATS_SIDE], { cy: 330, rx: 42 }, (base, accent) => (
    <g>
      <path d="M118,70 L182,70 L183,86 L117,86 Z" fill="#000" opacity="0.55" />
      <path d="M144,86 L156,86 L158,326 L142,326 Z" fill={accent} opacity="0.9" />
      <path
        d="M120,314 L180,314 L180,318 C180,323 177,326 172,326 L128,326 C123,326 120,323 120,318 Z"
        fill="#000"
        opacity="0.35"
      />
    </g>
  ));

  return {
    tshirts: { front: tee(false), back: tee(true), left: teeSide, right: teeSide },
    hoodies: {
      front: hoodie(false),
      back: hoodie(true),
      left: hoodieSide,
      right: hoodieSide,
    },
    shorts: {
      front: shorts(false),
      back: shorts(true),
      left: shortsSide,
      right: shortsSide,
    },
    rashguards: {
      front: rash(false),
      back: rash(true),
      left: rashSide,
      right: rashSide,
    },
    spats: {
      front: spats(false),
      back: spats(true),
      left: spatsSide,
      right: spatsSide,
    },
  };
}

const garmentViews = buildGarmentViews();

const fallbackView: GarmentView = {
  outlines: [
    "M70,70 C70,64 76,60 84,60 L216,60 C224,60 230,64 230,70 L230,270 C230,276 224,280 216,280 L84,280 C76,280 70,276 70,270 Z",
  ],
  shadow: { cy: 296, rx: 85 },
  details: () => null,
};

function getView(garmentType: string, viewAngle: string): GarmentView {
  return garmentViews[garmentType]?.[viewAngle] ?? fallbackView;
}

function renderDesignElement(element: DesignElement) {
  const style = {
    opacity: element.opacity,
  };

  if (element.type === "text") {
    const data = element.data as TextElementData;
    const anchorX =
      data.textAlign === "center"
        ? element.x + element.width / 2
        : data.textAlign === "right"
          ? element.x + element.width
          : element.x;
    const cy = element.y + element.height / 2;

    // Arched text rides an invisible curved path
    if (data.arc) {
      const s = (data.arc / 100) * element.height;
      const arcPath = `M${element.x},${cy + s / 2} Q${element.x + element.width / 2},${cy - s * 1.5} ${element.x + element.width},${cy + s / 2}`;
      return (
        <g key={element.id} style={style}>
          <path id={`arc-${element.id}`} d={arcPath} fill="none" />
          <text
            fontFamily={data.fontFamily}
            fontSize={data.fontSize}
            fontWeight={data.fontWeight}
            fill={data.color}
            stroke={data.stroke}
            strokeWidth={data.stroke ? data.strokeWidth || 1 : undefined}
          >
            <textPath
              href={`#arc-${element.id}`}
              xlinkHref={`#arc-${element.id}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {data.content}
            </textPath>
          </text>
        </g>
      );
    }

    return (
      <text
        key={element.id}
        x={anchorX}
        y={cy}
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

  if (element.type === "clipart") {
    const data = element.data as ClipartElementData;
    const art = getClipart(data.clipartId);
    if (!art) return null;
    return (
      <svg
        key={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={style}
        overflow="visible"
      >
        {art.paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.use === "primary" ? data.fill : data.secondaryFill || "#0a0a0a"}
          />
        ))}
      </svg>
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
  const selectedElement = visibleElements.find(
    (el) => el.id === selectedElementId
  );

  const view = getView(garmentType, viewAngle);
  const mirrored = viewAngle === "right";

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
            Start from a template, or add text, art and logos from the panel
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
        <defs>
          <linearGradient id="garment-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.28" />
            <stop offset="0.16" stopColor="#000" stopOpacity="0" />
            <stop offset="0.84" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="garment-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0.03" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="garment-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id="garment-clip">
            {view.outlines.map((d) => (
              <path key={d} d={d} transform={mirrored ? "translate(300,0) scale(-1,1)" : undefined} />
            ))}
          </clipPath>
        </defs>

        {/* Floor shadow */}
        <ellipse
          cx="150"
          cy={view.shadow.cy}
          rx={view.shadow.rx}
          ry="9"
          fill="#000"
          opacity="0.12"
          filter="url(#garment-soft)"
        />

        {/* Garment base + shading + trim */}
        <g transform={mirrored ? "translate(300,0) scale(-1,1)" : undefined}>
          {view.outlines.map((d) => (
            <g key={d}>
              <path d={d} fill={baseColor} />
              <path d={d} fill="url(#garment-shade)" />
              <path d={d} fill="url(#garment-sheen)" />
            </g>
          ))}
          {view.details(baseColor, secondaryColor)}
        </g>

        {/* Design elements, clipped to the garment */}
        <g clipPath="url(#garment-clip)">
          {visibleElements.map((element) => {
            const cx = element.x + element.width / 2;
            const cy = element.y + element.height / 2;
            return (
              <g
                key={element.id}
                transform={`rotate(${element.rotation} ${cx} ${cy})`}
                onPointerDown={(e) => startDrag(e, element)}
                style={{ cursor: element.locked ? "not-allowed" : "move" }}
              >
                {renderDesignElement(element)}
              </g>
            );
          })}
        </g>

        {/* Selection chrome — unclipped so handles stay reachable */}
        {selectedElement && (
          <g
            data-export-ignore="true"
            transform={`rotate(${selectedElement.rotation} ${
              selectedElement.x + selectedElement.width / 2
            } ${selectedElement.y + selectedElement.height / 2})`}
          >
            <rect
              x={selectedElement.x - 2}
              y={selectedElement.y - 2}
              width={selectedElement.width + 4}
              height={selectedElement.height + 4}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              rx="2"
              className={cn(isGesturing ? "" : "animate-pulse")}
              onPointerDown={(e) => startDrag(e, selectedElement)}
              style={{
                cursor: selectedElement.locked ? "not-allowed" : "move",
              }}
            />
            {!selectedElement.locked && (
              <circle
                cx={selectedElement.x + selectedElement.width + 2}
                cy={selectedElement.y + selectedElement.height + 2}
                r="7"
                fill="#ffffff"
                stroke="#3b82f6"
                strokeWidth="1.5"
                style={{ cursor: "nwse-resize" }}
                onPointerDown={(e) => startResize(e, selectedElement)}
              />
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
