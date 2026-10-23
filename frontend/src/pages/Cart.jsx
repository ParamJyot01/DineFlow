
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import UniversalHeader from "../Components/UniversalHeader";

function Cart() {
    const { restaurantId, tableId } = useParams();
    const navigate = useNavigate();

    const {
        cart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
    } = useCart();

    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const menuPath = `/menu/${restaurantId}/${tableId}`;
    const activeOrdersPath = `/active-orders/${restaurantId}/${tableId}`;

    const handleCheckout = async () => {
        if (cart.length === 0 || loading) {
            setError("Your cart is empty.");
            return;
        }

        setLoading(true);
        setError("");

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
                    data.message || "Could not place your order."
                );
            }

            if (!data.order?._id) {
                throw new Error("The server did not return an order ID.");
            }

            clearCart();

            navigate(`/order-confirmation/${data.order._id}`, {
                state: { order: data.order },
            });
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="df-page">
            <UniversalHeader activePage="cart" />
            <main className="df-cart-main">
                <div className="df-page-heading">
                    <div>
                        <span className="df-eyebrow">YOUR SELECTION</span>
                        <h1>Your Cart</h1>
                        <p>
                            Review your items before placing your order.
                        </p>
                    </div>

                    <Link to={menuPath} className="df-back-link">
                        <span aria-hidden="true">←</span> Back to Menu
                    </Link>
                </div>

                {cart.length === 0 ? (
                    <section className="df-empty-cart">
                        <div className="df-empty-cart-icon" aria-hidden="true">
                            🛒
                        </div>

                        <h2>Your cart is empty</h2>

                        <p>
                            Looks like you haven't added anything to your
                            order yet.
                        </p>

                        <Link to={menuPath} className="df-primary-button">
                            Browse Menu
                        </Link>
                    </section>
                ) : (
                    <div className="df-cart-layout">
                        <section className="df-cart-items-panel">
                            <div className="df-panel-heading">
                                <h2>Order Items</h2>
                                <span>{cartCount} items</span>
                            </div>

                            <div className="df-cart-items">
                                {cart.map((item) => (
                                    <article
                                        className="df-cart-item"
                                        key={item._id}
                                    >
                                        <div className="df-food-thumbnail">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    onError={(event) => {
                                                        event.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : (
                                                <span aria-hidden="true">
                                                    🍕
                                                </span>
                                            )}
                                        </div>

                                        <div className="df-food-info">
                                            <h3>{item.name}</h3>

                                            <p className="df-unit-price">
                                                ₹{Number(item.price).toFixed(2)} each
                                            </p>

                                            <button
                                                className="df-remove-button"
                                                type="button"
                                                onClick={() =>
                                                    removeFromCart(item._id)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="df-item-controls">
                                            <div
                                                className="df-quantity-control"
                                                aria-label={`Quantity for ${item.name}`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        decreaseQuantity(item._id)
                                                    }
                                                    aria-label={`Decrease ${item.name} quantity`}
                                                >
                                                    −
                                                </button>

                                                <span>{item.quantity}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        increaseQuantity(item._id)
                                                    }
                                                    aria-label={`Increase ${item.name} quantity`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <strong className="df-line-total">
                                                ₹
                                                {(
                                                    Number(item.price) *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </strong>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <Link to={menuPath} className="df-continue-link">
                                <span aria-hidden="true">+</span>
                                Add more food
                            </Link>
                        </section>

                        <aside className="df-summary-panel">
                            <div className="df-summary-heading">
                                <h2>Order Summary</h2>
                                <span>Table order</span>
                            </div>

                            <div className="df-summary-row">
                                <span>Items ({cartCount})</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>

                            <div className="df-summary-total">
                                <span>Total</span>
                                <strong>₹{cartTotal.toFixed(2)}</strong>
                            </div>

                            <div className="df-payment-section">
                                <label htmlFor="df-payment-method">
                                    Payment Method
                                </label>

                                <select
                                    id="df-payment-method"
                                    value={paymentMethod}
                                    onChange={(event) =>
                                        setPaymentMethod(event.target.value)
                                    }
                                >
                                    <option value="cash">
                                        Cash at counter
                                    </option>
                                    <option value="online">
                                        Online payment
                                    </option>
                                </select>

                                {paymentMethod === "online" && (
                                    <p className="df-payment-note">
                                        Online payments require a connected
                                        payment gateway.
                                    </p>
                                )}
                            </div>

                            {error && (
                                <p className="df-cart-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                className="df-primary-button df-place-order"
                                type="button"
                                onClick={handleCheckout}
                                disabled={loading || cart.length === 0}
                            >
                                {loading ? "Placing Order..." : "Place Order"}
                                {!loading && <span aria-hidden="true"> →</span>}
                            </button>

                            <p className="df-summary-note">
                                Your order will be sent to the restaurant
                                after you place it.
                            </p>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Cart;
