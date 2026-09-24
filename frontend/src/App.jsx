import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./pages/Menu";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:restaurantId/:tableId" element={<Menu />} />

        <Route
          path="*"
          element={<Navigate to="/menu/6ab5319aebd9ab0d1f35b744/6ab531d5ebd9ab0d1f35b745" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;