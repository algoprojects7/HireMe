import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HireMe — AI-Powered Work. Better Life.",
  description: "India's 1st AI-Powered Labor Platform. Smart AI matches you with genuine work near you. More work. Secure payments. Instant withdrawals. Your growth, powered by AI.",
  keywords: "HireMe, AI labor platform, worker jobs, construction work, plumbing, carpentry, instant payouts, India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
