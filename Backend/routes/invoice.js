const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const router = express.Router();
const db = require("../server");

router.get("/generate/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    // Fetch Order Details
    const [orderRows] = await db.execute(
        "SELECT orders.*, users.name AS user_name, users.email FROM orders JOIN users ON orders.user_id = users.id WHERE orders.id = ?",
        [orderId]
      );

    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = orderRows[0];

    // Fetch Order Items
    const [itemsRows] = await db.execute(
      "SELECT order_items.*, products.name AS product_name FROM order_items JOIN products ON order_items.product_id = products.id WHERE order_items.order_id = ?",
      [orderId]
    );

    if (itemsRows.length === 0) {
      return res.status(404).json({ success: false, message: "No items in this order" });
    }

    // Generate PDF Invoice
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `invoice_${orderId}.pdf`;
    const filePath = path.join(__dirname, "../invoices", fileName);

    if (!fs.existsSync(path.join(__dirname, "../invoices"))) {
      fs.mkdirSync(path.join(__dirname, "../invoices"), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // **Header with Logo**
    const logoPath = path.join(__dirname, "../assets/logo.png"); // Add a logo in assets folder
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 100 });
    }
    doc.fontSize(20).text("INVOICE", 450, 50, { align: "right" });
    doc.moveDown();

    // **Company Details**
    doc.fontSize(12).text("Company Name", 50, 100);
    doc.text("1234 Main Street, Virar, India");
    doc.text("Email: support@company.com");
    doc.text("Phone: +1234567890");
    doc.moveDown();

    // **Invoice Details**
    doc.text(`Invoice #: ${orderId}`, 50, 180);
    doc.text(`Date: ${moment(order.created_at).format("YYYY-MM-DD")}`);
    doc.text(`Status: ${order.status.toUpperCase()}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.moveDown();

    // **Customer Details**
    doc.text(`Customer Name: ${order.user_name}`, 50, 250);
    doc.text(`Email: ${order.email}`);
    doc.text(`Address: ${order.address}`);
    doc.moveDown();

    // **Table Header**
    doc.font("Helvetica-Bold").text("Product", 50, 320);
    doc.text("Qty", 300, 320);
    doc.text("Price", 350, 320);
    doc.text("Total", 450, 320);
    doc.moveDown();

    // **Table Data**
    doc.font("D:/my react/Backend/assets/fonts/Noto_Sans/NotoSans-Italic-VariableFont_wdth,wght.ttf");
    let y = 340;
    itemsRows.forEach((item) => {
      doc.text(item.product_name, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`₹ ${item.price}`, 350, y);
      doc.text(`₹ ${(item.quantity * item.price).toFixed(2)}`, 450, y);
      y += 20;
    });

    // **Total Amount**
    doc.moveDown();
    
    doc.fontSize(14).text(`Total Price:₹ ${order.total_price}`, 50, y + 40, { align: "right" });

    // **Footer**
    doc.moveDown();
    doc.fontSize(10).text("Thank you for your order!", 50, 750, { align: "center" });

    doc.end();

    stream.on("finish", () => {
      res.download(filePath);
    });

  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
