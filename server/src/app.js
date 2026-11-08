const express = require('express');
const cors = require('cors');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');

const app = express();

// The Vite dev server runs on port 5173.
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// Central handler. Controllers pass errors with next(err).
// Set err.status for 400, 401, 404, or 409. Anything else is a 500.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong.' : err.message;
  res.status(status).json({ error: message });
});

module.exports = app;
