const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const testUrl = process.env.TEST_DATABASE_URL;
const devUrl = process.env.DATABASE_URL;

if (!testUrl) {
  throw new Error('Set TEST_DATABASE_URL in server/.env before running tests.');
}

// Tests wipe the tables. Never let that run against the development database.
if (databaseName(testUrl) === databaseName(devUrl)) {
  throw new Error('TEST_DATABASE_URL must point at a different database than DATABASE_URL.');
}

// pool.js reads DATABASE_URL. This changes it for the test process only.
process.env.DATABASE_URL = testUrl;

function databaseName(url) {
  return new URL(url).pathname.replace(/^\//, '');
}
