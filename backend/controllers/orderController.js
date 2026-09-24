const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const { restaurant, table, items, paymentMethod } = req.body;

    if (!restaurant || !table || !items || items.length === 0) {
      return res.status(400).json({
        message: "Restaurant, table, and items are required",
      });
    }

    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      restaurant,
      table,
      items,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const { restaurantId, status } = req.query;

    const filter = {};

    if (restaurantId) {
      filter.restaurant = restaurantId;
    }

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("table", "tableNumber")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
};