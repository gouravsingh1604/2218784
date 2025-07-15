const Url = require("../models/Url");
const shortid = require("shortid");
const { Log } = require("../logger");

// Validate URL format
function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

exports.createShortUrl = async (req, res) => {
  const { url, validity, shortcode } = req.body;

  if (!url || !isValidURL(url)) {
    await Log("backend", "error", "controller", "Invalid URL");
    return res.status(400).json({ error: "Invalid URL format" });
  }

  let code = shortcode || shortid.generate();
  const existing = await Url.findOne({ shortCode: code });

  if (existing) {
    await Log("backend", "warn", "controller", "Shortcode already exists");
    return res.status(409).json({ error: "Shortcode already in use" });
  }

  const minutes = parseInt(validity);
  const validMinutes = !isNaN(minutes) && minutes > 0 ? minutes : 30;
  const expiry = new Date(Date.now() + validMinutes * 60 * 1000);

  const newUrl = new Url({
    longUrl: url,
    shortCode: code,
    expiresAt: expiry
  });

  try {
    await newUrl.save();
    await Log("backend", "info", "controller", `Short URL created: ${code}`);
    res.status(201).json({
      shortLink: `http://localhost:5000/${code}`,
      expiry: expiry.toISOString()
    });
  } catch (err) {
    await Log("backend", "error", "controller", "DB save failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUrlStats = async (req, res) => {
  const { shortcode } = req.params;
  const url = await Url.findOne({ shortCode: shortcode });

  if (!url) {
    await Log("backend", "warn", "controller", "Shortcode not found");
    return res.status(404).json({ error: "Shortcode not found" });
  }

  if (Date.now() > url.expiresAt.getTime()) {
    await Log("backend", "warn", "controller", "Shortcode expired");
    return res.status(410).json({ error: "Link expired" });
  }

  await Log("backend", "info", "controller", "Fetched short URL stats");

  res.json({
    originalUrl: url.longUrl,
    shortCode: url.shortCode,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt,
    totalClicks: url.clicks.length,
    clickDetails: url.clicks
  });
};

exports.redirectToLongUrl = async (req, res) => {
  const { shortcode } = req.params;
  const url = await Url.findOne({ shortCode: shortcode });

  if (!url || Date.now() > url.expiresAt.getTime()) {
    await Log("backend", "error", "controller", "Invalid or expired redirect");
    return res.status(404).send("Shortlink not found or expired");
  }

  const ref = req.get("referer") || "direct";
  url.clicks.push({ referrer: ref });
  await url.save();

  await Log("backend", "info", "controller", "Redirected to long URL");
  res.redirect(url.longUrl);
};
