"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Star, Shield, Globe, Users, Search, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CONDITIONS = [
  "Knee replacement", "Heart bypass surgery", "IVF / Fertility treatment",
  "Dental implants", "Cancer treatment", "Liver transplant",
  "Spine surgery", "Eye surgery (LASIK)", "Hip replacement",
];

const STATS = [
  { value: "12.4k+", label: "Patients Helped", icon: Users },
  { value: "45+", label: "Countries", icon: Globe },
  { value: "800+", label: "JCI Hospitals", icon: Shield },
  { value: "65%", label: "Avg Savings", icon: Star },
];

const HOW_IT_WORKS = [
  { icon: "💬", step: "01", title: "Describe Your Case", desc: "Share your condition in simple terms. Our AI understands complex medical procedures and budget needs." },
  { icon: "🛡️", step: "02", title: "Global Accreditation Scan", desc: "We instantly screen 800+ JCI-accredited hospitals worldwide to find the perfect match for your surgery." },
  { icon: "📊", step: "03", title: "Compare & Connect", desc: "Review transparent cost comparisons, quality rankings, and connect directly with hospital coordinators." },
];

const TESTIMONIALS = [
  { name: "Sarah Mitchell", flag: "🇺🇸", country: "United States", text: "I saved $28,000 on my hip replacement in India. The medical care was superior to what I've experienced locally.", treatment: "Hip Replacement", savings: "$28k saved" },
  { name: "James Knight", flag: "🇬🇧", country: "United Kingdom", text: "Found a JCI-accredited cardiac center in Thailand. The process was seamless and the recovery suite was world-class.", treatment: "Cardiac Bypass", savings: "£19k saved" },
  { name: "Amira Hassan", flag: "🇦🇪", country: "UAE", text: "Connected with a fertility specialist in Greece. We are now expecting our first child. Highly recommend this platform.", treatment: "IVF Treatment", savings: "AED 45k saved" },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // No redirect — logged-in users can still search from home page

  function handleSearch() {
    if (query.trim().length >= 3) {
      router.push(`/intake?condition=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  function handlePill(condition: string) {
    setQuery(condition);
    router.push(`/intake?condition=${encodeURIComponent(condition)}`);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ 
        paddingTop: "clamp(100px, 15vh, 160px)", 
        paddingBottom: "clamp(60px, 10vh, 120px)", 
        position: "relative",
        background: "linear-gradient(180deg, rgba(16,185,129,0.03) 0%, rgba(255,255,255,0) 100%)",
        overflow: "hidden"
      }}>
        <div className="container-custom" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>

            {/* Badge */}
            <div className="animate-fade-in-up" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "100px", padding: "6px 16px", marginBottom: "24px",
              fontSize: "12px", fontWeight: "700", color: "var(--accent)",
              letterSpacing: "0.02em", textTransform: "uppercase"
            }}>
              <Shield size={14} color="var(--accent)" />
              <span>JCI Accredited Network · 800+ Verified Hospitals</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up" style={{
              fontSize: "clamp(32px, 5vw, 64px)",
              fontWeight: "900", lineHeight: "1.1", letterSpacing: "-0.02em",
              color: "var(--primary)", marginBottom: "20px",
              fontFamily: "'Fraunces', serif"
            }}>
              The Smart Way to <br />
              Find <span style={{ color: "var(--accent)" }}>World-Class</span> Surgery
            </h1>

            <p className="animate-fade-in-up" style={{
              fontSize: "clamp(16px, 1.8vw, 18px)", color: "var(--text-secondary)",
              lineHeight: "1.6", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px",
            }}>
              MediTrip uses clinical-grade AI to match you with top-tier international hospitals, providing transparent costs and saving you up to 65%.
            </p>

            {/* Search box - Fixed Responsive */}
            <div className="animate-fade-in-up" style={{ maxWidth: "700px", margin: "0 auto 40px" }}>
              <div style={{ 
                background: "white",
                padding: "6px",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(10,37,64,0.08)",
                display: "flex",
                flexDirection: "row", // Force row on all screens but shrink content
                alignItems: "center",
                gap: "8px",
                border: "1px solid var(--border)",
              }}>
                <div style={{ paddingLeft: "12px", display: "flex", alignItems: "center" }}>
                  <Search size={18} color="var(--text-secondary)" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What treatment? (e.g. Spine Surgery)"
                  style={{ 
                    flex: 1, 
                    border: "none", 
                    outline: "none", 
                    fontSize: "15px", 
                    fontWeight: "500", 
                    color: "var(--primary)",
                    background: "transparent",
                    padding: "12px 0",
                    width: "100%"
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="btn-primary"
                  style={{
                    padding: "10px 20px", borderRadius: "10px",
                    fontSize: "14px", fontWeight: "700",
                    opacity: query.trim().length < 3 ? 0.6 : 1,
                    whiteSpace: "nowrap"
                  }}
                >
                  <span className="hidden md:inline">Find Hospital</span>
                  <span className="md:hidden">Find</span>
                </button>
              </div>
            </div>

            {/* Condition pills - Refined */}
            <div className="animate-fade-in-up">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", maxWidth: "800px", margin: "0 auto" }}>
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handlePill(c)}
                    style={{
                      padding: "6px 14px", borderRadius: "10px",
                      border: "1px solid var(--border)", background: "white",
                      color: "var(--primary)", fontSize: "13px", fontWeight: "600",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: "white", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "40px 0" }}>
        <div className="container-custom">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "24px", textAlign: "center" }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: "32px", fontWeight: "900", color: "var(--primary)", fontFamily: "'Fraunces', serif", lineHeight: "1", marginBottom: "8px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section" style={{ background: "var(--bg)", padding: "80px 0" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span className="badge badge-accent" style={{ marginBottom: "12px" }}>The Process</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--primary)", marginBottom: "16px", fontFamily: "'Fraunces', serif" }}>How It Works</h2>
          </div>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "24px" 
          }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="card" style={{ padding: "40px 32px", border: "1px solid var(--border)" }}>
                <div style={{ 
                  width: "56px", height: "56px", borderRadius: "14px", background: "rgba(16,185,129,0.1)", 
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "24px" 
                }}>
                  {step.icon}
                </div>
                <div style={{ display: "inline-block", background: "var(--primary)", color: "white", fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px", marginBottom: "16px", letterSpacing: "0.05em" }}>
                  PHASE {step.step}
                </div>
                <h3 style={{ fontSize: "20px", marginBottom: "12px", color: "var(--primary)", fontWeight: "800" }}>{step.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.6" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: "white", padding: "80px 0", borderTop: "1px solid var(--border)", overflow: "hidden" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--primary)", fontFamily: "'Fraunces', serif" }}>Patient Stories</h2>
          </div>
          
          <div style={{ 
            display: "flex",
            flexWrap: "nowrap",
            overflowX: "auto",
            gap: "20px",
            paddingBottom: "20px",
            WebkitOverflowScrolling: "touch"
          }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ 
                padding: "32px", 
                border: "1px solid var(--border)", 
                background: "var(--bg)", 
                minWidth: "280px",
                flexShrink: 0
              }}>
                <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: "var(--primary)", fontSize: "15px", lineHeight: "1.7", marginBottom: "24px", fontWeight: "500", fontStyle: "italic" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ fontSize: "20px" }}>{t.flag}</div>
                    <div style={{ fontWeight: "700", color: "var(--primary)", fontSize: "14px" }}>{t.name}</div>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--accent)", background: "rgba(16,185,129,0.08)", padding: "6px 12px", borderRadius: "8px" }}>
                    {t.savings}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: "140px 0", background: "linear-gradient(180deg, #FFFFFF 0%, rgba(16,185,129,0.05) 100%)" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(40px, 6vw, 64px)", marginBottom: "32px", color: "var(--primary)", fontWeight: "900", fontFamily: "'Fraunces', serif" }}>
              Secure Your Health. <br />
              <span style={{ color: "var(--accent)" }}>Save Thousands.</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "22px", marginBottom: "56px", lineHeight: "1.6" }}>
              Our AI is ready to find your perfect hospital match. Start your free search now and join 12k+ successful medical travelers.
            </p>
            <Link href="/intake" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ padding: "22px 56px", fontSize: "20px", borderRadius: "16px", boxShadow: "0 15px 35px rgba(10,37,64,0.15)" }}>
                Begin Free Search <ArrowRight size={22} style={{ marginLeft: "12px" }} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
