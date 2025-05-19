import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link
import axios from "axios";
import { motion } from "framer-motion";
import { useCart } from "./CartContext";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import AuthModal from "./AuthModal";
import Swal from "sweetalert2";
// You might want a StarRating component for reviews
// import StarRating from './StarRating'; // Example component

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [attributes, setAttributes] = useState([]); // For product attributes
  const [reviews, setReviews] = useState([]); // For product reviews
  const [relatedProducts, setRelatedProducts] = useState([]); // For related products
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [user, setUser] = useState(null); // User session data
  const cartContext = useCart();
  const { addToCart } = cartContext;
  const [showAuthModal, setShowAuthModal] = useState(false);

  // State for new review form
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);


  // Fetch User Session
  useEffect(() => {
    axios
      .get("http://localhost:5000/check-session", { withCredentials: true })
      .then((response) => {
        setUser(response.data.user || null);
      })
      .catch((error) => {
        console.error("Session check failed:", error);
        setUser(null);
      });
  }, []);


  // Fetch Product Details, Attributes, Reviews, Related Products
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // Fetch product details
        const productRes = await axios.get(`http://localhost:5000/product/${id}`);
        setProduct(productRes.data);
        setSelectedImage(productRes.data.image || "/Images/default-product.jpg");

        // Fetch product attributes
        const attributesRes = await axios.get(`http://localhost:5000/api/product/${id}/attributes`);
        setAttributes(attributesRes.data);

        // Fetch product reviews
        const reviewsRes = await axios.get(`http://localhost:5000/api/product/${id}/reviews`);
        setReviews(reviewsRes.data);

        // // Fetch related products
        const relatedRes = await axios.get(`http://localhost:5000/api/product/${id}/related`);
        setRelatedProducts(relatedRes.data);

        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError(err.response?.data?.message || "Product or related data not found. Please try again.");
        setProduct(null); // Ensure product is null on error to show error message
      }
    };

    if (id) {
      fetchProductData();
    }

    // Scroll to top when ID changes
    window.scrollTo(0, 0);

  }, [id]);


  const handleAddToCart = () => {
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "You must be logged in to add items to your cart.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
      }).then((result) => {
        if (result.isConfirmed) {
          setShowAuthModal(true);
        }
      });
      return;
    }

    if (product) {
      addToCart(product.id); // Assuming addToCart takes productId
      Swal.fire({
        title: "Added to Cart!",
        text: `${product.name} has been added to your cart.`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        position: "top-end",
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire("Login Required", "Please log in to submit a review.", "info");
      setShowAuthModal(true);
      return;
    }
    if (newReviewRating === 0 || !newReviewComment.trim()) {
      Swal.fire("Missing Fields", "Please provide a rating and a comment.", "warning");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/product/${id}/reviews`,
        { rating: newReviewRating, comment: newReviewComment },
        { withCredentials: true }
      );
      setReviews([response.data, ...reviews]); // Add new review to the top
      setNewReviewRating(0);
      setNewReviewComment("");
      Swal.fire("Review Submitted!", "Thank you for your feedback.", "success");
    } catch (error) {
      console.error("Error submitting review:", error);
      Swal.fire("Error", error.response?.data?.message || "Could not submit review.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (error && !product) return <p className="text-danger text-center mt-5 display-6">{error}</p>;
  if (!product) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div><p>Loading Product Details...</p></div>;


  // Helper for star display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'text-warning' : 'text-secondary'}`}>
          &#9733; {/* Filled star */}
        </span>
      );
    }
    return stars;
  };


  return (
    <>
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false);
          // Re-fetch user session or simply reload
          axios.get("http://localhost:5000/check-session", { withCredentials: true })
            .then((response) => setUser(response.data.user || null))
            .catch(() => setUser(null));
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mt-5 pt-4">
          <div className="row">
            {/* Product Image */}
            <div className="col-md-6 mb-4">
              <TransformWrapper defaultScale={1}>
                <TransformComponent>
                  <img
                    src={selectedImage || "/Images/default-product.jpg"}
                    alt={product.name}
                    className="img-fluid shadow-lg rounded main-image"
                    style={{ maxHeight: "500px", width: "100%", objectFit: "contain", cursor: 'zoom-in' }}
                  />
                </TransformComponent>
              </TransformWrapper>
              <div className="d-flex mt-3 justify-content-center flex-wrap">
                {[product.image, ...(product.additional_images || [])]
                  .filter(img => img) // Filter out null/undefined images
                  .map((img, index) => (
                    <img
                      key={index}
                      src={img || "/Images/default-product.jpg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="img-thumbnail mx-1 mb-1"
                      style={{
                        width: "80px",
                        height: "80px",
                        cursor: "pointer",
                        objectFit: "cover",
                        border: selectedImage === img ? "3px solid #007bff" : "1px solid #ddd",
                      }}
                      onClick={() => setSelectedImage(img)}
                      onError={(e) => e.target.src = "/Images/default-product.jpg"} // Fallback for broken thumbnail links
                    />
                  ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="col-md-6">
              <h1 className="fw-bold mb-3">{product.name}</h1>
              <p className="text-muted">
                Category: <span className="fw-semibold">{product.category_name || "N/A"}</span>
              </p>
              {product.subcategory_name && (
                <p className="text-muted">
                  Subcategory: <span className="fw-semibold">{product.subcategory_name}</span>
                </p>
              )}
              <h3 className="text-primary my-3">Price: ₹{product.price}</h3>

              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-1" dangerouslySetInnerHTML={{ __html: product.description || "No description available." }}></p>
              </div>

              {/* Product Attributes */}
              {attributes && attributes.length > 0 && (
                <div className="mb-3 card card-body bg-light">
                  <h5 className="card-title">Product Specifications</h5>
                  <ul className="list-unstyled mb-0">
                    {attributes.map((attr, index) => (
                      <li key={index}>
                        <strong>{attr.attribute_name}:</strong> {attr.attribute_value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-4">
                <strong>Stock:</strong>{" "}
                {product.stock === 0 ? (
                  <span className="text-danger fw-bold">Out of stock</span>
                ) : product.stock < 5 ? (
                  <span className="text-warning fw-bold">
                    Low Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-success fw-bold">In Stock</span>
                )}
              </div>

              {/* Buttons */}
              <div className="d-flex align-items-center">
                {product.stock > 0 && (
                  <button
                    className="btn btn-success btn-lg me-2 px-4"
                    onClick={handleAddToCart}
                  >
                    <i className="fas fa-cart-plus me-2"></i>Add to Cart
                  </button>
                )}
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/porducts")} 
                >
                  Back to Products
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <hr className="my-5" />
          <div className="row">
            <div className="col-md-12">
              <h3 className="mb-4">Customer Reviews ({reviews.length})</h3>
              {/* Add Review Form */}
              {user && (
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Write a Review</h5>
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-3">
                        <label htmlFor="rating" className="form-label">Your Rating:</label>
                        <div>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="star fs-3"
                              style={{ cursor: 'pointer', color: star <= newReviewRating ? '#ffc107' : '#e0e0e0' }}
                              onClick={() => setNewReviewRating(star)}
                            >
                              &#9733;
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="comment" className="form-label">Your Comment:</label>
                        <textarea
                          id="comment"
                          className="form-control"
                          rows="3"
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={isSubmittingReview}>
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
              {!user && <p className="mb-3"><a href="#!" onClick={(e)=>{e.preventDefault(); setShowAuthModal(true)}}>Log in</a> to write a review.</p>}

              {/* Display Reviews */}
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <h5 className="card-title mb-0">{review.user_name || "Anonymous"}</h5>
                        <small className="text-muted">
                          {new Date(review.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="mb-2">{renderStars(review.rating)}</div>
                      <p className="card-text">{review.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No reviews yet for this product. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts && relatedProducts.length > 0 && (
            <>
              <hr className="my-5" />
              <div className="row">
                <div className="col-md-12">
                  <h3 className="mb-4">Related Products</h3>
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {relatedProducts.map((related) => (
                      <div key={related.id} className="col">
                        <div className="card h-100 shadow-sm product-card-hover">
                           <Link to={`/product/${related.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                            <img
                              src={related.image || "/Images/default-product.jpg"}
                              className="card-img-top"
                              alt={related.name}
                              style={{ height: "200px", objectFit: "cover" }}
                              onError={(e) => e.target.src = "/Images/default-product.jpg"}
                            />
                            <div className="card-body">
                              <h5 className="card-title fs-6">{related.name}</h5>
                              <p className="card-text fw-bold text-primary">₹{related.price}</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ProductDetail;