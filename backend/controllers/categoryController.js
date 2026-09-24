const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    const filter = restaurantId
      ? { restaurant: restaurantId }
      : {};

    const categories = await Category.find(filter).sort({
      displayOrder: 1,
    });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
};