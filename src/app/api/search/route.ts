import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { IntakeFormData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const formData: IntakeFormData = await req.json();

    if (!formData.condition || !formData.homeCountry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const budgetDisplay = formData.minBudget && formData.maxBudget
      ? `${formData.currency || "USD"} ${Number(formData.minBudget).toLocaleString()} – ${Number(formData.maxBudget).toLocaleString()}`
      : formData.minBudget || formData.maxBudget || "Flexible";

    const destination =
      formData.destination === "Specific country"
        ? formData.specificCountry || "Any country"
        : formData.destination === "Specific city"
        ? formData.specificCity || "Any country"
        : "Any country";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: search, error: searchError } = await supabase
      .from("searches")
      .insert({
        user_id: user?.id || null,
        condition: formData.condition,
        budget: budgetDisplay,
        destination,
        home_country: formData.homeCountry,
        form_data: formData,
      })
      .select()
      .single();

    if (searchError || !search) {
      console.error("Search insert error:", searchError);
      // Still return a temp ID so the flow continues
      const tempId = `temp_${Date.now()}`;
      return NextResponse.json({ searchId: tempId, formData });
    }

    // Return both searchId AND formData so processing page can call /api/process directly
    return NextResponse.json({ searchId: search.id, formData });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
