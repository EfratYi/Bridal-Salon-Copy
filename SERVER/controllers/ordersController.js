const model = require('../model/ordersModel');

async function getAllOrders() {
  try {
    return await model.getOrders();
  } catch (err) {
    throw err;
  }
}

async function getOrder(id) {
  try {
    return await model.getOrder(id);
  } catch (err) {
    throw err;
  }
}

async function getOrdersOfClient(userId) {
  try {
    return await model.getOrdersOfClient(userId);
  } catch (err) {
    throw err;
  }
}

async function createOrder(date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId) {
  try {
    const created = await model.createOrder(date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId);
    return created;
  } catch (err) {
    throw err;
  }
}

async function updateOrder(id, date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId) {
  try {
    const updated = await model.updateOrder(id, date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId);
    return updated;
  } catch (err) {
    throw err;
  }
}

async function deleteOrder(id) {
  try {
    const result = await model.deleteOrder(id);
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = { getAllOrders, getOrder, getOrdersOfClient, createOrder, updateOrder, deleteOrder };
