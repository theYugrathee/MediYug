import { NextRequest, NextResponse } from "next/server";
import { dodo } from "@/lib/dodo";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

const TESTER_EMAILS = ["yugrathi100@gmail.com", "yugrathi28@gmail.com"];

export async function POST(req: NextRequest) {
  try {
    const { searchId, type, email, name, userId } = await req.json();

    if (!searchId || !type || !email || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const origin = req.headers.get("origin");
    const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ─── TESTER BYPASS ───────────────────────────────────────────
    if (TESTER_EMAILS.includes(email.toLowerCase())) {
      // Directly mark report as paid
      const { data: reportRow } = await supabase
        .from("reports")
        .select("id")
        .eq("search_id", searchId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (reportRow) {
        const planTierForTester = type === "subscription" ? "premium" : "standard";
        const { error: updateError } = await supabase
          .from("reports")
          .update({ is_paid: true, plan_tier: planTierForTester, payment_intent_id: "tester_bypass" })
          .eq("id", reportRow.id);
        if (updateError) console.error("Tester bypass update error:", updateError);
      }

      const { data: userData } = await supabase
        .from("users")
        .select("reports_remaining")
        .eq("id", userId)
        .single();

      await supabase.from("users").update({
        reports_remaining: (userData?.reports_remaining || 0) + 1,
      }).eq("id", userId);

      // Redirect directly to success page
      return NextResponse.json({
        url: `${baseUrl}/payment/success?searchId=${searchId}&session_id=tester_bypass`,
      });
    }
    // ─────────────────────────────────────────────────────────────

    let payment;

    // We require DODO_PRODUCT_ID_STANDARD and DODO_PRODUCT_ID_PREMIUM
    // to be defined in .env.local
    const productId = type === "one_time" 
      ? (process.env.DODO_PRODUCT_ID_STANDARD || "prod_standard_placeholder")
      : (process.env.DODO_PRODUCT_ID_PREMIUM || "prod_premium_placeholder");

    const amount = type === "one_time" ? 1900 : 4900;
    const planTier = type === "one_time" ? "standard" : "premium";

    payment = await dodo.payments.create({
      billing: {
        country: "IN", // Required by Dodo billing, using IN or US as default
      },
      customer: {
        email: email,
        name: name || "Customer",
      },
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
          amount: amount // Pass amount if Pay What You Want is enabled on the product, else it uses product price
        }
      ],
      metadata: {
        searchId,
        type: type,
        planTier,
        customerName: name || "",
        customerEmail: email,
        userId,
      },
      return_url: `${baseUrl}/payment/success?searchId=${searchId}`,
      payment_link: true, // We want a checkout URL returned
    });

    return NextResponse.json({ url: payment.payment_link || `${baseUrl}/payment/success?searchId=${searchId}` });
  } catch (err) {
    console.error("Dodo checkout error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
