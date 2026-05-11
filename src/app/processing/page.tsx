"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const PROCESSING_STEPS = [
  { label: "Analyzing clinical intake data...", icon: "🧠", duration: 2500 },
  { label: "Scanning global accredited hospitals...", icon: "🌍", duration: 3500 },
  { label: "Calculating real-time cost estimates...", icon: "💰", duration: 3000 },
  { label: "Verifying hospital certifications...", icon: "🛡️", duration: 2500 },
  { label: "Compiling your medical report...", icon: "📋", duration: 2000 },
];

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = searchParams.get("searchId");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [statusText, setStatusText] = useState("Processing medical intake...");

  useEffect(() => {
    let stepIndex = 0;
    const totalDuration = PROCESSING_STEPS.reduce((a, s) => a + s.duration, 0);
    let elapsed = 0;

    const tick = () => {
      if (stepIndex >= PROCESSING_STEPS.length) return;
      const step = PROCESSING_STEPS[stepIndex];
      elapsed += step.duration;
      setCurrentStep(stepIndex);
      setProgress(Math.min(95, Math.round((elapsed / totalDuration) * 95)));
      stepIndex++;
      if (stepIndex < PROCESSING_STEPS.length) {
        setTimeout(tick, step.duration);
      }
    };
    setTimeout(tick, 200);
  }, []);

  const runProcess = useCallback(async () => {
    if (!searchId) return;
    try {
      const storedData = sessionStorage.getItem(`formData_${searchId}`);
      if (!storedData) {
        setError("No session data found. Please start over.");
        return;
      }

      const formData = JSON.parse(storedData);
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId, formData }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === "SERVICE_BUSY") {
          setIsBusy(true);
          throw new Error("Our AI service is currently at peak capacity due to high demand. Please try again in a few moments.");
        }
        throw new Error(errData.error || "The AI is currently under high demand. Please try again later.");
      }

      const data = await res.json();
      if (data.success || data.reportId) {
        setProgress(100);
        setStatusText("Report successfully generated.");
        sessionStorage.removeItem(`formData_${searchId}`);
        setTimeout(() => {
          router.push(`/results?searchId=${searchId}`);
        }, 1000);
      }
    } catch (err) {
      console.error("Processing error:", err);
      setError(err instanceof Error ? err.message : "Network error. Please check your connection and try again.");
    }
  }, [searchId, router]);

  useEffect(() => {
    if (!searchId) {
      setError("Reference ID not found. Please try again.");
      return;
    }
    runProcess();
  }, [searchId, runProcess]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      {error ? (
        <div className="card" style={{ padding: "64px 48px", maxWidth: "520px", width: "100%", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
            <AlertCircle size={40} color="#EF4444" />
          </div>
          <h2 style={{ color: "var(--primary)", fontSize: "28px", marginBottom: "16px" }}>
            {isBusy ? "Service is Busy" : "Processing Error"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "40px", lineHeight: "1.6" }}>{error}</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {isBusy && (
              <button 
                className="btn-primary" 
                onClick={() => {
                  setError(null);
                  setIsBusy(false);
                  setProgress(10);
                  runProcess();
                }} 
                style={{ width: "100%", justifyContent: "center", padding: "16px" }}
              >
                Try Again Now
              </button>
            )}
            <button 
              className="btn-outline" 
              onClick={() => router.push("/intake")} 
              style={{ width: "100%", justifyContent: "center", padding: "16px" }}
            >
              Return to Intake Form
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "640px", width: "100%", textAlign: "center" }}>
          
          {/* Clinical Loading Animation */}
          <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 40px" }}>
            <div style={{ position: "absolute", inset: 0, border: "3px solid var(--border)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", inset: 0, border: "3px solid var(--accent)", borderRadius: "50%", borderTopColor: "transparent", animation: "spin 1.5s linear infinite" }} />
            <div style={{ position: "absolute", inset: "12px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: "52px" }}>🏥</span>
            </div>
          </div>

          <h1 style={{ fontSize: "32px", color: "var(--primary)", marginBottom: "12px" }}>Generating Medical Report</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "18px", marginBottom: "48px" }}>
            Please stay on this page while our AI performs a global clinical search.
          </p>

          {/* Progress Section */}
          <div style={{ background: "white", padding: "48px", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow)", textAlign: "left", marginBottom: "24px" }}>
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Analysis Progress</span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent)" }}>{progress}%</span>
            </div>
            
            <div style={{ height: "10px", background: "#F1F5F9", borderRadius: "100px", overflow: "hidden", marginBottom: "40px" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: "100px", transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {PROCESSING_STEPS.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: i <= currentStep ? 1 : 0.3, transition: "opacity 0.4s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "32px", height: "32px", background: i < currentStep ? "rgba(16,185,129,0.1)" : "transparent", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i < currentStep ? <CheckCircle2 size={18} color="var(--accent)" /> : <span style={{ fontSize: "22px" }}>{step.icon}</span>}
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: i <= currentStep ? "600" : "400", color: "var(--primary)" }}>{step.label}</span>
                  </div>
                  {i === currentStep && i < PROCESSING_STEPS.length && <Loader2 size={18} className="animate-spin" color="var(--accent)" />}
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontStyle: "italic" }}>
            &ldquo;We cross-reference 800+ JCI accredited hospitals to ensure patient safety.&rdquo;
          </p>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <ProcessingContent />
    </Suspense>
  );
}
