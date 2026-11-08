const pool = require('../db/pool');
const { httpError } = require('../utils/httpError');
const { todayInKolkata } = require('../utils/dates');
const {
  isRealDate,
  isKnownSlot,
  duplicateSlotMessage,
  validateReading,
} = require('../validation/readings');

// to_char keeps the date as YYYY-MM-DD. node-pg would otherwise turn it into a Date.
const READING_SQL = `id, to_char(reading_date, 'YYYY-MM-DD') AS date, slot, value`;

function toReading(row) {
  return {
    id: row.id,
    date: row.date,
    slot: row.slot,
    value: Number(row.value),
  };
}

async function countOnDate(userId, date, ignoreId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM readings
     WHERE user_id = $1
       AND reading_date = $2
       AND ($3::int IS NULL OR id <> $3)`,
    [userId, date, ignoreId]
  );
  return result.rows[0].count;
}

async function slotIsTaken(userId, date, slot, ignoreId) {
  const result = await pool.query(
    `SELECT id
     FROM readings
     WHERE user_id = $1
       AND reading_date = $2
       AND slot = $3
       AND ($4::int IS NULL OR id <> $4)
     LIMIT 1`,
    [userId, date, slot, ignoreId]
  );
  return result.rows.length > 0;
}

// Load the counts the validator needs. Skip the queries when date or slot is not usable yet.
async function ruleContext(userId, body, ignoreId, currentDate) {
  const date = body && body.date;
  const slot = body && body.slot;

  if (!isRealDate(date) || !isKnownSlot(slot)) {
    return { dateChanged: true, count: 0, slotTaken: false };
  }

  const dateChanged = currentDate ? currentDate !== date : true;
  const slotTaken = await slotIsTaken(userId, date, slot, ignoreId);

  // Max 4 is only checked when this save would put a reading on a new day.
  if (!dateChanged) {
    return { dateChanged: false, count: 0, slotTaken };
  }

  const count = await countOnDate(userId, date, ignoreId);
  return { dateChanged: true, count, slotTaken };
}

async function findOwned(userId, id) {
  const result = await pool.query(
    `SELECT ${READING_SQL}
     FROM readings
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] ? toReading(result.rows[0]) : null;
}

async function listReadings(userId, date) {
  if (date !== undefined) {
    if (!isRealDate(date)) {
      throw httpError(400, 'Please select a valid date.');
    }

    const result = await pool.query(
      `SELECT ${READING_SQL}
       FROM readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY reading_date DESC, id DESC`,
      [userId, date]
    );
    return result.rows.map(toReading);
  }

  const result = await pool.query(
    `SELECT ${READING_SQL}
     FROM readings
     WHERE user_id = $1
     ORDER BY reading_date DESC, id DESC`,
    [userId]
  );
  return result.rows.map(toReading);
}

async function createReading(userId, body) {
  const today = todayInKolkata();
  const context = await ruleContext(userId, body, null, null);
  const fields = validateReading(body, { today, ...context });

  try {
    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING ${READING_SQL}`,
      [userId, fields.date, fields.slot, fields.value]
    );
    return toReading(result.rows[0]);
  } catch (err) {
    // Another request took this slot between the check and the insert.
    if (err.code === '23505') {
      throw httpError(400, duplicateSlotMessage(fields.slot));
    }
    throw err;
  }
}

async function updateReading(userId, id, body) {
  const existing = await findOwned(userId, id);
  if (!existing) {
    throw httpError(404, 'Reading not found.');
  }

  const today = todayInKolkata();
  const context = await ruleContext(userId, body, existing.id, existing.date);
  const fields = validateReading(body, { today, ...context });

  try {
    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1, slot = $2, value = $3
       WHERE id = $4 AND user_id = $5
       RETURNING ${READING_SQL}`,
      [fields.date, fields.slot, fields.value, existing.id, userId]
    );

    if (!result.rows[0]) {
      throw httpError(404, 'Reading not found.');
    }
    return toReading(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      throw httpError(400, duplicateSlotMessage(fields.slot));
    }
    throw err;
  }
}

async function deleteReading(userId, id) {
  const result = await pool.query(
    `DELETE FROM readings
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId]
  );

  if (!result.rows[0]) {
    throw httpError(404, 'Reading not found.');
  }
}

module.exports = {
  listReadings,
  createReading,
  updateReading,
  deleteReading,
};
