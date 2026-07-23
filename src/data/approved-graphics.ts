/**
 * The approved brand graphics library.
 *
 * This is the ONLY art users can place in the regular build-your-own flow —
 * no user-created graphics, no text tool. Every entry here must be official,
 * approved Hillbilly Fight Wear artwork.
 *
 * To add art: drop a transparent PNG (or SVG) into /public/graphics and add
 * an entry below. `aspect` = natural width / height, used for initial sizing.
 */
export interface ApprovedGraphic {
  id: string;
  label: string;
  src: string;
  aspect: number;
}

export const approvedGraphics: ApprovedGraphic[] = [
  {
    id: "hfw-wordmark",
    label: "HFW Wordmark",
    src: "/graphics/hfw-logo.png",
    aspect: 2945 / 1252,
  },
  // More official artwork goes here as files land in /public/graphics
  // (e.g. It's A Fun Ride, Cockfighter, GNF designs from the store —
  // need transparent print files, not product photos).
];

export function getApprovedGraphic(id: string): ApprovedGraphic | undefined {
  return approvedGraphics.find((g) => g.id === id);
}
