import Link from "next/link";
import { Phone, Mail, MessageCircle, Facebook, Instagram, Youtube, Linkedin, Twitter } from "lucide-react";

const companyLinks = [
  { label: "About Us", href: "#" },
  { label: "How It Works", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Press & Media", href: "#" },
  { label: "Contact Us", href: "#" },
];

const workerLinks = [
  { label: "Find Work", href: "#" },
  { label: "How It Works", href: "#" },
  { label: "Safety & Security", href: "#" },
  { label: "Wallet & Payments", href: "#" },
  { label: "Help Center", href: "#" },
];

const customerLinks = [
  { label: "Hire Workers", href: "#" },
  { label: "How It Works", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Post a Job", href: "#" },
  { label: "Help Center", href: "#" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Refund Policy", href: "#" },
  { label: "Cancellation Policy", href: "#" },
  { label: "Grievance Policy", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-[#0a1128]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">

          {/* Support Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#1a2d6d] to-[#0f1d4a] rounded-2xl p-5 border border-blue-500/10">
              <h3 className="text-white font-bold text-[15px] leading-tight mb-0.5">Have Questions?</h3>
              <h3 className="text-white font-bold text-[15px] leading-tight mb-3">We&apos;re Here to Help!</h3>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                Our support team is available 24/7 to assist you with anything.
              </p>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[12px] text-gray-300">+91 91234 56789</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[12px] text-gray-300">support@hireme.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[12px] text-gray-300">+91 91234 56789</span>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#0a1128] text-xs font-bold rounded-full hover:bg-gray-100 transition-all">
                <MessageCircle className="w-3.5 h-3.5" />
                Chat with Support
              </button>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-[13px] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[12px] text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Workers */}
          <div>
            <h4 className="text-white font-bold text-[13px] mb-4">For Workers</h4>
            <ul className="space-y-2.5">
              {workerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[12px] text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="text-white font-bold text-[13px] mb-4">For Customers</h4>
            <ul className="space-y-2.5">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[12px] text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-[13px] mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[12px] text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us + Download */}
          <div>
            <h4 className="text-white font-bold text-[13px] mb-4">Follow Us</h4>
            <div className="flex gap-2 mb-6 flex-wrap">
              {[Facebook, Instagram, Instagram, Youtube, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-white/20 hover:text-white transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            <h4 className="text-white font-bold text-[13px] mb-3">Download Our App</h4>
            <div className="flex gap-2">
              {/* Google Play */}
              <a href="#" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg border border-white/10 hover:bg-white/15 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" fill="#ffffff"/>
                </svg>
                <div className="leading-none">
                  <div className="text-[7px] text-gray-400 uppercase">Get it on</div>
                  <div className="text-[10px] text-white font-bold">Google Play</div>
                </div>
              </a>
              {/* App Store */}
              <a href="#" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg border border-white/10 hover:bg-white/15 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.81 11.78 5.7 12.58 5.7C13.38 5.7 14.86 4.62 16.41 4.8C17.05 4.83 18.86 5.08 20.01 6.77C19.89 6.85 17.57 8.22 17.6 11.04C17.63 14.38 20.53 15.47 20.57 15.48C20.53 15.58 20.07 17.19 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                </svg>
                <div className="leading-none">
                  <div className="text-[7px] text-gray-400 uppercase">Download on the</div>
                  <div className="text-[10px] text-white font-bold">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f5c518] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a1128" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-sm font-extrabold text-white">Hire<span className="text-[#f5c518]">Me</span></span>
              <div className="text-[8px] text-gray-500">AI-Powered Work. Better Life.</div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-gray-500">
            © 2026 HireMe. All rights reserved.
          </p>

          {/* Powered by */}
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            Powered by <a href="https://algoguido.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Algoguido Technologies</a>
          </p>
        </div>
      </div>
    </footer>
  );
}