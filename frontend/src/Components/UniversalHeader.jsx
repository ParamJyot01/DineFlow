import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

function UniversalHeader({ activePage }) {
    const { restaurantId, tableId } = useParams();
    const { cartCount } = useCart();
    const [tableLabel, setTableLabel] = useState("Table");

    useEffect(() => {
        let cancelled = false;

        const loadTable = async () => {
            if (!tableId) return;
            try {
                const response = await fetch(`http://localhost:5000/api/tables/${tableId}`);
                if (!response.ok) return;
                const data = await response.json();
                const table = data?.table || data;
                const label = table?.tableNumber ?? table?.number ?? table?.name;
                if (!cancelled && label !== undefined && label !== null && String(label).trim()) {
                    setTableLabel(`Table ${label}`);
                }
            } catch (error) {
                // Keep the generic table label if the table endpoint is unavailable.
                console.error("Could not load table details for header:", error);
            }
        };

        loadTable();
        return () => {
            cancelled = true;
        };
    }, [tableId]);

    const menuPath = restaurantId && tableId ? `/menu/${restaurantId}/${tableId}` : "/";
    const cartPath = restaurantId && tableId ? `/cart/${restaurantId}/${tableId}` : "/";
    const ordersPath = restaurantId && tableId ? `/active-orders/${restaurantId}/${tableId}` : "/";

    return (
        <header className="df-header">
            <Link className="df-brand" to={menuPath} aria-label="DineFlow home">
                <span className="df-brand-name">DineFlow<span className="df-brand-period">.</span></span>
                <span className="df-brand-subtitle">Restaurant ordering</span>
            </Link>

            <div className="df-header-right">
                <span className="df-table-badge" aria-label={tableLabel}>
                    <span aria-hidden="true">▦</span> {tableLabel}
                </span>
                <nav className="df-navigation" aria-label="Main navigation">
                    <Link className={`df-nav-link ${activePage === "menu" ? "df-nav-active" : ""}`} to={menuPath} aria-current={activePage === "menu" ? "page" : undefined}>
                        Menu
                    </Link>
                    <Link className={`df-nav-link ${activePage === "cart" ? "df-nav-active" : ""}`} to={cartPath} aria-current={activePage === "cart" ? "page" : undefined}>
                        Cart <span className="df-nav-count">{cartCount}</span>
                    </Link>
                    <Link className={`df-nav-link ${activePage === "activeOrders" ? "df-nav-active" : ""}`} to={ordersPath} aria-current={activePage === "activeOrders" ? "page" : undefined}>
                        Active Orders
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default UniversalHeader;
