import { Resend } from "resend";
import { AIReport, Hospital } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder_key_for_build");

export async function sendReportEmail(
  email: string,
  name: string,
  report: AIReport,
  hospitals: Hospital[],
  searchCondition: string
) {
  const hospitalRows = hospitals
    .slice(0, 5)
    .map(
      (h) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px 8px; font-weight: 600;">${h.name}</td>
        <td style="padding: 12px 8px; color: #64748B;">${h.city}, ${h.country}</td>
        <td style="padding: 12px 8px; color: #64748B;">${h.rating ? `⭐ ${h.rating}` : "N/A"}</td>
        <td style="padding: 12px 8px; font-weight: 600; color: #10B981;">${h.costEstimate || "Contact for pricing"}</td>
        ${h.phone ? `<td style="padding: 12px 8px; color: #0A2540;">${h.phone}</td>` : "<td style='padding: 12px 8px; color: #94A3B8;'>Not available</td>"}
      </tr>`
    )
    .join("");

  const countryRows = report.topCountries
    .map(
      (c) => `
      <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #10B981;">
        <div style="font-size: 20px; margin-bottom: 4px;">${c.flag} <strong>${c.country}</strong></div>
        <div style="color: #10B981; font-weight: 600; font-size: 18px; margin-bottom: 8px;">${c.estimatedCost}</div>
        <div style="color: #64748B; font-size: 14px;">${c.reasoning}</div>
      </div>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your MediTrip Report</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0;">
  <div style="max-width: 680px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: #0A2540; padding: 40px 40px 30px; text-align: center;">
      <div style="color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
        🏥 MediTrip
      </div>
      <div style="color: rgba(255,255,255,0.7); margin-top: 8px; font-size: 14px;">
        AI-Powered Medical Tourism Platform
      </div>
    </div>

    <!-- Body -->
    <div style="padding: 40px;">
      <p style="color: #64748B; font-size: 15px;">Hi ${name || "there"},</p>
      <p style="color: #64748B; font-size: 15px; margin-bottom: 32px;">
        Here is your complete MediTrip report for <strong style="color: #0A2540;">${searchCondition}</strong>. 
        We've analyzed global medical options to help you make an informed decision.
      </p>

      <!-- Condition Summary -->
      <div style="background: #F0FDF4; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #D1FAE5;">
        <h2 style="color: #0A2540; margin: 0 0 12px; font-size: 18px;">Your Condition Summary</h2>
        <p style="color: #334155; margin: 0; line-height: 1.6;">${report.conditionSummary}</p>
        <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: #D1FAE5; color: #059669; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;">${report.medicalSpecialty}</span>
          <span style="background: #DBEAFE; color: #1E40AF; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;">${report.procedureType}</span>
        </div>
      </div>

      <!-- Top Countries -->
      <h2 style="color: #0A2540; margin-bottom: 16px; font-size: 20px;">🌍 Top Recommended Countries</h2>
      ${countryRows}

      <!-- Hospitals -->
      <h2 style="color: #0A2540; margin: 32px 0 16px; font-size: 20px;">🏥 Top Hospital Matches</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #F1F5F9;">
            <th style="padding: 12px 8px; text-align: left; color: #64748B; font-weight: 600;">Hospital</th>
            <th style="padding: 12px 8px; text-align: left; color: #64748B; font-weight: 600;">Location</th>
            <th style="padding: 12px 8px; text-align: left; color: #64748B; font-weight: 600;">Rating</th>
            <th style="padding: 12px 8px; text-align: left; color: #64748B; font-weight: 600;">Est. Cost</th>
            <th style="padding: 12px 8px; text-align: left; color: #64748B; font-weight: 600;">Phone</th>
          </tr>
        </thead>
        <tbody>${hospitalRows}</tbody>
      </table>

      <!-- Additional Notes -->
      ${report.additionalNotes ? `
      <div style="background: #FFF7ED; border-radius: 12px; padding: 20px; margin-top: 32px; border: 1px solid #FED7AA;">
        <h3 style="color: #0A2540; margin: 0 0 8px; font-size: 16px;">💡 Important Notes</h3>
        <p style="color: #64748B; margin: 0; font-size: 14px; line-height: 1.6;">${report.additionalNotes}</p>
      </div>
      ` : ""}

      <!-- Disclaimer -->
      <div style="background: #F1F5F9; border-left: 3px solid #10B981; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 32px;">
        <p style="color: #64748B; font-size: 12px; margin: 0; line-height: 1.6;">
          ⚠️ <strong>Disclaimer:</strong> ${report.disclaimer}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #F8FAFC; padding: 24px 40px; border-top: 1px solid #E2E8F0; text-align: center;">
      <p style="color: #94A3B8; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} MediTrip. All rights reserved.<br>
        This report was generated by AI and is for informational purposes only.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const { data, error } = await resend.emails.send({
    from: "MediTrip <reports@meditrip.health>",
    to: email,
    subject: `Your MediTrip Report — ${searchCondition}`,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send report email");
  }

  return data;
}
