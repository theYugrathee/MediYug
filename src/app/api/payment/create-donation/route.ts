import { NextRequest, NextResponse } from "next/server";
import { dodo } from "@/lib/dodo";

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!process.env.DODO_API_KEY || process.env.DODO_API_KEY.includes("your_dodo_secret")) {
      return NextResponse.json({ 
        error: "CONFIGURATION_ERROR", 
        message: "Dodo API Key is missing. Please add it to your .env.local file." 
      }, { status: 500 });
    }

    const origin = req.headers.get("origin");
    const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create a one-time payment for the donation
    // We use a generic "Donation" product or create one on the fly if supported,
    // but Dodo usually requires a product ID. 
    // However, Dodo supports "payments" without a pre-defined product sometimes,
    // but the safest way is to use the payments.create method.
    
    const payment = await dodo.payments.create({
      billing: {
        country: "US", // Default
      },
      customer: {
        name: "Anonymous Supporter",
        email: "support@meditrip.com", // Generic fallback
      },
      product_cart: [
        {
          product_id: "don_generic", // Placeholder or real ID if you have one
          quantity: 1,
          amount: amount * 100, // Dodo usually uses cents/smallest unit
        },
      ],
      metadata: {
        type: "donation",
        amount: String(amount),
      },
      return_url: `${baseUrl}/payment/success?type=donation`,
      payment_link: true,
    });

    return NextResponse.json({ url: payment.payment_link });
  } catch (err) {
    console.error("Donation creation error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
