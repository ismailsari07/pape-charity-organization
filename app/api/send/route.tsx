export const runtime = "nodejs";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { to, subject, title, description } = body;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🕌 ${title}</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px; line-height: 1.6; color: #333333;">
              <div style="white-space: pre-wrap; font-size: 16px;">
                ${description}
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                Bu email The Canadian Turkish Islamic Trust tarafından gönderilmiştir.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                Bu duyuruları almak istemiyorsanız, 
                <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(to)}" 
                   style="color: #2563eb; text-decoration: underline;">
                  buraya tıklayarak
                </a> 
                abonelikten çıkabilirsiniz.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "The Canadian Turkish Islamic Trust <duyuru@papemosque.ca>",
      to: [to],
      subject: subject,
      replyTo: "duyuru@papecami.com",
      html: htmlContent,
      headers: {
        "List-Unsubscribe": `<${baseUrl}/unsubscribe?email=${encodeURIComponent(to)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Email sending failed", details: error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sent: data,
      resendId: data?.id,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json({ error: "Email sending failed" }, { status: 500 });
  }
}
