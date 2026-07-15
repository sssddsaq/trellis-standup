async function postToClickUp(message) {
  const token = process.env.CLICKUP_TOKEN;
  const workspaceId = process.env.CLICKUP_WORKSPACE_ID;
  const channelId = process.env.CLICKUP_CHANNEL_ID;

  if (!token || !workspaceId || !channelId) {
    throw new Error('Server is missing ClickUp configuration (CLICKUP_TOKEN, CLICKUP_WORKSPACE_ID, CLICKUP_CHANNEL_ID)');
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
