import { ShieldCheck, Users, CreditCard, Cpu, Lock } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Aadhaar Verified", sub: "Secure & verified", color: "text-blue-500" },
  { icon: Users, label: "Verified Customers", sub: "100% Genuine", color: "text-green-500" },
  { icon: CreditCard, label: "Secure Payments", sub: "By Razorpay", color: "text-purple-500" },
  { icon: Cpu, label: "AI Powered", sub: "Smart Matching", color: "text-orange-500" },
  { icon: Lock, label: "Data Protected", sub: "Your data is safe", color: "text-teal-500" },
];

export function TrustBadges() {
  return (
    <section className="py-10 sm:py-14 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h3 className="text-center text-lg sm:text-xl font-bold text-gray-900 mb-8">
          Trusted By Thousands Across India
        </h3>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <badge.icon className={`w-5 h-5 ${badge.color}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">{badge.label}</div>
                <div className="text-[10px] text-gray-500">{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
