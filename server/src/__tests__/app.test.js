const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../app');
const pool = require('../db/pool');
const { todayInKolkata } = require('../utils/dates');
const { dailyRange, monthToDateRange, monthlyRange } = require('../utils/dateRanges');

function addDays(iso, days) {
  const [year, month, day] = iso.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

beforeAll(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  await pool.query(sql);
});

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE readings, users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});

async function register() {
  const response = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password1',
  });

  expect(response.status).toBe(201);
  return response.body.token;
}

function postReading(token, body) {
  return request(app)
    .post('/api/readings')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

test('rejects glucose values 39 and 601', async () => {
  const token = await register();
  const date = addDays(todayInKolkata(), -1);

  for (const value of [39, 601]) {
    const response = await postReading(token, { date, slot: 'morning_fasting', value });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Value must be between 40 and 600 mg/dl.' });
  }
});

test('rejects a duplicate slot on the same day', async () => {
  const token = await register();
  const date = addDays(todayInKolkata(), -1);
  const body = { date, slot: 'after_lunch', value: 120 };

  const first = await postReading(token, body);
  expect(first.status).toBe(201);

  const second = await postReading(token, body);
  expect(second.status).toBe(400);
  expect(second.body).toEqual({
    error: 'You already have an After lunch reading for this date.',
  });
});

test('rejects a 5th reading in one day with the max-4 message', async () => {
  const token = await register();
  const date = addDays(todayInKolkata(), -1);
  const slots = ['morning_fasting', 'after_breakfast', 'after_lunch', 'after_dinner'];

  for (const slot of slots) {
    const response = await postReading(token, { date, slot, value: 110 });
    expect(response.status).toBe(201);
  }

  // All 4 slots are taken, so this is also a duplicate. Max-4 must win.
  const fifth = await postReading(token, { date, slot: 'morning_fasting', value: 130 });
  expect(fifth.status).toBe(400);
  expect(fifth.body).toEqual({ error: 'You can add only 4 readings per day.' });
});

test('rejects a future date', async () => {
  const token = await register();
  const tomorrow = addDays(todayInKolkata(), 1);

  const response = await postReading(token, {
    date: tomorrow,
    slot: 'morning_fasting',
    value: 100,
  });

  expect(response.status).toBe(400);
  expect(response.body).toEqual({ error: 'Date cannot be in the future.' });
});

test('builds date ranges, including January, and rounds the average to 1 decimal', async () => {
  expect(dailyRange('2026-10-15')).toEqual({ from: '2026-10-15', to: '2026-10-15' });
  expect(monthToDateRange('2026-10-15')).toEqual({ from: '2026-10-01', to: '2026-10-15' });
  expect(monthlyRange('2026-10-15')).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  // January rolls back to December of the previous year.
  expect(monthlyRange('2026-01-15')).toEqual({ from: '2025-12-01', to: '2025-12-31' });

  const token = await register();
  const date = addDays(todayInKolkata(), -1);
  // 40, 50 and 62 average 50.666..., which rounds to 50.7.
  const values = [
    ['morning_fasting', 40],
    ['after_breakfast', 50],
    ['after_lunch', 62],
  ];

  for (const [slot, value] of values) {
    const created = await postReading(token, { date, slot, value });
    expect(created.status).toBe(201);
  }

  const report = await request(app)
    .get('/api/reports/daily')
    .query({ date })
    .set('Authorization', `Bearer ${token}`);

  expect(report.status).toBe(200);
  expect(report.body.count).toBe(3);
  expect(report.body.lowest).toBe(40);
  expect(report.body.highest).toBe(62);
  expect(report.body.average).toBe(50.7);
});
