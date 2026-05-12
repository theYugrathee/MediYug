"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Shield, Globe, Search, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthGateModal from "@/components/AuthGateModal";
import { createClient } from "@/lib/supabase/client";
import { IntakeFormData, TravelGroup, DestinationPreference } from "@/types";
import { COUNTRIES, CURRENCIES } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Case" },
  { id: 2, label: "Home" },
  { id: 3, label: "Destination" },
  { id: 4, label: "Travel" },
];

const TRAVEL_GROUPS: TravelGroup[] = ["Patient alone", "Patient + 1", "Patient + family"];
const DESTINATION_PREFS: DestinationPreference[] = ["Any country", "Specific country", "Specific city"];

const selBtn = (active: boolean) => ({
  padding: "24px", borderRadius: "20px",
  border: `2px solid ${active ? "var(--accent)" : "rgba(10,37,64,0.06)"}`,
  background: active ? "rgba(16,185,129,0.03)" : "white",
  textAlign: "left" as const, cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  width: "100%", outline: "none", fontFamily: "inherit",
  boxShadow: active ? "0 10px 25px rgba(16,185,129,0.12)" : "0 4px 12px rgba(0,0,0,0.02)",
  position: "relative" as const,
  overflow: "hidden" as const
});

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  border: "2px solid rgba(10,37,64,0.06)",
  borderRadius: "16px",
  fontSize: "16px",
  fontFamily: "inherit",
  outline: "none",
  background: "rgba(10,37,64,0.02)",
  color: "var(--primary)",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
  fontWeight: "500"
};

const labelStyle = { 
  display: "block", 
  fontSize: "13px", 
  fontWeight: "800" as const, 
  color: "var(--text-secondary)", 
  marginBottom: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em"
};

function IntakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [form, setForm] = useState<Partial<IntakeFormData>>({
    condition: searchParams.get("condition") || "",
    homeCountry: "",
    currency: "USD",
    minBudget: "",
    maxBudget: "",
    destination: "Any country",
    specificCountry: "",
    specificCity: "",
    travelGroup: "Patient alone",
    planType: "standard",
  });

  // Restore form from localStorage if it exists (useful after auth redirect)
  useEffect(() => {
    const saved = localStorage.getItem("pendingIntakeForm");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed }));
        // If we just came back from auth, we might want to auto-submit
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            localStorage.removeItem("pendingIntakeForm");
            // Auto-submit after restore if we are at the last step
            setStep(4);
            handleSubmit(parsed as IntakeFormData);
          }
        });
      } catch (e) {
        console.error("Error restoring form", e);
      }
    }
  }, []);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  function update<K extends keyof IntakeFormData>(key: K, val: IntakeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function canProceed() {
    if (step === 1) return (form.condition?.trim().length ?? 0) >= 5;
    if (step === 2) return (form.homeCountry?.trim().length ?? 0) > 0;
    if (step === 3) {
      if (form.destination === "Specific country") return (form.specificCountry?.trim().length ?? 0) > 0;
      if (form.destination === "Specific city") return (form.specificCity?.trim().length ?? 0) > 0;
      return true;
    }
    if (step === 4) return !!form.travelGroup;
    return true;
  }

  async function handleSubmit(overrideForm?: IntakeFormData) {
    setLoading(true);
    try {
      const payload = overrideForm || (form as IntakeFormData);
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      if (data.searchId) {
        sessionStorage.setItem(`formData_${data.searchId}`, JSON.stringify(payload));
        router.push(`/processing?searchId=${data.searchId}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to start search. Please check your connection.");
      setLoading(false);
    }
  }

  async function attemptSubmit() {
    if (loading) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await handleSubmit();
    } else {
      // Save form to localStorage so it survives the OAuth redirect
      localStorage.setItem("pendingIntakeForm", JSON.stringify(form));
      setShowAuthGate(true);
    }
  }

  function nextStep() {
    if (step < 4) setStep(step + 1);
    else attemptSubmit();
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      {showAuthGate && (
        <AuthGateModal
          onClose={() => setShowAuthGate(false)}
          onAuthenticated={() => { setShowAuthGate(false); handleSubmit(); }}
        />
      )}
      <div style={{ paddingTop: "120px", paddingBottom: "80px", minHeight: "100vh" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ 
              display: "inline-flex", alignItems: "center", gap: "6px", 
              color: "var(--accent)", fontWeight: "800", fontSize: "12px", 
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" 
            }}>
              <CheckCircle2 size={14} /> Medical Intelligence Intake
            </div>
            <h1 style={{ 
              fontSize: "clamp(26px, 5vw, 36px)", color: "var(--primary)", 
              fontFamily: "'Fraunces', serif", marginBottom: "8px" 
            }}>
              Search Global Care
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "400px", margin: "0 auto" }}>
              Securely share your case to receive a personalized, clinical-grade hospital comparison.
            </p>
          </div>

          {/* Progress Bar - Minimalist Premium */}
          <div style={{ marginBottom: "40px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              {STEPS.map((s) => (
                <span key={s.id} style={{ 
                  fontSize: "11px", fontWeight: "800", textTransform: "uppercase", 
                  color: step === s.id ? "var(--accent)" : "var(--text-secondary)",
                  letterSpacing: "0.05em", transition: "color 0.3s ease"
                }}>
                  {s.label}
                </span>
              ))}
            </div>
            <div style={{ height: "4px", background: "rgba(10,37,64,0.06)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ 
                height: "100%", background: "var(--accent)", width: `${progress}%`, 
                transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)", borderRadius: "10px" 
              }} />
            </div>
          </div>

          {/* Form Card */}
          <div className="card animate-fade-in-up" style={{ 
            padding: "clamp(24px, 6vw, 48px)",
            boxShadow: "0 10px 40px rgba(10,37,64,0.05)",
            border: "1px solid var(--border)",
            borderRadius: "24px"
          }}>

            {/* STEP 1: CONDITION */}
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--primary)", fontWeight: "800" }}>
                  Medical Treatment Case
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                  What specific surgery or treatment are you exploring?
                </p>
                <textarea
                  id="condition-input"
                  placeholder="Describe your medical needs..."
                  rows={6}
                  value={form.condition}
                  onChange={(e) => update("condition", e.target.value)}
                  style={{
                    ...inputStyle,
                    resize: "none",
                    minHeight: "160px",
                    lineHeight: "1.6",
                    marginBottom: "20px",
                    background: "rgba(10,37,64,0.02)",
                    padding: "20px",
                    fontSize: "16px"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; e.target.style.background = "white"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "rgba(10,37,64,0.02)"; }}
                />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Knee replacement", "Heart bypass", "Dental implants", "Hip replacement"].map((c) => (
                    <button key={c} onClick={() => update("condition", c)} style={{
                      padding: "8px 16px", borderRadius: "10px",
                      border: "1.5px solid",
                      borderColor: form.condition === c ? "var(--accent)" : "var(--border)",
                      background: form.condition === c ? "rgba(16,185,129,0.05)" : "white",
                      color: form.condition === c ? "var(--primary)" : "var(--text-secondary)",
                      fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s"
                    }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: HOME */}
            {step === 2 && (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--primary)", fontWeight: "800" }}>Origin & Logistics</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "32px" }}>Help us calculate precise travel and currency savings.</p>

                <div style={{ marginBottom: "24px" }}>
                  <label style={labelStyle}>Your Home Country</label>
                  <select 
                    style={{ ...inputStyle, padding: "14px 16px", background: "rgba(10,37,64,0.02)" }} 
                    value={form.homeCountry} 
                    onChange={(e) => update("homeCountry", e.target.value)}
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Local Treatment Quote (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontWeight: "700" }}>$</span>
                    <input
                      type="number"
                      style={{ ...inputStyle, padding: "14px 16px 14px 32px", background: "rgba(10,37,64,0.02)" }}
                      placeholder="Amount in USD"
                      value={form.currentQuote || ""}
                      onChange={(e) => update("currentQuote", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: DESTINATION */}
            {step === 3 && (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--primary)", fontWeight: "800" }}>Target Destination</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "32px" }}>Choose where our AI should focus its search.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                  {DESTINATION_PREFS.map((d) => (
                    <button 
                      key={d} 
                      onClick={() => update("destination", d)} 
                      style={selBtn(form.destination === d)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ 
                          width: "48px", height: "48px", borderRadius: "12px", 
                          background: form.destination === d ? "var(--accent)" : "rgba(10,37,64,0.04)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: form.destination === d ? "white" : "var(--primary)",
                          transition: "all 0.3s ease"
                        }}>
                          {d === "Any country" ? <Globe size={22} /> : d === "Specific country" ? <Search size={22} /> : <Plus size={22} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: "800", fontSize: "16px", color: form.destination === d ? "var(--primary)" : "var(--text-primary)" }}>{d}</div>
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                            {d === "Any country" ? "Global hospital search" : d === "Specific country" ? "Focus on one region" : "Targeted city search"}
                          </div>
                        </div>
                      </div>
                      {form.destination === d && <CheckCircle2 size={24} color="var(--accent)" />}
                    </button>
                  ))}
                </div>
                {form.destination === "Specific country" && (
                  <div className="animate-fade-in-up">
                    <label style={labelStyle}>Selected Region</label>
                    <select style={inputStyle} value={form.specificCountry} onChange={(e) => update("specificCountry", e.target.value)}>
                      <option value="">Select target country...</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                {form.destination === "Specific city" && (
                  <div className="animate-fade-in-up">
                    <label style={labelStyle}>Target Location</label>
                    <input type="text" style={inputStyle} placeholder="e.g. Bangkok, Istanbul, Mumbai..." value={form.specificCity} onChange={(e) => update("specificCity", e.target.value)} />
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: TRAVEL */}
            {step === 4 && (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--primary)", fontWeight: "800" }}>Travel Group</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "32px" }}>Define your logistics party for accurate cost estimation.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {TRAVEL_GROUPS.map((g) => (
                    <button 
                      key={g} 
                      onClick={() => update("travelGroup", g)} 
                      style={selBtn(form.travelGroup === g)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ 
                          width: "48px", height: "48px", borderRadius: "12px", 
                          background: form.travelGroup === g ? "var(--primary)" : "rgba(10,37,64,0.04)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white",
                          transition: "all 0.3s ease"
                        }}>
                          {g === "Patient alone" ? "👤" : g === "Patient + 1" ? "👥" : "👨‍👩‍👧‍👦"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "800", color: form.travelGroup === g ? "var(--primary)" : "var(--text-primary)", fontSize: "16px" }}>{g}</div>
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: "500" }}>
                            {g === "Patient alone" ? "Solo Medical Traveler" : "Companion Logistics Included"}
                          </div>
                        </div>
                      </div>
                      {form.travelGroup === g && <CheckCircle2 size={24} color="var(--accent)" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px", gap: "16px" }}>
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="btn-outline"
                style={{ 
                  opacity: step === 1 ? 0 : 1, 
                  flex: 1, 
                  justifyContent: "center", 
                  padding: "16px",
                  borderRadius: "12px",
                  fontSize: "14px"
                }}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <button
                onClick={nextStep}
                disabled={!canProceed() || loading}
                className="btn-primary"
                style={{ 
                  opacity: canProceed() && !loading ? 1 : 0.5, 
                  flex: 2, 
                  justifyContent: "center",
                  padding: "16px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "800"
                }}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {step === 4 ? "Generate AI Report" : "Continue"} <ArrowRight size={18} style={{ marginLeft: "8px" }} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div style={{ 
            marginTop: "32px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}>
            <Shield size={14} /> Clinical Data Privacy Standards (HIPAA Compliant)
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <IntakeContent />
    </Suspense>
  );
}
