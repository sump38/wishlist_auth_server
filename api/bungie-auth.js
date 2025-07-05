const axios = require("axios");

module.exports = async (req, res) => {
    // Set CORS headers
    const allowedOrigin = process.env.FRONTEND_DOMAIN || "http://localhost:3000";
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    console.log("Bungie Auth Request:", req.method, req.url);
    console.log("Request headers origin:", req.headers.origin);
    console.log("Environment variables check:");
    console.log("- BUNGIE_CLIENT_ID:", process.env.BUNGIE_CLIENT_ID);
    console.log("- BUNGIE_API_KEY:", process.env.BUNGIE_API_KEY ? "Set" : "Missing");
    console.log("- BUNGIE_API_SECRET:", process.env.BUNGIE_API_SECRET ? "Set" : "Missing");

    const { code } = req.method === "POST" ? req.body : req.query;
    const { refresh_token } = req.method === "POST" ? req.body : req.query;

    // auth code flow:

    if (code) {
        console.log("Authorization code received:", code.substring(0, 10) + "...");

        try {
            // Convert form data to URL-encoded string for Bungie API
            const formData = new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                client_id: process.env.BUNGIE_CLIENT_ID,
                client_secret: process.env.BUNGIE_API_SECRET,
            });

            console.log("Making request to Bungie token endpoint...");

            // Bungie OAuth token exchange
            const result = await axios.post(
                "https://www.bungie.net/platform/app/oauth/token/",
                formData.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-API-Key": process.env.BUNGIE_API_KEY,
                    },
                }
            );

            console.log("Bungie API response received:", result.status);
            const { access_token, refresh_token, expires_in, membership_id } = result.data;

            return res.status(200).json({
                access_token,
                refresh_token,
                expires_in,
                membership_id,
            });
        } catch (err) {
            console.error("Bungie token exchange error:");
            console.error("- Status:", err.response?.status);
            console.error("- Response data:", err.response?.data);
            console.error("- Error message:", err.message);

            return res.status(500).json({
                error: "Token exchange failed",
                details: err.response?.data || err.message,
            });
        }

    } else if (refresh_token) {

        console.log("Refresh token received:", refresh_token.substring(0, 10) + "...");
        const _token = refresh_token;

        try {
            // Convert form data to URL-encoded string for Bungie API
            const formData = new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: _token,
                client_id: process.env.BUNGIE_CLIENT_ID,
                client_secret: process.env.BUNGIE_API_SECRET,
            });
            console.log("Making request to Bungie token refresh endpoint...");
            
            // Bungie OAuth token refresh
            const result = await axios.post(
                "https://www.bungie.net/platform/app/oauth/token/",
                formData.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-API-Key": process.env.BUNGIE_API_KEY,
                    },
                }
            );
            
            console.log("Bungie API response received:", result.status);
            const { access_token, refresh_token, expires_in, membership_id } = result.data;

            return res.status(200).json({
                access_token,
                refresh_token,
                expires_in,
                membership_id,
            });

        } catch (err) {
            console.error("Bungie token refresh error:");
            console.error("- Status:", err.response?.status);
            console.error("- Response data:", err.response?.data);
            console.error("- Error message:", err.message);

            return res.status(500).json({
                error: "Token refresh failed",
                details: err.response?.data || err.message,
            });
        }
    } else {
        console.warn("Missing authorization code or refresh token in request");
        return res.status(400).json({ error: "Missing authorization code or refresh token" });
    }


};
