import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminInsertForm = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: null,
    stock: "",
    discount: "",
    category_id: "",
    subcategory_id: "",
    description: "",
    attributes: "",
    product_images: [],
  });

  // ✅ Fetch Categories
  useEffect(() => {
    axios
      .get("http://localhost:5000/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // ✅ Fetch Subcategories when Category changes
  useEffect(() => {
    if (formData.category_id) {
      axios
        .get(`http://localhost:5000/subcategories/${formData.category_id}`)
        .then((response) => setSubcategories(response.data))
        .catch((error) =>
          console.error("Error fetching subcategories:", error)
        );
    }
  }, [formData.category_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: e.target.files[0] });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, product_images: Array.from(e.target.files) });
    // ✅ Preview multiple images
    const previews = files.map((file) => URL.createObjectURL(file));
    setAdditionalPreviews(previews);
  };

  // ✅ Handle Form Submission with Backend API Integration
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "product_images") {
        formData[key].forEach((file) =>
          formDataToSend.append("product_images", file)
        );
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/insert-product",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(response.data.message);
      setFormData({
        name: "",
        price: "",
        image: null,
        stock: "",
        discount: "",
        category_id: "",
        subcategory_id: "",
        description: "",
        attributes: "",
        product_images: [],
      });
      setImagePreview(null);
      setAdditionalPreviews([]);
    } catch (error) {
      console.error("Error inserting product:", error);
      alert("Failed to insert product!");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Add New Product</h2>
      <div className="row">
        {/* 🖼 Left Column: Image Upload */}
        <div className="col-md-5 text-center">
          <div className="border p-3 rounded bg-light">
            <h5>Main Image Preview</h5>
            <div className="mb-3">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              ) : (
                <p>No image selected</p>
              )}
            </div>
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              required
            />
          </div>

          {/* 📷 Additional Images */}
          <div className="border p-3 rounded mt-3 bg-light">
            <h5>Additional Images</h5>
            <input
              type="file"
              className="form-control mb-2"
              multiple
              onChange={handleImageUpload}
            />
            <div className="d-flex flex-wrap mt-2">
              {additionalPreviews.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Additional Preview ${index}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    margin: "5px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 📝 Right Column: Product Details */}
        <div className="col-md-7">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Discount (%)</label>
                <input
                  type="number"
                  className="form-control"
                  name="discount"
                  step="0.01"
                  value={formData.discount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Subcategory</label>
                <select
                  className="form-select"
                  name="subcategory_id"
                  value={formData.subcategory_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Attributes</label>
              <textarea
                className="form-control"
                rows="3"
                name="attributes"
                value={formData.attributes}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Insert Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminInsertForm;
