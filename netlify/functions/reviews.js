// netlify/functions/reviews.js
//
// Netlify serverless function — securely fetches Google reviews
// and returns them to your front-end without exposing your API key.
//
// SETUP:
//   1. In your Netlify dashboard → Site Settings → Environment Variables
//      Add:  GOOGLE_API_KEY  =  (your Google Places API key)
//      Add:  GOOGLE_PLACE_ID =  (your Google Place ID — see instructions)
//
//   2. Deploy this file. Netlify auto-detects functions in /netlify/functions/

exports.handler = async function (event, context) {
    const API_KEY  = process.env.GOOGLE_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACE_ID;

    // CORS headers — allows your site to call this function
    const headers = {
        'Access-Control-Allow-Origin': '*',   // Restrict to your domain in production e.g. 'https://www.ding-dong.io'
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (!API_KEY || !PLACE_ID) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Missing environment variables: GOOGLE_API_KEY or GOOGLE_PLACE_ID' }),
        };
    }

    try {
        const fields = 'rating,user_ratings_total,reviews';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=${fields}&key=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Google API error: ${data.status} — ${data.error_message || ''}`);
        }

        const result = data.result;

        // Sort reviews by time (newest first) and return top 10
        const reviews = (result.reviews || [])
            .sort((a, b) => b.time - a.time)
            .slice(0, 10);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                rating: result.rating,
                user_ratings_total: result.user_ratings_total,
                reviews,
            }),
        };
    } catch (err) {
        console.error('Reviews function error:', err);
        return {
            statusCode: 502,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch reviews', detail: err.message }),
        };
    }
};
