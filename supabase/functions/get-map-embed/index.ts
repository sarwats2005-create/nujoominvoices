import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, zoom } = await req.json();

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Google Maps API key not configured (GOOGLE_MAPS_API_KEY secret missing)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Validate the key server-side by calling Geocoding API. This surfaces
    // exact Google error messages (REQUEST_DENIED, INVALID_REQUEST, etc.)
    // that an <iframe> embed would otherwise hide.
    const validateUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    const validateRes = await fetch(validateUrl);
    const validateJson = await validateRes.json();

    console.log("[get-map-embed] Google validation status:", validateJson.status, "error_message:", validateJson.error_message);

    // Google returns 200 OK with status like REQUEST_DENIED in body when the key is invalid/restricted.
    if (validateJson.status && validateJson.status !== "OK" && validateJson.status !== "ZERO_RESULTS") {
      return new Response(
        JSON.stringify({
          error: `Google Maps API error: ${validateJson.status}`,
          details: validateJson.error_message || "No additional details from Google.",
          googleStatus: validateJson.status,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const embedUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${latitude},${longitude}&zoom=${zoom}&maptype=roadmap`;

    return new Response(
      JSON.stringify({ embedUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating map embed:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
