import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { AIFeatures } from "@/components/landing/AIFeatures";
import { StepsSection } from "@/components/landing/StepsSection";
import { BottomCards } from "@/components/landing/BottomCards";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { StatsBar } from "@/components/landing/StatsBar";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-yellow-500/30">
      <Navbar />
      <main>
        <Hero />
        <AIFeatures />
        <StepsSection />
        <BottomCards />
        <TrustBadges />
        <StatsBar />
      </main>
      <Footer />
    </div>
  );
}
