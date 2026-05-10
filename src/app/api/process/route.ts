import { NextRequest, NextResponse } from "next/server";
import { generateMedicalReport } from "@/lib/gemini";
import { searchHospitals } from "@/lib/places";
import { createClient } from "@/lib/supabase/server";
import { IntakeFormData, Hospital } from "@/types";

export const maxDuration = 60; // 60 seconds for Vercel

export async function POST(req: NextRequest) {
  try {
    const { searchId, formData }: { searchId: string; formData: IntakeFormData } = await req.json();

    if (!searchId || !formData) {
      return NextResponse.json({ error: "Missing searchId or formData" }, { status: 400 });
    }

    // 1. Generate master AI report (Report + Hospitals + Ranking in 1 call)
    const aiReport = await generateMedicalReport(formData);

    // 2. Use the hospitals already generated and ranked by AI
    let hospitals = aiReport.recommendedHospitals || [];

    // 3. Add cost estimates if not already present (AI usually includes them now)
    const costByCountry: Record<string, string> = {};
    aiReport.topCountries.forEach((c) => {
      costByCountry[c.country.toLowerCase()] = c.estimatedCost;
    });

    hospitals = hospitals.map((h) => ({
      ...h,
      costEstimate: h.costEstimate || costByCountry[h.country?.toLowerCase() || ""] || aiReport.topCountries[0]?.estimatedCost || "Contact for pricing",
    }));

    // 6. Save report to Supabase
    const supabase = await createClient();
    const reportId = crypto.randomUUID();
    
    const { error: reportError } = await supabase
      .from("reports")
      .insert({
        id: reportId,
        search_id: searchId,
        ai_report_json: aiReport,
        is_paid: false,
      });

    if (reportError) {
      console.error("Report insert error:", reportError);
    }

    // 7. Save hospitals to Supabase
    if (reportId && hospitals.length > 0) {
      const hospitalRows = hospitals.map((h) => ({
        report_id: reportId,
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
      }));

      const { error: hospitalError } = await supabase.from("hospitals").insert(hospitalRows);
      if (hospitalError) console.error("Hospital insert error:", hospitalError);
    }

    return NextResponse.json({ success: true, reportId });
  } catch (err: any) {
    console.error("Process API error:", err);
    
    // Check if it's a rate limit error (Gemini returns 429)
    if (err?.status === 429 || String(err).includes("429") || String(err).includes("quota")) {
      return NextResponse.json(
        { error: "SERVICE_BUSY", message: "Our AI service is currently at peak capacity." }, 
        { status: 429 }
      );
    }

    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
