import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediTrip — AI-Powered Medical Tourism Platform",
  description:
    "Find the best and most affordable hospitals worldwide for your medical condition. AI-powered medical travel platform that connects patients to world-class care.",
  keywords: "medical tourism, hospital abroad, affordable healthcare, JCI accredited, medical travel",
  openGraph: {
    title: "MediTrip — Find The Best Hospital In The World For Your Treatment",
    description: "AI-powered medical travel platform that finds you the right hospital in the right country at the right price.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediTrip — AI-Powered Medical Tourism",
    description: "Find the best hospitals worldwide for your treatment.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[#F7F9FC]">
        {children}
      </body>
    </html>
  );
}
