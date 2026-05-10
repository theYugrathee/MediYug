"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Globe, Mail, Eye, EyeOff, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface AuthGateModalProps {
  onClose: () => void;
  onAuthenticated: () => void;
  redirectPath?: string;
}

export default function AuthGateModal({ onClose, onAuthenticated }: AuthGateModalProps) {
  const [mode, setMode] = useState<"choice" | "login" | "signup">("choice");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Welcome back!");
    onAuthenticated();
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Account created! Generating your report...");
    onAuthenticated();
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}` },
    });
    if (error) toast.error(error.message);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", border: "1.5px solid #E2E8F0",
    borderRadius: "10px", fontSize: "14px", outline: "none",
    fontFamily: "inherit", background: "white", boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,37,64,0.55)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: "24px", padding: "0",
          maxWidth: "480px", width: "100%", overflow: "hidden",
          boxShadow: "0 32px 64px rgba(0,0,0,0.2)",
          animation: "fadeInUp 0.25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #0A2540 0%, #1a3d6b 100%)",
          padding: "32px 32px 28px", position: "relative",
          textAlign: "center",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "16px", right: "16px",
              background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer",
              color: "white", borderRadius: "8px", padding: "6px", display: "flex",
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            width: "56px", height: "56px", background: "rgba(16,185,129,0.2)",
            borderRadius: "16px", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
            border: "1px solid rgba(16,185,129,0.3)",
          }}>
            <Globe size={28} color="#10B981" />
          </div>
          <h2 style={{ color: "white", fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>
            {mode === "choice" ? "Create a Free Account to Continue" : mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: "1.5" }}>
            {mode === "choice"
              ? "Sign in to generate your report and save results to your dashboard"
              : mode === "login"
              ? "Sign in to generate your clinical report"
              : "It's free — generate your report instantly after signing up"}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px 32px" }}>

          {/* CHOICE MODE */}
          {mode === "choice" && (
            <>
              {/* Value props */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                {[
                  "Free to create an account",
                  "Save all your reports to dashboard",
                  "Edit & regenerate with your plan",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#334155" }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                style={{
                  width: "100%", padding: "13px", border: "1.5px solid #E2E8F0",
                  borderRadius: "10px", background: "white", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "16px",
                  transition: "all 0.2s",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>or</span>
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setMode("signup")}
                  style={{
                    flex: 1, padding: "13px", background: "#0A2540", border: "none",
                    borderRadius: "10px", color: "white", fontWeight: "700",
                    cursor: "pointer", fontSize: "14px", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: "6px",
                  }}
                >
                  Sign Up Free <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => setMode("login")}
                  style={{
                    flex: 1, padding: "13px", background: "white",
                    border: "1.5px solid #E2E8F0", borderRadius: "10px",
                    color: "#334155", fontWeight: "600", cursor: "pointer", fontSize: "14px",
                  }}
                >
                  Sign In
                </button>
              </div>
            </>
          )}

          {/* LOGIN MODE */}
          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <button type="button" onClick={handleGoogle} style={{
                width: "100%", padding: "12px", border: "1.5px solid #E2E8F0",
                borderRadius: "10px", background: "white", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "16px",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Continue with Google
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>or</span>
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input type="email" style={{ ...inputStyle, paddingLeft: "36px" }} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} style={{ ...inputStyle, paddingRight: "40px" }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", background: "#0A2540", border: "none",
                borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer",
                fontSize: "14px", opacity: loading ? 0.7 : 1, marginBottom: "12px",
              }}>
                {loading ? "Signing in..." : "Sign In & Generate Report"}
              </button>
              <p style={{ textAlign: "center", fontSize: "13px", color: "#64748B" }}>
                No account?{" "}
                <button type="button" onClick={() => setMode("signup")} style={{ background: "none", border: "none", color: "#10B981", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                  Sign up free
                </button>
              </p>
            </form>
          )}

          {/* SIGNUP MODE */}
          {mode === "signup" && (
            <form onSubmit={handleSignup}>
              <button type="button" onClick={handleGoogle} style={{
                width: "100%", padding: "12px", border: "1.5px solid #E2E8F0",
                borderRadius: "10px", background: "white", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "16px",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Continue with Google
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>or</span>
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input type="text" style={{ ...inputStyle, paddingLeft: "36px" }} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input type="email" style={{ ...inputStyle, paddingLeft: "36px" }} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} style={{ ...inputStyle, paddingRight: "40px" }} placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", background: "#10B981", border: "none",
                borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer",
                fontSize: "14px", opacity: loading ? 0.7 : 1, marginBottom: "12px",
              }}>
                {loading ? "Creating account..." : "Create Account & Generate Report"}
              </button>
              <p style={{ textAlign: "center", fontSize: "13px", color: "#64748B" }}>
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "#10B981", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
