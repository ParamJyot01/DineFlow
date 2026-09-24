const express = require("express");

const {
  createFood,
  getFoods,
} = require("../controllers/foodController");

const router = express.Router();

router.post("/", createFood);
router.get("/", getFoods);

module.exports = router;