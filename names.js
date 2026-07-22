// Team roster - the single source of truth for both the browser pages and
// the Netlify functions. Edit this list to match the actual interns.
const TEAM_NAMES = [
  'Abdulaziz',
  'Saad',
];

// Browser pages load this via <script> and use the TEAM_NAMES global.
// Netlify functions load it via require() through lib/roster.js.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TEAM_NAMES };
}
