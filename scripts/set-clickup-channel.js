// Switches which ClickUp channel the standup bot posts to.
// No Netlify deploy needed — this just updates a row in Supabase, and the
// functions read it fresh on every invocation.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/set-clickup-channel.js <workspace_id> <channel_id>

const [workspaceId, channelId] = process.argv.slice(2);

if (!workspaceId || !channelId) {
  console.error('Usage: node scripts/set-clickup-channel.js <workspace_id> <channel_id>');
  process.exit(1);
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables first.');
    process.exit(1);
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/clickup_settings?id=eq.1`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ workspace_id: workspaceId, channel_id: channelId, updated_at: new Date().toISOString() }),
  });

  if (!res.ok) {
    console.error('Failed:', res.status, await res.text());
    process.exit(1);
  }

  const rows = await res.json();
  console.log('Updated clickup_settings:', JSON.stringify(rows[0]));
}

main();
