require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");

const app = express();

const REDIRECT_URI = "http://localhost:3000/auth/google/callback";

const oauth2Client = new google.auth.OAuth2(
  "258542387351-cp6fkiqdarvinej56u9peqtksm2cu6ep.apps.googleusercontent.com",
  "secGOCSPX-kl0J8ZHX9SPlqz26iIRoj0JJrXnP",
  REDIRECT_URI
);

app.get("/", (req, res) => {
  res.send("Go to /auth/google to start the Google OAuth flow.");
});

// Step 1
app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile"],
    prompt: "consent",
  });

  res.redirect(url);
});

// Step 2
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  if (error) {
    console.error("Google OAuth error callback", { error, query: req.query });
    return res
      .status(400)
      .send(`OAuth callback error: ${error}. Check the Google consent screen or redirect URI.`);
  }

  if (!code) {
    console.error("Missing authorization code in callback", req.originalUrl, req.query);
    return res
      .status(400)
      .send("Missing authorization code. Start auth at /auth/google and complete consent.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens); // ✅ important

    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);

    res.send("Auth successful!");
  } catch (err) {
    console.error("Error exchanging code for tokens", err);
    res.status(500).send("Error getting tokens");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));