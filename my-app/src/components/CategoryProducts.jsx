import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate= useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/products", {
          params: { category: categoryId },
        });
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // ✅ Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category_name]) {
      acc[product.category_name] = [];
    }
    acc[product.category_name].push(product);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Category Products</h2>

      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center">No products found in this category.</p>
      ) : (
        Object.keys(groupedProducts).map((category) => (
          <div key={category}>
            <h3 className="mt-4">{category}</h3> {/* ✅ Category Title */}
            <div className="row">
              {groupedProducts[category].map((product) => (
                <div className="col-md-3 mb-4" key={product.id}>
                  <div className="card h-100 shadow-sm">
                    <img
                      src={product.image || "placeholder.jpg"}
                      className="card-img-top"
                      alt={product.name}
                      style={{ objectFit: "contain", height: "200px", cursor: "pointer"}}
                      onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
               onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
               onClick={() => navigate(`/product/${product.id}`)}
                    />
                    <div className="card-body text-center">
                      <h5 className="card-title" style={{cursor: "pointer"}}  onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h5>
                      <p className="card-text text-primary fw-bold">${product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CategoryProducts;
