const express = require("express");
const router = express.Router();
const db = require("../server"); // Import the database connection

// 🏆 Get Best-Selling Products
router.get("/api/best-selling-products", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.id, p.name, p.price, p.image, COALESCE(SUM(oi.quantity), 0) AS sales
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY sales DESC
      LIMIT 10;
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching best-selling products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
