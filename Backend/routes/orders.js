const db = require("../server"); // Import your DB connection
const express = require("express");
const router = express.Router();

// Get order tracking details
router.get("/track/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    // Fetch order status
    const [order] = await db.query("SELECT status FROM orders WHERE id = ?", [orderId]);

    if (!order.length) {
      return res.status(404).json({ error: "Order not found" });
    }

    const status = order[0].status.trim().toLowerCase(); // Normalize status

    // console.log("Order Status:", status); // Debugging

    // Define tracking steps based on status
    const trackingSteps = {
      pending: ["Confirmed Order", "Processing Order"],
      processing: ["Confirmed Order", "Processing Order"],
      shipped: ["Confirmed Order", "Processing Order", "Dispatched Item"],
      delivered: ["Confirmed Order", "Processing Order", "Dispatched Item", "Product Delivered"],
      cancelled: ["Confirmed Order", "Processing Order", "Dispatched Item", "Order Canceled"], // Ensure exact match
    };

    // Send the correct tracking data
    res.json({ tracking: trackingSteps[status] || ["Unknown Status"] });

  } catch (error) {
    console.error("Error fetching tracking details:", error);
    res.status(500).json({ error: "Failed to fetch tracking details" });
  }
});

module.exports = router;
