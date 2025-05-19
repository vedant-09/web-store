require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

// Replace with your business' location
const STORE_LOCATION = "19.0760,72.8777"; // Example: Mumbai, India

// Function to calculate delivery charge based on distance
const calculateDeliveryCharge = (distance) => {
  if (distance <= 5) return 30; // Within 5 km - ₹30
  if (distance <= 10) return 50; // 5-10 km - ₹50
  if (distance <= 20) return 80; // 10-20 km - ₹80
  return 100; // More than 20 km - ₹100
};

// API to get delivery charge based on user's address
router.post("/calculate-charge", async (req, res) => {
  const { userAddress } = req.body;
  if (!userAddress) {
    return res.status(400).json({ error: "User address is required" });
  }

  try {
    // Google Maps Distance Matrix API request
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`,
      {
        params: {
          origins: STORE_LOCATION,
          destinations: userAddress,
          key: process.env.GOOGLE_MAPS_API_KEY,
          mode: "driving",
        },
      }
    );

    const data = response.data;
    if (data.status !== "OK") {
      return res.status(500).json({ error: "Error fetching distance" });
    }

    // Extract distance in km
    const distanceText = data.rows[0].elements[0].distance.text;
    const distanceKm = parseFloat(distanceText.replace(" km", ""));

    // Calculate delivery charge
    const deliveryCharge = calculateDeliveryCharge(distanceKm);

    res.json({ distance: distanceKm, deliveryCharge });
  } catch (error) {
    console.error("Error fetching distance:", error);
    res.status(500).json({ error: "Error fetching distance" });
  }
});

module.exports = router;
