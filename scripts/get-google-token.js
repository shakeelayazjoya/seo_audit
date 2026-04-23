require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");

const app = express();

const REDIRECT_URI = "http://localhost:3000/auth/google/callback";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

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

  try {
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens); // ✅ important

    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);

    res.send("Auth successful!");
  } catch (err) {
    console.error(err);
    res.send("Error getting tokens");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));