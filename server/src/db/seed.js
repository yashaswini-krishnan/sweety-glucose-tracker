require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./pool');
const { todayInKolkata } = require('../utils/dates');
const { monthToDateRange, monthlyRange } = require('../utils/dateRanges');

const DEMO_EMAIL = 'demo@sweety.com';
const DEMO_PASSWORD = 'Demo@1234';

// A few realistic days. Never more than 4 readings, and every value is inside 40-600.
const DAY_PLANS = [
  [
    ['morning_fasting', 96],
    ['after_breakfast', 142],
    ['after_lunch', 128],
    ['after_dinner', 151],
  ],
  [
    ['morning_fasting', 104],
    ['after_lunch', 167],
  ],
  [
    ['morning_fasting', 91],
    ['after_breakfast', 138],
    ['after_dinner', 149],
  ],
];

function addDays(iso, days) {
  const [year, month, day] = iso.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

// First day, a day in the middle, and the last day. One day is enough when the range is short.
function sampleDates(from, to) {
  if (from === to) {
    return [from];
  }

  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const span = Math.round((end - start) / (24 * 60 * 60 * 1000));
  const middle = addDays(from, Math.floor(span / 2));

  return [...new Set([from, middle, to])].sort();
}

async function seed() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Updating the existing row keeps the same login working on a second run.
  const user = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash
     RETURNING id`,
    ['Demo User', DEMO_EMAIL, passwordHash]
  );
  const userId = user.rows[0].id;

  // Replace only this user's readings, then insert a fresh set.
  await pool.query('DELETE FROM readings WHERE user_id = $1', [userId]);

  const today = todayInKolkata();
  const currentMonth = monthToDateRange(today);
  const previousMonth = monthlyRange(today);
  const dates = [
    ...sampleDates(previousMonth.from, previousMonth.to),
    ...sampleDates(currentMonth.from, currentMonth.to),
  ];

  for (let index = 0; index < dates.length; index += 1) {
    const plan = DAY_PLANS[index % DAY_PLANS.length];

    for (const [slot, value] of plan) {
      await pool.query(
        `INSERT INTO readings (user_id, reading_date, slot, value)
         VALUES ($1, $2, $3, $4)`,
        [userId, dates[index], slot, value]
      );
    }
  }

  console.log(`Seeded ${DEMO_EMAIL} / ${DEMO_PASSWORD} with ${dates.length} days of readings.`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
