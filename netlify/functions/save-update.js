const { TEAM_NAMES } = require('./lib/roster');

const MAX_FIELD_LENGTH = 2000;

function cleanField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }
  if (!payload || typeof payload !== 'object') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const name = cleanField(payload.name);
  const did = cleanField(payload.did);
  const next = cleanField(payload.next);
  const stuck = cleanField(payload.stuck);

  if (!name || !did || !next) {
    return { statusCode: 400, body: JSON.stringify({ error: 'name, did, and next are required' }) };
  }
  if (!TEAM_NAMES.includes(name)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'That name is not on the team roster' }) };
  }
  if (did.length > MAX_FIELD_LENGTH || next.length > MAX_FIELD_LENGTH || stuck.length > MAX_FIELD_LENGTH) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Each field must be ${MAX_FIELD_LENGTH} characters or fewer` }),
    };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing Supabase configuration' }) };
  }

  // Upsert: one row per person per Riyadh day. On resubmit, the text fields
  // are replaced but created_at keeps the first submission time, editing an
  // update later never changes whether it counted as on time.
  const response = await fetch(`${SUPABASE_URL}/rest/v1/updates?on_conflict=name,riyadh_date`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([{ name, did, next, stuck: stuck || null }]),
  });

  if (!response.ok) {
    const details = await response.text();
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to save update', details }) };
  }

  const rows = await response.json();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, row: rows[0] }),
  };
};
