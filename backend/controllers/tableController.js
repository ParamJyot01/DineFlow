const Table = require("../models/Table");
const generateTableQR = require("../utils/qrGenerator");

const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);

    const qrCode = await generateTableQR(
      table.restaurant,
      table._id
    );

    table.qrCode = qrCode;
    await table.save();

    res.status(201).json({
      message: "Table created successfully",
      table,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create table",
      error: error.message,
    });
  }
};

const getTables = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    const filter = restaurantId
      ? { restaurant: restaurantId }
      : {};

    const tables = await Table.find(filter).sort({
      tableNumber: 1,
    });

    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tables",
      error: error.message,
    });
  }
};

module.exports = {
  createTable,
  getTables,
};