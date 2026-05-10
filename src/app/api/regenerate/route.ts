import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMedicalReport } from "@/lib/gemini";
import { IntakeFormData } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check regenerations remaining
    const { data: userData } = await supabase
      .from("users")
      .select("regenerations_remaining, stripe_subscription_id")
      .eq("id", user.id)
      .single();

    const hasSubscription = !!userData?.stripe_subscription_id;
    const regenCount = userData?.regenerations_remaining || 0;

    if (!hasSubscription && regenCount <= 0) {
      return NextResponse.json({ error: "No regenerations remaining" }, { status: 403 });
    }

    const { searchId, formData, parentReportId }: {
      searchId: string;
      formData: IntakeFormData;
      parentReportId: string;
    } = await req.json();

    if (!searchId || !formData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Deduct 1 regeneration (unless on unlimited subscription)
    if (!hasSubscription) {
      await supabase
        .from("users")
        .update({ regenerations_remaining: regenCount - 1 })
        .eq("id", user.id);
    }

    // Generate new report
    const aiReport = await generateMedicalReport(formData);

    let hospitals = aiReport.recommendedHospitals || [];
    const costByCountry: Record<string, string> = {};
    aiReport.topCountries.forEach((c) => {
      costByCountry[c.country.toLowerCase()] = c.estimatedCost;
    });
    hospitals = hospitals.map((h) => ({
      ...h,
      costEstimate: h.costEstimate || costByCountry[h.country?.toLowerCase() || ""] || "Contact for pricing",
    }));

    // Save new report linked to parent
    const newReportId = crypto.randomUUID();
    const { error: reportError } = await supabase
      .from("reports")
      .insert({
        id: newReportId,
        search_id: searchId,
        parent_report_id: parentReportId || null,
        ai_report_json: aiReport,
        is_paid: true, // regeneration is always paid (user already paid)
      });

    if (reportError) {
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }

    // Save hospitals
    if (newReportId && hospitals.length > 0) {
      await supabase.from("hospitals").insert(
        hospitals.map((h) => ({
          report_id: newReportId,
          name: h.name,
          city: h.city,
          country: h.country,
          phone: h.phone || null,
          rating: h.rating || null,
          total_ratings: h.totalRatings || null,
          cost_estimate: h.costEstimate || null,
          place_id: h.placeId || null,
          address: h.address,
          specializations: h.specializations || [],
        }))
      );
    }

    // Also update search form_data so it reflects the new inputs
    await supabase
      .from("searches")
      .update({ form_data: formData })
      .eq("id", searchId);

    return NextResponse.json({
      success: true,
      newSearchId: searchId,
      reportId: newReportId,
      regenerationsRemaining: hasSubscription ? "unlimited" : regenCount - 1,
    });
  } catch (err) {
    console.error("Regeneration error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
