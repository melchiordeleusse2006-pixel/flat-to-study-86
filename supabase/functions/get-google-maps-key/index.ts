import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('get-google-maps-key function called');
    
    const googleMapsKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    console.log('API key exists:', !!googleMapsKey);
    
    if (!googleMapsKey) {
      console.error('Google Maps API key not found in environment');
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Returning API key successfully');
    return new Response(
      JSON.stringify({ apiKey: googleMapsKey }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in get-google-maps-key function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get Google Maps API key', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})