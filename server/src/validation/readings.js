const { httpError } = require('../utils/httpError');

// Stored code -> the words we use in error messages.
const SLOT_LABELS = {
  morning_fasting: 'Morning (fasting)',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner',
};

function isRealDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  // Build the date in UTC so a local timezone cannot shift the day.
  const utc = new Date(Date.UTC(year, month - 1, day));
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
}

function isKnownSlot(slot) {
  return typeof slot === 'string' && Object.hasOwn(SLOT_LABELS, slot);
}

function articleFor(label) {
  const match = label.trim().match(/[A-Za-z]/);
  const letter = match ? match[0].toLowerCase() : '';
  return ['a', 'e', 'i', 'o', 'u'].includes(letter) ? 'an' : 'a';
}

function duplicateSlotMessage(slot) {
  const label = SLOT_LABELS[slot] || 'reading';
  return `You already have ${articleFor(label)} ${label} reading for this date.`;
}

// Order is fixed: required, range, date, future date, slot, max 4, duplicate slot.
// context.today is YYYY-MM-DD in Asia/Kolkata.
// context.count is how many other readings this user already has on that date.
// context.slotTaken is true when another reading already uses this slot.
// context.dateChanged is false when an edit keeps the same date (skip the max-4 check).
function validateReading(body, context) {
  const source = body || {};
  const { value, date, slot } = source;

  if (value === undefined || value === null || value === '') {
    throw httpError(400, 'Please enter a glucose value.');
  }

  // Reject text and decimals. JSON "120" is a string, 120.5 is not a whole number.
  const wholeNumber = typeof value === 'number' && Number.isInteger(value);
  if (!wholeNumber || value < 40 || value > 600) {
    throw httpError(400, 'Value must be between 40 and 600 mg/dl.');
  }

  if (!isRealDate(date)) {
    throw httpError(400, 'Please select a valid date.');
  }

  if (date > context.today) {
    throw httpError(400, 'Date cannot be in the future.');
  }

  if (!isKnownSlot(slot)) {
    throw httpError(400, 'Please choose a valid time slot.');
  }

  const dateChanged = context.dateChanged !== false;
  if (dateChanged && context.count >= 4) {
    throw httpError(400, 'You can add only 4 readings per day.');
  }

  if (context.slotTaken) {
    throw httpError(400, duplicateSlotMessage(slot));
  }

  return { date, slot, value };
}

module.exports = {
  SLOT_LABELS,
  isRealDate,
  isKnownSlot,
  duplicateSlotMessage,
  validateReading,
};
