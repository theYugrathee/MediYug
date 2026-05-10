import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Report, Hospital } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ searchId: string }> }
) {
  const { searchId } = await params;

  if (!searchId) {
    return NextResponse.json({ error: "Missing search ID" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    
    // Fetch report by search_id
    const { data: reportRow, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("search_id", searchId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (reportError || !reportRow) {
      // Report not ready yet
      return NextResponse.json({ ready: false });
    }

    // Fetch hospitals
    const { data: hospitalRows } = await supabase
      .from("hospitals")
      .select("*")
      .eq("report_id", reportRow.id)
      .order("id", { ascending: true });

    const hospitals: Hospital[] = (hospitalRows || []).map((h) => ({
      id: h.id,
      name: h.name,
      address: h.address || "",
      city: h.city || "",
      country: h.country || "",
      phone: h.phone,
      rating: h.rating,
      totalRatings: h.total_ratings,
      placeId: h.place_id,
      specializations: h.specializations || [],
      costEstimate: h.cost_estimate,
    }));

    const report: Report = {
      id: reportRow.id,
      searchId: reportRow.search_id,
      aiReport: reportRow.ai_report_json,
      hospitals,
      isPaid: reportRow.is_paid,
      planTier: reportRow.plan_tier,
      paymentIntentId: reportRow.payment_intent_id,
      createdAt: reportRow.created_at,
    };

    return NextResponse.json({ ready: true, report });
  } catch (err) {
    console.error("Report fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
