// All functions take a valid YYYY-MM-DD string and return { from, to }.
// They compare calendar dates only. They do not look at the clock.

function parts(date) {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

function iso(year, month, day) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

function dailyRange(date) {
  return { from: date, to: date };
}

// 1st of the selected month through the selected date. 15 Oct -> 1 Oct to 15 Oct.
function monthToDateRange(date) {
  const { year, month } = parts(date);
  return { from: iso(year, month, 1), to: date };
}

// The whole previous month. 15 Oct -> 1 Sep to 30 Sep. 15 Jan -> 1 Dec to 31 Dec of the previous year.
function monthlyRange(date) {
  const { year, month } = parts(date);
  let previousYear = year;
  let previousMonth = month - 1;

  if (previousMonth === 0) {
    previousMonth = 12;
    previousYear = year - 1;
  }

  // Day 0 of the next month is the last day of previousMonth.
  // previousMonth is 1-12, which is the JS month index of the month after it.
  const lastDay = new Date(Date.UTC(previousYear, previousMonth, 0)).getUTCDate();

  return {
    from: iso(previousYear, previousMonth, 1),
    to: iso(previousYear, previousMonth, lastDay),
  };
}

module.exports = { dailyRange, monthToDateRange, monthlyRange };
