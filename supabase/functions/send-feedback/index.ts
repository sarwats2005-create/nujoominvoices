import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  recipientEmail: string;
}

// Basic email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Sanitize string to prevent HTML injection in emails
const sanitizeForHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { name, email, subject, message, recipientEmail }: FeedbackRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate field lengths
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Field length exceeded" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email formats
    if (!isValidEmail(email) || !isValidEmail(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize user inputs before inserting into HTML
    const safeName = sanitizeForHtml(name);
    const safeEmail = sanitizeForHtml(email);
    const safeSubject = sanitizeForHtml(subject);
    const safeMessage = sanitizeForHtml(message);

    // Send notification to the business/admin
    const notificationResponse = await resend.emails.send({
      from: "Nujoom Invoices <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `New Feedback: ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Feedback Received</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${safeMessage}</p>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            This message was sent via Nujoom Invoices contact form.
          </p>
        </div>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    // Send confirmation to the sender
    const confirmationResponse = await resend.emails.send({
      from: "Nujoom Invoices <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Thank you for contacting us, ${safeName}!</h2>
          <p>We have received your message regarding:</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <strong>${safeSubject}</strong>
          </div>
          <p>We will get back to you as soon as possible.</p>
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Nujoom Invoices Team</strong>
          </p>
        </div>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: notificationResponse,
        confirmation: confirmationResponse 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ error: "Unable to send message. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
