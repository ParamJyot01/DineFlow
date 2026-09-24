const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
const restaurantRoutes = require("./routes/restaurantRoutes");

app.use("/api/restaurants", restaurantRoutes);
const categoryRoutes = require("./routes/categoryRoutes");

app.use("/api/categories", categoryRoutes);
const foodRoutes = require("./routes/foodRoutes");

app.use("/api/foods", foodRoutes);
const tableRoutes = require("./routes/tableRoutes");

app.use("/api/tables", tableRoutes);
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "DineFlow API is running",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});