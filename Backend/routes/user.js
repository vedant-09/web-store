const express = require("express");
const db = require("../server"); // ✅ Import MySQL connection
const router = express.Router();

router.get("/user/address", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT 
         id, pincode, full_address, landmark, city, state, country, type_of_address, created_at, updated_at
       FROM addresses
       WHERE user_id = ?`,
      [user.id]
    );
    const address = rows[0] || null;
    res.json({ success: true, address });
  } catch (err) {
    console.error("DB error fetching address:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// POST /user/address
// ───────────────────
// If `id` is provided in body, updates that row;
// otherwise inserts a new one tied to the current user.
router.post("/user/address", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const {
    id,
    pincode,
    full_address,
    landmark,
    city,
    state,
    country,
    type_of_address,
  } = req.body;

  // simple validation
  if (!pincode || !full_address || !city || !state || !country) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required address fields" });
  }

  try {
    if (id) {
      // update existing
      await db.execute(
        `UPDATE addresses
         SET pincode = ?, full_address = ?, landmark = ?, city = ?, state = ?, country = ?, type_of_address = ?, updated_at = NOW()
         WHERE id = ? AND user_id = ?`,
        [
          pincode,
          full_address,
          landmark || null,
          city,
          state,
          country,
          type_of_address,
          id,
          user.id,
        ]
      );
      return res.json({ success: true, message: "Address updated" });
    } else {
      // insert new
      const [result] = await db.execute(
        `INSERT INTO addresses
         (user_id, pincode, full_address, landmark, city, state, country, type_of_address, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          user.id,
          pincode,
          full_address,
          landmark || null,
          city,
          state,
          country,
          type_of_address,
        ]
      );
      return res.json({
        success: true,
        message: "Address created",
        addressId: result.insertId,
      });
    }
  } catch (err) {
    console.error("DB error saving address:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
