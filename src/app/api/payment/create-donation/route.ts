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

    const payment = await dodo.payments.create({
      billing: {
        country: "US",
      },
      customer: {
        name: "Anonymous Supporter",
        email: "support@meditrip.com",
      },
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID_DONATION || "pdt_0NechJjqM8IYjxVykT9Hf",
          quantity: 1,
          amount: amount * 100,
        },
      ],
      metadata: {
        type: "donation",
        amount: String(amount),
      },
      return_url: `${baseUrl}/`,
      payment_link: true,
    });

    return NextResponse.json({ url: payment.payment_link });
  } catch (err) {
    console.error("Donation creation error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
