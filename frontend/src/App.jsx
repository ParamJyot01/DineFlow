
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import ActiveOrders from "./pages/ActiveOrders";
import OrderConfirmation from "./pages/OrderConfirmation";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <CartProvider>
                <Routes>
                    <Route
                        path="/menu/:restaurantId/:tableId"
                        element={<Menu />}
                    />

                    <Route
                        path="/cart/:restaurantId/:tableId"
                        element={<Cart />}
                    />

                    <Route
                        path="/active-orders/:restaurantId/:tableId"
                        element={<ActiveOrders />}
                    />

                    <Route
                        path="/order-confirmation/:orderId"
                        element={<OrderConfirmation />}
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate to="/menu/6ab5319aebd9ab0d1f35b744/6ab531d5ebd9ab0d1f35b745" />
                        }
                    />
                </Routes>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;
