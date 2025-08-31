import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface MessageNotificationRequest {
  message_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message_id }: MessageNotificationRequest = await req.json();
    
    console.log("Processing notification for message:", message_id);

    // Get message details with listing and agency info
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select(`
        *,
        listings:listing_id (
          title,
          address_line,
          city,
          rent_monthly_eur,
          images
        ),
        profiles:agency_id (
          agency_name,
          email,
          full_name
        )
      `)
      .eq('id', message_id)
      .single();

    if (messageError || !messageData) {
      console.error("Error fetching message:", messageError);
      return new Response(JSON.stringify({ error: "Message not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { listings: listing, profiles: agency } = messageData;
    
    if (!agency?.email) {
      console.log("No agency email found, skipping notification");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "flat2study <notifications@flat2study.com>",
      to: [agency.email],
      subject: `New message about your listing: ${listing.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Message on flat2study</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hello ${agency.agency_name || agency.full_name},
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              You have received a new message about your listing on flat2study!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333;">Listing Details:</h3>
              <p style="margin: 5px 0;"><strong>Property:</strong> ${listing.title}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${listing.address_line}, ${listing.city}</p>
              <p style="margin: 5px 0;"><strong>Rent:</strong> €${listing.rent_monthly_eur}/month</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #333;">Message Details:</h3>
              <p style="margin: 5px 0;"><strong>From:</strong> ${messageData.sender_name}</p>
              ${messageData.sender_phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${messageData.sender_phone}</p>` : ''}
              ${messageData.sender_university ? `<p style="margin: 5px 0;"><strong>University:</strong> ${messageData.sender_university}</p>` : ''}
              <p style="margin: 15px 0 5px 0;"><strong>Message:</strong></p>
              <p style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 5px 0; font-style: italic;">
                "${messageData.message}"
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://flat2study.com/messages" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: bold;
                        display: inline-block;">
                View and Reply on flat2study
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              The flat2study Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, email_sent: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-message-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);