const axios = require("axios");

module.exports = async (req, res) => {
  const { code } = req.method === "POST" ? req.body : req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing code" });
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