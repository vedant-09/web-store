import React, { useMemo } from "react";
import { useCart } from "./CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, refreshCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = (product) => {
    navigate("/checkout", {
      state: { products: [{ ...product, subtotal: product.price * product.quantity }] }, // Pass full product, consider adding subtotal if needed by checkout
    });
  };

  const handleBuyAll = () => {
    const productsWithSubtotals = cart.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));
    navigate("/checkout", { state: { products: productsWithSubtotals } }); // Send the entire cart with subtotals
  };

  const calculateSubtotal = (item) => {
    return (parseFloat(item.price) * parseInt(item.quantity, 10)).toFixed(2);
  };

  const cartTotal = useMemo(() => {
    return cart
      .reduce((total, item) => total + parseFloat(item.price) * parseInt(item.quantity, 10), 0)
      .toFixed(2);
  }, [cart]);

  return (
    <div className="container mt-5 mb-5"> {/* Added mb-5 for spacing */}
      <h2 className="mb-4 text-primary fw-bold">Your Shopping Cart</h2>
      {cart.length === 0 ? (
        <div className="alert alert-info text-center">
          <p className="lead mb-2">Your cart is currently empty.</p>
          <Link to="/porducts" className="btn btn-primary"> {/* Corrected link to /products */}
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="row">
          {/* Cart Items Table */}
          <div className="col-lg-8 mb-4 mb-lg-0">
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: "10%" }}>Image</th>
                    <th scope="col" style={{ width: "25%" }}>Product</th>
                    <th scope="col" className="text-center" style={{ width: "10%" }}>Price</th>
                    <th scope="col" className="text-center" style={{ width: "15%" }}>Quantity</th>
                    <th scope="col" className="text-center" style={{ width: "10%" }}>Subtotal</th>
                    <th scope="col" className="text-center" style={{ width: "30%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={item.image || 'placeholder.jpg'} // Added placeholder
                          alt={item.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </td>
                      <td>
                        <span className="fw-medium">{item.name}</span>
                      </td>
                      <td className="text-center">₹{parseFloat(item.price).toFixed(2)}</td>
                      <td className="text-center">
                        <div className="input-group input-group-sm justify-content-center" style={{maxWidth: "120px", margin: "auto"}}>
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1} // Disable if quantity is 1
                          >
                            &ndash;
                          </button>
                          <input type="text" className="form-control text-center" value={item.quantity} readOnly style={{backgroundColor: '#fff'}}/>
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-center fw-medium">₹{calculateSubtotal(item)}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-danger me-2 mb-1 mb-md-0" // Added margin for spacing
                          onClick={async () => {
                            await removeFromCart(item.id);
                            refreshCart(); // Ensure cart updates immediately
                          }}
                          title="Remove from cart"
                        >
                          <i className="bi bi-trash"></i> Remove {/* Example with Bootstrap Icon */}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleBuyNow(item)}
                          title="Buy this item now"
                        >
                           <i className="bi bi-lightning-fill"></i> Buy Now {/* Example with Bootstrap Icon */}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cart Totals Section */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title text-center mb-4 text-primary">Cart Totals</h4>
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-medium">Subtotal:</span>
                  <span>₹{cartTotal}</span>
                </div>
                {/* You can add more details like shipping, tax estimates here if needed */}
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <h5 className="fw-bold">Total:</h5>
                  <h5 className="fw-bold">₹{cartTotal}</h5>
                </div>
                <div className="d-grid">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleBuyAll}
                  >
                    Proceed to Buy All Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}