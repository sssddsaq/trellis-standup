// Workspace/channel come from the clickup_settings table when possible, so
// switching where the bot posts is a database update, not a deploy. Falls
// back to env vars if the table isn't reachable or doesn't have a row yet.
async function getChannelTarget() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/clickup_settings?id=eq.1&select=workspace_id,channel_id`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows[0] && rows[0].workspace_id && rows[0].channel_id) {
          return { workspaceId: rows[0].workspace_id, channelId: rows[0].channel_id };
        }
      }
    } catch {
      // fall through to env vars
    }
  }

  return {
    workspaceId: process.env.CLICKUP_WORKSPACE_ID || null,
    channelId: process.env.CLICKUP_CHANNEL_ID || null,
  };
}

async function postToClickUp(message) {
  const token = process.env.CLICKUP_TOKEN;
  const { workspaceId, channelId } = await getChannelTarget();

  if (!token || !workspaceId || !channelId) {
    throw new Error('Server is missing ClickUp configuration (CLICKUP_TOKEN env var, and workspace/channel via clickup_settings table or env vars)');
  }

  const response = await fetch(
    `https://api.clickup.com/api/v3/workspaces/${workspaceId}/chat/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message, content_format: 'text/md' }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`ClickUp post failed (${response.status}): ${details}`);
  }

  return response.json();
}

module.exports = { postToClickUp };
