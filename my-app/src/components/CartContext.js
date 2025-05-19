import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Function to fetch the latest cart data
  const refreshCart = async () => {
    console.log("Attempting to refresh cart..."); // Added log
    try {
      const response = await axios.get("http://localhost:5000/cart", { withCredentials: true });
      console.log("Cart fetched successfully:", response.data); // Added log
      setCart(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("User is not authenticated (401). Clearing cart."); // Added log
        setCart([]);
      } else {
        // Handle other potential errors (e.g., network error, server error)
        console.error("Error refreshing cart (non-401):", error);
        // Decide if you want to clear the cart on other errors too, maybe not.
        // setCart([]); // Optional: clear cart on any error
      }
    }
  };

  // Fetch cart ONLY on initial mount
  useEffect(() => {
    console.log("CartProvider mounted. Performing initial refreshCart."); // Added log
    refreshCart();
  }, []); // Empty dependency array - runs once on mount


  // REMOVED the second useEffect that called /check-session

  const addToCart = async (product_id) => {
    try {
      const stockResponsepd = await axios.get(`http://localhost:5000/product/stock/${product_id}`);
      const availableStockpd = stockResponsepd.data.stock;

      const existingCartItem = cart.find(item => item.product_id === product_id);
      const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;

      if (currentQuantity + 1 > availableStockpd) {
        alert(`Only ${availableStockpd} items are in stock.`);
        return;
      }

      await axios.post("http://localhost:5000/cart/add", { product_id }, { withCredentials: true });
      refreshCart(); // Refresh cart after adding
    } catch (error) {
        // Check if the error is due to authentication (e.g., 401)
       if (error.response && error.response.status === 401) {
         alert("Login required to add items to the cart.");
       } else {
         console.error("Error adding to cart:", error);
         alert("An error occurred while adding the item. Please try again."); // Generic message for other errors
       }
    }
  };

  const removeFromCart = async (id) => {
    console.log("Removing item with ID:", id);
    try {
      await axios.post("http://localhost:5000/cart/remove", { id }, { withCredentials: true });
      refreshCart(); // Refresh cart after removing
    } catch (error) {
      console.error("Error removing item:", error);
       // Handle potential auth errors if necessary
    }
  };

  const updateQuantity = async (id, quantity) => {
    console.log('Updating cart item id:' + id, 'to quantity:' + quantity); // Corrected log
    if (quantity < 1) {
      await removeFromCart(id); // Use existing remove logic
      return;
    }
    try {
      // Get product_id from cart item (needed for stock check)
      // OPTIMIZATION: The 'cart' state already has this info. No need for an extra API call.
      const cartItem = cart.find(item => item.id === id);
      if (!cartItem) {
          console.error("Could not find cart item with ID:", id, "in current cart state:", cart);
          alert("Item not found in your cart.");
          refreshCart(); // Refresh to sync state if something is off
          return;
      }
      const product_id = cartItem.product_id;

      // Get stock from products table
      const stockResponse = await axios.get(`http://localhost:5000/product/stock/${product_id}`);
      const availableStock = stockResponse.data.stock;

      if (quantity > availableStock) {
        alert(`Only ${availableStock} items are in stock.`);
        // Optional: You might want to set the quantity back to the available stock
        // instead of just alerting and returning. For now, just prevent update.
        // refreshCart(); // Refresh to show the *actual* quantity which didn't change
        return;
      }

      await axios.post("http://localhost:5000/cart/update", { id, quantity }, { withCredentials: true });
      refreshCart(); // Refresh cart after updating
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Handle potential auth or other errors
    }
  };

  // Function specifically to clear the cart locally (e.g., on logout)
  const clearLocalCart = () => {
      console.log("Clearing local cart state.");
      setCart([]);
  }

  return (
    // Provide clearLocalCart if needed by Navbar for logout
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, refreshCart, clearLocalCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);