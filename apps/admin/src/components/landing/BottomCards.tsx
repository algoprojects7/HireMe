import Link from "next/link";
import { ShieldCheck, Check, Star, ArrowRight } from "lucide-react";

export function BottomCards() {
  return (
    <section id="pricing" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-5">
          {/* Card 1: Earnings Security */}
          <div className="bg-[#0a1128] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-extrabold mb-1 leading-tight">Your Earnings,</h3>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-6 leading-tight">Always Secure</h3>
              <ul className="space-y-3">
                {["100% Secure Payments", "Money held safely until work is done", "Instant Wallet Credits", "Withdraw Anytime, Anywhere"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute right-4 bottom-4 opacity-10">
              <ShieldCheck className="w-32 h-32 text-blue-400" />
            </div>
          </div>

          {/* Card 2: Testimonial */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What Workers Say</h3>
            <div className="flex gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <blockquote className="text-sm text-gray-600 italic leading-relaxed mb-6">
              &quot;AI se mujhe pehle se 3x zyada kaam milne laga.&quot;
              <br />
              &quot;Payment bhi turant wallet me aa jata hai.&quot;
              <br />
              &quot;Bahut badiya platform hai!&quot;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img src="https://i.pravatar.cc/80?u=ramesh" alt="Ramesh" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">– Ramesh Yadav</div>
                <div className="text-xs text-gray-500">Construction Worker</div>
              </div>
            </div>
          </div>

          {/* Card 3: CTA */}
          <div className="ks-orange-gradient rounded-2xl p-6 sm:p-8 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-3 leading-tight">
                Start Earning More With AI Today
              </h3>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Join thousands of workers who are earning more with the power of AI.
              </p>
            </div>
            <div>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#e8511a] font-bold text-sm rounded-full hover:bg-gray-100 transition-all group"
              >
                Join Now – It&apos;s Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="text-xs text-white/60 mt-3">No hidden charges · 100% Free to Join</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
