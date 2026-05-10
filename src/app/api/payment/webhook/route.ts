import { NextRequest, NextResponse } from "next/server";
import { dodo } from "@/lib/dodo";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 400 });
  }

  let event: any;
  try {
    event = await dodo.webhooks.unwrap(body, { headers: req.headers as any, key: webhookSecret });
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = supabaseAdmin;

  // Dodo payment success events
  if (event.type === "payment.succeeded" || (event.data && event.data.status === "succeeded")) {
    const payment = event.data;
    const metadata = payment.metadata;

    if (!metadata?.searchId) {
      return NextResponse.json({ received: true });
    }

    const { searchId, customerEmail, customerName, userId, type, planTier } = metadata;

    if (userId) {
      if (type === "one_time") {
        const { data: userData } = await supabase
          .from("users")
          .select("reports_remaining")
          .eq("id", userId)
          .single();
          
        await supabase
          .from("users")
          .update({
            reports_remaining: (userData?.reports_remaining || 0) + 1,
          })
          .eq("id", userId);
      } else if (type === "subscription" || planTier === "premium") {
        await supabase
          .from("users")
          .update({ 
            stripe_subscription_id: (payment.subscription_id as string) || `premium_${payment.payment_id}`, 
            stripe_customer_id: payment.customer?.customer_id as string 
          })
          .eq("id", userId);
      }
    }

    // Mark report as paid
    const { data: reportRow } = await supabase
      .from("reports")
      .select("*")
      .eq("search_id", searchId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (reportRow) {
      const { error: updateError } = await supabase
        .from("reports")
        .update({
          is_paid: true,
          plan_tier: planTier === "premium" ? "premium" : "standard",
          payment_intent_id: payment.payment_id,
        })
        .eq("id", reportRow.id);

      if (updateError) console.error("Webhook report update error:", updateError);
    } else {
      console.error("Report not found for search ID:", searchId);
    }
  }

  return NextResponse.json({ received: true });
}
