import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { IntakeFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const formData: IntakeFormData = await req.json();

    const condition = formData.condition?.trim().slice(0, 1000) || "";
    const homeCountry = formData.homeCountry?.trim().slice(0, 100) || "";

    if (condition.length < 5 || !homeCountry) {
      return NextResponse.json({ error: "Invalid input provided" }, { status: 400 });
    }

    // Defensive check: prevent common injection patterns
    const forbiddenPatterns = [/SELECT/i, /INSERT/i, /DELETE/i, /UPDATE/i, /DROP/i, /--/];
    if (forbiddenPatterns.some(p => p.test(condition))) {
       // Log but don't leak info
       console.warn("Potential injection attempt detected in condition field");
    }

    const budgetDisplay = formData.minBudget && formData.maxBudget
      ? `${formData.currency || "USD"} ${Number(formData.minBudget).toLocaleString()} – ${Number(formData.maxBudget).toLocaleString()}`
      : formData.minBudget || formData.maxBudget || "Flexible";

    const destination =
      formData.destination === "Specific country"
        ? (formData.specificCountry?.trim().slice(0, 100) || "Any country")
        : formData.destination === "Specific city"
        ? (formData.specificCity?.trim().slice(0, 100) || "Any country")
        : "Any country";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: search, error: searchError } = await supabase
      .from("searches")
      .insert({
        user_id: user?.id || null,
        condition: condition,
        budget: budgetDisplay,
        destination,
        home_country: homeCountry,
        form_data: { ...formData, condition, homeCountry, destination },
      })
      .select()
      .single();

    if (searchError || !search) {
      console.error("Search insert error:", searchError);
      return NextResponse.json({ error: "Failed to initialize search" }, { status: 500 });
    }

    return NextResponse.json({ searchId: search.id, formData });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }
}
