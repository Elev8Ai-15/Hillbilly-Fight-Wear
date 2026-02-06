"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black">
            Get in <span className="text-primary-light">Touch</span>
          </h1>
          <p className="text-gray-300 mt-2">
            Questions, custom orders, or just want to holler at us? We&apos;re here
            for it.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black mb-4">Contact Info</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Email</p>
                    <p className="text-gray-500 text-sm">
                      info@hillbillyfightwear.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Phone</p>
                    <p className="text-gray-500 text-sm">(555) 867-5309</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Location</p>
                    <p className="text-gray-500 text-sm">
                      Somewhere in Appalachia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black mb-4">Quick Help</h2>
              <div className="space-y-3">
                {[
                  "Sizing runs true to standard US sizes",
                  "Custom orders ship in 7-10 business days",
                  "Standard orders ship in 3-5 business days",
                  "30-day return policy on non-custom items",
                  "Free shipping on orders over $99",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <MessageSquare size={14} className="text-primary mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={20} className="text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-green-800">
                  Message Sent!
                </h3>
                <p className="text-green-600 text-sm mt-2">
                  We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormState({
                      name: "",
                      email: "",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="mt-4 text-sm text-primary font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState({ ...formState, subject: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
