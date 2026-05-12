"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, ArrowLeft, ShieldCheck, Lock, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

const PLANS = [
  {
    id: "one_time" as const,
    label: "Standard Report",
    price: "$19",
    originalPrice: "$49",
    priceNum: 19,
    billing: "one-time",
    description: "Full clinical report with verified hospital matches",
    features: [
      "All hospital matches unlocked",
      "Full cost breakdown",
      "Specialist contact details",
      "Direct coordinates",
    ],
    color: "var(--accent)",
    bg: "white",
    border: "var(--border)",
  },
  {
    id: "subscription" as const,
    label: "Premium Report",
    price: "$49",
    originalPrice: "$99",
    priceNum: 49,
    billing: "one-time",
    description: "Everything in Standard + Visa info, travel guide & expert tips",
    features: [
      "Everything in Standard",
      "Visa requirements & process",
      "Full destination travel guide",
      "Packing & health travel tips",
      "Priority AI processing",
    ],
    color: "white",
    bg: "var(--primary)",
    border: "var(--primary)",
    recommended: true,
  },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = searchParams.get("searchId");
  const typeParam = searchParams.get("type") as "one_time" | "subscription" | null;

  const [selected, setSelected] = useState<"one_time" | "subscription">(typeParam || "one_time");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (searchId) {
      supabase.from("searches").select("home_country").eq("id", searchId).single().then(({ data }) => {
        if (data?.home_country) {
          const countryMap: Record<string, string> = {
            "United States": "US", "United Kingdom": "GB", "Canada": "CA", "Australia": "AU",
            "India": "IN", "UAE": "AE", "Singapore": "SG", "Malaysia": "MY", "Germany": "DE", "France": "FR"
          };
          setCountry(countryMap[data.home_country] || "US");
        }
      });
    }
  }, [searchId, supabase]);

  async function handleCheckout() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push(`/auth/login?next=/payment?searchId=${searchId || ''}&type=${selected}`);
      return;
    }

    if (!email.includes("@")) { alert("Please enter a valid email address"); return; }
    if (!searchId) { alert("Missing search reference ID"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId, type: selected, email, name, country, userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initiate secure checkout");
      }
    } catch {
      alert("System communication error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = PLANS.find((p) => p.id === selected)!;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        <div className="container-custom" style={{ maxWidth: "1000px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span className="badge badge-accent" style={{ marginBottom: "16px" }}>Secure Clinical Portal</span>
            <h3 style={{ fontSize: "22px", color: "var(--primary)", marginBottom: "12px" }}>Stop Overpaying for Care</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px", maxWidth: "440px", margin: "0 auto 20px" }}>
              Full hospital list, direct contact details, and <strong>complete treatment breakdowns.</strong>
            </p>
            <div style={{ display: "inline-block", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", padding: "12px 24px" }}>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--accent)" }}>
                💰 People save an average of $31,000 using MediTrip. This report costs {selectedPlan.price}.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px" }}>

            {/* Left: Plan selector */}
            <div>
              <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                1. Select Analysis Plan
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelected(plan.id)}
                    style={{
                      border: `2px solid ${selected === plan.id ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "16px",
                      padding: "24px",
                      background: selected === plan.id ? (plan.recommended ? "var(--primary)" : "rgba(16,185,129,0.05)") : "white",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      position: "relative",
                      boxShadow: selected === plan.id ? "var(--shadow)" : "none"
                    }}
                  >
                    {plan.recommended && (
                      <div style={{
                        position: "absolute", top: "-12px", right: "20px",
                        background: "var(--accent)", color: "white", fontSize: "11px",
                        fontWeight: "800", padding: "4px 12px", borderRadius: "100px",
                      }}>
                        BEST VALUE
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontWeight: "800", fontSize: "18px", color: (plan.recommended && selected === plan.id) ? "white" : "var(--primary)" }}>
                        {plan.label}
                      </span>
                      <div style={{ textAlign: "right" }}>
                        {plan.originalPrice && (
                          <span style={{ fontSize: "14px", textDecoration: "line-through", color: (plan.recommended && selected === plan.id) ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)", marginRight: "8px" }}>
                            {plan.originalPrice}
                          </span>
                        )}
                        <span style={{ fontSize: "24px", fontWeight: "800", color: (plan.recommended && selected === plan.id) ? "var(--accent)" : "var(--accent)" }}>
                          {plan.price}
                        </span>
                        <span style={{ fontSize: "12px", color: (plan.recommended && selected === plan.id) ? "rgba(255,255,255,0.5)" : "var(--text-secondary)", marginLeft: "4px" }}>
                          {plan.billing}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: "14px", color: (plan.recommended && selected === plan.id) ? "rgba(255,255,255,0.7)" : "var(--text-secondary)", marginBottom: "16px" }}>
                      {plan.description}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {plan.features.map((f) => (
                        <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: (plan.recommended && selected === plan.id) ? "rgba(255,255,255,0.8)" : "var(--text-secondary)" }}>
                          <CheckCircle2 size={14} color="var(--accent)" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <button
                style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "0", fontWeight: "600" }}
                onClick={() => router.back()}
              >
                <ArrowLeft size={16} /> Back to report summary
              </button>
            </div>

            {/* Right: Checkout form */}
            <div>
              <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "var(--primary)" }}>2. Patient Details</h2>
              <div className="card" style={{ padding: "40px", boxShadow: "var(--shadow-lg)" }}>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "var(--primary)", marginBottom: "8px" }}>
                    Full Patient Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "var(--primary)", marginBottom: "8px" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "10px", lineHeight: "1.4" }}>
                    🔒 We will display your full clinical findings and hospital coordinates securely in your dashboard. We use this to pre-fill your secure checkout.
                  </p>
                </div>



                {/* Order Summary Table */}
                <div style={{ background: "#F1F5F9", borderRadius: "14px", padding: "24px", marginBottom: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "600" }}>Analysis Selection</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)" }}>{selectedPlan.label}</span>
                  </div>
                  <div style={{ height: "1px", background: "var(--border)", margin: "16px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>Grand Total</span>
                    <span style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent)", fontFamily: "'Fraunces', serif" }}>{selectedPlan.price}</span>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "18px", fontSize: "17px", borderRadius: "14px" }}
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? "Processing Securely..." : `Proceed to Payment — ${selectedPlan.price}`}
                </button>

                <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
                    <ShieldCheck size={14} color="var(--accent)" /> Dodo Protected
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
                    <Lock size={14} color="var(--accent)" /> 256-bit SSL
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="disclaimer" style={{ marginTop: "40px", textAlign: "center", border: "none" }}>
            ⚖️ By proceeding, you agree to our Terms of Service and Medical Disclaimer.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <PaymentContent />
    </Suspense>
  );
}
