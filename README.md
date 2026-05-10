# MediTrip 🏥🌍

MediTrip is a premium, AI-powered medical tourism platform designed to help patients navigate the complex world of global healthcare. We empower users to find world-class, affordable medical treatments by analyzing their specific conditions and cross-referencing them with a global database of accredited hospitals.

Built with **Next.js**, **Supabase**, **Dodo Payments**, and **Advanced AI Analysis**.

## ✨ Features

- **AI-Powered Clinical Analysis**: Uses state-of-the-art AI to interpret medical conditions and recommend specific specialties, procedures, and global destinations.
- **Global Hospital Intelligence**: Integration with global mapping data to identify highly-rated, internationally accredited hospitals.
- **Cost Transparency**: Provides AI-generated cost estimates for procedures across different countries, helping users save up to 80% compared to local treatments.
- **Premium Medical Reports**: Users can unlock comprehensive, clinical-grade reports detailing hospital certifications, travel logistics, and personalized healthcare pathways.
- **Secure Payments**: Fully integrated with Dodo Payments for safe and seamless global transactions.
- **Personalized Dashboard**: A private user portal to manage search history, track report status, and access past medical insights.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Modern CSS with high-performance animations
- **Database & Auth**: Supabase (PostgreSQL)
- **Payment Gateway**: Dodo Payments
- **AI Engine**: Advanced Large Language Models (LLM)
- **Emails**: Resend API
- **Maps Integration**: Google Places API

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory and add the following keys (refer to `.env.example` for the full list):
- Supabase Project URL & Anon Key
- AI Service API Keys
- Dodo Payments Secret Keys
- Google Maps API Key
- Resend API Key

### 3. Database Initialization
1. Create a new project in your Supabase Dashboard.
2. Run the provided SQL script found in `supabase/schema.sql` using the Supabase SQL Editor to set up the necessary tables and relationships.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛡️ Disclaimer

MediTrip is an informational platform and does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health providers with any questions you may have regarding a medical condition. This platform is designed to assist in researching travel and cost options for elective medical procedures.

---
*Created with care for global health equity.*
