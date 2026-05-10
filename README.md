# MediTrip 🏥🌍

MediTrip is an AI-powered medical tourism platform that helps patients find the best and most affordable hospitals worldwide for their specific medical condition.

Built with **Next.js 14**, **Tailwind CSS**, **Supabase**, **Stripe**, **Claude AI**, and **Google Maps API**.

## Features

- **AI Medical Condition Analysis:** Uses Claude AI to understand natural language conditions and recommend specialties and procedures.
- **Global Hospital Search:** Connects to Google Maps Places API to find highly rated hospitals.
- **Cost Comparisons:** AI-generated estimates of procedure costs across different countries compared to the user's home country.
- **Paywalled Reports:** Users get top 2 results for free. They can unlock the full report via a one-time Stripe payment or a monthly subscription.
- **PDF Email Reports:** Full reports are automatically sent to users via email using Resend.
- **User Dashboard:** Supabase Auth-powered dashboard to track search history and past reports.

## Prerequisites

- Node.js 18+
- Supabase Account (Free tier)
- Anthropic Account for Claude API
- Google Cloud Console Account for Maps API
- Stripe Account
- Resend Account (Free tier)

## Setup Instructions

### 1. Clone & Install
\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

### 2. Environment Variables
Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`
Fill in all the required API keys in `.env.local`.

### 3. Database Setup (Supabase)
1. Go to your Supabase project.
2. Navigate to the SQL Editor.
3. Open `supabase/schema.sql` from this repository.
4. Run the entire SQL script to create tables, triggers, and Row Level Security (RLS) policies.

### 4. Stripe Setup
1. Create products in your Stripe Dashboard for "One-Time Report" ($19) and "Monthly Unlimited" ($29/month).
2. Get your Secret Key and Publishable Key.
3. Configure a Stripe Webhook pointing to `https://your-domain.com/api/payment/webhook` (or use Stripe CLI for local testing).
4. Webhook events to listen to: `checkout.session.completed` and `payment_intent.succeeded`.

### 5. Run Locally
\`\`\`bash
npm run dev
\`\`\`
The app will be running at `http://localhost:3000`.

## Architecture Details

- **Frontend:** Next.js App Router, React Server Components where applicable, Tailwind for styling.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth (Email/Password + Google OAuth).
- **Payments:** Stripe Checkout.
- **AI Integration:** `@anthropic-ai/sdk` using `claude-sonnet-4-20250514`.
- **Emails:** Resend API.

## Disclaimer

This platform includes a medical disclaimer on all pages. It is designed to provide *informational guidance only* and should not replace professional medical advice.
