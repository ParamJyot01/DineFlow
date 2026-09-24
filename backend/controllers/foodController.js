const Food = require("../models/Food");

const createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);

    res.status(201).json({
      message: "Food item created successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create food item",
      error: error.message,
    });
  }
};

const getFoods = async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.query;

    const filter = {};

    if (restaurantId) {
      filter.restaurant = restaurantId;
    }

    if (categoryId) {
      filter.category = categoryId;
    }

    const foods = await Food.find(filter)
      .populate("category", "name")
      .sort({ displayOrder: 1 });

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch food items",
      error: error.message,
    });
  }
};

module.exports = {
  createFood,
  getFoods,
};