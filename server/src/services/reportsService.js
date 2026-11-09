const pool = require('../db/pool');
const { httpError } = require('../utils/httpError');
const { dailyRange, monthToDateRange, monthlyRange } = require('../utils/dateRanges');
const { isRealDate, SLOT_LABELS } = require('../validation/readings');

function numberOrNull(value) {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

async function statsForRange(userId, from, to) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count,
            MIN(value)::int AS lowest,
            MAX(value)::int AS highest,
            ROUND(AVG(value)::numeric, 1) AS average
     FROM readings
     WHERE user_id = $1
       AND reading_date >= $2
       AND reading_date <= $3`,
    [userId, from, to]
  );

  const row = result.rows[0];
  return {
    count: row.count,
    highest: numberOrNull(row.highest),
    lowest: numberOrNull(row.lowest),
    average: numberOrNull(row.average),
  };
}

async function readingsForDay(userId, date) {
  const result = await pool.query(
    `SELECT id,
            to_char(reading_date, 'YYYY-MM-DD') AS date,
            slot,
            value
     FROM readings
     WHERE user_id = $1 AND reading_date = $2
     ORDER BY CASE slot
       WHEN 'morning_fasting' THEN 1
       WHEN 'after_breakfast' THEN 2
       WHEN 'after_lunch' THEN 3
       WHEN 'after_dinner' THEN 4
     END`,
    [userId, date]
  );

  return result.rows.map((row) => ({
    id: row.id,
    date: row.date,
    slot: row.slot,
    slotLabel: SLOT_LABELS[row.slot],
    value: Number(row.value),
  }));
}

async function buildReport(userId, date, rangeFor, label, includeReadings) {
  if (!isRealDate(date)) {
    throw httpError(400, 'Please select a valid date.');
  }

  const { from, to } = rangeFor(date);
  const stats = await statsForRange(userId, from, to);
  const report = { label, from, to, ...stats };

  // Only the daily report lists the individual readings.
  if (includeReadings) {
    report.readings = await readingsForDay(userId, date);
  }

  return report;
}

function dailyReport(userId, date) {
  return buildReport(userId, date, dailyRange, 'Daily', true);
}

function monthToDateReport(userId, date) {
  return buildReport(userId, date, monthToDateRange, 'Month to date', false);
}

function monthlyReport(userId, date) {
  return buildReport(userId, date, monthlyRange, 'Monthly', false);
}

module.exports = { dailyReport, monthToDateReport, monthlyReport };
