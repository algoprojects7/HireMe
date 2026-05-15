import { Search, MapPin, TrendingUp, BarChart3, ShieldCheck, AlertTriangle } from "lucide-react";

const features = [
  {
    title: "AI Smart Matching",
    description: "Find the best jobs that match your skills, location & experience.",
    icon: Search,
    bgColor: "bg-teal-50",
    iconColor: "text-teal-500",
    borderColor: "border-teal-200",
  },
  {
    title: "More Job Opportunities",
    description: "AI finds new and nearby jobs for you instantly.",
    icon: MapPin,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-500",
    borderColor: "border-orange-200",
  },
  {
    title: "Price Suggestion by AI",
    description: "AI suggests the best price so you earn more and grow faster.",
    icon: TrendingUp,
    bgColor: "bg-red-50",
    iconColor: "text-red-500",
    borderColor: "border-red-200",
  },
  {
    title: "Work & Earning Insights",
    description: "AI shows your earning patterns and helps you improve.",
    icon: BarChart3,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
  },
  {
    title: "Trust & Safety AI",
    description: "AI verifies jobs & clients for your safety and peace of mind.",
    icon: ShieldCheck,
    bgColor: "bg-green-50",
    iconColor: "text-green-500",
    borderColor: "border-green-200",
  },
  {
    title: "Instant Fraud Detection",
    description: "AI detects fake activities so you only get genuine work.",
    icon: AlertTriangle,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-500",
    borderColor: "border-purple-200",
  },
];

export function AIFeatures() {
  return (
    <section id="ai-advantage" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            AI Works For You, Brings You More Work
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Our AI engine works 24/7 to connect you with the right work and help you earn more.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`ks-feature-card group border ${feature.borderColor}`}
            >
              <div className={`ks-icon-circle ${feature.bgColor}`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-[13px] font-bold text-gray-900 mb-2 leading-tight">
                {feature.title}
              </h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
