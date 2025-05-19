// eslint-disable-next-line
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PRODUCTS_PER_PAGE = 12; // 3 columns * 4 rows

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [actualMinPrice, setActualMinPrice] = useState(0);
  const [actualMaxPrice, setActualMaxPrice] = useState(1000); // Default max
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/products", { withCredentials: true })
      .then((response) => {
        const fetchedProducts = response.data;
        setProducts(fetchedProducts);

        if (fetchedProducts.length > 0) {
          const prices = fetchedProducts.map((p) => parseFloat(p.price));
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setActualMinPrice(min);
          setActualMaxPrice(max);
          // Initialize price range state with actual min/max to prefill inputs
          // or leave them blank for user to input. Let's leave them blank initially
          // but use actualMinPrice/MaxPrice for placeholders and validation.
        } else {
          setActualMinPrice(0);
          setActualMaxPrice(1000); // Reset if no products
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  useEffect(() => {
    let result = [...products];

    // Apply search query filter
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerCaseQuery) ||
          product.category_name.toLowerCase().includes(lowerCaseQuery) ||
          product.subcategories_name.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Apply price range filter
    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);

    if (!isNaN(minPrice)) {
      result = result.filter((product) => parseFloat(product.price) >= minPrice);
    }
    if (!isNaN(maxPrice)) {
      result = result.filter((product) => parseFloat(product.price) <= maxPrice);
    }

    setFilteredAndSortedProducts(result);
    setCurrentPage(1); // Reset to first page whenever filters change
  }, [searchQuery, priceRange, products]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePriceChange = (event) => {
    const { name, value } = event.target;
    setPriceRange((prevRange) => ({
      ...prevRange,
      [name]: value,
    }));
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredAndSortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Generate page numbers for pagination control
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container-fluid py-5" // Changed to container-fluid for better responsiveness control
    >
      <h2 className="text-center mb-5 fw-bold text-primary">Our Products</h2>

      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3 mb-4 mb-lg-0">
          <div className="card shadow-sm p-4">
            <h5 className="mb-3 text-primary">Filters</h5>

            {/* Search Bar */}
            <div className="mb-4">
              <label htmlFor="search" className="form-label fw-semibold">Search</label>
              <input
                type="text"
                id="search"
                className="form-control rounded-pill px-3"
                placeholder="Product, category..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="form-label fw-semibold">Price Range</label>
              <div className="d-flex align-items-center">
                <input
                  type="number"
                  name="min"
                  className="form-control me-2"
                  placeholder={`Min (${actualMinPrice})`}
                  value={priceRange.min}
                  onChange={handlePriceChange}
                  min="0"
                />
                <span>-</span>
                <input
                  type="number"
                  name="max"
                  className="form-control ms-2"
                  placeholder={`Max (${actualMaxPrice})`}
                  value={priceRange.max}
                  onChange={handlePriceChange}
                  min="0"
                />
              </div>
                <small className="form-text text-muted">
                    Enter min and/or max price.
                </small>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="col-lg-9">
          {currentProducts.length > 0 ? (
            <>
              <div className="row g-4">
                {currentProducts.map((product) => (
                  // col-12 (mobile), col-md-6 (tablet), col-xl-4 (desktop for 3 columns)
                  <div className="col-12 col-md-6 col-xl-4" key={product.id}>
                    <div className="card h-100 shadow-sm border-0 rounded-3">
                      <div
                        className="overflow-hidden d-flex justify-content-center align-items-center"
                        style={{
                          height: "250px", // Increased height slightly
                          background: "#f8f9fa",
                          borderTopLeftRadius: "0.75rem", // Adjusted to match card
                          borderTopRightRadius: "0.75rem",
                        }}
                      >
                        <img
                          src={product.image || "placeholder.jpg"}
                          className="card-img-top p-3"
                          alt={product.name}
                          style={{
                            objectFit: "contain",
                            maxHeight: "100%", // Ensure image fits within container
                            maxWidth: "100%",
                            transition: "transform 0.3s ease",
                            cursor: "pointer",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.transform = "scale(1.05)")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.transform = "scale(1)")
                          }
                          onClick={() => navigate(`/product/${product.id}`)}
                        />
                      </div>
                      <div className="card-body text-center d-flex flex-column">
                        <h5
                          className="card-title fw-semibold text-dark mb-2"
                          style={{ cursor: "pointer", fontSize: "1.1rem" }} // Slightly larger title
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.name}
                        </h5>
                        <p className="text-muted small mb-2">
                          {product.category_name} &raquo;{" "}
                          {product.subcategories_name}
                        </p>
                        <p className="card-text text-primary fw-bold fs-5 mt-auto">
                          ₹{parseFloat(product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav aria-label="Page navigation" className="mt-5 d-flex justify-content-center">
                  <ul className="pagination shadow-sm">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => paginate(currentPage - 1)} aria-label="Previous">
                        &laquo; {/* Previous */}
                      </button>
                    </li>
                    {pageNumbers.map((number) => (
                      <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                        <button onClick={() => paginate(number)} className="page-link">
                          {number}
                        </button>
                      </li>
                    ))}
                     <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => paginate(currentPage + 1)} aria-label="Next">
                         &raquo; {/* Next */}
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center mt-5 p-5 bg-light rounded-3">
                <p className="text-danger fs-4 fw-semibold">No products found matching your criteria.</p>
                <p className="text-muted">Try adjusting your search or price filters.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Products;