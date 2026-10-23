
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function OrderConfirmation() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    `http://localhost:5000/api/orders/${orderId}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Could not load order details."
                    );
                }

                setOrder(data);
            } catch (err) {
                setError(err.message || "Could not load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <main className="confirmation-page">
                <div className="confirmation-card">
                    <h1>Loading your order...</h1>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="confirmation-page">
                <div className="confirmation-card">
                    <h1>Unable to load order</h1>
                    <p>{error || "Order not found."}</p>
                    <Link className="confirmation-button" to="/">
                        Back to menu
                    </Link>
                </div>
            </main>
        );
    }

    const restaurantId =
        typeof order.restaurant === "object"
            ? order.restaurant._id
            : order.restaurant;

    const tableId =
        typeof order.table === "object"
            ? order.table._id
            : order.table;

    return (
        <main className="confirmation-page">
            <section className="confirmation-card">
                <div className="confirmation-icon">✓</div>

                <p className="confirmation-label">DINEFLOW</p>
                <h1>Order placed successfully!</h1>
                <p className="confirmation-subtitle">
                    Your order has been received by the restaurant.
                </p>

                <div className="confirmation-status">
                    <span>Order status</span>
                    <strong>{order.status || "pending"}</strong>
                </div>

                <div className="confirmation-details">
                    <span>Order number</span>
                    <strong>
                        DF-{String(order._id).slice(-8).toUpperCase()}
                    </strong>
                </div>

                <div className="confirmation-items">
                    <h2>Order summary</h2>

                    {order.items?.map((item, index) => (
                        <div
                            className="confirmation-item"
                            key={item.food || index}
                        >
                            <div>
                                <strong>{item.name}</strong>
                                <p>
                                    ₹{item.price} × {item.quantity}
                                </p>
                            </div>

                            <strong>
                                ₹{item.price * item.quantity}
                            </strong>
                        </div>
                    ))}
                </div>

                <div className="confirmation-total">
                    <span>Total amount</span>
                    <strong>₹{order.totalAmount}</strong>
                </div>

                <div className="confirmation-details">
                    <span>Payment method</span>
                    <strong>{order.paymentMethod}</strong>
                </div>

                <div className="confirmation-details">
                    <span>Payment status</span>
                    <strong>{order.paymentStatus || "pending"}</strong>
                </div>

                <Link
                    className="confirmation-button"
                    to={`/menu/${restaurantId}/${tableId}`}
                >
                    Back to menu
                </Link>
            </section>
        </main>
    );
}

export default OrderConfirmation;
