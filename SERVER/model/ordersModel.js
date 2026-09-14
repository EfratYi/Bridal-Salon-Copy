const pool = require('../DB.js');

// Orders model with transactions and input validation

async function getOrders() {
  try {
    const sql = `
      SELECT o.id, u.name, u.userId, d.model, c.weddingDate, o.returnDate
      FROM orders o
      JOIN clients c ON o.clientId = c.id
      JOIN users u ON c.userId = u.id
      JOIN dresses d ON o.dressId = d.id
      ORDER BY o.id DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  } catch (err) {
    throw err;
  }
}

async function getOrder(id) {
  try {
    const sql = `
      SELECT
        o.id,
        u.userId,
        u.name,
        u.phone1,
        u.phone2,
        u.email,
        c.weddingDate,
        o.date,
        o.returnDate,
        d.model,
        o.repairs,
        o.paidInAdvance,
        GROUP_CONCAT(a.type SEPARATOR ', ') AS accessories
      FROM orders o
      JOIN clients c ON o.clientId = c.id
      JOIN users u ON c.userId = u.id
      JOIN dresses d ON o.dressId = d.id
      LEFT JOIN accessoriesInOrder aio ON o.id = aio.orderId
      LEFT JOIN accessories a ON aio.accessoryId = a.id
      WHERE o.id = ?
      GROUP BY o.id, u.userId, u.name, u.phone1, u.phone2, u.email, c.weddingDate, o.date, o.returnDate, d.model, o.repairs, o.paidInAdvance
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    throw err;
  }
}

async function getOrdersOfClient(userId) {
  try {
    const sql = `
      SELECT
        o.id,
        u.userId,
        u.name,
        u.phone1,
        u.phone2,
        u.email,
        c.weddingDate,
        o.date,
        o.returnDate,
        d.model,
        o.repairs,
        o.paidInAdvance,
        GROUP_CONCAT(a.type SEPARATOR ', ') AS accessories
      FROM orders o
      JOIN clients c ON o.clientId = c.id
      JOIN users u ON c.userId = u.id
      JOIN dresses d ON o.dressId = d.id
      LEFT JOIN accessoriesInOrder aio ON o.id = aio.orderId
      LEFT JOIN accessories a ON aio.accessoryId = a.id
      WHERE u.userId = ?
      GROUP BY o.id, u.userId, u.name, u.phone1, u.phone2, u.email, c.weddingDate, o.date, o.returnDate, d.model, o.repairs, o.paidInAdvance
      ORDER BY o.date DESC
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows;
  } catch (err) {
    throw err;
  }
}

async function createOrder(date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Validate client exists
    const [clientRows] = await conn.query('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (clientRows.length === 0) {
      throw new Error('Client not found');
    }

    // Validate dress exists
    const [dressRows] = await conn.query('SELECT id FROM dresses WHERE id = ?', [dressId]);
    if (dressRows.length === 0) {
      throw new Error('Dress not found');
    }

    const sql = 'INSERT INTO orders (`date`, `returnDate`, clientId, dressId, repairs, paidInAdvance) VALUES (?,?,?,?,?,?)';
    const [resultOrder] = await conn.query(sql, [date, returnDate, clientId, dressId, repairs, paidInAdvance]);
    const orderId = resultOrder.insertId;

    if (accessoriesId && Array.isArray(accessoriesId) && accessoriesId.length > 0) {
      const sqlAccessories = 'INSERT INTO accessoriesInOrder (orderId, accessoryId) VALUES (?,?)';
      for (let i = 0; i < accessoriesId.length; i++) {
        await conn.query(sqlAccessories, [orderId, accessoriesId[i]]);
      }
    }

    // update dress uses count
    await conn.query('UPDATE dresses SET uses = COALESCE(uses,0) + 1 WHERE id = ?', [dressId]);

    await conn.commit();

    // return the created order (fresh from DB)
    const created = await getOrder(orderId);
    return created;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function updateOrder(id, date, returnDate, clientId, dressId, repairs, paidInAdvance, accessoriesId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ensure order exists
    const [existingRows] = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      throw new Error('Order not found');
    }
    const existingOrder = existingRows[0];
    const oldDressId = existingOrder.dressId;

    // validate client and dress
    const [clientRows] = await conn.query('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (clientRows.length === 0) throw new Error('Client not found');
    const [dressRows] = await conn.query('SELECT id FROM dresses WHERE id = ?', [dressId]);
    if (dressRows.length === 0) throw new Error('Dress not found');

    // if dress changed, update uses counters
    if (oldDressId !== dressId) {
      // decrement old
      await conn.query('UPDATE dresses SET uses = GREATEST(COALESCE(uses,0) - 1, 0) WHERE id = ?', [oldDressId]);
      // increment new
      await conn.query('UPDATE dresses SET uses = COALESCE(uses,0) + 1 WHERE id = ?', [dressId]);
    }

    // update accessories: remove old then insert new
    await conn.query('DELETE FROM accessoriesInOrder WHERE orderId = ?', [id]);
    if (accessoriesId && Array.isArray(accessoriesId) && accessoriesId.length > 0) {
      const sqlInsertAccessories = 'INSERT INTO accessoriesInOrder (orderId, accessoryId) VALUES (?,?)';
      for (let i = 0; i < accessoriesId.length; i++) {
        await conn.query(sqlInsertAccessories, [id, accessoriesId[i]]);
      }
    }

    const sql = 'UPDATE orders SET `date` = ?, `returnDate` = ?, `clientId` = ?, `dressId` = ?, `repairs` = ?, `paidInAdvance` = ? WHERE id = ?';
    await conn.query(sql, [date, returnDate, clientId, dressId, repairs, paidInAdvance, id]);

    await conn.commit();

    const updated = await getOrder(id);
    return updated;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deleteOrder(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT dressId FROM orders WHERE id = ?', [id]);
    if (rows.length === 0) throw new Error('Order not found');
    const dressId = rows[0].dressId;

    await conn.query('DELETE FROM accessoriesInOrder WHERE orderId = ?', [id]);
    await conn.query('DELETE FROM orders WHERE id = ?', [id]);

    // decrement dress uses
    if (dressId) {
      await conn.query('UPDATE dresses SET uses = GREATEST(COALESCE(uses,0) - 1, 0) WHERE id = ?', [dressId]);
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { createOrder, getOrders, getOrder, updateOrder, deleteOrder, getOrdersOfClient };
