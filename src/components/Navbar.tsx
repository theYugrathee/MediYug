"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, X, Home, FileText, LogOut, Plus, ChevronRight, User, Zap, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DonateModal from "./DonateModal";

export default function Navbar() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [regenCount, setRegenCount] = useState<number | null>(null);
  const [donateOpen, setDonateOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) {
        const fetchUserData = async () => {
          try {
            const { data, error } = await supabase.from("users")
              .select("regenerations_remaining, stripe_subscription_id")
              .eq("id", u.id)
              .single();
            if (error) {
              console.error("Navbar data error:", error);
            } else if (data) {
              if (data.stripe_subscription_id) setRegenCount(-1);
              else setRegenCount(data.regenerations_remaining || 0);
            }
          } catch (err) {
            console.error("Navbar data error:", err);
          }
        };
        fetchUserData();
      }
    }).catch(err => console.error("Navbar auth error:", err));
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSidebarOpen(false);
    router.push("/");
  }

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      {donateOpen && <DonateModal onClose={() => setDonateOpen(false)} />}
      <nav className="navbar" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)" }}>
        <div className="container-custom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px", width: "100%" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={18} color="white" />
            </div>
            <span style={{ fontSize: "22px", fontWeight: "800", color: "var(--primary)", fontFamily: "'Fraunces', serif", letterSpacing: "-0.5px" }}>
              Medi<span style={{ color: "var(--accent)" }}>Trip</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "28px" }}>
            <Link href="/#how-it-works" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "15px", fontWeight: "500" }}>
              How It Works
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "15px", fontWeight: "500" }}>
                  Dashboard
                </Link>
                <Link href="/intake">
                  <button className="btn-primary" style={{ padding: "10px 22px", fontSize: "14px" }}>
                    <Plus size={14} /> New Search
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "15px", fontWeight: "500" }}>
                  Sign In
                </Link>
                <Link href="/intake">
                  <button className="btn-primary" style={{ padding: "10px 22px", fontSize: "14px" }}>
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — always visible */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            style={{ 
              background: "none", border: "none", cursor: "pointer", 
              padding: "12px", margin: "-4px",
              color: "var(--primary)", display: "flex", flexDirection: "column", 
              gap: "5px", alignItems: "center", justifyContent: "center",
              touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
              minWidth: "44px", minHeight: "44px",
            }}
            aria-label="Open menu"
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: "var(--primary)", borderRadius: "2px" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "var(--primary)", borderRadius: "2px" }} />
            <span style={{ display: "block", width: "14px", height: "2px", background: "var(--primary)", borderRadius: "2px" }} />
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(10,37,64,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel — only mounted when open to prevent blocking clicks */}
      {sidebarOpen && (
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(320px, 85vw)", zIndex: 400,
        background: "white", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
        animation: "slideInRight 0.25s ease",
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "800", fontSize: "18px", color: "var(--primary)", fontFamily: "'Fraunces', serif" }}>
            Medi<span style={{ color: "var(--accent)" }}>Trip</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}>
            <X size={22} />
          </button>
        </div>

        {/* User Card */}
        {user ? (
          <div style={{ margin: "20px 20px 0", background: "linear-gradient(135deg, #0A2540 0%, #1a3d6b 100%)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={20} color="#10B981" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: "800", color: "white", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
              </div>
            </div>
            {regenCount !== null && (
              <div style={{ marginTop: "14px", background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={14} color="#10B981" />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
                  {regenCount === -1 ? "Unlimited regenerations" : `${regenCount} regeneration${regenCount !== 1 ? "s" : ""} left`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ margin: "20px 20px 0", padding: "20px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>Sign in to access your reports</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href="/auth/login" onClick={() => setSidebarOpen(false)} style={{ flex: 1 }}>
                <button style={{ width: "100%", padding: "10px", background: "var(--primary)", border: "none", borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
                  Sign In
                </button>
              </Link>
              <Link href="/auth/signup" onClick={() => setSidebarOpen(false)} style={{ flex: 1 }}>
                <button style={{ width: "100%", padding: "10px", background: "var(--accent)", border: "none", borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" }}>
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <div style={{ padding: "20px 12px", flex: 1 }}>
          {[
            { href: "/", label: "Home", icon: <Home size={18} /> },
            { href: "/dashboard", label: "My Reports", icon: <FileText size={18} />, authRequired: true },
            { href: "/intake", label: "New Search", icon: <Plus size={18} /> },
          ].map((item) => {
            if (item.authRequired && !user) return null;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: "12px", marginBottom: "4px",
                  color: "var(--primary)", transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#F1F5F9"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "var(--accent)" }}>{item.icon}</span>
                    <span style={{ fontWeight: "600", fontSize: "15px" }}>{item.label}</span>
                  </div>
                  <ChevronRight size={16} color="var(--text-secondary)" />
                </div>
              </Link>
            );
          })}

          {/* Donation Button */}
          <button 
            onClick={() => { setSidebarOpen(false); setDonateOpen(true); }}
            style={{
              width: "calc(100% - 24px)", margin: "12px", padding: "14px 16px",
              background: "rgba(16,185,129,0.06)", border: "1.5px dashed rgba(16,185,129,0.3)",
              borderRadius: "14px", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "space-between", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16,185,129,0.06)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={16} color="white" fill="white" />
              </div>
              <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--primary)" }}>Support Our Mission</span>
            </div>
            <ArrowRight size={16} color="var(--accent)" />
          </button>

          {/* Upgrade banner if no regenerations */}
          {user && regenCount === 0 && (
            <Link href="/intake" onClick={() => setSidebarOpen(false)} style={{ textDecoration: "none" }}>
              <div style={{ margin: "8px 4px", padding: "14px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Zap size={14} color="var(--accent)" />
                  <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--accent)" }}>No Regenerations Left</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 8px" }}>
                  Start a new search to get a fresh report.
                </p>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)" }}>Start New Search →</span>
              </div>
            </Link>
          )}
        </div>

        {/* Bottom Sign Out */}
        {user && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
            <button
              onClick={handleSignOut}
              style={{
                width: "100%", padding: "12px", background: "none",
                border: "1.5px solid var(--border)", borderRadius: "12px",
                color: "#EF4444", fontWeight: "700", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px", fontSize: "14px", fontFamily: "inherit", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#EF4444"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
      )}
    </>
  );
}

function ArrowRight({ size, color }: { size: number; color?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
