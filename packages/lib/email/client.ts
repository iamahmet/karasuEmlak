import { Resend } from "resend";
import { getEnv } from "@karasu-emlak/config/env-schema";

let resendInstance: Resend | null = null;

/**
 * Get Resend client instance
 * Creates singleton instance if not exists
 */
export function getResendClient(): Resend | null {
  const env = getEnv();
  
  if (!env.RESEND_API_KEY) {
    console.warn("⚠️  RESEND_API_KEY not configured. Email sending will be disabled.");
    return null;
  }

  if (!resendInstance) {
    resendInstance = new Resend(env.RESEND_API_KEY);
  }

  return resendInstance;
}

/**
 * Send email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();
    
    if (!resend) {
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    const env = getEnv();
    const defaultFrom = from || `Karasu Emlak <noreply@${env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, "")}>`;
    const defaultReplyTo = replyTo || env.RESEND_REPLY_TO || "info@karasuemlak.net";

    const { data, error } = await resend.emails.send({
      from: defaultFrom,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      replyTo: defaultReplyTo,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error: any) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

