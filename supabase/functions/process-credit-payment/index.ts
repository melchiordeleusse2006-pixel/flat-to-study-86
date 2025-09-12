import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    const agency_id = session.metadata?.agency_id;
    const credits_amount = parseInt(session.metadata?.credits_amount || "0");
    
    if (!agency_id || !credits_amount) {
      throw new Error("Invalid session metadata");
    }

    // Add credits to the agency
    const { error: creditError } = await supabaseClient.rpc('add_agency_credits', {
      agency_profile_id: agency_id,
      credits_amount: credits_amount,
      stripe_payment_intent_id_param: session.payment_intent as string,
      description_param: `Purchased ${credits_amount} credits`
    });

    if (creditError) {
      console.error("Error adding credits:", creditError);
      throw new Error("Failed to add credits");
    }

    console.log(`Successfully added ${credits_amount} credits to agency ${agency_id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      credits_added: credits_amount 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing credit payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});