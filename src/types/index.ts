// Type definitions for MediTrip

export interface IntakeFormData {
  condition: string;
  homeCountry: string;
  currentQuote?: string;
  currency?: string;
  minBudget?: string;
  maxBudget?: string;
  destination: DestinationPreference;
  specificCountry?: string;
  specificCity?: string;
  travelGroup: TravelGroup;
  planType?: "standard" | "premium";
}

// Keep for backward compat
export type BudgetRange = string;

export type TravelGroup =
  | "Patient alone"
  | "Patient + 1"
  | "Patient + family";

export type DestinationPreference =
  | "Any country"
  | "Specific country"
  | "Specific city";

export interface Hospital {
  id?: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  rating?: number;
  totalRatings?: number;
  placeId?: string;
  specializations?: string[];
  costEstimate?: string;
  website?: string;
  isJciAccredited?: boolean;
  isNabhAccredited?: boolean;
}

export interface CountryRecommendation {
  country: string;
  flag: string;
  reasoning: string;
  estimatedCost: string;
  savings?: string;
  savingsPercent?: number;
  popularHospitals?: string[];
  travelTime?: string;
  languageBarrier?: "Low" | "Medium" | "High";
  medicalQuality?: "Excellent" | "Very Good" | "Good";
}

export interface CostComparison {
  homeCountry: string;
  homeCost: string;
  comparisonRows: {
    country: string;
    cost: string;
    savings: string;
    savingsPercent: number;
  }[];
}

export interface AIReport {
  conditionSummary: string;
  medicalSpecialty: string;
  procedureType: string;
  urgencyNote?: string;
  topCountries: CountryRecommendation[];
  costComparison: CostComparison;
  recommendedHospitals: Hospital[];
  additionalNotes?: string;
  disclaimer: string;
  generatedAt: string;
  visaInfo?: VisaInfo;
  travelGuide?: TravelGuide;
}

export interface VisaInfo {
  generalRequirements: string;
  medicalVisaTypes: string;
  processingTime: string;
  requiredDocuments: string[];
  tips: string;
}

export interface TravelGuide {
  bestTimeToTravel: string;
  localTransportation: string;
  accommodationTips: string;
  currencyAndPayments: string;
  languageTips: string;
  healthAndSafety: string;
  packingList: string[];
  companionTips: string;
}

export interface Search {
  id: string;
  userId?: string;
  condition: string;
  budget: string;
  destination: string;
  createdAt: string;
}

export interface Report {
  id: string;
  searchId: string;
  aiReport: AIReport;
  hospitals: Hospital[];
  isPaid: boolean;
  planTier?: "standard" | "premium";
  paymentIntentId?: string;
  createdAt: string;
}

export interface PaymentOption {
  id: "one_time" | "subscription";
  label: string;
  price: string;
  priceId: string;
  description: string;
  features: string[];
}
