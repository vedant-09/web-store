require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { log } = require("console");


const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true  // ✅ Set to false for public APIs
}));

// 🔹 Create MySQL Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "myshop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
module.exports=db;

// 🔹 Session Store using MySQL
const sessionStore = new MySQLStore({}, db);

app.use(session({
  key: "user_sid",
  secret: process.env.SESSION_SECRET || "your_secret_key",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, sameSite: "lax",maxAge: 86400000 } 
}));

console.log("✅ Database connection pool & session store initialized");

const invoiceRoutes = require("./routes/invoice");
const Module = require("module");
app.use("/invoice", invoiceRoutes);
const userRoutes = require("./routes/user");
app.use(userRoutes);

const orderRoutes = require("./routes/orders");
app.use("/orders", orderRoutes);

const bestSellingRoutes = require("./routes/BestSellingRoutes");
app.use("/BestSellingRoutes",bestSellingRoutes);

const adminProductsRouter = require("./routes/adminProducts");
app.use("/", adminProductsRouter);

// ✅ STEP 1: Define Image Storage Path
const imageStoragePath = path.join(__dirname, "../my-app/public/Images");
if (!fs.existsSync(imageStoragePath)) {
  fs.mkdirSync(imageStoragePath, { recursive: true });
}

// ✅ STEP 2: Serve Images for Frontend
app.use("/Images", express.static(imageStoragePath));

// ✅ STEP 3: Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageStoragePath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ STEP 4: Insert Product API
app.post("/insert-product", upload.fields([{ name: "image" }, { name: "product_images" }]), async (req, res) => {
  try {
    const { name, price, stock, discount, category_id, subcategory_id, description, attributes } = req.body;
    const image = req.files["image"] ? `/Images/${req.files["image"][0].filename}` : null;
    const productImages = req.files["product_images"] ? req.files["product_images"].map(file => `/Images/${file.filename}`) : [];

    if (!name || !price || !stock || !category_id) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const conn = await db.getConnection();
    try {
      // ✅ Insert Product
      const [result] = await conn.execute(
        "INSERT INTO products (name, price, image, stock, discount, category_id, subcategory_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, price, image, stock, discount, category_id, subcategory_id]
      );
      const productId = result.insertId;

      // ✅ Insert Product Details
      await conn.execute(
        "INSERT INTO product_details (product_id, description) VALUES (?, ?)",
        [productId, description]
      );

      // ✅ Insert Product Images
      if (productImages.length > 0) {
        const imageValues = productImages.map(img => [productId, img]);
        await conn.query("INSERT INTO product_images (product_id, image_url) VALUES ?", [imageValues]);
      }

      conn.release();
      res.status(200).json({ message: "Product added successfully!" });
    } catch (err) {
      conn.release();
      console.error(err);
      res.status(500).json({ error: "Database Insertion Error", details: err });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error", details: err });
  }
});

app.put("/products-update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, discount,  description, attributes } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Update product table
    await connection.execute(
      "UPDATE products SET name = ?, price = ?,  discount = ?, updated_at = NOW() WHERE id = ?",
      [name, price,  discount, id]
    );

    // Update product_details table
    await connection.execute(
      "UPDATE product_details SET description = ?, attributes = ?, updated_at = NOW() WHERE product_id = ?",
      [description, attributes, id]
    );

    await connection.commit();
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Error updating product", details: error });
  } finally {
    connection.release();
  }
});

// Upload new main product image
app.post("/products/:id/upload-image", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const imagePath = "/Images/" + req.file.filename;

  try {
    await db.execute("UPDATE products SET image = ?, updated_at = NOW() WHERE id = ?", [imagePath, id]);
    res.status(200).json({ message: "Product image updated successfully", imagePath });
  } catch (error) {
    res.status(500).json({ error: "Error updating product image", details: error });
  }
});

// Upload multiple images for a product
app.post("/products/:id/upload-multiple-images", upload.array("images", 5), async (req, res) => {
  const { id } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  const values = req.files.map((file) => [id, "/Images/" + file.filename]);

  try {
    await db.query("INSERT INTO product_images (product_id, image_url) VALUES ?", [values]);
    res.status(200).json({ message: "Product images uploaded successfully", images: values });
  } catch (error) {
    res.status(500).json({ error: "Error uploading images", details: error });
  }
});

app.delete("/products/:id/delete-image/:imageId", async (req, res) => {
  const { id, imageId } = req.params;

  try {
    await db.query("DELETE FROM product_images WHERE id = ?", [imageId]);
    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
});

// 🔹 Fetch all images for a product
app.get("/products/:id/images", async (req, res) => {
  const { id } = req.params;
  try {
    const [images] = await db.query("SELECT * FROM product_images WHERE product_id=?", [id]);
    res.json(images);
  } catch (error) {
    console.error("Error fetching product images:", error);
    res.status(500).json({ message: "Error fetching product images" });
  }
});

// 🔹 Update an individual product image


app.post("/products/:id/update-image/:imageId", upload.single("image"), async (req, res) => {
  const { id, imageId } = req.params;
  const imagePath = `/Images/${req.file.filename}`;

  try {
    await db.query("UPDATE product_images SET image_url=? WHERE id=?", [imagePath, imageId]);
    res.json({ success: true, message: "Image updated successfully", image_url: imagePath });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: "Failed to update image" });
  }
});

// 🔹 Remove an individual product image
app.delete("/products/:id/delete-image/:imageId", async (req, res) => {
  const { imageId } = req.params;
  try {
    await db.query("DELETE FROM product_images WHERE id=?", [imageId]);
    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

//  Fetch subcategories 
app.get("/subcategories/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const [subcategories] = await db.query(
      "SELECT * FROM subcategories WHERE category_id = ?",
      [categoryId]
    );
    res.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//  Fetch Categories 
app.get('/categories', async (req, res) => {
  try {
    const sql = 'SELECT * FROM categories';
    const [categories] = await db.execute(sql);

    res.json(categories); 
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// 🔹 AUTHENTICATION ROUTES
// ==============================

app.get("/user-profile", async (req, res) => {
  // console.log("🔍 Session Data:", req.session); // ✅ Debugging

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized: No active session" });
  }

  const userId = req.session.user.id;
  
  try {
    const [rows] = await db.execute("SELECT name, email, phone FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ SIGNUP
app.post("/signup", async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !email || !password) {
    return res.status(400).json({ status: "error", message: "All fields required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)";
    await db.execute(sql, [name, phone, email, hashedPassword]);
    res.json({ status: "success", message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ status: "error", message: "User already exists or database error" });
  }
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password required" });
  }

  try {
    const [results] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (results.length === 0) return res.status(401).json({ status: "error", message: "Invalid credentials" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ status: "error", message: "Invalid credentials" });

    req.session.user = { id: user.id, email: user.email, name: user.name };
    res.json({ status: "success", message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// ✅ SESSION CHECK
app.get("/check-session", (req, res) => {
  if (!req.session.user) {
    return res.json({ user: null }); // Instead of sending an error, return user: null
  }
  res.json({ user: req.session.user });
});

// ✅ LOGOUT
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ status: "error", message: "Logout failed" });
    res.clearCookie("user_sid");
    res.json({ status: "success", message: "Logged out successfully" });
  });
});
// ==============================
// 🔹 cart
// ==============================

// ✅ Add to Cart (Store in MySQL)
app.post("/cart/add", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please login to add items to the cart" });
  }

  const { product_id } = req.body;
  const user_id = req.session.user.id;

  // console.log("Received data:", req.body); // Add this for debugging

  if (!product_id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [user_id, product_id]
    );


    if (existing.length > 0) {
      await db.query(
        "UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?",
        [user_id, product_id]
      );
    } else {
      await db.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)",
        [user_id, product_id]
      );
    }

    res.json({ message: "Added to cart" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Get Cart Items
app.get("/cart", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please login to view your cart" });
  }

  const user_id = req.session.user.id;

  try {
    const [cart] = await db.query(
      `SELECT c.id,c.product_id,c.quantity, p.name, p.price, p.image 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [user_id]
    );

    res.json(cart);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Remove from Cart
app.post("/cart/remove", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please login to remove items from cart" });
  }
 
  const { id } = req.body; // Use 'id' instead of 'product_id'
  const user_id = req.session.user.id;
  
  try {
    const [result] = await db.query("DELETE FROM cart WHERE user_id = ? AND id = ?", [user_id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// update quantity value in cart
app.post("/cart/update", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please login to update cart" });
  }

  const { id, quantity } = req.body;
  const user_id = req.session.user.id;

  try {
    const [result] = await db.query(
      "UPDATE cart SET quantity = ? WHERE user_id = ? AND id = ?",
      [quantity, user_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/cart/item/:id", async (req, res) => {
  const { id } = req.params;
  try {
      const [result] = await db.execute("SELECT product_id FROM cart WHERE id = ?", [id]);

      if (result.length > 0) {
          res.json({ product_id: result[0].product_id });
      } else {
          res.status(404).json({ message: "Cart item not found" });
      }

  } catch (error) {
      console.error("Error fetching product_id:", error);
      res.status(500).json({ message: "Error fetching product data" });
  }
});

app.get("/product/stock/:product_id", async (req, res) => {
  const { product_id } = req.params;
  try {
      const [result] = await db.execute("SELECT stock FROM products WHERE id = ?", [product_id]);

      if (result.length > 0) {
          res.json({ stock: result[0].stock });
      } else {
          res.status(404).json({ message: "Product not found" });
      }

  } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ message: "Error fetching stock data" });
  }
});

// ==============================
//Order API
// ==============================

// API for Creating an Order
app.post("/order/create", async (req, res) => {
  // console.log("Session Data:", req.session);
  // console.log("Received Order Data:", req.body); // Debugging line

  const user_id = req.session?.user?.id;
  const { products, address, paymentMethod } = req.body; // ✅ Include address & payment method

  if (!user_id) {
      return res.status(401).json({ success: false, message: "Login required" });
  }

  if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid product list" });
  }

  if (!address || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Address and payment method required" });
  }

  try {
      // Calculate total price
      const totalPrice = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
      const deliveryCharge = 50;
      const finalTotal = totalPrice + deliveryCharge; // Include delivery charge

      // Insert order
      const [orderResult] = await db.execute(
          "INSERT INTO orders (user_id, total_price, address, paymentMethod, status) VALUES (?, ?, ?, ?, ?)",
          [user_id, finalTotal, address, paymentMethod, "Pending"]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const product of products) {
        
        
          await db.execute(
              "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
              [orderId, product.product_id, product.quantity, product.price]
          );

          // Reduce stock
          await db.execute(
              "UPDATE products SET stock = stock - ? WHERE id = ?",
              [product.quantity, product.product_id]
          );

          // Remove from cart
          await db.execute(
              "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
              [user_id, product.product_id]
          );
      }

      res.json({ success: true, message: "Order placed successfully" });

  } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ success: false, message: "Error placing order" });
  }
});

//API for Fetching Orders
app.get("/orders", async (req, res) => {
  const user_id  = req.session.user.id;
  // console.log(user_id);
  if (!user_id) return res.status(401).json({ success: false, message: "Login required" });

  try {
      const [orders] = await db.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [user_id]);

      const ordersWithItems = await Promise.all(orders.map(async (order) => {
          const [items] = await db.execute(
              `SELECT oi.*, p.name AS product_name FROM order_items oi 
              JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
              [order.id]
          );
          return { ...order, items };
      }));

      res.json(ordersWithItems);
  } catch (error) {
      console.error("Order fetch error:", error);
      res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

app.post("/admin/orders/update-status", async (req, res) => {
  const { order_id, status } = req.body;
  // console.log("Received request to update order:", order_id, status);
  if (!order_id || !status) {
    return res.json({ success: false, message: "Invalid data" });
  }

  try {
    const query = "UPDATE orders SET status = ? WHERE id = ?";
    const [result] = await db.query(query, [status, order_id]);

    if (result.affectedRows > 0) {
      // console.log("Order status updated successfully");
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: "Order not found" });
    }
  } catch (err) {
    console.error("Error updating order status:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }
});

app.get("/admin/order-details/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT u.name AS user_name, p.name AS product_name, oi.quantity, oi.price 
       FROM order_items oi 
       JOIN orders o ON oi.order_id = o.id 
       JOIN users u ON o.user_id = u.id 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?;`,
      [orderId]
    );

    if (rows.length > 0) {
      res.json({ success: true, orderDetails: rows });
    } else {
      res.json({ success: false, message: "No order details found." });
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});




// ==============================
// 🔹 CATEGORY & PRODUCT ROUTES
// ==============================

// ✅ FETCH PRODUCTS
app.get("/products", async (req, res) => {
  try {
    let sql = `SELECT p.id, p.name, p.price, p.image,p.stock, c.name AS category_name ,sb.name AS subcategories_name FROM products p JOIN categories c ON p.category_id = c.id JOIN subcategories sb ON p.subcategory_id=sb.id`;
    let queryParams = [];

    if (req.query.category) {
      sql += ` WHERE p.category_id = ?`;
      queryParams.push(req.query.category);
    }

    sql += " ORDER BY c.name ASC, p.name ASC";
    const [results] = await db.execute(sql, queryParams);
    res.json(results);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ status: "error", message: "Database error" });
  }
});

app.get('/products/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;
  const query = `
    SELECT p.id, p.name, p.price, p.image, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ?;
  `;

  db.query(query, [categoryId], (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ✅ FETCH PRODUCT DETAILS
app.get("/product/:id", async (req, res) => {
  try {
    const [products] = await db.execute(
      `
       SELECT 
        p.id, p.name, p.price, p.image, p.stock, pd.description, 
        s.name AS subcategory_name, c.name AS category_name, 
        GROUP_CONCAT(pi.image_url) AS additional_images 
      FROM products p 
      JOIN subcategories s ON p.subcategory_id = s.id 
      JOIN categories c ON s.category_id = c.id 
      JOIN product_details pd ON pd.product_id = p.id 
      LEFT JOIN product_images pi ON pi.product_id = p.id 
      WHERE p.id = ? 
      GROUP BY p.id
      `,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    let product = products[0];

    // 🔹 Convert additional_images from comma-separated string to an array
    product.additional_images = product.additional_images
      ? product.additional_images.split(",")
      : [];

    res.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ UPDATE PRODUCT (Admin)
app.post("/update-product", async (req, res) => {
  const { id, name, price } = req.body;
  if (!id || !name || !price) return res.status(400).json({ status: "error", message: "All fields required" });

  try {
    await db.execute("UPDATE products SET name = ?, price = ? WHERE id = ?", [name, price, id]);
    res.json({ status: "success", message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ status: "error", message: "Database error" });
  }
});

// ✅ UPDATE Stock (Admin)
app.put("/api/products/:id/update-stock", async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (!id || stock === undefined) {
    return res.status(400).json({ error: "Product ID and stock are required" });
  }

  try {
    const [result] = await db.query("UPDATE products SET stock = ? WHERE id = ?", [stock, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ==============================
// 🔹 ADMIN ROUTES
// ==============================

// ✅ ADMIN LOGIN
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ status: "error", message: "Email and password required" });

  try {
    const [results] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);
    if (results.length === 0) return res.status(401).json({ status: "error", message: "Admin not found" });

    const admin = results[0];
    if (!await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    req.session.admin = { id: admin.id, email: admin.email };
    res.json({ status: "success", message: "Login successful", admin: req.session.admin });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// ✅ ADMIN SESSION CHECK
app.get("/admin/check-session", (req, res) => {
  res.json({ loggedIn: !!req.session.admin, admin: req.session.admin || null });
});

// ✅ ADMIN LOGOUT
app.post("/admin/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ status: "error", message: "Logout failed" });
    res.clearCookie("user_sid");
    res.json({ status: "success", message: "Admin logged out successfully" });
  });
});

//admin/orders
app.get("/admin/orders", async (req, res) => {
  try {
    const sql = `
      SELECT 
        o.id AS order_id, 
        u.name AS user_name, 
        CAST(o.total_price AS DECIMAL(10,2)) AS price, 
        o.created_at AS date, 
        o.address, 
        o.paymentMethod,
        o.status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;

    // No need to call `.promise()`, just use db directly
    const [results] = await db.query(sql); 
    res.json({ success: true, orders: results });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ✅ API to calculate delivery charge based on user's city (fetched from DB)
// POST /api/calculate-charge
app.post("/api/calculate-charge", async (req, res) => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const userId = sessionUser.id;
  try {
    // 1) fetch the user's city
    const [addrRows] = await db.execute(
      `SELECT city
       FROM addresses
       WHERE user_id = ?`,
      [userId]
    );

    if (addrRows.length === 0 || !addrRows[0].city) {
      // no address or city → treat as Others
      throw new Error("No city on file");
    }

    const userCity = addrRows[0].city;

    // 2) look up that city’s charge
    const [chargeRows] = await db.execute(
      `SELECT charge
       FROM delivery_charges
       WHERE city = ?`,
      [userCity]
    );

    let deliveryCharge;
    if (chargeRows.length > 0) {
      deliveryCharge = chargeRows[0].charge;
    } else {
      // 3) fallback to the 'Others' entry
      const [otherRows] = await db.execute(
        `SELECT charge
         FROM delivery_charges
         WHERE city = 'Others'`
      );
      deliveryCharge = otherRows[0]?.charge ?? 0;
    }

    return res.json({
      success: true,
      city: userCity,
      deliveryCharge,
    });
  } catch (err) {
    console.error("Error calculating delivery charge:", err);
    // If our thrown "No city on file" or a DB error, still fallback to Others
    try {
      const [otherRows] = await db.execute(
        `SELECT charge
         FROM delivery_charges
         WHERE city = 'Others'`
      );
      const fallbackCharge = otherRows[0]?.charge ?? 0;
      return res.json({
        success: true,
        city: "Others",
        deliveryCharge: fallbackCharge,
      });
    } catch (fallbackErr) {
      console.error("Error fetching fallback charge:", fallbackErr);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }
});

app.get("/api/product/:productId/attributes", async (req, res) => {
  const { productId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT a.name AS attribute_name, pav.value AS attribute_value
       FROM product_attribute_values pav
       JOIN attributes a ON pav.attribute_id = a.id
       WHERE pav.product_id = ?`,
      [productId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching product attributes:", error);
    res.status(500).json({ message: "Error fetching product attributes" });
  }
});

// === PRODUCT REVIEWS ===
// GET Reviews for a Product
app.get("/api/product/:productId/reviews", async (req, res) => {
  const { productId } = req.params;
  try {
    const [reviews] = await db.query(
      `SELECT pr.id, pr.product_id, pr.user_id, u.name as user_name, pr.rating, pr.comment, pr.created_at
       FROM product_reviews pr
       JOIN users u ON pr.user_id = u.id  ORDER BY pr.created_at DESC`, // Assuming you have a users table
      [productId]
    );
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ message: "Error fetching product reviews" });
  }
});

// POST a new Review for a Product
app.post("/api/product/:productId/reviews", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in to post a review." });
  }

  const { productId } = req.params;
  const  userId  = req.session.user.id; // Assuming your session stores user ID as `id`
  const { rating, comment } = req.body;


  if (!rating || !comment) {
    return res.status(400).json({ message: "Rating and comment are required." });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    // Check if user already reviewed this product 
    // const [existingReview] = await db.query(
    //   "SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?",
    //   [productId, userId]
    // );
    // if (existingReview.length > 0) {
    //   return res.status(409).json({ message: "You have already reviewed this product." });
    // }
    console.log(userId);
    const [result] = await db.query(
      "INSERT INTO product_reviews (product_id, user_id, rating, comment, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [productId, userId, rating, comment]
    );
    const newReviewId = result.insertId;
    const [newReview] = await db.query( // Fetch the newly created review with user name
        `SELECT pr.id, pr.product_id, pr.user_id, u.name as user_name, pr.rating, pr.comment, pr.created_at
         FROM product_reviews pr
         JOIN users u ON pr.user_id = u.id
         WHERE pr.id = ?`,
        [newReviewId]
    );

    res.status(201).json(newReview[0]);
  } catch (error) {
    console.error("Error posting product review:", error);
    
    res.status(500).json({ message: "Error posting product review" });
  }
});


// === RELATED PRODUCTS ===
app.get("/api/product/:productId/related", async (req, res) => {
  const { productId } = req.params;
  try {
    // 1. Get the subcategory_id and category_id of the current product
    // We need to join products with subcategories to get the category_id
    const [currentProductInfoRows] = await db.execute(
      `SELECT
         p.subcategory_id,
         s.category_id
       FROM products p
       JOIN subcategories s ON p.subcategory_id = s.id
       WHERE p.id = ?`,
      [productId]
    );

    if (currentProductInfoRows.length === 0) {
      // This case should ideally not happen if productId is valid
      return res.status(404).json({ message: "Current product for relation check not found" });
    }

    const { subcategory_id, category_id } = currentProductInfoRows[0];

    // 2. Build the query to find related products
    let relatedProductsQuery = `
      SELECT
        p.id,
        p.name,
        p.price,
        p.image, -- Main image for the card
        s.name AS subcategory_name, -- Optional: if you want to display it on the card
        c.name AS category_name    -- Optional: if you want to display it on the card
      FROM products p
      JOIN subcategories s ON p.subcategory_id = s.id
      JOIN categories c ON s.category_id = c.id
      WHERE p.id != ? `; // Exclude the current product itself

    const queryParams = [productId];

    // Prioritize matching by subcategory, then fallback to category
    if (subcategory_id) {
      relatedProductsQuery += ` AND p.subcategory_id = ?`;
      queryParams.push(subcategory_id);
    } else if (category_id) {
      // This case implies a product might not have a subcategory but a direct category link,
      // which is not how your current product detail query is structured (it requires subcategory).
      // If subcategory_id is always present for a product, this 'else if' might be less critical.
      relatedProductsQuery += ` AND s.category_id = ?`;
      queryParams.push(category_id);
    } else {
      // No subcategory or category to match (should be rare with good data integrity)
      // You could fetch random products, bestsellers, or an empty array.
      return res.json([]);
    }

    relatedProductsQuery += " ORDER BY RAND() LIMIT 4"; // Fetch up to 4 related products, adjust as needed

    const [relatedProducts] = await db.execute(relatedProductsQuery, queryParams);
    res.json(relatedProducts);

  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Error fetching related products", error: error.message });
  }
});

// ✅ Start Server
app.listen(5000, () => console.log(`🚀 Server running on http://localhost:5000`));
