
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UniversalHeader from "../Components/UniversalHeader";

function Menu() {
    const { restaurantId, tableId } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [table, setTable] = useState(null);
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const {
        cart,
        addToCart,
        decreaseQuantity,
        clearCart,
        cartCount,
        cartTotal,
    } = useCart();

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutMessage, setCheckoutMessage] = useState("");


useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
        setLoading(true);

        const fetchData = async (url, fallback) => {
            try {
                const response = await fetch(url);

                if (!response.ok) {
                    console.error(
                        `Request failed (${response.status}):`,
                        url
                    );
                    return fallback;
                }

                return await response.json();
            } catch (error) {
                console.error("Request error:", url, error);
                return fallback;
            }
        };

        const [
            restaurantData,
            tableData,
            foodsData,
            categoriesData,
        ] = await Promise.all([
            fetchData(
                `http://localhost:5000/api/restaurants/${restaurantId}`,
                null
            ),
            fetchData(
                `http://localhost:5000/api/tables/${tableId}`,
                null
            ),
            fetchData(
                `http://localhost:5000/api/foods?restaurantId=${restaurantId}`,
                []
            ),
            fetchData(
                `http://localhost:5000/api/categories?restaurantId=${restaurantId}`,
                []
            ),
        ]);

        if (!cancelled) {
            setRestaurant(restaurantData);
            setTable(tableData);
            setFoods(Array.isArray(foodsData) ? foodsData : []);
            setCategories(
                Array.isArray(categoriesData) ? categoriesData : []
            );
            setLoading(false);
        }
    };

    loadData();

    return () => {
        cancelled = true;
    };
}, [restaurantId, tableId]);


    const handleCheckout = async () => {
        if (cart.length === 0 || checkoutLoading) {
            return;
        }

        setCheckoutLoading(true);
        setCheckoutMessage("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        restaurant: restaurantId,
                        table: tableId,
                        paymentMethod,
                        items: cart.map((item) => ({
                            food: item._id,
                            quantity: item.quantity,
                        })),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to place order."
                );
            }

            if (!data.order?._id) {
                throw new Error(
                    "The server did not return an order ID."
                );
            }

            clearCart();

            navigate(
                `/order-confirmation/${data.order._id}`,
                {
                    state: { order: data.order },
                }
            );
        } catch (error) {
            setCheckoutMessage(
                error.message || "Could not place your order."
            );
        } finally {
            setCheckoutLoading(false);
        }
    };

    const filteredFoods =
        selectedCategory === "All"
            ? foods
            : foods.filter(
                  (food) =>
                      food.category?.name?.toLowerCase() ===
                      selectedCategory.toLowerCase()
              );

    return (
        <div className="menu-page">
            {/* HEADER */}
           <UniversalHeader activePage="menu" variant="menu" />
            <main className="menu-content">
                {/* RESTAURANT HERO */}
                <section className="restaurant-hero">
                    <div>
                        <span className="hero-label">WELCOME</span>

                        <h2>{restaurant?.name || "Restaurant"}</h2>

                        <p>
                            {restaurant?.description ||
                                "Fresh food, delicious flavors and simple ordering."}
                        </p>
                    </div>

                    <div className="restaurant-status">
                        <span className="status-dot"></span>
                        Open now
                    </div>
                </section>

                {/* CATEGORIES */}
                <nav className="category-tabs">
                    <button
                        className={`category-tab ${
                            selectedCategory === "All" ? "active" : ""
                        }`}
                        onClick={() => setSelectedCategory("All")}
                    >
                        All
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category._id}
                            className={`category-tab ${
                                selectedCategory === category.name
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedCategory(category.name)
                            }
                        >
                            {category.name}
                        </button>
                    ))}
                </nav>

                {/* MENU */}
                <section className="menu-section">
                    <div className="section-heading">
                        <div>
                            <span className="section-label">
                                OUR MENU
                            </span>

                            <h2>Popular dishes</h2>
                        </div>

                        <span className="food-count">
                            {filteredFoods.length}{" "}
                            {filteredFoods.length === 1
                                ? "item"
                                : "items"}
                        </span>
                    </div>

                    {loading ? (
                        <p className="loading-text">
                            Loading menu...
                        </p>
                    ) : filteredFoods.length === 0 ? (
                        <div className="empty-menu">
                            <div className="empty-icon">🍽️</div>

                            <h3>No items here yet</h3>

                            <p>
                                We haven't added anything to the{" "}
                                {selectedCategory} category yet.
                            </p>
                        </div>
                    ) : (
                        <div className="food-grid">
                            {filteredFoods.map((food) => (
                                <article
                                    className="food-card"
                                    key={food._id}
                                >
                                    <div className="food-image">
                                        {food.image ? (
                                            <img
                                                src={food.image}
                                                alt={food.name}
                                            />
                                        ) : (
                                            <span>🍕</span>
                                        )}

                                        {food.isVeg && (
                                            <span className="veg-badge">
                                                ● VEG
                                            </span>
                                        )}
                                    </div>

                                    <div className="food-details">
                                        <span className="food-category">
                                            {food.category?.name || "Food"}
                                        </span>

                                        <h3>{food.name}</h3>

                                        <p>{food.description}</p>

                                        <div className="food-bottom">
                                            <strong>
                                                ₹{food.price}
                                            </strong>

                                            <button
                                                className="add-button"
                                                onClick={() =>
                                                    addToCart(food)
                                                }
                                            >
                                                <span>+</span>
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* EXISTING INLINE CART — KEPT */}
                {cart.length > 0 && (
                    <section className="cart-section">
                        <div className="cart-header">
                            <div>
                                <span className="section-label">
                                    YOUR ORDER
                                </span>

                                <h2>Cart</h2>
                            </div>

                            <span className="cart-items-count">
                                {cartCount}{" "}
                                {cartCount === 1 ? "item" : "items"}
                            </span>
                        </div>

                        <div className="cart-items">
                            {cart.map((item) => (
                                <div
                                    className="cart-item"
                                    key={item._id}
                                >
                                    <div className="cart-item-info">
                                        <h3>{item.name}</h3>
                                        <p>₹{item.price} each</p>
                                    </div>

                                    <div className="cart-item-right">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() =>
                                                    decreaseQuantity(item._id)
                                                }
                                                aria-label={`Decrease ${item.name}`}
                                            >
                                                −
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button
                                                onClick={() =>
                                                    addToCart(item)
                                                }
                                                aria-label={`Increase ${item.name}`}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <strong>
                                            ₹
                                            {(
                                                Number(item.price) *
                                                item.quantity
                                            ).toFixed(2)}
                                        </strong>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-total">
                            <span>Total</span>
                            <strong>₹{cartTotal.toFixed(2)}</strong>
                        </div>

                        <div className="payment-method">
                            <h3>Payment method</h3>

                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cash"
                                    checked={paymentMethod === "cash"}
                                    onChange={(event) =>
                                        setPaymentMethod(event.target.value)
                                    }
                                />
                                Cash
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="online"
                                    checked={paymentMethod === "online"}
                                    onChange={(event) =>
                                        setPaymentMethod(event.target.value)
                                    }
                                />
                                Online
                            </label>

                            {paymentMethod === "online" && (
                                <p>
                                    Online payment requires a connected
                                    payment gateway to collect real payments.
                                </p>
                            )}
                        </div>

                        {checkoutMessage && (
                            <p role="status" aria-live="polite">
                                {checkoutMessage}
                            </p>
                        )}

                        <button
                            className="checkout-button"
                            onClick={handleCheckout}
                            disabled={
                                checkoutLoading || cart.length === 0
                            }
                        >
                            {checkoutLoading
                                ? "Placing order..."
                                : "Proceed to Checkout"}
                            {!checkoutLoading && <span>→</span>}
                        </button>
                    </section>
                )}
            </main>

            {/* MOBILE CART */}
            {cart.length > 0 && (
                <div className="mobile-cart-bar">
                    <div>
                        <strong>🛒 {cartCount} items</strong>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/cart/${restaurantId}/${tableId}`)
                        }
                    >
                        View Cart →
                    </button>
                </div>
            )}
        </div>
    );
}

export default Menu;
