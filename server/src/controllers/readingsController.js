const {
  listReadings,
  createReading,
  updateReading,
  deleteReading,
} = require('../services/readingsService');
const { httpError } = require('../utils/httpError');

function parseId(param) {
  if (!/^\d+$/.test(param)) {
    return null;
  }
  const id = Number(param);
  return Number.isSafeInteger(id) ? id : null;
}

async function list(req, res, next) {
  try {
    const readings = await listReadings(req.user.id, req.query.date);
    res.json(readings);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const reading = await createReading(req.user.id, req.body || {});
    res.status(201).json(reading);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw httpError(404, 'Reading not found.');
    }
    const reading = await updateReading(req.user.id, id, req.body || {});
    res.json(reading);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw httpError(404, 'Reading not found.');
    }
    await deleteReading(req.user.id, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
