
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import UniversalHeader from "../Components/UniversalHeader";

const ACTIVE_STATUSES = ["pending", "accepted", "preparing", "ready"];

function ActiveOrders() {
    const { restaurantId, tableId } = useParams();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = useCallback(async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/orders?restaurantId=${restaurantId}&tableId=${tableId}`
            );

            const responseText = await response.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    "The orders API returned HTML instead of JSON. Check the backend URL and API route."
                );
            }

            if (!response.ok) {
                throw new Error(data.message || "Could not load orders.");
            }

            const orderList = Array.isArray(data)
                ? data
                : data.orders || [];

            setOrders(orderList);
            setError("");
        } catch (err) {
            setError(err.message || "Could not load orders.");
        } finally {
            setLoading(false);
        }
    }, [restaurantId, tableId]);

    useEffect(() => {
        loadOrders();

        const intervalId = window.setInterval(loadOrders, 15000);
        return () => window.clearInterval(intervalId);
    }, [loadOrders]);

    const activeOrders = orders.filter((order) =>
        ACTIVE_STATUSES.includes(order.status)
    );

    return (
        <main className="active-orders-page">
            <UniversalHeader activePage="activeOrders" />

            <div className="ao-content">
                <section className="ao-page-heading">
                    <div>
                        <span className="ao-eyebrow">ORDER TRACKING</span>
                        <h1>Your Orders</h1>
                        <p>
                            Follow your food from the kitchen to your table.
                        </p>
                    </div>

                    <div className="ao-heading-actions">
                        <div className="ao-active-count">
                            <strong>{activeOrders.length}</strong>
                            <span>Active orders</span>
                        </div>

                        <button
                            className="ao-refresh-button"
                            type="button"
                            onClick={loadOrders}
                            disabled={loading}
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </section>

                <div className="ao-section-heading">
                    <h2>Current orders</h2>
                    <span>Updates every 15 seconds</span>
                </div>

                {loading ? (
                    <section className="ao-message">
                        <div className="ao-message-icon">◷</div>
                        <h2>Loading your orders</h2>
                        <p>Please wait while we retrieve your latest orders.</p>
                    </section>
                ) : error ? (
                    <section className="ao-message ao-error-message">
                        <div className="ao-message-icon">!</div>
                        <h2>Couldn't load orders</h2>
                        <p>{error}</p>
                        <button
                            className="ao-primary-button"
                            type="button"
                            onClick={loadOrders}
                        >
                            Try Again
                        </button>
                    </section>
                ) : activeOrders.length === 0 ? (
                    <section className="ao-message">
                        <div className="ao-message-icon">🛍️</div>
                        <h2>No active orders yet</h2>
                        <p>
                            Once you place an order, its progress will appear here.
                        </p>
                        <Link
                            className="ao-primary-button"
                            to={`/menu/${restaurantId}/${tableId}`}
                        >
                            Browse Menu
                        </Link>
                    </section>
                ) : (
                    <section className="ao-orders-list">
                        {activeOrders.map((order) => {
                            const status = String(order.status || "pending").toLowerCase();

                            const progressSteps = [
                                "pending",
                                "accepted",
                                "preparing",
                                "ready",
                            ];

                            const progressIndex = progressSteps.indexOf(status);

                            return (
                                <article className="ao-order-card" key={order._id}>
                                    <div className="ao-order-header">
                                        <div>
                                            <span className="ao-order-label">
                                                ORDER #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <p className="ao-order-date">
                                                {order.createdAt
                                                    ? new Date(order.createdAt).toLocaleString()
                                                    : "Recently placed"}
                                            </p>
                                        </div>

                                        <span className={`ao-status ao-status-${status}`}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="ao-order-body">
                                        <h3>Order items</h3>

                                        <ul className="ao-items-list">
                                            {(order.items || []).map((item, index) => (
                                                <li key={`${item.food || item.name}-${index}`}>
                                                    <span className="ao-item-name">
                                                        {item.name || "Food item"}
                                                        <span className="ao-item-quantity">
                                                            × {item.quantity}
                                                        </span>
                                                    </span>

                                                    <strong>
                                                        ₹{(
                                                            Number(item.price || 0) *
                                                            Number(item.quantity || 0)
                                                        ).toFixed(2)}
                                                    </strong>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="ao-progress">
                                        <div className="ao-progress-heading">
                                            <strong>Order progress</strong>
                                            <span>
                                                {status === "ready"
                                                    ? "Ready to serve"
                                                    : status === "preparing"
                                                    ? "Your food is being prepared"
                                                    : status === "accepted"
                                                    ? "Order accepted by restaurant"
                                                    : "Waiting for confirmation"}
                                            </span>
                                        </div>

                                        <div className="ao-progress-track">
                                            {progressSteps.map((step, index) => (
                                                <div
                                                    key={step}
                                                    className={`ao-progress-step ${
                                                        index <= progressIndex ? "is-complete" : ""
                                                    }`}
                                                >
                                                    <span className="ao-progress-dot" />
                                                    <span className="ao-progress-label">
                                                        {step.charAt(0).toUpperCase() + step.slice(1)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="ao-order-footer">
                                        <div className="ao-total">
                                            <span>Order total</span>
                                            <strong>
                                                ₹{Number(order.totalAmount || 0).toFixed(2)}
                                            </strong>
                                        </div>

                                        <Link
                                            className="ao-details-link"
                                            to={`/order-confirmation/${order._id}`}
                                        >
                                            View Details <span aria-hidden="true">→</span>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}

                <section className="ao-bottom-cta">
                    <div>
                        <h2>Still hungry?</h2>
                        <p>Discover something else from our menu.</p>
                    </div>

                    <Link
                        className="ao-primary-button"
                        to={`/menu/${restaurantId}/${tableId}`}
                    >
                        + Order More Food
                    </Link>
                </section>
            </div>
        </main>
    );
}

export default ActiveOrders;
