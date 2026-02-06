import { Target, Users, Award, Heart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Our <span className="text-primary-light">Story</span>
            </h1>
            <p className="text-gray-300 text-lg mt-4 leading-relaxed">
              Hillbilly Fight Wear was born in the backwoods of Appalachia,
              where grit and determination aren&apos;t just words — they&apos;re
              a way of life. We bring that same toughness to every piece of
              fight gear we make.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black">
              Built Different. <span className="text-primary">Fight Different.</span>
            </h2>
            <p className="text-gray-600 mt-4 leading-relaxed">
              We started Hillbilly Fight Wear because we were tired of cookie-cutter
              fight gear that looked like everything else. Our athletes are unique —
              their gear should be too.
            </p>
            <p className="text-gray-600 mt-3 leading-relaxed">
              Every product is designed with input from active fighters, tested in
              real training environments, and built to last. When we say premium,
              we mean it — from the stitching to the sublimation, every detail matters.
            </p>
            <p className="text-gray-600 mt-3 leading-relaxed">
              Our custom garment designer lets you create one-of-a-kind fight wear
              that tells your story. Because when you step into the cage, you should
              look as fierce as you fight.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-12 flex items-center justify-center">
            <div className="text-center">
              <Target size={64} className="text-primary mx-auto mb-4" />
              <p className="text-2xl font-black">Est. 2024</p>
              <p className="text-gray-500">Appalachian Made</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: "Quality First",
                desc: "Premium materials and construction in every product we ship.",
              },
              {
                icon: Users,
                title: "Fighter Tested",
                desc: "Designed with input from real combat athletes and coaches.",
              },
              {
                icon: Award,
                title: "Unique Designs",
                desc: "Stand out from the crowd with bold, original fight wear.",
              },
              {
                icon: Heart,
                title: "Community Driven",
                desc: "Supporting local fighters, gyms, and combat sports communities.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-white p-6 rounded-xl shadow-sm text-center"
              >
                <value.icon
                  size={32}
                  className="text-primary mx-auto mb-3"
                />
                <h3 className="font-bold">{value.title}</h3>
                <p className="text-gray-500 text-sm mt-2">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-black">Ready to Gear Up?</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Browse our collection or design your own custom fight wear.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Link
            href="/products"
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            Shop Now
          </Link>
          <Link
            href="/custom-designer"
            className="bg-secondary hover:bg-secondary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            Custom Designer
          </Link>
        </div>
      </section>
    </div>
  );
}
