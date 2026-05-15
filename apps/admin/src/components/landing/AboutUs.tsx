import { HeartHandshake, Zap, ShieldCheck } from "lucide-react";

const values = [
  {
    icon: HeartHandshake,
    title: "Direct Connection",
    description: "We eliminate middlemen, allowing workers and customers to connect directly with complete transparency.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: ShieldCheck,
    title: "Financial Security",
    description: "100% secure payments held in escrow, ensuring workers get paid instantly upon job completion.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: Zap,
    title: "AI-Driven Growth",
    description: "Our smart algorithms do the heavy lifting, finding better, higher-paying jobs nearby in milliseconds.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

export function AboutUs() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Story */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-6">
              Our Mission
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Empowering India&apos;s <br />
              <span className="text-[#f5c518]">Unorganized Workforce</span>
            </h2>
            
            <div className="space-y-5 text-gray-500 text-sm sm:text-base leading-relaxed">
              <p>
                For decades, the unorganized workforce has struggled with unfair middlemen, delayed payments, and a lack of reliable job opportunities. We started <strong>HireMe</strong> to change that narrative completely.
              </p>
              <p>
                We believe that technology should be a great equalizer. By leveraging cutting-edge Artificial Intelligence, we bridge the gap between skilled workers and the customers who need them most. 
              </p>
              <p>
                Our platform isn&apos;t just about finding work—it&apos;s about creating a secure, transparent ecosystem where workers can build a sustainable livelihood, and customers can find verified talent with absolute peace of mind.
              </p>
            </div>
          </div>

          {/* Right Column - Values Grid */}
          <div className="relative">
            {/* Core Value Cards */}
            <div className="grid gap-4 sm:gap-6 relative z-10">
              {values.map((value, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start group"
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${value.bg} group-hover:scale-110 transition-transform`}>
                    <value.icon className={`w-6 h-6 ${value.color}`} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">
                      {value.title}
                    </h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Backdrop decoration for the cards */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent rounded-[2rem] -m-6 -z-10 rotate-1" />
          </div>
        </div>
      </div>
    </section>
  );
}
