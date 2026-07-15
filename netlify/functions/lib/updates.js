const RIYADH_DEADLINE_UTC_HOUR = 13;
const RIYADH_DEADLINE_UTC_MINUTE = 15;

function getTodayRiyadhDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// Asia/Riyadh is UTC+3 year-round (no daylight saving), so 4:15pm Riyadh
// is always 13:15 UTC on the same calendar date.
function getDeadlineUtc(riyadhDate) {
  const hh = String(RIYADH_DEADLINE_UTC_HOUR).padStart(2, '0');
  const mm = String(RIYADH_DEADLINE_UTC_MINUTE).padStart(2, '0');
  return new Date(`${riyadhDate}T${hh}:${mm}:00.000Z`);
}

async function getTodayUpdates() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Server is missing Supabase configuration');
  }

  const riyadhDate = getTodayRiyadhDate();
  const deadlineUtc = getDeadlineUtc(riyadhDate);

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/updates?riyadh_date=eq.${riyadhDate}&order=created_at.asc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed to fetch updates: ${details}`);
  }

  const rows = await response.json();
  const updates = rows.map((row) => ({
    name: row.name,
    did: row.did,
    next: row.next,
    stuck: row.stuck,
    created_at: row.created_at,
    on_time: new Date(row.created_at).getTime() <= deadlineUtc.getTime(),
  }));

  return { riyadhDate, deadlineUtc, updates };
}

function getMissingNames(teamNames, updates) {
  const posted = new Set(updates.map((u) => u.name));
  return teamNames.filter((name) => !posted.has(name));
}

function formatRiyadhTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-US', {
    timeZone: 'Asia/Riyadh',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatRiyadhDateLabel(riyadhDate) {
  const [year, month, day] = riyadhDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

module.exports = {
  getTodayRiyadhDate,
  getDeadlineUtc,
  getTodayUpdates,
  getMissingNames,
  formatRiyadhTime,
  formatRiyadhDateLabel,
};
