require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  flightLogChannelId: process.env.FLIGHT_LOG_CHANNEL_ID,

  // Roles allowed to Accept/Deny flight logs and use /edit flights.
  // Edit this array if role names change - no other file needs to be touched.
  reviewRoles: [
    'vEZY Founder',
    'Chief Directing Officer',
    'Manager',
    'Flight Dispatcher',
  ],

  // Default embed color (vEZY blue) - used when a log is still pending
  embedColor: 0x2b6cb0,
};
