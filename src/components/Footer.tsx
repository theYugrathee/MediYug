import Link from "next/link";
import { Globe, Shield, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "var(--primary)", color: "white", padding: "80px 0 40px", borderTop: "1px solid var(--primary-light)" }}>
      <div className="container-custom">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "48px", marginBottom: "64px" }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Globe size={18} color="var(--primary)" />
              </div>
              <span style={{ fontSize: "22px", fontWeight: "800", color: "white", fontFamily: "'Fraunces', serif" }}>
                Medi<span style={{ color: "var(--accent)" }}>Trip</span>
              </span>
            </div>
            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(255,255,255,0.7)", maxWidth: "280px" }}>
              The world&apos;s leading AI platform for medical travel. Connecting patients with world-class, JCI-accredited care.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{ color: "white", fontWeight: "700", marginBottom: "24px", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Platform</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "About Us", href: "/about" },
                { label: "Founder's Vision", href: "/about" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Find Hospitals", href: "/intake" }
              ].map((item) => (
                <Link key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "15px", transition: "all 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: "white", fontWeight: "700", marginBottom: "24px", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Resources</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Privacy Policy", href: "/legal/terms" },
                { label: "Terms of Service", href: "/legal/terms" },
                { label: "Medical Disclaimer", href: "/legal/terms" },
                { label: "Contact: yugrathee28@gmail.com", href: "mailto:yugrathee28@gmail.com" }
              ].map((item) => (
                <Link key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "15px", transition: "all 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div>
            <h4 style={{ color: "white", fontWeight: "700", marginBottom: "24px", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Trust & Safety</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { icon: Shield, text: "JCI Accredited Hospitals" },
                { icon: Shield, text: "Verified Cost Estimates" },
                { icon: Heart, text: "Patient-Centered Care" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                  <Icon size={16} color="var(--accent)" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>© {new Date().getFullYear()} MediTrip Global. All rights reserved.</p>
          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Powered by AI</span>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Dodo Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
