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
    // Google returns 200 OK with status like REQUEST_DENIED in body when the key is invalid/restricted.
    // A REQUEST_DENIED caused by referrer restrictions is EXPECTED for browser keys — the iframe
    // request will succeed because the browser sends a valid Referer. So we only hard-fail on
    // errors that would also break the iframe (invalid key, key not authorized for Maps Embed,
    // billing disabled, etc.).
    const status = validateJson.status as string | undefined;
    const errMsg = (validateJson.error_message as string | undefined) || "";
    const isRefererOnly =
      status === "REQUEST_DENIED" && /referer|referrer/i.test(errMsg);

    if (status && status !== "OK" && status !== "ZERO_RESULTS" && !isRefererOnly) {
      return new Response(
        JSON.stringify({
          error: `Google Maps API error: ${status}`,
          details: errMsg || "No additional details from Google.",
          googleStatus: status,
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
