import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Menu() {
    const { restaurantId, tableId } = useParams();

    const [restaurant, setRestaurant] = useState(null);
    const [table, setTable] = useState(null);
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        fetch(`http://localhost:5000/api/restaurants/${restaurantId}`)
            .then((response) => response.json())
            .then((data) => {
                setRestaurant(data);
            })
            .catch((error) => {
                console.error("Failed to fetch restaurant:", error);
            });
        fetch(`http://localhost:5000/api/tables/${tableId}`)
            .then((response) => response.json())
            .then((data) => {
                setTable(data);
            })
            .catch((error) => {
                console.error("Failed to fetch table:", error);
            });
        fetch(
  `http://localhost:5000/api/foods?restaurantId=${restaurantId}`
)
            .then((response) => response.json())
            .then((data) => {
                setFoods(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch foods:", error);
                setLoading(false);
            });

        fetch(
            `http://localhost:5000/api/categories?restaurantId=${restaurantId}`
        )
            .then((response) => response.json())
            .then((data) => {
                setCategories(data);
            })
            .catch((error) => {
                console.error("Failed to fetch categories:", error);
            });
    }, [restaurantId]);

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
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item._id === foodId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

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
            <header className="menu-header">
                <div className="brand">
                    <h1>DineFlow</h1>
                    <span>Restaurant Menu</span>
                </div>

                <div className="header-actions">
                    <div className="cart-badge">
                        🛒 <span>{cartCount}</span>
                    </div>

<div className="table-badge">
  Table {table?.tableNumber || "..."}
</div>
                </div>
            </header>

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
                        className={`category-tab ${selectedCategory === "All" ? "active" : ""
                            }`}
                        onClick={() => setSelectedCategory("All")}
                    >
                        All
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category._id}
                            className={`category-tab ${selectedCategory === category.name ? "active" : ""
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
                            <div className="empty-icon">
                                🍽️
                            </div>

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

                {/* CART */}
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
                                {cartCount === 1
                                    ? "item"
                                    : "items"}
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

                                        <p>
                                            ₹{item.price} each
                                        </p>

                                    </div>

                                    <div className="cart-item-right">

                                        <div className="quantity-controls">

                                            <button
                                                onClick={() =>
                                                    decreaseQuantity(
                                                        item._id
                                                    )
                                                }
                                            >
                                                −
                                            </button>

                                            <span>
                                                {item.quantity}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    addToCart(item)
                                                }
                                            >
                                                +
                                            </button>

                                        </div>

                                        <strong>
                                            ₹
                                            {item.price *
                                                item.quantity}
                                        </strong>

                                    </div>

                                </div>
                            ))}

                        </div>

                        <div className="cart-total">

                            <span>Total</span>

                            <strong>
                                ₹{cartTotal}
                            </strong>

                        </div>

                        <button className="checkout-button">
                            Proceed to Checkout
                            <span>→</span>
                        </button>

                    </section>
                )}

            </main>

            {/* MOBILE CART */}
            {cart.length > 0 && (
                <div className="mobile-cart-bar">

                    <div>
                        <strong>
                            🛒 {cartCount} items
                        </strong>

                        <span>
                            ₹{cartTotal}
                        </span>
                    </div>

                    <button>
                        View Cart →
                    </button>

                </div>
            )}

        </div>
    );
}

export default Menu;