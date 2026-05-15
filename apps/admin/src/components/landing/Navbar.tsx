"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Workers", href: "#for-workers" },
  { label: "For Customers", href: "#for-customers" },
  { label: "Features", href: "#features" },
  { label: "AI Advantage", href: "#ai-advantage" },
  { label: "Pricing", href: "#pricing" },
  { label: "About Us", href: "#about" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a1128]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex items-center gap-1">
            <div className="w-9 h-9 bg-[#f5c518] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a1128" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="flex flex-col leading-tight ml-1">
              <span className="text-lg font-extrabold text-white tracking-tight">
                Hire<span className="text-[#f5c518]">Me</span>
              </span>
              <span className="text-[9px] text-gray-400 font-medium -mt-0.5">AI-Powered Work. Better Life.</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-gray-300">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-white transition-colors py-1 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#f5c518] group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 px-5 py-2 bg-[#f5c518] text-[#0a1128] text-sm font-bold rounded-full hover:bg-[#e6b800] transition-all group"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0a1128] border-t border-white/5 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-sm text-gray-300 hover:text-white py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/register"
            className="block w-full text-center px-5 py-2.5 bg-[#f5c518] text-[#0a1128] text-sm font-bold rounded-full mt-4"
          >
            Get Started →
          </Link>
        </div>
      )}
    </nav>
  );
}
