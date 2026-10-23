
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "dineflow-cart";

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(STORAGE_KEY);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error("Could not save cart:", error);
        }
    }, [cart]);

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

    const increaseQuantity = (foodId) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item._id === foodId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
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

    const removeFromCart = (foodId) => {
        setCart((currentCart) =>
            currentCart.filter((item) => item._id !== foodId)
        );
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartTotal = cart.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart,
                clearCart,
                cartCount,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}
