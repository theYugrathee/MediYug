"use client";

import { useState } from "react";
import { X, Heart, Loader2, CheckCircle2, DollarSign } from "lucide-react";

interface DonateModalProps {
  onClose: () => void;
}

const DONATION_AMOUNTS = [10, 50, 100, 500, 1000, 5000, 10000];

export default function DonateModal({ onClose }: DonateModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDonate() {
    if (!selectedAmount) return;
    setLoading(true);

    try {
      const res = await fetch("/api/payment/create-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create donation session");
      }
    } catch (err) {
      console.error("Donation error:", err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(10,37,64,0.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
    }}>
      <div className="card animate-fade-in-up" style={{ 
        maxWidth: "480px", width: "100%", padding: "32px", position: "relative",
        background: "white", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)"
        }}>
          <X size={24} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "60px", height: "60px", background: "rgba(16,185,129,0.1)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Heart size={30} color="var(--accent)" fill="var(--accent)" style={{ opacity: 0.8 }} />
          </div>
          <h2 style={{ fontSize: "24px", color: "var(--primary)", marginBottom: "8px" }}>Support MediTrip</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Your donation helps us provide free medical insights to those who need it most worldwide.
          </p>
        </div>

        {/* Amount Grid */}
        <div style={{ 
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", 
          gap: "12px", marginBottom: "32px" 
        }}>
          {DONATION_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              style={{
                padding: "16px 8px", borderRadius: "12px", border: "1.5px solid",
                borderColor: selectedAmount === amt ? "var(--accent)" : "var(--border)",
                background: selectedAmount === amt ? "rgba(16,185,129,0.05)" : "white",
                color: selectedAmount === amt ? "var(--primary)" : "var(--text-primary)",
                fontWeight: "700", cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "2px"
              }}
            >
              <DollarSign size={14} />{amt.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Action */}
        <button
          className="btn-primary"
          onClick={handleDonate}
          disabled={!selectedAmount || loading}
          style={{ 
            width: "100%", justifyContent: "center", padding: "18px", 
            fontSize: "16px", opacity: (!selectedAmount || loading) ? 0.6 : 1 
          }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>Complete Donation <ArrowRight size={18} style={{ marginLeft: "8px" }} /></>
          )}
        </button>

        <p style={{ 
          textAlign: "center", fontSize: "12px", color: "var(--text-secondary)", 
          marginTop: "16px", fontStyle: "italic" 
        }}>
          Securely processed by Dodo Payments
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

// Simple ArrowRight icon placeholder since lucide-react was imported at top
function ArrowRight({ size, style }: { size: number; style?: any }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
      strokeLinejoin="round" style={style}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
