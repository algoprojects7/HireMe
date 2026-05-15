import { MapPin, Users, Wallet, Search, Bell, Shield } from "lucide-react";

const features = [
  {
    title: "AI-Powered Matching",
    description: "Our proprietary algorithm connects the right skill with the right job in milliseconds.",
    icon: Search,
    color: "blue"
  },
  {
    title: "Real-time Tracking",
    description: "Monitor your workforce movement and status with high-precision GPS maps.",
    icon: MapPin,
    color: "green"
  },
  {
    title: "Secure Wallets",
    description: "Automated ledger-based payments and instant payouts for every completed task.",
    icon: Wallet,
    color: "purple"
  },
  {
    title: "KYC Verification",
    description: "Face-match and document verification to ensure a safe and trusted ecosystem.",
    icon: Shield,
    color: "red"
  },
  {
    title: "Live Notifications",
    description: "Instant booking alerts and status updates via WebSocket integration.",
    icon: Bell,
    color: "yellow"
  },
  {
    title: "Multi-Tenant SaaS",
    description: "Scale your agency with isolated tenant environments and custom branding.",
    icon: Users,
    color: "indigo"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-[#050505] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Built for Modern Operations</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Everything you need to manage an unorganized workforce at scale, with enterprise-grade security and AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
