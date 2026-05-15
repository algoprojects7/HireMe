import { UserPlus, Search, FileCheck, Briefcase, CreditCard, Banknote } from "lucide-react";

const steps = [
  { number: 1, title: "Create Profile", description: "Add your skills, experience & KYC verification.", icon: UserPlus, color: "bg-teal-500", iconBg: "bg-teal-50", iconColor: "text-teal-500" },
  { number: 2, title: "AI Finds Work", description: "Our AI engine finds the best jobs near you in real-time.", icon: Search, color: "bg-orange-500", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  { number: 3, title: "Get Job Offer", description: "Receive job offers from verified customers.", icon: FileCheck, color: "bg-red-500", iconBg: "bg-red-50", iconColor: "text-red-500" },
  { number: 4, title: "Do Your Work", description: "Complete the work and make your customer happy.", icon: Briefcase, color: "bg-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { number: 5, title: "Get Paid Securely", description: "Payment goes to your secure wallet instantly.", icon: CreditCard, color: "bg-green-500", iconBg: "bg-green-50", iconColor: "text-green-500" },
  { number: 6, title: "Withdraw Anytime", description: "Withdraw your money anytime, any moment to your bank.", icon: Banknote, color: "bg-purple-500", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
];

export function StepsSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
            Simple Steps, <span className="text-[#f5c518]">More Work</span>, <span className="text-[#e8511a]">Better Earnings</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div key={i} className="text-center p-4 relative group">
              <div className={`w-16 h-16 mx-auto rounded-2xl ${step.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                <step.icon className={`w-7 h-7 ${step.iconColor}`} />
              </div>
              <div className={`w-7 h-7 rounded-full ${step.color} flex items-center justify-center text-white text-xs font-bold mx-auto mb-2`}>
                {step.number}
              </div>
              <h3 className="text-[13px] font-bold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
