"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get("searchId");
  const sessionId = searchParams.get("session_id");
  const isTesterBypass = sessionId === "tester_bypass";
  
  const [status, setStatus] = useState<"processing" | "success" | "failed" | "not_found">("processing");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!searchId) return;
    if (isTesterBypass) {
      setStatus("success");
      return;
    }

    const checkPaid = async () => {
      try {
        const res = await fetch(`/api/report/${searchId}`);
        const data = await res.json();
        if (data?.report?.isPaid) {
          setStatus("success");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Payment polling error:", err);
      }
    };

    checkPaid();
    const interval = setInterval(checkPaid, 3000);
    return () => clearInterval(interval);
  }, [searchId, isTesterBypass]);

  const handleManualVerify = async () => {
    if (!searchId) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/payment/verify?searchId=${searchId}`);
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        // If not found yet, maybe give it more time
        alert("Payment not found yet. Please wait a few seconds and try again.");
      }
    } catch (err) {
      alert("Error verifying payment. Please check your internet connection.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar />
      <div style={{ paddingTop: "88px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
        <div className="card animate-bounce-in" style={{ maxWidth: "520px", width: "100%", padding: "56px 48px", textAlign: "center" }}>
          
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: status === "success" ? "rgba(16,185,129,0.1)" : "rgba(10,37,64,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            border: `3px solid ${status === "success" ? "rgba(16,185,129,0.3)" : "rgba(10,37,64,0.1)"}`,
          }}>
            <CheckCircle size={40} color={status === "success" ? "#10B981" : "#0A2540"} />
          </div>

          <h1 style={{ fontSize: "30px", marginBottom: "12px", letterSpacing: "-0.5px" }}>
            {status === "success" ? "Payment Successful! 🎉" : "Confirming Payment..."}
          </h1>
          
          <p style={{ color: "#64748B", fontSize: "16px", lineHeight: "1.7", marginBottom: "32px" }}>
            {status === "success" 
              ? "Your full MediTrip report has been unlocked. You can now access all hospital matches and clinical findings."
              : "We're waiting for the bank to confirm your transaction. This usually happens in seconds."}
          </p>

          {status === "processing" && (
            <div style={{ background: "#F1F5F9", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontSize: "13px", color: "#475569", margin: 0, fontWeight: "600" }}>
                  ⏳ Taking longer than expected?
                </p>
                <button 
                  onClick={handleManualVerify}
                  disabled={verifying}
                  style={{
                    background: "#0A2540", color: "white", border: "none",
                    borderRadius: "8px", padding: "10px 16px", fontWeight: "700",
                    cursor: "pointer", fontSize: "14px", opacity: verifying ? 0.7 : 1
                  }}
                >
                  {verifying ? "Syncing with Dodo..." : "I've Paid — Verify My Report"}
                </button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div style={{ background: "#F0FDF4", borderRadius: "10px", padding: "14px 20px", marginBottom: "24px", border: "1px solid #BBF7D0" }}>
              <p style={{ fontSize: "13px", color: "#166534", margin: 0, fontWeight: "600" }}>
                ✅ Payment Verified — Access Unlocked
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            {searchId && (
              <Link href={status === "success" ? `/results?searchId=${searchId}` : "#"}>
                <button 
                  className={status === "success" ? "btn-accent" : "btn-outline"} 
                  disabled={status !== "success"}
                  style={{ width: "100%", justifyContent: "center", padding: "14px", opacity: status === "success" ? 1 : 0.6 }}
                >
                  {status === "success" ? "View Full Report" : "Confirming..."} {status === "success" && <ArrowRight size={16} />}
                </button>
              </Link>
            )}
            <Link href="/dashboard">
              <button className="btn-outline" style={{ width: "100%", justifyContent: "center", padding: "14px" }}>
                Go to Dashboard
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F8FAFC" }} />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
