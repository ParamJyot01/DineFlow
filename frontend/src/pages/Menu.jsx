import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Menu() {
  const { restaurantId, tableId } = useParams();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/foods")
      .then((response) => response.json())
      .then((data) => {
        setFoods(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch foods:", error);
        setLoading(false);
      });
  }, []);

  const addToCart = (food) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item._id === food._id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item._id === food._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...food, quantity: 1 }];
    });
  };

  const decreaseQuantity = (foodId) => {
    setCart((currentCart) => {
      return currentCart
        .map((item) =>
          item._id === foodId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="menu-page">
      <header className="menu-header">
        <div>
          <h1>DineFlow</h1>
          <p>Restaurant Menu</p>
        </div>

        <div className="header-actions">
          <span className="cart-badge">
            🛒 {cartCount}
          </span>

          <span className="table-badge">
            Table 1
          </span>
        </div>
      </header>

      <main className="menu-content">
        <section className="restaurant-info">
          <h2>DineFlow Demo Restaurant</h2>
          <p>Fresh food. Simple ordering.</p>
        </section>

        {loading ? (
          <p>Loading menu...</p>
        ) : foods.length === 0 ? (
          <p>No food items available.</p>
        ) : (
          <section className="food-list">
            {foods.map((food) => (
              <div className="food-card" key={food._id}>
                <div className="food-image">
                  🍕
                </div>

                <div className="food-details">
                  <div>
                    <h3>{food.name}</h3>
                    <p>{food.description}</p>
                  </div>

                  <div className="food-action">
                    <strong>₹{food.price}</strong>

                    <button onClick={() => addToCart(food)}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {cart.length > 0 && (
          <section className="cart-section">
            <div className="cart-header">
              <h2>Your Order</h2>

              <span>
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>₹{item.price} each</p>
                  </div>

                  <div className="cart-item-right">
                    <div className="quantity-controls">
                      <button
                        onClick={() => decreaseQuantity(item._id)}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => addToCart(item)}
                      >
                        +
                      </button>
                    </div>

                    <strong>
                      ₹{item.price * item.quantity}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <span>Total</span>

              <strong>₹{cartTotal}</strong>
            </div>

            <button className="checkout-button">
              Proceed to Checkout
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default Menu;