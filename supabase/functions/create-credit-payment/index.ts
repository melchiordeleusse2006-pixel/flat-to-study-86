import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit packages configuration
const CREDIT_PACKAGES = {
  "5": {
    price_id: "price_1S6OWYJp4oZgzh3ekUzsvO4z",
    credits: 5,
    amount: 2500 // €25.00 in cents
  },
  "10": {
    price_id: "price_1S6OXOJp4oZgzh3exhnz2Xhp", 
    credits: 10,
    amount: 4500 // €45.00 in cents
  },
  "50": {
    price_id: "price_1S6OYEJp4oZgzh3ecRuBScs6",
    credits: 50,
    amount: 22500 // €225.00 in cents
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Get request body
    const { package_size } = await req.json();
    
    if (!package_size || !CREDIT_PACKAGES[package_size]) {
      throw new Error("Invalid package size");
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Get user profile to ensure they're an agency
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('user_type', 'agency')
      .single();

    if (profileError || !profile) {
      throw new Error("User must be an agency to purchase credits");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const package_info = CREDIT_PACKAGES[package_size];

    // Create payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: package_info.price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?credits=${package_info.credits}`,
      cancel_url: `${req.headers.get("origin")}/owner-dashboard`,
      metadata: {
        agency_id: profile.id,
        credits_amount: package_info.credits.toString(),
        package_size: package_size
      }
    });

    console.log(`Created payment session for ${package_info.credits} credits for agency ${profile.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});