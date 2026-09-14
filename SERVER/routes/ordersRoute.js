const express = require("express");
const router = express.Router();
const controller = require('../controllers/ordersController');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const cors = require('cors');
router.use(cors({ origin: 'http://localhost:5173', credentials: true }));

router.get("/", async (req, res) => {
  try {
    const orders = await controller.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const order = await controller.getOrder(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error(`GET /orders/${id} error:`, err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId } = req.body;
    if (!date || !clientId || !dressId) return res.status(400).json({ success: false, message: 'Missing required fields: date, clientId, dressId' });
    const created = await controller.createOrder(date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId } = req.body;
    if (!clientId || !dressId) return res.status(400).json({ success: false, message: 'Missing required fields: clientId, dressId' });
    const updated = await controller.updateOrder(id, date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(`PUT /orders/${id} error:`, err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

router.delete("/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    const result = await controller.deleteOrder(orderId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(`DELETE /orders/${orderId} error:`, err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;
