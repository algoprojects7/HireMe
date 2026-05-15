"use client";

import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Wallet, CheckCircle, Lock, Headphones } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const rotatingTexts = [
  "Secure.",
  "Verify.",
  "Empower.",
  "Power Growth.",
  "Protect You."
];

// Hardcoded starfield positions to guarantee no SSR/client hydration mismatch
const starfieldDots = [
  { width: "2.4px", height: "1.8px", top: "12%", left: "5%" },
  { width: "1.2px", height: "2.6px", top: "8%", left: "18%" },
  { width: "1.8px", height: "1.4px", top: "23%", left: "32%" },
  { width: "2.1px", height: "2.3px", top: "45%", left: "7%" },
  { width: "1.5px", height: "1.9px", top: "67%", left: "14%" },
  { width: "2.7px", height: "1.2px", top: "89%", left: "22%" },
  { width: "1.3px", height: "2.8px", top: "34%", left: "41%" },
  { width: "2.0px", height: "1.6px", top: "56%", left: "53%" },
  { width: "1.7px", height: "2.1px", top: "78%", left: "66%" },
  { width: "2.5px", height: "1.3px", top: "15%", left: "74%" },
  { width: "1.1px", height: "2.4px", top: "92%", left: "81%" },
  { width: "2.9px", height: "1.7px", top: "3%", left: "90%" },
  { width: "1.6px", height: "2.0px", top: "38%", left: "95%" },
  { width: "2.3px", height: "1.5px", top: "61%", left: "48%" },
  { width: "1.9px", height: "2.7px", top: "84%", left: "37%" },
  { width: "2.2px", height: "1.1px", top: "27%", left: "62%" },
  { width: "1.4px", height: "2.5px", top: "50%", left: "85%" },
  { width: "2.8px", height: "1.8px", top: "73%", left: "29%" },
  { width: "1.0px", height: "2.2px", top: "5%", left: "55%" },
  { width: "2.6px", height: "1.4px", top: "42%", left: "71%" },
  { width: "1.8px", height: "2.9px", top: "19%", left: "88%" },
  { width: "2.4px", height: "1.0px", top: "96%", left: "43%" },
  { width: "1.2px", height: "2.3px", top: "31%", left: "16%" },
  { width: "2.7px", height: "1.6px", top: "64%", left: "92%" },
  { width: "1.5px", height: "2.1px", top: "10%", left: "35%" },
  { width: "2.0px", height: "1.3px", top: "53%", left: "26%" },
  { width: "1.3px", height: "2.6px", top: "76%", left: "58%" },
  { width: "2.9px", height: "1.9px", top: "21%", left: "79%" },
  { width: "1.7px", height: "2.4px", top: "87%", left: "11%" },
  { width: "2.1px", height: "1.2px", top: "40%", left: "67%" },
  { width: "1.6px", height: "2.8px", top: "70%", left: "3%" },
  { width: "2.5px", height: "1.5px", top: "16%", left: "50%" },
  { width: "1.9px", height: "2.0px", top: "59%", left: "77%" },
  { width: "2.3px", height: "1.7px", top: "82%", left: "45%" },
  { width: "1.1px", height: "2.2px", top: "6%", left: "64%" },
  { width: "2.8px", height: "1.4px", top: "47%", left: "19%" },
  { width: "1.4px", height: "2.7px", top: "33%", left: "83%" },
  { width: "2.6px", height: "1.1px", top: "95%", left: "56%" },
  { width: "1.0px", height: "2.5px", top: "25%", left: "97%" },
  { width: "2.2px", height: "1.8px", top: "68%", left: "39%" },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [activeMode, setActiveMode] = useState<"worker" | "customer">("worker");

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash.includes('for-customers')) {
          setActiveMode('customer');
        } else if (window.location.hash.includes('for-workers')) {
          setActiveMode('worker');
        } else if (window.location.hash === '' || window.location.hash === '#') {
          setActiveMode('worker');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    const interval = setInterval(handleHashChange, 200);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-16 overflow-hidden">
      {/* Anchor points for navigation */}
      <div id="for-workers" className="absolute top-0" />
      <div id="for-customers" className="absolute top-0" />
      <div id="ai-advantage#for-customers" className="absolute top-0" />

      {/* Background */}
      <div className="ks-hero-gradient absolute inset-0" />
      <div className="ks-hero-overlay absolute inset-0" />

      {/* Starfield dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {starfieldDots.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={dot}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-0 lg:pt-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-start">
          {/* Left Content */}
          <div className="pt-4 lg:pt-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f5c518]/10 border border-[#f5c518]/30 text-[#f5c518] text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              India&apos;s 1st AI-Powered Labor Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              AI Brings Work.
              <br />
              You Earn. We{" "}
              <div className="inline-block relative h-[1.1em] align-top overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotatingTexts[index]}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-[#f5c518] block relative pb-1"
                  >
                    {rotatingTexts[index]}
                    <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                      <path d="M0 3C50 0 150 6 200 3" stroke="#f5c518" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </motion.span>
                </AnimatePresence>
              </div>
            </h1>

            {/* Subtext */}
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
              Smart AI matches you with genuine work near you.
              <br />
              More work. Secure payments. Instant withdrawals.
              <br />
              Your growth, powered by AI.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-[13px]">AI Finds Work</div>
                  <div className="text-[11px] text-gray-500">More jobs, less waiting</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-[13px]">100% Genuine</div>
                  <div className="text-[11px] text-gray-500">Verified jobs & clients</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-[13px]">Instant Payouts</div>
                  <div className="text-[11px] text-gray-500">Withdraw anytime</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/auth/register?type=worker"
                className={`group flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full transition-all ${
                  activeMode === 'worker'
                    ? "bg-[#f5c518] text-[#0a1128] hover:bg-[#e6b800] shadow-lg shadow-yellow-500/20"
                    : "bg-transparent text-white border border-white/20 hover:bg-white/5"
                }`}
                onClick={() => setActiveMode('worker')}
              >
                I&apos;m a Worker
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span className="block text-[10px] font-medium opacity-75 -ml-1">Find More Work with AI</span>
              </Link>
              <Link
                href="/search"
                className={`group flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full transition-all ${
                  activeMode === 'customer'
                    ? "bg-[#f5c518] text-[#0a1128] hover:bg-[#e6b800] shadow-lg shadow-yellow-500/20"
                    : "bg-transparent text-white border border-white/20 hover:bg-white/5"
                }`}
              >
                Hire a Worker
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span className="block text-[10px] font-medium opacity-50 -ml-1">Find Verified Workers</span>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0a1128] bg-gray-700 overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/64?u=hireme${i}`}
                      alt={`Worker ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400">
                <span className="text-white font-bold">50,000+</span> workers are earning more with AI
                <span className="ml-3 text-yellow-400">⭐ 4.8/5</span>{" "}
                <span className="text-gray-500">Trusted by thousands</span>
              </div>
            </div>
          </div>

          {/* Right Side - Worker Image + UI Mockups */}
          <div className="relative flex justify-center lg:justify-end items-end min-h-[400px] lg:min-h-[520px]">
            {/* Worker group image */}
            <div className="relative z-10">
              <img
                src="/hero-workers.png"
                alt="Indian workers using HireMe"
                className="w-full max-w-md lg:max-w-lg object-contain drop-shadow-2xl mt-16"
              />
            </div>

            {/* Jobs Mockup Card */}
            <div className="absolute left-0 top-12 z-20 animate-float">
              <div className="bg-white rounded-2xl shadow-2xl p-4 w-52">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-gray-800">AI Recommended Jobs</span>
                  <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">AI Match</span>
                </div>
                <div className="space-y-2">
                  {[
                    { job: "Construction Work", pay: "₹850/day", dist: "2 km away" },
                    { job: "Carpentry Work", pay: "₹700/day", dist: "1.8 km away" },
                    { job: "Plumbing Work", pay: "₹800/day", dist: "2.5 km away" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="text-[11px] font-semibold text-gray-800">{item.job}</div>
                        <div className="text-[9px] text-gray-400">{item.dist}</div>
                      </div>
                      <div className="text-[11px] font-bold text-blue-600">{item.pay}</div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-2 bg-[#22c55e] text-white text-[10px] font-bold py-1.5 rounded-lg">
                  View All Jobs
                </button>
              </div>
            </div>

            {/* Nearby Jobs floating tag */}
            <div className="absolute right-8 top-8 z-20">
              <div className="bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e8511a" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-gray-700">Nearby Jobs</span>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="absolute right-0 bottom-8 z-20 animate-float" style={{ animationDelay: "1.5s" }}>
              <div className="bg-white rounded-2xl shadow-2xl p-4 w-48">
                <div className="text-[10px] text-gray-500 mb-1">My Wallet</div>
                <div className="text-2xl font-extrabold text-gray-900 mb-1">₹8,650</div>
                <div className="text-[10px] text-gray-400 mb-3">Available Balance</div>
                <button className="w-full bg-[#22c55e] text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1">
                  <Wallet className="w-3 h-3" />
                  Withdraw
                  <span className="ml-1 text-[8px] bg-white/20 px-1 rounded">Secure</span>
                </button>
                <div className="text-[9px] text-gray-400 mt-2 text-center">⚡ Instant transfer to bank</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="relative z-10 border-t border-white/10 mt-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[12px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Works Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Payment Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Data Protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-yellow-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
