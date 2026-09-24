const QRCode = require("qrcode");

const generateTableQR = async (restaurantId, tableId) => {
  const menuUrl = `http://localhost:5173/menu/${restaurantId}/${tableId}`;

  const qrCode = await QRCode.toDataURL(menuUrl);

  return qrCode;
};

module.exports = generateTableQR;