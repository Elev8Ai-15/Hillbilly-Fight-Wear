import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";

interface ChatRequestBody {
  messages: { role: string; content: string }[];
}

// AI-powered chat responses using product knowledge base
function generateResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  // Sizing queries
  if (msg.includes("size") || msg.includes("sizing") || msg.includes("fit")) {
    return "Our sizing runs true to standard US sizes. For fight shorts and rashguards, we recommend ordering your regular size for a snug compression fit, or one size up for a relaxed fit. If you're between sizes, size up. Need specific measurements? Let me know which product you're looking at!";
  }

  // Custom design queries
  if (
    msg.includes("custom") ||
    msg.includes("design") ||
    msg.includes("personalize") ||
    msg.includes("designer")
  ) {
    return "Our Custom Garment Designer lets you create one-of-a-kind fight wear! You can customize T-shirts, fight shorts, rashguards, hoodies, and spats. Choose your colors, add text and logos, and preview your design in real-time. Head to /custom-designer to get started. Custom orders ship in 7-10 business days.";
  }

  // Shipping queries
  if (
    msg.includes("ship") ||
    msg.includes("delivery") ||
    msg.includes("shipping")
  ) {
    return "We offer free shipping on orders over $99! Standard orders ship within 3-5 business days. Custom designed items take 7-10 business days to produce and ship. We ship to all 50 US states and internationally. Need it faster? Contact us about rush options.";
  }

  // Return queries
  if (
    msg.includes("return") ||
    msg.includes("refund") ||
    msg.includes("exchange")
  ) {
    return "We offer a 30-day hassle-free return policy on all non-custom items. Items must be unworn with tags attached. Custom designed items are final sale since they're made specifically for you. For exchanges, just reach out to us and we'll make it right.";
  }

  // Product recommendations
  if (
    msg.includes("recommend") ||
    msg.includes("suggestion") ||
    msg.includes("best") ||
    msg.includes("popular")
  ) {
    const bestsellers = products
      .filter((p) => p.tags.includes("bestseller"))
      .map((p) => `${p.name} ($${p.price})`)
      .join(", ");
    return `Our bestsellers right now are: ${bestsellers}. They're top-rated by fighters and always in demand. Want me to help you pick the right one for your training style?`;
  }

  // MMA / BJJ specific
  if (
    msg.includes("mma") ||
    msg.includes("bjj") ||
    msg.includes("boxing") ||
    msg.includes("wrestling") ||
    msg.includes("muay thai")
  ) {
    return "We've got gear for all combat sports! For MMA, check out our Copperhead Strike Fight Shorts and Backwoods Brawler Boxing Gloves. For BJJ, our Moonshine Grappler Rashguard and Ridge Runner Spats are competition-approved. Everything is designed to perform in training and competition.";
  }

  // Pricing
  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("expensive") ||
    msg.includes("cheap") ||
    msg.includes("discount")
  ) {
    return "Our gear ranges from $34.99 for tees to $89.99 for premium leather boxing gloves. Custom designs start at $44.99 for T-shirts. We regularly run sales — sign up for our newsletter for exclusive fighter discounts. Orders over $99 get free shipping!";
  }

  // Material queries
  if (
    msg.includes("material") ||
    msg.includes("fabric") ||
    msg.includes("quality") ||
    msg.includes("durable")
  ) {
    return "We use premium materials throughout. Our rashguards and spats feature 4-way stretch polyester/spandex blends with antimicrobial treatment. Fight shorts have reinforced split seams and silicone grip waistbands. Boxing gloves are genuine leather with multi-layered foam. Everything is built to last through intense training.";
  }

  // Default helpful response
  return "I can help you with product recommendations, sizing info, custom design options, shipping details, and more. What would you like to know about? You can also browse our full collection at /products or try our Custom Designer to create your own fight wear!";
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const lastMessage = body.messages[body.messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "No user message provided" },
        { status: 400 }
      );
    }

    const response = generateResponse(lastMessage.content);

    return NextResponse.json({ message: response });
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
