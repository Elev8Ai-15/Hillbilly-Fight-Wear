// On-brand clipart drawn in a 100x100 viewBox. "primary" paths take the
// element's fill color, "secondary" paths take its secondaryFill.
export interface ClipartPath {
  d: string;
  use: "primary" | "secondary";
}

export interface Clipart {
  id: string;
  label: string;
  paths: ClipartPath[];
}

export const cliparts: Clipart[] = [
  {
    id: "viper",
    label: "Viper Head",
    paths: [
      {
        d: "M50,4 C64,8 76,18 80,34 C83,46 77,58 68,68 C61,76 55,84 50,92 C45,84 39,76 32,68 C23,58 17,46 20,34 C24,18 36,8 50,4 Z",
        use: "primary",
      },
      { d: "M36,28 L44,40 L39,43 L32,32 Z", use: "secondary" },
      { d: "M64,28 L56,40 L61,43 L68,32 Z", use: "secondary" },
      { d: "M44,54 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", use: "secondary" },
      { d: "M50,54 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", use: "secondary" },
      {
        d: "M48,90 L45,102 L41,108 L44,109 L49,101 L50,96 L51,101 L56,109 L59,108 L55,102 L52,90 Z",
        use: "primary",
      },
    ],
  },
  {
    id: "skull",
    label: "Skull",
    paths: [
      {
        d: "M50,4 C24,4 10,22 10,44 C10,58 17,68 26,74 L26,88 C26,92 29,95 33,95 L67,95 C71,95 74,92 74,88 L74,74 C83,68 90,58 90,44 C90,22 76,4 50,4 Z",
        use: "primary",
      },
      { d: "M24,42 a10,12 0 1,0 20,0 a10,12 0 1,0 -20,0", use: "secondary" },
      { d: "M56,42 a10,12 0 1,0 20,0 a10,12 0 1,0 -20,0", use: "secondary" },
      { d: "M50,54 L43,68 L57,68 Z", use: "secondary" },
      { d: "M40,78 L43,78 L43,93 L40,93 Z", use: "secondary" },
      { d: "M48,78 L51,78 L51,93 L48,93 Z", use: "secondary" },
      { d: "M56,78 L59,78 L59,93 L56,93 Z", use: "secondary" },
    ],
  },
  {
    id: "lightning",
    label: "Lightning",
    paths: [
      { d: "M55,2 L20,55 L42,55 L30,98 L80,40 L55,40 L72,2 Z", use: "primary" },
    ],
  },
  {
    id: "mountains",
    label: "Mountains",
    paths: [
      { d: "M2,82 L30,28 L45,56 L62,16 L98,82 Z", use: "primary" },
      { d: "M30,28 L37,42 L30,40 L24,44 Z", use: "secondary" },
      { d: "M62,16 L71,34 L62,30 L54,36 Z", use: "secondary" },
    ],
  },
  {
    id: "jug",
    label: "Moonshine Jug",
    paths: [
      {
        d: "M38,20 L38,12 C38,8 42,6 50,6 C58,6 62,8 62,12 L62,20 C76,26 84,38 84,58 L84,82 C84,90 78,94 70,94 L30,94 C22,94 16,90 16,82 L16,58 C16,38 24,26 38,20 Z",
        use: "primary",
      },
      { d: "M30,58 L36,58 L48,76 L42,76 Z", use: "secondary" },
      { d: "M42,58 L48,58 L36,76 L30,76 Z", use: "secondary" },
      { d: "M47,58 L53,58 L65,76 L59,76 Z", use: "secondary" },
      { d: "M59,58 L65,58 L53,76 L47,76 Z", use: "secondary" },
      { d: "M64,24 C74,26 80,32 80,40 C80,46 75,50 68,50 L68,42 C71,42 72,41 72,39 C72,34 68,31 64,30 Z", use: "secondary" },
    ],
  },
  {
    id: "barbed-wire",
    label: "Barbed Wire",
    paths: [
      { d: "M2,48 L98,48 L98,52 L2,52 Z", use: "primary" },
      { d: "M20,36 L25,36 L32,64 L27,64 Z", use: "primary" },
      { d: "M27,36 L32,36 L25,64 L20,64 Z", use: "primary" },
      { d: "M48,36 L53,36 L60,64 L55,64 Z", use: "primary" },
      { d: "M55,36 L60,36 L53,64 L48,64 Z", use: "primary" },
      { d: "M76,36 L81,36 L88,64 L83,64 Z", use: "primary" },
      { d: "M83,36 L88,36 L81,64 L76,64 Z", use: "primary" },
    ],
  },
  {
    id: "hatchets",
    label: "Crossed Hatchets",
    paths: [
      { d: "M20,80 L74,26 L80,32 L26,86 Z", use: "secondary" },
      { d: "M80,80 L26,26 L20,32 L74,86 Z", use: "secondary" },
      {
        d: "M68,6 C80,8 92,18 94,30 C86,34 74,32 66,26 C62,18 63,10 68,6 Z",
        use: "primary",
      },
      {
        d: "M32,6 C20,8 8,18 6,30 C14,34 26,32 34,26 C38,18 37,10 32,6 Z",
        use: "primary",
      },
    ],
  },
  {
    id: "horseshoe",
    label: "Horseshoe",
    paths: [
      {
        d: "M50,6 C24,6 12,32 12,52 C12,72 22,88 30,94 L40,84 C32,78 24,66 24,52 C24,40 32,18 50,18 C68,18 76,40 76,52 C76,66 68,78 60,84 L70,94 C78,88 88,72 88,52 C88,32 76,6 50,6 Z",
        use: "primary",
      },
      { d: "M18,40 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0", use: "secondary" },
      { d: "M74,40 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0", use: "secondary" },
      { d: "M24,66 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0", use: "secondary" },
      { d: "M68,66 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0", use: "secondary" },
    ],
  },
  {
    id: "banner",
    label: "Ribbon Banner",
    paths: [
      { d: "M14,36 L86,36 L86,64 L14,64 Z", use: "primary" },
      { d: "M14,42 L2,42 L8,53 L2,64 L14,64 Z", use: "secondary" },
      { d: "M86,42 L98,42 L92,53 L98,64 L86,64 Z", use: "secondary" },
    ],
  },
  {
    id: "shield",
    label: "Shield",
    paths: [
      {
        d: "M50,4 L90,16 L90,48 C90,74 72,90 50,96 C28,90 10,74 10,48 L10,16 Z",
        use: "primary",
      },
      {
        d: "M50,14 L81,23 L81,48 C81,68 67,81 50,86 C33,81 19,68 19,48 L19,23 Z",
        use: "secondary",
      },
    ],
  },
];

export function getClipart(id: string): Clipart | undefined {
  return cliparts.find((c) => c.id === id);
}
