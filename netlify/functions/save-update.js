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

  const name = (payload.name || '').trim();
  const did = (payload.did || '').trim();
  const next = (payload.next || '').trim();
  const stuck = (payload.stuck || '').trim();

  if (!name || !did || !next) {
    return { statusCode: 400, body: JSON.stringify({ error: 'name, did, and next are required' }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing Supabase configuration' }) };
  }

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
