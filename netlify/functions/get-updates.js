exports.handler = async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing Supabase configuration' }) };
  }

  const todayRiyadh = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/updates?riyadh_date=eq.${todayRiyadh}&order=created_at.asc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to fetch updates', details }) };
  }

  const rows = await response.json();

  // Asia/Riyadh is UTC+3 year-round (no daylight saving), so 16:15 Riyadh
  // is always 13:15 UTC on the same calendar date.
  const cutoffUtc = new Date(`${todayRiyadh}T13:15:00.000Z`);

  const updates = rows.map((row) => ({
    name: row.name,
    did: row.did,
    next: row.next,
    stuck: row.stuck,
    created_at: row.created_at,
    on_time: new Date(row.created_at).getTime() <= cutoffUtc.getTime(),
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: todayRiyadh, cutoff_utc: cutoffUtc.toISOString(), updates }),
  };
};
