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
      <section style={{ paddingTop: "140px", paddingBottom: "100px", position: "relative" }}>
        <div className="container-custom">
          <div style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center" }}>

            {/* Badge */}
            <div className="animate-fade-in-up" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "white", border: "1px solid var(--border)",
              borderRadius: "100px", padding: "8px 20px", marginBottom: "32px",
              fontSize: "14px", fontWeight: "600", color: "var(--primary)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
            }}>
              <CheckCircle2 size={16} color="var(--accent)" />
              <span style={{ color: "var(--text-secondary)" }}>Trustworthy Medical Travel · </span>
              <span>800+ JCI Accredited Hospitals</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up" style={{
              fontSize: "clamp(42px, 6vw, 72px)",
              fontWeight: "800", lineHeight: "1.1", letterSpacing: "-1.5px",
              color: "var(--primary)", marginBottom: "24px",
            }}>
              Find The Best Hospital <br />
              <span style={{ color: "var(--accent)" }}>Worldwide</span> For Your Treatment
            </h1>

            <p className="animate-fade-in-up" style={{
              fontSize: "clamp(17px, 2vw, 20px)", color: "var(--text-secondary)",
              lineHeight: "1.6", marginBottom: "48px", maxWidth: "640px", margin: "0 auto 48px",
            }}>
              Describe your condition — our AI instantly finds world-class hospitals, compares real treatment costs, and helps you save up to 65% on high-quality medical care.
            </p>

            {/* Search box */}
            <div className="animate-fade-in-up" style={{ maxWidth: "720px", margin: "0 auto 32px" }}>
              <div className="hero-search">
                <Search size={20} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what treatment you need (e.g. Knee replacement)..."
                  id="hero-search-input"
                  style={{ fontSize: "16px" }}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="btn-accent"
                  style={{
                    padding: "14px 28px", borderRadius: "12px",
                    flexShrink: 0, opacity: query.trim().length < 3 ? 0.6 : 1,
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Find Hospitals <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Trust hints */}
            <div className="animate-fade-in-up" style={{
              display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "64px",
            }}>
              {["✓ Free searching", "✓ Instant results", "✓ JCI verified"].map((t) => (
                <span key={t} style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "500" }}>{t}</span>
              ))}
            </div>

            {/* Condition pills */}
            <div className="animate-fade-in-up">
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handlePill(c)}
                    style={{
                      padding: "8px 18px", borderRadius: "100px",
                      border: "1px solid var(--border)", background: "white",
                      color: "var(--text-secondary)", fontSize: "14px", fontWeight: "500",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
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
      <section style={{ background: "white", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "50px 0" }}>
        <div className="container-custom">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "32px", textAlign: "center" }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--primary)", fontFamily: "'Fraunces', serif", lineHeight: "1", marginBottom: "8px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section" style={{ background: "var(--bg)" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span className="badge badge-accent" style={{ marginBottom: "16px" }}>The Process</span>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "var(--primary)" }}>How MediTrip Works</h2>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto" }}>
              Our clinical-grade AI platform simplifies your medical journey in three easy steps.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="card" style={{ padding: "48px 40px" }}>
                <div style={{ fontSize: "42px", marginBottom: "24px" }}>{step.icon}</div>
                <div style={{ display: "inline-block", background: "rgba(10,37,64,0.05)", color: "var(--primary)", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "8px", marginBottom: "16px", letterSpacing: "0.05em" }}>
                  STEP {step.step}
                </div>
                <h3 style={{ fontSize: "22px", marginBottom: "12px", color: "var(--primary)" }}>{step.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: "white", padding: "100px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", color: "var(--primary)" }}>Patient Success Stories</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "18px" }}>Real patients, real savings, world-class results.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: "40px" }}>
                <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ color: "var(--primary)", fontSize: "16px", lineHeight: "1.7", marginBottom: "32px", fontWeight: "500" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontWeight: "700", color: "var(--primary)", fontSize: "16px" }}>{t.flag} {t.name}</div>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{t.country}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent)", background: "rgba(16,185,129,0.08)", padding: "6px 14px", borderRadius: "8px" }}>
                      {t.savings}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: "120px 0", background: "var(--bg)" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: "24px", color: "var(--primary)" }}>
            Start Your Journey Today
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "20px", marginBottom: "48px", maxWidth: "560px", margin: "0 auto 48px" }}>
            Join 12,400+ patients who found world-class care at a fraction of the cost.
          </p>
          <Link href="/intake">
            <button className="btn-primary" style={{ padding: "18px 48px", fontSize: "18px", borderRadius: "14px" }}>
              Find Your Hospital Now <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
