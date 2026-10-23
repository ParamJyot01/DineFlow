
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const Food = require("../models/Food");

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { restaurant, table, items, paymentMethod } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(restaurant || "") ||
            !mongoose.Types.ObjectId.isValid(table || "")
        ) {
            return res.status(400).json({
                message: "A valid restaurant and table are required",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "At least one food item is required",
            });
        }

        if (
            paymentMethod !== undefined &&
            !["cash", "online"].includes(paymentMethod)
        ) {
            return res.status(400).json({
                message: "Payment method must be cash or online",
            });
        }

        const restaurantRecord = await Restaurant.findById(restaurant);

        if (!restaurantRecord) {
            return res.status(404).json({
                message: "Restaurant not found",
            });
        }

        const tableRecord = await Table.findOne({
            _id: table,
            restaurant,
            isActive: true,
        });

        if (!tableRecord) {
            return res.status(400).json({
                message:
                    "Table is invalid, inactive, or belongs to another restaurant",
            });
        }

        const quantitiesByFood = new Map();

        for (const item of items) {
            if (
                !item ||
                !mongoose.Types.ObjectId.isValid(item.food || "") ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                item.quantity > 99
            ) {
                return res.status(400).json({
                    message:
                        "Each item needs a valid food ID and quantity from 1 to 99",
                });
            }

            const foodId = item.food.toString();

            quantitiesByFood.set(
                foodId,
                (quantitiesByFood.get(foodId) || 0) + item.quantity
            );
        }

        const requestedItems = [];

        for (const [foodId, quantity] of quantitiesByFood) {
            if (quantity > 99) {
                return res.status(400).json({
                    message: "Maximum quantity per food item is 99",
                });
            }

            const food = await Food.findOne({
                _id: foodId,
                restaurant,
                isAvailable: true,
            });

            if (!food) {
                return res.status(400).json({
                    message:
                        "A food item is unavailable or belongs to another restaurant",
                    foodId,
                });
            }

            requestedItems.push({
                food: food._id,
                name: food.name,
                price: food.price,
                quantity,
            });
        }

        const totalAmount = requestedItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        const order = await Order.create({
            restaurant,
            table,
            items: requestedItems,
            totalAmount,
            paymentMethod: paymentMethod || "cash",
        });

        return res.status(201).json({
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            message: "Failed to create order",
            error: error.message,
        });
    }
};

// Get orders, optionally filtered by restaurant, table, and status
const getOrders = async (req, res) => {
    try {
        const { restaurantId, tableId, status } = req.query;
        const filter = {};

        if (restaurantId) {
            if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
                return res.status(400).json({
                    message: "Invalid restaurant ID",
                });
            }

            filter.restaurant = restaurantId;
        }

        if (tableId) {
            if (!mongoose.Types.ObjectId.isValid(tableId)) {
                return res.status(400).json({
                    message: "Invalid table ID",
                });
            }

            filter.table = tableId;
        }

        if (status) {
            const allowedStatuses = [
                "pending",
                "accepted",
                "preparing",
                "ready",
                "served",
                "cancelled",
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid order status",
                });
            }

            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate("table", "tableNumber")
            .populate("restaurant", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json(orders);
    } catch (error) {
        console.error("Get orders error:", error);

        return res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
};

// Get one order by its ID
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        const order = await Order.findById(orderId)
            .populate("table", "tableNumber")
            .populate("restaurant", "name");

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json(order);
    } catch (error) {
        console.error("Get order by ID error:", error);

        return res.status(500).json({
            message: "Failed to fetch order",
            error: error.message,
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
};
