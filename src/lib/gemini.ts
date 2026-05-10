import { GoogleGenerativeAI } from "@google/generative-ai";
import { IntakeFormData, AIReport } from "@/types";

function getGenAI() {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5
  ].filter(Boolean);
  const randomKey = keys[Math.floor(Math.random() * keys.length)] || "AIzaSyPlaceholderForBuild";
  return new GoogleGenerativeAI(randomKey);
}

const SYSTEM_PROMPT = `You are MediTrip's medical travel AI assistant. You help patients find the best hospitals worldwide for their condition. You are knowledgeable about global medical tourism, international hospital accreditation (JCI, NABH), treatment costs by country, and medical specializations. Always respond with structured JSON. Never give specific medical advice. Always include disclaimer that users should consult a doctor before traveling. Be accurate, compassionate and trustworthy.

When generating cost estimates, use realistic 2026 market rates. Always include a compassionate tone while being factual about costs and quality.`;

export async function generateMedicalReport(formData: IntakeFormData): Promise<AIReport> {
  const genAI = getGenAI();
  // The user no longer provides a budget or local quote.
  // The AI must research these costs automatically.

  const isPremium = formData.planType === "premium";

  const userPrompt = `
A patient has submitted the following intake information. Please analyze this and generate a comprehensive medical travel report in JSON format.

Patient Information:
- Medical Condition: ${formData.condition}
- Home Country: ${formData.homeCountry}
- Preferred Destination: ${formData.destination}${formData.specificCountry ? ` (${formData.specificCountry})` : ""}${formData.specificCity ? ` / ${formData.specificCity}` : ""}
- Travel Group: ${formData.travelGroup}

Please respond with a JSON object matching EXACTLY this structure:
{
  "conditionSummary": "A compassionate 2-3 sentence explanation of what the patient's condition is and what treatment they likely need. Written for a non-medical audience.",
  "medicalSpecialty": "The medical specialty (e.g., Orthopedics, Cardiology, Oncology)",
  "procedureType": "The specific procedure likely needed (e.g., Total Knee Replacement, CABG, etc.)",
  "urgencyNote": "Optional note about treatment urgency",
  "topCountries": [
    {
      "country": "Country name",
      "flag": "Flag emoji",
      "reasoning": "2-3 sentences explaining why this country is recommended for this specific condition",
      "estimatedCost": "Cost range in USD (e.g., $8,000 - $12,000)",
      "savings": "Amount saved vs home country based on your research",
      "savingsPercent": 65,
      "popularHospitals": ["Hospital 1", "Hospital 2"],
      "travelTime": "Approximate flight time from ${formData.homeCountry}",
      "languageBarrier": "Low",
      "medicalQuality": "Excellent"
    }
  ],
  "costComparison": {
    "homeCountry": "${formData.homeCountry}",
    "homeCost": "AI-researched estimated cost in ${formData.homeCountry} for this condition",
    "comparisonRows": [
      {
        "country": "Country name",
        "cost": "Estimated cost range in USD",
        "savings": "Amount saved",
        "savingsPercent": 65
      }
    ]
  },
  "additionalNotes": "Any important notes about traveling for this specific medical condition, recovery time, aftercare considerations, etc.",
  "disclaimer": "MediTrip provides informational guidance only. Always consult a qualified doctor before making any medical travel decisions. Cost estimates are approximations and may vary based on individual circumstances, hospital selection, and additional care required.",
  "visaInfo": {
    "generalRequirements": "General visa requirements for medical travel from ${formData.homeCountry}",
    "medicalVisaTypes": "Types of medical visas available for top recommended destinations",
    "processingTime": "Typical processing time",
    "requiredDocuments": ["Document 1", "Document 2", "Hospital invitation letter"],
    "tips": "Practical visa tips for medical travelers"
  },
  "travelGuide": {
    "bestTimeToTravel": "Best months to visit",
    "localTransportation": "How to get around from the hospital",
    "accommodationTips": "Where to stay near the hospital",
    "currencyAndPayments": "Currency, payment methods, tipping culture",
    "languageTips": "Key phrases or communication tips",
    "healthAndSafety": "Health precautions, vaccinations, travel insurance advice",
    "packingList": ["Essential item 1", "Post-surgery clothing", "Medical documents folder"],
    "companionTips": "Tips for the travel companion"
  },
  "recommendedHospitals": [
    {
      "name": "Actual Hospital Name",
      "address": "Full real address",
      "city": "City name",
      "country": "Country name",
      "phone": "Real phone number if known",
      "rating": 4.8,
      "totalRatings": 1250,
      "specializations": ["Specialty 1", "JCI Accredited"],
      "costEstimate": "$8,000 - $12,000"
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}

${formData.destination !== "Any country"
      ? `CRITICAL INSTRUCTION: The user has SPECIFICALLY REQUESTED to go to: ${formData.specificCity || ""} ${formData.specificCountry || ""}. You MUST ONLY return this specific location as the single item in the "topCountries" array. AND you MUST find and return the 6 best hospitals specifically in that location in the "recommendedHospitals" array.`
      : `The user is open to ANY country. Provide up to 3 recommended destination countries. Then, in the "recommendedHospitals" array, provide the 6 best hospitals across these recommended countries, ranked by their relevance and quality for treating ${formData.condition}.`}

IMPORTANT: Research the average cost of ${formData.condition} in ${formData.homeCountry} (the patient's home country) and compare it with the costs in the recommended destinations. Return exactly 6 real, famous hospitals known for ${formData.condition}. Rank them in order of excellence.
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ googleSearch: {} }] as any,
  });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }]
  });

  let jsonText = response.response.text();

  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    const report = JSON.parse(jsonText) as AIReport;
    // Add mock placeIds to hospitals if missing
    if (report.recommendedHospitals) {
      report.recommendedHospitals = report.recommendedHospitals.map((h, i) => ({
        ...h,
        placeId: `ai_ranked_${i}_${Date.now()}`
      }));
    }
    return report;
  } catch (err) {
    console.error("Failed to parse AI response as JSON", err);
    throw new Error("Failed to parse AI response as JSON");
  }
}
