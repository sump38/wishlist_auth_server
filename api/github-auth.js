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

  const { code } = req.method === "POST" ? req.body : req.query;

  if (!code) {
    const response = {
      FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN || "http://localhost:3000",
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
    }


    // return res.status(400).json({ error: "Missing code" });
    return res.status(400).json(response);
  }

  try {
    const result = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const { access_token } = result.data;
    return res.status(200).json({ access_token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Token exchange failed" });
  }
};