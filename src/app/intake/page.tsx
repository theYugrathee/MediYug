"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
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
  padding: "18px 24px", borderRadius: "14px",
  border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
  background: active ? "rgba(16,185,129,0.05)" : "white",
  textAlign: "left" as const, cursor: "pointer", transition: "all 0.2s",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  width: "100%", outline: "none", fontFamily: "inherit",
});

const labelStyle = { display: "block", fontSize: "14px", fontWeight: "600" as const, color: "var(--primary)", marginBottom: "8px" };

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

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = form as IntakeFormData;
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
      setShowAuthGate(true);
    }
  }

  function nextStep() {
    if (step < 4) setStep(step + 1);
    else attemptSubmit();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: "1.5px solid var(--border)",
    borderRadius: "12px",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    background: "white",
    color: "var(--text-primary)",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      {showAuthGate && (
        <AuthGateModal
          onClose={() => setShowAuthGate(false)}
          onAuthenticated={() => { setShowAuthGate(false); handleSubmit(); }}
        />
      )}
      <div style={{ paddingTop: "90px", paddingBottom: "60px", minHeight: "100vh" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 16px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span className="badge badge-accent" style={{ marginBottom: "10px" }}>Step {step} of 4</span>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 34px)", marginBottom: "6px", color: "var(--primary)" }}>
              Medical Intake Form
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
              Complete these details to generate your clinical-grade hospital report.
            </p>
          </div>

          {/* Step Indicators */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
              {STEPS.map((s) => (
                <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "700", fontSize: "13px", transition: "all 0.3s ease",
                    background: step > s.id ? "var(--accent)" : step === s.id ? "var(--primary)" : "white",
                    color: step >= s.id ? "white" : "var(--text-secondary)",
                    border: step >= s.id ? "none" : "1px solid var(--border)",
                    boxShadow: step === s.id ? "0 0 0 4px rgba(10,37,64,0.08)" : "none",
                    flexShrink: 0,
                  }}>
                    {step > s.id ? "✓" : s.id}
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: step === s.id ? "var(--primary)" : "var(--text-secondary)" }}>{s.label}</span>
                </div>
              ))}
              <div style={{ position: "absolute", top: "16px", left: "20px", right: "20px", height: "2px", background: "var(--border)", zIndex: -1 }} />
              <div style={{ position: "absolute", top: "16px", left: "20px", width: `${progress}%`, height: "2px", background: "var(--accent)", zIndex: -1, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: "clamp(24px, 5vw, 44px)" }}>

            {/* STEP 1: CONDITION */}
            {step === 1 && (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: "clamp(18px, 4vw, 24px)", marginBottom: "6px", color: "var(--primary)" }}>
                  What treatment do you need?
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
                  Describe your condition or the specific surgery you are looking for.
                </p>
                <textarea
                  id="condition-input"
                  placeholder="e.g. I need a total knee replacement surgery on my left leg due to severe arthritis..."
                  rows={6}
                  value={form.condition}
                  onChange={(e) => update("condition", e.target.value)}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "140px",
                    lineHeight: "1.6",
                    marginBottom: "14px",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Knee replacement", "Heart bypass", "IVF treatment", "Dental implants", "Hip replacement", "Cancer treatment"].map((c) => (
                    <button key={c} onClick={() => update("condition", c)} style={{
                      padding: "6px 14px", borderRadius: "8px",
                      border: `1px solid ${form.condition === c ? "var(--primary)" : "var(--border)"}`,
                      background: form.condition === c ? "rgba(10,37,64,0.06)" : "white",
                      color: form.condition === c ? "var(--primary)" : "var(--text-secondary)",
                      fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
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
                <h2 style={{ fontSize: "clamp(18px, 4vw, 24px)", marginBottom: "6px", color: "var(--primary)" }}>Your Current Location</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>We use this to compare travel logistics and cost savings.</p>

                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Where do you live? *</label>
                  <select style={inputStyle} value={form.homeCountry} onChange={(e) => update("homeCountry", e.target.value)}>
                    <option value="">Select your home country...</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Local Treatment Quote (Optional)</label>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 25000 (in your local currency)"
                    value={form.currentQuote || ""}
                    onChange={(e) => update("currentQuote", e.target.value)}
                  />
                </div>
              </div>
            )}



            {/* STEP 3: DESTINATION */}
            {step === 3 && (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: "clamp(18px, 4vw, 24px)", marginBottom: "6px", color: "var(--primary)" }}>Destination Preference</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>Where would you like to travel for treatment?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {DESTINATION_PREFS.map((d) => (
                    <button key={d} onClick={() => update("destination", d)} style={selBtn(form.destination === d)}>
                      <span style={{ fontWeight: "700", color: form.destination === d ? "var(--primary)" : "var(--text-primary)" }}>{d}</span>
                      {form.destination === d && <CheckCircle2 size={20} color="var(--accent)" />}
                    </button>
                  ))}
                </div>
                {form.destination === "Specific country" && (
                  <select style={inputStyle} value={form.specificCountry} onChange={(e) => update("specificCountry", e.target.value)}>
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                {form.destination === "Specific city" && (
                  <input type="text" style={inputStyle} placeholder="e.g. Istanbul, Bangkok, Mumbai..." value={form.specificCity} onChange={(e) => update("specificCity", e.target.value)} />
                )}
              </div>
            )}

            {/* STEP 4: TRAVEL */}
            {step === 4 && (
              <div className="animate-fade-in-up">
                <h2 style={{ fontSize: "clamp(18px, 4vw, 24px)", marginBottom: "6px", color: "var(--primary)" }}>Traveling Party</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>How many people will be traveling with the patient?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {TRAVEL_GROUPS.map((g) => (
                    <button key={g} onClick={() => update("travelGroup", g)} style={selBtn(form.travelGroup === g)}>
                      <div>
                        <div style={{ fontWeight: "700", color: form.travelGroup === g ? "var(--primary)" : "var(--text-primary)", fontSize: "16px" }}>{g}</div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                          {g === "Patient alone" ? "Solo medical travel" : "Includes travel companion logistics"}
                        </div>
                      </div>
                      {form.travelGroup === g && <CheckCircle2 size={20} color="var(--accent)" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", gap: "12px" }}>
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="btn-outline"
                style={{ opacity: step === 1 ? 0 : 1, flex: 1, justifyContent: "center", pointerEvents: step === 1 ? "none" : "auto" }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={nextStep}
                disabled={!canProceed() || loading}
                className="btn-primary"
                style={{ opacity: canProceed() && !loading ? 1 : 0.5, flex: 2, justifyContent: "center" }}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {step === 4 ? "Generate Report" : "Continue"} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
            🛡️ Your data is encrypted and handled according to medical privacy standards.
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
