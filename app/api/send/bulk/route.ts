export const runtime = "nodejs";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getActiveSubscribers, getSubscriberById } from "@/lib/api/subscribers";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { subscriber_ids, send_to_all, subject, title, description } = body;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // Get subscribers
    let subscribers;
    if (send_to_all) {
      // Send to all active subscribers
      subscribers = await getActiveSubscribers();
    } else {
      // Send to selected subscribers
      const promises = subscriber_ids.map((id: string) => getSubscriberById(id));
      const results = await Promise.all(promises);
      subscribers = results.filter((s) => s !== null && s.status === "active");
    }

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found" }, { status: 400 });
    }

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        // Personalize description with subscriber name
        const personalizedDescription = description.replace(/\[Name\]/g, subscriber.name);

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
                    ${personalizedDescription}
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                    Bu email The Canadian Turkish Islamic Trust tarafından gönderilmiştir.
                  </p>
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    Bu duyuruları almak istemiyorsanız, 
                    <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" 
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

        const result = await resend.emails.send({
          from: "The Canadian Turkish Islamic Trust <duyuru@papemosque.ca>",
          to: [subscriber.email],
          subject: subject,
          replyTo: "duyuru@papecami.com",
          html: htmlContent,
          headers: {
            "List-Unsubscribe": `<${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });

        return {
          success: true,
          subscriber_id: subscriber.id,
          email: subscriber.email,
          resend_id: result.data?.id,
        };
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        return {
          success: false,
          subscriber_id: subscriber.id,
          email: subscriber.email,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);

    const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      total: results.length,
      successful,
      failed,
      results: results.map((r) => (r.status === "fulfilled" ? r.value : { success: false, error: "Promise rejected" })),
    });
  } catch (error) {
    console.error("Bulk email sending error:", error);
    return NextResponse.json({ error: "Bulk email sending failed" }, { status: 500 });
  }
}
