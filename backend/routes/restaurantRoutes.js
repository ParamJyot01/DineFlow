const express = require("express");

const {
  createRestaurant,
  getRestaurants,
} = require("../controllers/restaurantController");

const router = express.Router();

router.post("/", createRestaurant);
router.get("/", getRestaurants);

module.exports = router;