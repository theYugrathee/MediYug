"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      
      <div style={{ paddingTop: "120px", paddingBottom: "100px" }}>
        <div className="container-custom" style={{ maxWidth: "800px" }}>
          <h1 style={{ fontSize: "40px", color: "var(--primary)", marginBottom: "40px" }}>Terms & Conditions</h1>
          
          <div className="card" style={{ padding: "48px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
            <h2 style={{ color: "var(--primary)", fontSize: "20px", marginBottom: "16px" }}>1. Medical Disclaimer</h2>
            <p style={{ marginBottom: "24px" }}>
              MediTrip is an AI-powered information platform. We are not medical professionals, and we do not provide medical advice, diagnosis, or treatment. All information provided in our reports is for informational purposes only. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>

            <h2 style={{ color: "var(--primary)", fontSize: "20px", marginBottom: "16px" }}>2. Use of AI</h2>
            <p style={{ marginBottom: "24px" }}>
              Our reports are generated using advanced artificial intelligence. While we strive for accuracy, AI can occasionally generate incorrect information. It is the user's responsibility to verify all hospital details, costs, and clinical capabilities directly with the facilities mentioned.
            </p>

            <h2 style={{ color: "var(--primary)", fontSize: "20px", marginBottom: "16px" }}>3. Payments and Refunds</h2>
            <p style={{ marginBottom: "24px" }}>
              Payments for reports are processed securely via Dodo Payments. Due to the digital nature of our clinical reports, we generally do not offer refunds once a report has been generated and unlocked.
            </p>

            <h2 style={{ color: "var(--primary)", fontSize: "20px", marginBottom: "16px" }}>4. Contact</h2>
            <p>
              For any questions regarding these terms, please contact us at <strong>yugrathee28@gmail.com</strong>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
