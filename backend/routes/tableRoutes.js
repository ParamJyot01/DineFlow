const express = require("express");

const {
  createTable,
  getTables,
} = require("../controllers/tableController");

const router = express.Router();

router.post("/", createTable);
router.get("/", getTables);

module.exports = router;