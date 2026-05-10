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
  const [confirmed, setConfirmed] = useState(isTesterBypass);

  useEffect(() => {
    if (!searchId) return;
    // Tester bypass: report is already paid, no need to poll
    if (isTesterBypass) {
      setConfirmed(true);
      return;
    }

    // Do an immediate first check, then poll every 2s
    const checkPaid = async () => {
      try {
        const res = await fetch(`/api/report/${searchId}`);
        const data = await res.json();
        if (data?.report?.isPaid) {
          setConfirmed(true);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Payment polling error:", err);
      }
    };

    checkPaid(); // immediate first check
    const interval = setInterval(checkPaid, 2000);
    return () => clearInterval(interval);
  }, [searchId, isTesterBypass]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar />
      <div
        style={{
          paddingTop: "88px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div
          className="card animate-bounce-in"
          style={{ maxWidth: "520px", width: "100%", padding: "56px 48px", textAlign: "center" }}
        >
          <div
            style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "rgba(16,185,129,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              border: "3px solid rgba(16,185,129,0.3)",
            }}
          >
            <CheckCircle size={40} color="#10B981" />
          </div>

          <h1 style={{ fontSize: "30px", marginBottom: "12px", letterSpacing: "-0.5px" }}>
            {confirmed ? "Payment Successful! 🎉" : "Processing Payment..."}
          </h1>
          <p style={{ color: "#64748B", fontSize: "16px", lineHeight: "1.7", marginBottom: "32px" }}>
            {confirmed 
              ? "Your full MediTrip report has been unlocked. You can now access all hospital matches and clinical findings."
              : "We are verifying your transaction with Stripe. This usually takes a few seconds."}
          </p>

          {!confirmed && (
            <div
              style={{
                background: "#FFF7ED", borderRadius: "10px",
                padding: "14px 20px", marginBottom: "24px",
                border: "1px solid #FED7AA",
              }}
            >
              <p style={{ fontSize: "13px", color: "#92400E", margin: 0 }}>
                ⏳ Confirming your payment...
              </p>
            </div>
          )}

          {confirmed && (
            <div
              style={{
                background: "#F0FDF4", borderRadius: "10px",
                padding: "14px 20px", marginBottom: "24px",
                border: "1px solid #BBF7D0",
              }}
            >
              <p style={{ fontSize: "13px", color: "#166534", margin: 0 }}>
                ✅ Payment confirmed — your report is now fully unlocked!
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            {searchId && (
              <Link href={confirmed ? `/results?searchId=${searchId}` : "#"}>
                <button 
                  className={confirmed ? "btn-accent" : "btn-outline"} 
                  disabled={!confirmed}
                  style={{ width: "100%", justifyContent: "center", padding: "14px", opacity: confirmed ? 1 : 0.6, cursor: confirmed ? "pointer" : "not-allowed" }}
                >
                  {confirmed ? "View Full Report" : "Processing Payment..."} {confirmed && <ArrowRight size={16} />}
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
