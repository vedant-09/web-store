import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

const BestSelling = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/BestSellingRoutes/api/best-selling-products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching best-selling products:", error));
  }, []);
  const navigate = useNavigate();
  const settings = {
    dots: true,
    infinite: false, // ❌ No looping
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false, // ❌ No auto-scroll
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Top 10 Best Selling Products</h2>
      <Slider {...settings}>
        {products.map((product) => (
          <div key={product.id} className="p-3">
            <div className="card h-100 shadow-sm d-flex flex-column">
              {/* 🖼 Image with Fixed Height and Centering */}
              <div className="d-flex align-items-center justify-content-center" style={{ height: "250px" }}>
                <img
                  src={product.image}
                  className="card-img-top"
                  alt={product.name}
                  style={{ maxHeight: "100%", width: "auto", objectFit: "contain", cursor:"pointer" }} // ✅ No Cropping
                  onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
                  onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              </div>
              <div className="card-body d-flex flex-column text-center">
                <h5 className="card-title" onClick={() => navigate(`/product/${product.id}`)} style={{cursor:"pointer"}}>{product.name}</h5>
                <p className="card-text text-danger">${product.price}</p>
                
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BestSelling;
