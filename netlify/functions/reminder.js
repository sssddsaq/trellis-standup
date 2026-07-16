const { getTodayUpdates, getMissingNames } = require('./lib/updates');
const { TEAM_NAMES } = require('./lib/roster');
const { postToClickUp } = require('./lib/clickup');
const { isAuthorizedTrigger } = require('./lib/trigger');

exports.handler = async (event) => {
  if (!isAuthorizedTrigger(event)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized' }) };
  }

  try {
    const { updates } = await getTodayUpdates();
    const missing = getMissingNames(TEAM_NAMES, updates);

    if (missing.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, message: 'Everyone has posted, no reminder sent.' }) };
    }

    const verb = missing.length === 1 ? "hasn't" : "haven't";
    const message = `⏰ Reminder: ${missing.join(', ')} still ${verb} posted today's standup update.`;

    await postToClickUp(message);

    return { statusCode: 200, body: JSON.stringify({ ok: true, message }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
