import Link from "next/link";

const footerLinks = {
  shop: [
    { name: "Fight Shorts", href: "/products?category=shorts" },
    { name: "Rashguards", href: "/products?category=rashguards" },
    { name: "Gloves", href: "/products?category=gloves" },
    { name: "Hoodies", href: "/products?category=hoodies" },
    { name: "All Products", href: "/products" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Custom Designer", href: "/custom-designer" },
  ],
  support: [
    { name: "Shipping & Returns", href: "/contact" },
    { name: "Size Guide", href: "/contact" },
    { name: "FAQ", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-secondary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-black tracking-tight mb-4">
              HILLBILLY<span className="text-primary-light"> FIGHT WEAR</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Born in the backwoods, built for the cage. Premium fight gear and
              custom apparel for warriors who train hard and fight harder.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-primary-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-primary-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-primary-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Hillbilly Fight Wear. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/contact" className="hover:text-primary-light transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-primary-light transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
