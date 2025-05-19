const express = require("express");
const router = express.Router();
const db = require("../server"); // Assuming your database connection is in server.js

// admin-product route
router.get("/admin-product", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
    p.id, 
    p.name,  
    p.price, 
    p.image, 
    p.stock, 
    c.name AS category_name, 
    sb.name AS subcategory_name, 
    COALESCE(SUM(oi.quantity), 0) AS sold
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN subcategories sb ON p.subcategory_id = sb.id
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.price, p.image, p.stock, c.name, sb.name;

        `);

        res.json(rows);
    } catch (error) {
        console.error("Error fetching admin products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;