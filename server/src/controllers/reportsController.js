const {
  dailyReport,
  monthToDateReport,
  monthlyReport,
} = require('../services/reportsService');

async function daily(req, res, next) {
  try {
    const report = await dailyReport(req.user.id, req.query.date);
    res.json(report);
  } catch (err) {
    next(err);
  }
}

async function monthToDate(req, res, next) {
  try {
    const report = await monthToDateReport(req.user.id, req.query.date);
    res.json(report);
  } catch (err) {
    next(err);
  }
}

async function monthly(req, res, next) {
  try {
    const report = await monthlyReport(req.user.id, req.query.date);
    res.json(report);
  } catch (err) {
    next(err);
  }
}

module.exports = { daily, monthToDate, monthly };
