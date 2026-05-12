"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, FileText, Calendar, Lock, LogOut, User, Globe, CheckCircle,
  MoreVertical, ExternalLink, ArrowRight, Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

interface SearchRecord {
  id: string;
  condition: string;
  budget: string;
  destination: string;
  created_at: string;
  reports?: { is_paid: boolean; id: string }[];
}

interface UserData {
  reports_remaining: number;
  dodo_subscription_id?: string;
}

function ReportMenu({ search, report, onClose }: {
  search: SearchRecord;
  report?: { is_paid: boolean; id: string };
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <div
      style={{
        position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 50,
        background: "white", border: "1px solid var(--border)", borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: "200px", overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {report && (
        <button
          onClick={() => { router.push(`/results?searchId=${search.id}`); onClose(); }}
          style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--primary)", fontFamily: "inherit", fontWeight: "600" }}
        >
          <ExternalLink size={14} color="var(--accent)" /> View Report
        </button>
      )}

      {report && !report.is_paid && (
        <button
          onClick={() => { router.push(`/payment?searchId=${search.id}`); onClose(); }}
          style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#10B981", fontFamily: "inherit", fontWeight: "600" }}
        >
          <Lock size={14} color="#10B981" /> Unlock Full Report
        </button>
      )}
      <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
      <button
        onClick={() => { router.push(`/intake?condition=${encodeURIComponent(search.condition)}`); onClose(); }}
        style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--text-secondary)", fontFamily: "inherit" }}
      >
        <Plus size={14} /> New Search (Similar)
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push("/auth/login"); return; }
      setUser(u as any);

      const [searchRes, userRes] = await Promise.all([
        supabase.from("searches").select("*, reports(id, is_paid)").eq("user_id", u.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("users").select("reports_remaining, dodo_subscription_id").eq("id", u.id).single(),
      ]);

      setSearches(searchRes.data || []);
      setUserData(userRes.data);
      setLoading(false);
    };
    init();
  }, [supabase, router]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (openMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
  }

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const paidCount = searches.filter((s) => s.reports?.some((r) => r.is_paid)).length;


  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>⏳</div>
          <p style={{ color: "#64748B" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar />
      <div style={{ paddingTop: "88px", paddingBottom: "60px" }}>
        <div className="container-custom">

          {/* Welcome Header */}
          <div style={{
            background: "linear-gradient(135deg, #0A2540 0%, #1a3a5c 100%)",
            borderRadius: "20px", padding: "clamp(24px, 4vw, 44px)",
            marginBottom: "28px", color: "white",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={22} color="#10B981" />
                </div>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", margin: 0 }}>Welcome back,</p>
                  <h1 style={{ color: "white", fontSize: "clamp(18px, 3vw, 24px)", margin: 0 }}>{name}</h1>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: 0 }}>{user?.email}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link href="/intake">
                <button className="btn-accent" style={{ padding: "11px 20px", fontSize: "14px" }}>
                  <Plus size={15} /> New Search
                </button>
              </Link>
              <button
                onClick={handleSignOut}
                style={{ padding: "11px 16px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", fontFamily: "inherit" }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "28px" }}>
            {[
              { label: "Total Searches", value: searches.length, icon: "🔍" },
              { label: "Paid Reports", value: paidCount, icon: "📋" },
              { label: "Countries Explored", value: [...new Set(searches.map((s) => s.destination))].filter(Boolean).length, icon: "🌍" },
            ].map((stat) => (
              <div key={stat.label} className="card" style={{ padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>{stat.icon}</div>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "#0A2540" }}>{stat.value}</div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>{stat.label}</div>
              </div>
            ))}
          </div>



          {/* Reports List */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "20px", color: "#0A2540" }}>My Reports</h2>
              <Link href="/intake">
                <button className="btn-accent" style={{ padding: "9px 16px", fontSize: "13px" }}>
                  <Plus size={13} /> New
                </button>
              </Link>
            </div>

            {searches.length === 0 ? (
              <div className="card" style={{ padding: "56px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <h3 style={{ marginBottom: "8px", color: "#0A2540" }}>No reports generated yet</h3>
                <p style={{ color: "#64748B", fontSize: "15px", margin: 0 }}>
                  Click the "New" button above to start your first search.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {searches.map((search) => {
                  const report = search.reports?.[0];
                  const isPaid = report?.is_paid;
                  const date = new Date(search.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

                  return (
                    <div 
                      key={search.id} 
                      className="card" 
                      style={{ 
                        padding: "20px 24px", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        gap: "12px", 
                        flexWrap: "wrap",
                        cursor: report ? "pointer" : "default",
                        transition: "transform 0.2s, border-color 0.2s"
                      }}
                      onClick={() => {
                        if (report) router.push(`/results?searchId=${search.id}`);
                        else if (!report) router.push(`/processing?searchId=${search.id}`);
                      }}
                      onMouseEnter={(e) => {
                        if (report) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.borderColor = "var(--accent)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (report) {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.borderColor = "var(--border)";
                        }
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <FileText size={15} color="#10B981" style={{ flexShrink: 0 }} />
                          <h3 style={{ fontSize: "15px", color: "#0A2540", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "300px" }}>{search.condition}</h3>
                          {isPaid ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(16,185,129,0.1)", color: "#059669", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "100px", flexShrink: 0 }}>
                              <CheckCircle size={10} /> Paid
                            </span>
                          ) : report ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(239,68,68,0.08)", color: "#DC2626", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "100px", flexShrink: 0 }}>
                              <Lock size={10} /> Free Preview
                            </span>
                          ) : null}
                        </div>
                        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>📍 {search.destination}</span>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>💰 {search.budget}</span>
                          <span style={{ fontSize: "12px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={11} /> {date}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        {report ? (
                          <Link href={`/results?searchId=${search.id}`}>
                            <button className="btn-primary" style={{ padding: "9px 16px", fontSize: "13px" }}>
                              View Report
                            </button>
                          </Link>
                        ) : (
                          <Link href={`/processing?searchId=${search.id}`}>
                            <button className="btn-outline" style={{ padding: "9px 16px", fontSize: "13px" }}>
                              Processing...
                            </button>
                          </Link>
                        )}

                        {/* 3-dot menu */}
                        <div style={{ position: "relative" }} ref={openMenu === search.id ? menuRef : undefined}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === search.id ? null : search.id); }}
                            style={{ background: "none", border: "1px solid var(--border)", borderRadius: "8px", padding: "7px 9px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenu === search.id && (
                            <ReportMenu
                              search={search}
                              report={report}
                              onClose={() => setOpenMenu(null)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="disclaimer" style={{ marginTop: "32px" }}>
            ⚠️ MediTrip provides informational guidance only. Always consult a qualified doctor before making any medical travel decisions.
          </div>
        </div>
      </div>
    </div>
  );
}
