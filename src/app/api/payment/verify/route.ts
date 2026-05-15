import { NextRequest, NextResponse } from "next/server";
import { dodo } from "@/lib/dodo";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const searchId = searchParams.get("searchId");

  if (!searchId) {
    return NextResponse.json({ error: "Missing searchId" }, { status: 400 });
  }

  try {
    // 1. Check if it's already marked as paid in our DB
    const { data: report } = await supabase
      .from("reports")
      .select("id, is_paid")
      .eq("search_id", searchId)
      .single();

    if (report?.is_paid) {
      return NextResponse.json({ success: true, status: "already_paid" });
    }

    // 2. Deep Search in Dodo
    // Correct SDK parameters: page_size and the result is the array itself or .items
    const payments = await dodo.payments.list({ page_size: 50 });
    
    // Dodo SDK often returns the array directly or under 'items' 
    // depending on the version/pagination type.
    const paymentList = (payments as any).items || (payments as any).data || payments;

    console.log(`Searching through payments for searchId: ${searchId}`);

    const matchingPayment = (paymentList as any[]).find(p => {
      // Check metadata precisely
      const meta = p.metadata as any;
      const isMatch = meta && (String(meta.searchId) === String(searchId) || String(meta.search_id) === String(searchId));
      const isSuccess = p.status === "succeeded";
      
      return isMatch && isSuccess;
    });

    if (matchingPayment) {
      const meta = matchingPayment.metadata as any;
      // Correct logic: check if explicitly premium or subscription, otherwise standard
      const planTier = (meta.planTier === "premium" || meta.type === "subscription") ? "premium" : "standard";
      
      // Update database
      const { error: updateError } = await supabase
        .from("reports")
        .update({
          is_paid: true,
          plan_tier: planTier,
          payment_intent_id: matchingPayment.payment_id,
        })
        .eq("search_id", searchId);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, status: "unlocked" });
    }

    return NextResponse.json({ 
      success: false, 
      status: "not_found", 
      debug: { 
        searchedCount: (paymentList as any[]).length,
        targetSearchId: searchId
      } 
    });
  } catch (err) {
    console.error("Manual verification error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
