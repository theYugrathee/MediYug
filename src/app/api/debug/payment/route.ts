import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

// DEBUG ONLY — remove before production
export async function GET(req: NextRequest) {
  const searchId = req.nextUrl.searchParams.get("searchId");
  if (!searchId) return NextResponse.json({ error: "No searchId" });

  // 1. Find the report
  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("id, is_paid, plan_tier")
    .eq("search_id", searchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchError) return NextResponse.json({ step: "fetch", error: fetchError.message });
  if (!report) return NextResponse.json({ step: "fetch", error: "report not found" });

  // 2. Try to update is_paid
  const { error: updateError } = await supabase
    .from("reports")
    .update({ is_paid: true, plan_tier: "standard", payment_intent_id: "debug_test" })
    .eq("id", report.id);

  // 3. Re-fetch to confirm
  const { data: after } = await supabase
    .from("reports")
    .select("is_paid, plan_tier")
    .eq("id", report.id)
    .single();

  return NextResponse.json({
    reportId: report.id,
    before: { is_paid: report.is_paid, plan_tier: report.plan_tier },
    updateError: updateError ? updateError.message : null,
    after,
  });
}
