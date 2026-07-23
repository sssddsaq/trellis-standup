// Temporary diagnostic — remove after confirming env propagation. Never returns the token.
exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workspaceId: process.env.CLICKUP_WORKSPACE_ID || null,
    channelId: process.env.CLICKUP_CHANNEL_ID || null,
    tokenPresent: Boolean(process.env.CLICKUP_TOKEN),
  }),
});
