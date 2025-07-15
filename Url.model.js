const mongoose = require("mongoose");

const ClickSchema = new mongoose.Schema({
  timestamp: { 
    type: Date,
    default: Date.now
    },
    referrer: String,
});

const UrlSchema = new mongoose.Schema({
  longUrl: { 
    type: String,
    required: true 
    },
  shortCode: { 
    type: String, 
    required: true,
    unique: true
    },
    expiresAt: { type: Date, required: true },
    clicks: [ClickSchema]
} , {
    timestamps :true,
});

module.exports = mongoose.model("Url", UrlSchema);
