import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import UniversalHeader from "../Components/UniversalHeader";

function OrderConfirmation() {
    const { orderId } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Could not load order details.");
                }

                if (!cancelled) setOrder(data?.order || data);
            } catch (err) {
                if (!cancelled) setError(err.message || "Could not load order details.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        // Refresh from the API so direct visits and page refreshes also work.
        fetchOrder();
        return () => { cancelled = true; };
    }, [orderId]);

    const restaurantId = order
        ? (typeof order.restaurant === "object" ? order.restaurant?._id : order.restaurant)
        : null;
    const tableId = order
        ? (typeof order.table === "object" ? order.table?._id : order.table)
        : null;
    const menuPath = restaurantId && tableId ? `/menu/${restaurantId}/${tableId}` : "/";

    if (loading) {
        return (
            <main className="confirmation-page">
                {restaurantId && tableId && <UniversalHeader activePage="" />}
                <div className="confirmation-card" role="status" aria-live="polite">
                    <h1>Loading your order...</h1>
                    <p>Please wait while we retrieve your order details.</p>
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
                    <Link className="confirmation-button" to="/">Back to menu</Link>
                </div>
            </main>
        );
    }

    const status = String(order.status || "pending");

    return (
        <main className="confirmation-page">
            <UniversalHeader activePage="" />
            <section className="confirmation-card">
                <div className="confirmation-icon" aria-hidden="true">✓</div>
                <p className="confirmation-label">DINEFLOW</p>
                <h1>Order placed successfully!</h1>
                <p className="confirmation-subtitle">Your order has been received by the restaurant.</p>

                <div className="confirmation-status">
                    <span>Order status</span>
                    <strong>{status.charAt(0).toUpperCase() + status.slice(1)}</strong>
                </div>
                <div className="confirmation-details">
                    <span>Order number</span>
                    <strong>DF-{String(order._id || orderId).slice(-8).toUpperCase()}</strong>
                </div>

                <div className="confirmation-items">
                    <h2>Order summary</h2>
                    {(order.items || []).map((item, index) => {
                        const price = Number(item.price || 0);
                        const quantity = Number(item.quantity || 0);
                        return (
                            <div className="confirmation-item" key={item.food?._id || item.food || index}>
                                <div>
                                    <strong>{item.name || item.food?.name || "Food item"}</strong>
                                    <p>₹{price.toFixed(2)} × {quantity}</p>
                                </div>
                                <strong>₹{(price * quantity).toFixed(2)}</strong>
                            </div>
                        );
                    })}
                </div>

                <div className="confirmation-total">
                    <span>Total amount</span>
                    <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
                </div>
                <div className="confirmation-details">
                    <span>Payment method</span>
                    <strong>{order.paymentMethod || "Not specified"}</strong>
                </div>
                <div className="confirmation-details">
                    <span>Payment status</span>
                    <strong>{order.paymentStatus || "pending"}</strong>
                </div>

                <div className="confirmation-actions">
                    {restaurantId && tableId && (
                        <Link className="confirmation-button" to={menuPath}>Back to menu</Link>
                    )}
                    {restaurantId && tableId && (
                        <Link className="confirmation-secondary-button" to={`/active-orders/${restaurantId}/${tableId}`}>
                            Track active orders
                        </Link>
                    )}
                </div>
            </section>
        </main>
    );
}

export default OrderConfirmation;
