"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Mail, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) { 
        toast.error(error.message); 
        setLoading(false); 
        return; 
      }
      
      toast.success("Welcome back!");
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get("next") || "/dashboard";
      router.push(nextUrl);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const params = new URLSearchParams(window.location.search);
      const nextUrl = params.get("next") || "/dashboard";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}` },
      });
      if (error) toast.error(error.message);
    } catch (err) {
      console.error("Google Login error:", err);
      toast.error("An error occurred with Google login.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f7ff 0%, #ffffff 60%, #f0fdf8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={20} color="white" />
            </div>
            <span style={{ fontSize: "22px", fontWeight: "800", color: "#0A2540", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Medi<span style={{ color: "#10B981" }}>Trip</span>
            </span>
          </Link>
        </div>

        <div className="card" style={{ padding: "40px" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "6px", textAlign: "center" }}>Welcome back</h1>
          <p style={{ color: "#64748B", textAlign: "center", fontSize: "14px", marginBottom: "28px" }}>Sign in to access your reports and searches</p>

          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            style={{ width: "100%", padding: "13px", border: "1.5px solid #E2E8F0", borderRadius: "10px", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "14px", fontWeight: "600", color: "#334155", transition: "all 0.2s", marginBottom: "20px" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          <form onSubmit={handleEmailLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input id="login-email" type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: "40px" }} />
              </div>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input id="login-password" type={showPw ? "text" : "password"} className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button id="email-login-btn" type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#64748B", marginTop: "20px" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" style={{ color: "#10B981", fontWeight: "600", textDecoration: "none" }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
