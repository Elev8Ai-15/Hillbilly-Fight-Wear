import { NextRequest, NextResponse } from "next/server";

interface GarmentPreviewRequest {
  prompt: string;
  garmentType: string;
  currentColors: {
    base: string;
    secondary: string;
  };
}

// AI-powered garment design suggestion engine
function generateDesignSuggestion(params: GarmentPreviewRequest) {
  const { prompt, garmentType } = params;
  const promptLower = prompt.toLowerCase();

  // Color scheme suggestions based on prompt keywords
  const colorSchemes: Record<string, { baseColor: string; secondaryColor: string }> = {
    aggressive: { baseColor: "#0a0a0a", secondaryColor: "#b91c1c" },
    fierce: { baseColor: "#1a1a1a", secondaryColor: "#dc2626" },
    fire: { baseColor: "#b91c1c", secondaryColor: "#f59e0b" },
    ocean: { baseColor: "#1e3a5f", secondaryColor: "#3b82f6" },
    forest: { baseColor: "#14532d", secondaryColor: "#22c55e" },
    military: { baseColor: "#3f6212", secondaryColor: "#f59e0b" },
    royal: { baseColor: "#1e3a5f", secondaryColor: "#f59e0b" },
    stealth: { baseColor: "#1f2937", secondaryColor: "#4b5563" },
    patriotic: { baseColor: "#1e3a5f", secondaryColor: "#b91c1c" },
    gold: { baseColor: "#0a0a0a", secondaryColor: "#f59e0b" },
    purple: { baseColor: "#4c1d95", secondaryColor: "#a78bfa" },
    neon: { baseColor: "#0a0a0a", secondaryColor: "#22c55e" },
    classic: { baseColor: "#ffffff", secondaryColor: "#0a0a0a" },
    snake: { baseColor: "#14532d", secondaryColor: "#92400e" },
    country: { baseColor: "#92400e", secondaryColor: "#f59e0b" },
    red: { baseColor: "#b91c1c", secondaryColor: "#ffffff" },
    blue: { baseColor: "#1e3a5f", secondaryColor: "#ffffff" },
    black: { baseColor: "#0a0a0a", secondaryColor: "#ffffff" },
    white: { baseColor: "#ffffff", secondaryColor: "#0a0a0a" },
    green: { baseColor: "#14532d", secondaryColor: "#ffffff" },
  };

  // Find matching color scheme
  let selectedScheme = { baseColor: "#0a0a0a", secondaryColor: "#b91c1c" };
  for (const [keyword, scheme] of Object.entries(colorSchemes)) {
    if (promptLower.includes(keyword)) {
      selectedScheme = scheme;
      break;
    }
  }

  // Extract text content from prompt
  const textMatches = prompt.match(/['"]([^'"]+)['"]/);
  const teamNameMatch = promptLower.match(
    /(?:team|gym|name|text|write|say)[:\s]+([^\s,]+(?:\s+[^\s,]+)*)/
  );
  const suggestedText =
    textMatches?.[1] ||
    teamNameMatch?.[1]?.toUpperCase() ||
    (garmentType === "shorts" ? "HFW" : "HILLBILLY FIGHT WEAR");

  return {
    suggestions: {
      baseColor: selectedScheme.baseColor,
      secondaryColor: selectedScheme.secondaryColor,
      text: suggestedText,
    },
    description: `I've created a ${garmentType} design based on your description. The color scheme uses ${selectedScheme.baseColor} as the base with ${selectedScheme.secondaryColor} accents. I've also added "${suggestedText}" as text. Feel free to adjust colors, position, and add more elements!`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GarmentPreviewRequest = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "No design prompt provided" },
        { status: 400 }
      );
    }

    const result = generateDesignSuggestion(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate design suggestion" },
      { status: 500 }
    );
  }
}
