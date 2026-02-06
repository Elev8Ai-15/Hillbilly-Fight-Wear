import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import AIChatWidget from "@/components/ai/AIChatWidget";

export const metadata: Metadata = {
  title: "Hillbilly Fight Wear | Premium Custom Fight Gear & Apparel",
  description:
    "Born in the backwoods, built for the cage. Premium MMA, BJJ, and boxing gear with custom design options. Shop fight shorts, rashguards, gloves, and more.",
  keywords: [
    "MMA gear",
    "fight shorts",
    "rashguard",
    "boxing gloves",
    "custom fight wear",
    "BJJ apparel",
    "combat sports clothing",
  ],
  openGraph: {
    title: "Hillbilly Fight Wear | Premium Custom Fight Gear",
    description:
      "Premium MMA, BJJ, and boxing gear with custom design options.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-secondary antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartSidebar />
        <AIChatWidget />
      </body>
    </html>
  );
}
