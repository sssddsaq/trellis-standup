const { getTodayUpdates } = require('./lib/updates');

exports.handler = async () => {
  try {
    const { riyadhDate, deadlineUtc, updates } = await getTodayUpdates();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: riyadhDate, cutoff_utc: deadlineUtc.toISOString(), updates }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
