"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, MapPin, Star, Lock, ArrowRight, CheckCircle2, X, ShieldCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Report } from "@/types";
import { COUNTRIES } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} fill={s <= Math.round(rating) ? "#F59E0B" : "none"} color={s <= Math.round(rating) ? "#F59E0B" : "var(--border)"} />
      ))}
      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginLeft: "6px" }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function PaywallModal({ searchId, onClose }: { searchId: string; onClose: () => void }) {
  const router = useRouter();
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,37,64,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onClose}>
      <div className="card animate-fade-in-up" style={{ maxWidth: "520px", width: "100%", padding: "48px", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><X size={24} /></button>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", background: "rgba(16,185,129,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Lock size={32} color="var(--accent)" />
          </div>
          <h2 style={{ fontSize: "28px", color: "var(--primary)", marginBottom: "12px" }}>Unlock Full Report</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.6", marginBottom: "16px" }}>Get all hospital matches, cost breakdowns, and direct coordinates to finalize your medical travel.</p>
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "var(--accent)" }}>
              💰 People save an average of $31,000 using MediTrip.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          {/* Standard Option */}
          <button onClick={() => router.push(`/payment?searchId=${searchId}&type=one_time`)} style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 20px", background: "white", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--primary)" }}>Standard Report</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>All hospitals + contact details</div>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)" }}>$19</div>
            </div>
          </button>

          {/* Premium Option */}
          <button onClick={() => router.push(`/payment?searchId=${searchId}&type=subscription`)} style={{ width: "100%", border: "2px solid var(--accent)", borderRadius: "14px", padding: "16px 20px", background: "rgba(16,185,129,0.04)", cursor: "pointer", textAlign: "left", position: "relative" }}>
            <div style={{ position: "absolute", top: "-10px", right: "20px", background: "var(--accent)", color: "white", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase" }}>Recommended</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "800", fontSize: "15px", color: "var(--primary)" }}>Premium Concierge</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Visa info + Travel guide + Health tips</div>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent)" }}>$49</div>
            </div>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {["All hospital matches + contacts", "Clinical cost comparisons", "Direct clinical coordinates", "Secure Stripe payment"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <CheckCircle2 size={14} color="var(--accent)" /> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



function HospitalCard({ hospital, index, blurred, homeCost, homeCountry }: any) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + " " + hospital.address)}`;

  return (
    <div style={{ position: "relative", filter: blurred ? "blur(6px)" : "none", pointerEvents: blurred ? "none" : "auto" }}>
      <div className="card" style={{ padding: "32px", borderLeft: index === 0 ? "4px solid var(--accent)" : "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            {index === 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent)", fontSize: "12px", fontWeight: "800", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <ShieldCheck size={16} /> Verified Top Match
              </div>
            )}
            <h3 style={{ fontSize: "20px", color: "var(--primary)", marginBottom: "6px" }}>{hospital.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "14px", marginBottom: "12px" }}>
              <MapPin size={14} /> {hospital.city}, {hospital.country}
            </div>
            {hospital.rating && <StarRating rating={hospital.rating} />}
            {hospital.totalRatings && <span style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>({hospital.totalRatings.toLocaleString()} patient reviews)</span>}
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: "700", textTransform: "uppercase" }}>Est. Procedure Cost</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent)", fontFamily: "'Fraunces', serif" }}>{hospital.costEstimate}</div>
            {homeCost && (
              <div style={{ fontSize: "14px", color: "#EF4444", fontWeight: "700", marginTop: "4px", background: "rgba(239, 68, 68, 0.05)", padding: "4px 10px", borderRadius: "6px" }}>
                vs {homeCost} at Home
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          {hospital.specializations?.map((tag: string) => (
            <span key={tag} className="badge badge-accent" style={{ background: "rgba(16,185,129,0.06)", color: "var(--accent)", border: "1px solid rgba(16,185,129,0.15)" }}>{tag}</span>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <button className="btn-outline" style={{ padding: "8px 20px", fontSize: "13px" }}>
              <MapPin size={14} /> View on Map
            </button>
          </a>
          {hospital.phone && (
            <a href={`tel:${hospital.phone}`} style={{ textDecoration: "none" }}>
              <button className="btn-outline" style={{ padding: "8px 20px", fontSize: "13px" }}>
                <Phone size={14} /> Contact Hospital
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = searchParams.get("searchId");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);



  useEffect(() => {
    const load = async () => {
      if (!searchId) { setError("Reference ID required."); setLoading(false); return; }
      try {
        const res = await fetch(`/api/report/${searchId}`);
        const data = await res.json();
        if (data.report) setReport(data.report);
        else setError(data.error || "Medical report not found.");
      } catch (err: any) { 
        console.error("Report load error:", err);
        setError("Failed to connect to clinical servers."); 
      }
      finally { setLoading(false); }
    };
    load();

    // If not paid, poll for payment status
    let interval: NodeJS.Timeout;
    if (report && !report.isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/report/${searchId}`);
          const data = await res.json();
          if (data.report?.isPaid) {
            setReport(data.report);
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [searchId, report?.isPaid]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={40} className="animate-spin" color="var(--primary)" style={{ margin: "0 auto 20px" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "18px" }}>Fetching your clinical report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card" style={{ padding: "48px", textAlign: "center", maxWidth: "440px" }}>
          <X size={48} color="#EF4444" style={{ margin: "0 auto 20px" }} />
          <h2 style={{ marginBottom: "12px", color: "var(--primary)" }}>Report Error</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>{error}</p>
          <button className="btn-primary" onClick={() => window.location.href = "/intake"}>New Search</button>
        </div>
      </div>
    );
  }

  const isPaid = report.isPaid;
  const freeHospitals = report.hospitals.slice(0, 2);
  const lockedHospitals = report.hospitals.slice(2);
  const homeCost = report.aiReport.costComparison?.homeCost;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Navbar />
      {showPaywall && <PaywallModal searchId={searchId!} onClose={() => setShowPaywall(false)} />}

      <div style={{ paddingTop: "120px", paddingBottom: "100px" }}>
        <div className="container-custom">

          {/* ── REPORT SUMMARY ── */}
          <div style={{ background: "white", borderRadius: "24px", padding: "64px", border: "1px solid var(--border)", boxShadow: "var(--shadow)", marginBottom: "32px", position: "relative" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              <span className="badge-accent badge">{report.aiReport.medicalSpecialty}</span>
              <span className="badge" style={{ color: "var(--primary)", fontWeight: "700" }}>{report.aiReport.procedureType}</span>
            </div>
            <h1 style={{ fontSize: "42px", color: "var(--primary)", marginBottom: "20px", lineHeight: "1.1" }}>Clinical Analysis Report</h1>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", lineHeight: "1.7", maxWidth: "800px", marginBottom: "32px" }}>
              {report.aiReport.conditionSummary}
            </p>
            {report.aiReport.urgencyNote && (
              <div style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "12px", padding: "16px 24px", color: "#D97706", display: "flex", alignItems: "center", gap: "12px" }}>
                <Star size={18} fill="#F59E0B" />
                <span style={{ fontSize: "15px", fontWeight: "600" }}>Medical Alert: {report.aiReport.urgencyNote}</span>
              </div>
            )}
          </div>

          {/* ── DESTINATION SCAN (HORIZONTAL SCROLL) ── */}
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "22px", color: "var(--primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              🌍 Best Destination Countries
            </h2>
            <div style={{
              display: "flex",
              gap: "20px",
              overflowX: "auto",
              paddingBottom: "10px",
              scrollbarWidth: "none", // Hide scrollbar for clean look
              msOverflowStyle: "none"
            }}>
              {report.aiReport.topCountries.map((c, i) => (
                <div key={i} className="card" style={{
                  flex: "0 0 350px", // Fixed width for horizontal scroll items
                  padding: "24px",
                  background: i === 0 ? "rgba(16,185,129,0.03)" : "white",
                  border: i === 0 ? "1px solid var(--accent)" : "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "32px" }}>{c.flag}</span>
                      <div>
                        <div style={{ fontWeight: "800", color: "var(--primary)", fontSize: "18px" }}>{c.country}</div>
                        <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Quality: {c.medicalQuality || "Excellent"}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--accent)" }}>{c.estimatedCost}</div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent)" }}>{c.savingsPercent}% Savings</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px", height: "70px", overflow: "hidden", textOverflow: "ellipsis" }}>{c.reasoning}</p>
                  <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase" }}>Travel Time</div>
                      <div style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600" }}>✈️ {c.travelTime}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase" }}>Language</div>
                      <div style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600" }}>🗣️ {c.languageBarrier} Barrier</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>

            {/* ── LEFT: HOSPITALS ── */}
            <div style={{ flex: 2 }}>
              <h2 style={{ fontSize: "24px", color: "var(--primary)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                🏥 Top Hospital Matches
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {freeHospitals.map((h, i) => (
                  <HospitalCard key={i} hospital={h} index={i} homeCost={homeCost} />
                ))}

                {!isPaid && lockedHospitals.length > 0 && (
                  <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {lockedHospitals.slice(0, 2).map((h, i) => (
                        <HospitalCard key={i} hospital={h} index={i + 2} blurred />
                      ))}
                    </div>
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to bottom, rgba(247,249,252,0) 0%, rgba(247,249,252,1) 80%)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                      padding: "40px", textAlign: "center",
                    }}>
                      <div style={{ marginTop: "120px" }}>
                        <div style={{ width: "64px", height: "64px", background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                          <Lock size={24} color="var(--primary)" />
                        </div>
                        <h3 style={{ fontSize: "22px", color: "var(--primary)", marginBottom: "12px" }}>Unlock {lockedHospitals.length} More Options</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "20px", maxWidth: "340px", margin: "0 auto 20px" }}>
                          Full hospital list, direct contact details, and complete treatment breakdowns.
                        </p>
                        <div style={{ display: "inline-block", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", padding: "10px 16px", marginBottom: "24px" }}>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "var(--accent)" }}>
                            💰 People save an average of $31,000 using MediTrip. This report costs $19.
                          </p>
                        </div>
                        <button className="btn-primary" onClick={() => setShowPaywall(true)} style={{ padding: "16px 32px" }}>
                          Unlock Full Report — From $19
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isPaid && lockedHospitals.map((h, i) => (
                  <HospitalCard key={i} hospital={h} index={i + 2} homeCost={homeCost} />
                ))}
              </div>
            </div>

            {/* ── RIGHT: SIDEBAR ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>


              {report.aiReport.additionalNotes && (
                <div className="card" style={{ padding: "28px", background: "white" }}>
                  <h3 style={{ fontSize: "18px", color: "var(--primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    💡 Clinical Notes
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.7" }}>{report.aiReport.additionalNotes}</p>
                </div>
              )}

              <div className="card" style={{ padding: "28px", background: "rgba(10,37,64,0.02)", border: "1px dashed var(--border)" }}>
                <h3 style={{ fontSize: "16px", color: "var(--primary)", marginBottom: "12px" }}>Why these countries?</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>Our AI selects destinations based on:</p>
                <ul style={{ paddingLeft: "20px", marginTop: "10px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  <li>JCI Hospital Density</li>
                  <li>Historical Savings Data</li>
                  <li>Specialist Availability</li>
                  <li>Flight Accessibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── PREMIUM FEATURES (VISA & TRAVEL GUIDE) ── */}
          {report.aiReport.visaInfo && report.aiReport.travelGuide && isPaid && report.planTier === "premium" && (
            <div style={{ marginTop: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <Star size={24} color="var(--accent)" fill="var(--accent)" />
                <h2 style={{ fontSize: "24px", color: "var(--primary)", margin: 0 }}>Premium Concierge Info</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                
                {/* Visa Info */}
                <div className="card" style={{ padding: "32px", borderTop: "4px solid var(--accent)" }}>
                  <h3 style={{ fontSize: "20px", color: "var(--primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    🛂 Visa & Travel Requirements
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--primary)" }}>General Requirements:</strong>
                      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>{report.aiReport.visaInfo.generalRequirements}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--primary)" }}>Medical Visas:</strong>
                      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>{report.aiReport.visaInfo.medicalVisaTypes}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--primary)" }}>Required Documents:</strong>
                      <ul style={{ paddingLeft: "20px", margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "14px" }}>
                        {report.aiReport.visaInfo.requiredDocuments.map((doc: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: "4px" }}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ background: "rgba(16,185,129,0.08)", padding: "12px 16px", borderRadius: "8px" }}>
                      <strong style={{ fontSize: "13px", color: "var(--accent)" }}>💡 Visa Tip:</strong>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>{report.aiReport.visaInfo.tips}</p>
                    </div>
                  </div>
                </div>

                {/* Travel Guide */}
                <div className="card" style={{ padding: "32px", borderTop: "4px solid var(--primary)" }}>
                  <h3 style={{ fontSize: "20px", color: "var(--primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    ✈️ Destination Guide
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <strong style={{ fontSize: "13px", color: "var(--primary)" }}>Best Time To Travel</strong>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{report.aiReport.travelGuide.bestTimeToTravel}</p>
                      </div>
                      <div>
                        <strong style={{ fontSize: "13px", color: "var(--primary)" }}>Transportation</strong>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{report.aiReport.travelGuide.localTransportation}</p>
                      </div>
                    </div>
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--primary)" }}>Health & Safety:</strong>
                      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>{report.aiReport.travelGuide.healthAndSafety}</p>
                    </div>
                    <div>
                      <strong style={{ fontSize: "14px", color: "var(--primary)" }}>Essential Packing List:</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                        {report.aiReport.travelGuide.packingList.map((item: string, idx: number) => (
                          <span key={idx} style={{ background: "#F1F5F9", color: "#475569", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer" style={{ marginTop: "64px", border: "none", textAlign: "center", maxWidth: "800px", margin: "64px auto 0" }}>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              🛡️ <strong>Medical Disclaimer:</strong> {report.aiReport.disclaimer}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <ResultsContent />
    </Suspense>
  );
}
