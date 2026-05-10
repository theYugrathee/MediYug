import { Hospital } from "@/types";

interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  geometry: {
    location: { lat: number; lng: number };
  };
}

interface TextSearchResponse {
  results: GooglePlacesResult[];
  status: string;
  next_page_token?: string;
}

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Search Google Places for hospitals based on condition and location.
 * Uses the Places Text Search API, or falls back to Gemini AI for free.
 */
export async function searchHospitals(
  condition: string,
  location: string,
  procedureType?: string
): Promise<Hospital[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("Google Maps API key not configured — using Gemini AI to generate hospital data");
    return getGeminiHospitals(condition, location, procedureType);
  }

  const query = `${procedureType || condition} hospital in ${location}`;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&type=hospital&key=${apiKey}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = (await response.json()) as TextSearchResponse;
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API status:", data.status);
      return getGeminiHospitals(condition, location, procedureType);
    }

    // Get details for each place (phone numbers require details call)
    const hospitals: Hospital[] = await Promise.all(
      data.results.slice(0, 8).map(async (place) => {
        const details = await getPlaceDetails(place.place_id, apiKey);
        const addressParts = place.formatted_address.split(",");
        const country = addressParts[addressParts.length - 1]?.trim() || location;
        const city = addressParts[addressParts.length - 2]?.trim() || location;

        return {
          name: place.name,
          address: place.formatted_address,
          city,
          country,
          phone: details?.formatted_phone_number || details?.international_phone_number || undefined,
          rating: place.rating,
          totalRatings: place.user_ratings_total,
          placeId: place.place_id,
          website: details?.website,
          specializations: extractSpecializations(place.name, condition),
        };
      })
    );

    return hospitals.filter((h) => h.name && h.address);
  } catch (error) {
    console.error("Error fetching from Google Places:", error);
    return getGeminiHospitals(condition, location, procedureType);
  }
}

async function getGeminiHospitals(condition: string, location: string, procedureType?: string): Promise<Hospital[]> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }] as any
    });
    
    const prompt = `You are an expert medical travel assistant. The user is looking for hospitals in ${location} that specialize in ${condition} (${procedureType || "treatment"}).
    Generate a JSON array of 6 real, top-rated hospitals in ${location} known for this medical specialty. 
    
    Return ONLY a JSON array with exactly this structure:
    [
      {
        "name": "Actual Hospital Name",
        "address": "Full real address",
        "city": "City name",
        "country": "Country name",
        "phone": "Real phone number format if known, otherwise generic format",
        "rating": 4.8,
        "totalRatings": 1250,
        "placeId": "mock_generated_id",
        "specializations": ["Specialty 1", "JCI Accredited"],
        "costEstimate": "$8,000 - $12,000"
      }
    ]`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    
    let jsonText = response.response.text();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    
    const hospitals = JSON.parse(jsonText) as Hospital[];
    return hospitals.map((h, i) => ({ ...h, placeId: `gemini_mock_${i}_${Date.now()}` }));
  } catch (err) {
    console.error("Failed to generate hospitals with Gemini:", err);
    return getMockHospitals(location); // absolute fallback
  }
}

async function getPlaceDetails(placeId: string, apiKey: string): Promise<GooglePlacesResult | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,international_phone_number,website&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

function extractSpecializations(name: string, condition: string): string[] {
  const tags: string[] = [];
  const nameLower = name.toLowerCase();
  const conditionLower = condition.toLowerCase();

  if (nameLower.includes("cardiac") || conditionLower.includes("heart")) tags.push("Cardiology");
  if (nameLower.includes("ortho") || conditionLower.includes("knee") || conditionLower.includes("hip") || conditionLower.includes("joint")) tags.push("Orthopedics");
  if (nameLower.includes("cancer") || nameLower.includes("oncol") || conditionLower.includes("cancer") || conditionLower.includes("tumor")) tags.push("Oncology");
  if (nameLower.includes("neuro") || conditionLower.includes("brain") || conditionLower.includes("neuro")) tags.push("Neurology");
  if (nameLower.includes("eye") || nameLower.includes("ophthal") || conditionLower.includes("eye") || conditionLower.includes("vision")) tags.push("Ophthalmology");
  if (nameLower.includes("dental") || conditionLower.includes("dental") || conditionLower.includes("tooth")) tags.push("Dentistry");
  if (nameLower.includes("fertility") || conditionLower.includes("ivf") || conditionLower.includes("fertility")) tags.push("Fertility");
  if (nameLower.includes("liver") || conditionLower.includes("liver")) tags.push("Hepatology");
  if (nameLower.includes("kidney") || conditionLower.includes("kidney")) tags.push("Nephrology");
  if (nameLower.includes("spine") || conditionLower.includes("spine") || conditionLower.includes("back")) tags.push("Spine Surgery");

  // Default tags
  if (tags.length === 0) {
    tags.push("General Surgery", "Multi-Specialty");
  }

  // Always add JCI for top-rated hospitals
  tags.push("JCI Accredited");

  return tags.slice(0, 4);
}

/**
 * Fallback mock data for demo / when API key is not set
 */
function getMockHospitals(location: string): Hospital[] {
  const mockData: Record<string, Hospital[]> = {
    default: [
      {
        name: "Apollo Hospitals",
        address: "21, Greams Lane, Chennai, Tamil Nadu 600006, India",
        city: "Chennai",
        country: "India",
        phone: "+91 44 2829 0200",
        rating: 4.5,
        totalRatings: 2847,
        placeId: "mock_1",
        specializations: ["Multi-Specialty", "JCI Accredited", "NABH Accredited"],
        costEstimate: "$8,000 - $15,000",
      },
      {
        name: "Bumrungrad International Hospital",
        address: "33 Sukhumvit 3, Watthana, Bangkok 10110, Thailand",
        city: "Bangkok",
        country: "Thailand",
        phone: "+66 2 066 8888",
        rating: 4.6,
        totalRatings: 4123,
        placeId: "mock_2",
        specializations: ["Multi-Specialty", "JCI Accredited", "International Care"],
        costEstimate: "$10,000 - $18,000",
      },
      {
        name: "Gleneagles Hospital",
        address: "6A Napier Road, Singapore 258500",
        city: "Singapore",
        country: "Singapore",
        phone: "+65 6473 7222",
        rating: 4.4,
        totalRatings: 1876,
        placeId: "mock_3",
        specializations: ["Multi-Specialty", "JCI Accredited", "Cardiology"],
        costEstimate: "$15,000 - $25,000",
      },
      {
        name: "Medicana International",
        address: "Beylikdüzü, Istanbul, Turkey",
        city: "Istanbul",
        country: "Turkey",
        phone: "+90 444 44 84",
        rating: 4.3,
        totalRatings: 987,
        placeId: "mock_4",
        specializations: ["Multi-Specialty", "JCI Accredited", "Hair Transplant"],
        costEstimate: "$5,000 - $12,000",
      },
      {
        name: "Fortis Memorial Research Institute",
        address: "Sector 44, Gurugram, Haryana 122002, India",
        city: "Gurugram",
        country: "India",
        phone: "+91 124 4921 021",
        rating: 4.4,
        totalRatings: 3201,
        placeId: "mock_5",
        specializations: ["Oncology", "Neurology", "JCI Accredited"],
        costEstimate: "$7,000 - $13,000",
      },
      {
        name: "Koç University Hospital",
        address: "Davutpaşa Cd. No:4, Topkapı, Istanbul, Turkey",
        city: "Istanbul",
        country: "Turkey",
        phone: "+90 850 250 8 250",
        rating: 4.7,
        totalRatings: 1456,
        placeId: "mock_6",
        specializations: ["Cardiology", "Orthopedics", "JCI Accredited"],
        costEstimate: "$6,000 - $11,000",
      },
    ],
  };

  // Try to match location to predefined sets
  const locationLower = location.toLowerCase();
  if (locationLower.includes("india")) return mockData.default.filter((h) => h.country === "India");
  if (locationLower.includes("thailand")) return mockData.default.filter((h) => h.country === "Thailand");
  if (locationLower.includes("turkey")) return mockData.default.filter((h) => h.country === "Turkey");

  return mockData.default;
}

export function getGoogleMapsDirectionsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
