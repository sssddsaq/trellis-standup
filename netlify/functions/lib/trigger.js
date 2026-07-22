// Scheduled invocations come from Netlify's scheduler as a POST with an
// X-NF-Event: schedule header and a JSON body carrying next_run. Anything
// else must present the manual trigger key (?key=...), so strangers who find
// the function URLs can't make the bot spam the ClickUp channel.
function isAuthorizedTrigger(event) {
  const headers = event.headers || {};
  for (const headerName of Object.keys(headers)) {
    if (
      headerName.toLowerCase() === 'x-nf-event' &&
      String(headers[headerName]).toLowerCase() === 'schedule'
    ) {
      return true;
    }
  }

  let raw = event.body;
  if (event.isBase64Encoded && raw) {
    raw = Buffer.from(raw, 'base64').toString('utf8');
  }
  if (event.httpMethod === 'POST' && raw) {
    try {
      const body = JSON.parse(raw);
      if (body && body.next_run) return true;
    } catch {
      // fall through, not a scheduler payload
    }
  }

  const key = process.env.TRIGGER_KEY;
  const given = event.queryStringParameters && event.queryStringParameters.key;
  return Boolean(key && given && given === key);
}

module.exports = { isAuthorizedTrigger };
