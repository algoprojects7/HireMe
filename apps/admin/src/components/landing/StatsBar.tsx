import { User, Atom, Wallet, Send, ShieldCheck } from "lucide-react";

const stats = [
  { 
    icon: User, 
    value: "50K+", 
    label: "Active Workers", 
    iconColor: "text-yellow-400",
    glowColor: "rgba(250, 204, 21, 0.2)"
  },
  { 
    icon: Atom, 
    value: "1L+", 
    label: "Jobs Completed", 
    iconColor: "text-blue-400",
    glowColor: "rgba(96, 165, 250, 0.2)"
  },
  { 
    icon: Wallet, 
    value: "95%", 
    label: "Happy Workers", 
    iconColor: "text-orange-400",
    glowColor: "rgba(251, 146, 60, 0.2)"
  },
  { 
    icon: Send, 
    value: "₹50Cr+", 
    label: "Earnings Paid", 
    iconColor: "text-cyan-400",
    glowColor: "rgba(34, 211, 238, 0.2)"
  },
  { 
    icon: ShieldCheck, 
    value: "24/7", 
    label: "AI Support", 
    iconColor: "text-purple-400",
    glowColor: "rgba(192, 132, 252, 0.2)"
  },
];

export function StatsBar() {
  return (
    <section className="bg-gradient-to-r from-[#0a1535] via-[#0d1b45] to-[#0a1535] py-12 relative overflow-hidden border-y border-white/5">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.2)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between">
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 flex items-center justify-center min-w-[240px] py-4 lg:py-0 relative">
              <div className="flex items-center gap-5 group">
                {/* Glassmorphic Icon Container */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center relative transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: `inset 0 0 15px ${stat.glowColor}`
                  }}
                >
                  <stat.icon className={`w-7 h-7 ${stat.iconColor} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                </div>
                
                {/* Text */}
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white leading-none mb-1">
                    {stat.value}
                  </span>
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-tight">
                    {stat.label}
                  </span>
                </div>
              </div>

              {/* Vertical Divider */}
              {i < stats.length - 1 && (
                <div className="hidden lg:block absolute right-0 h-12 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
