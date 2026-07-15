const { getTodayUpdates, getMissingNames, formatRiyadhTime, formatRiyadhDateLabel } = require('./lib/updates');
const { TEAM_NAMES } = require('./lib/roster');
const { postToClickUp } = require('./lib/clickup');

function buildSummaryMessage({ riyadhDate, updates, missing }) {
  const lines = [`**Trellis Standup — ${formatRiyadhDateLabel(riyadhDate)}**`, ''];

  if (updates.length === 0) {
    lines.push('_No one has posted an update today._');
  } else {
    updates.forEach((u) => {
      const tag = u.on_time ? '✅' : '⚠️ Late';
      lines.push(`**${u.name}** ${tag} — ${formatRiyadhTime(u.created_at)}`);
      lines.push(`Did: ${u.did}`);
      lines.push(`Next: ${u.next}`);
      lines.push(`Stuck: ${u.stuck || 'Nothing noted.'}`);
      lines.push('');
    });
  }

  if (missing.length > 0) {
    lines.push(`🚫 **Not posted:** ${missing.join(', ')}`);
  }

  return lines.join('\n').trim();
}

exports.handler = async () => {
  try {
    const { riyadhDate, updates } = await getTodayUpdates();
    const missing = getMissingNames(TEAM_NAMES, updates);
    const message = buildSummaryMessage({ riyadhDate, updates, missing });

    await postToClickUp(message);

    return { statusCode: 200, body: JSON.stringify({ ok: true, message }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
