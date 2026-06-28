require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const config = require('./config');

// Only the Guilds intent is needed - interaction payloads already include
// member/role data, so GuildMembers/MessageContent intents are not required.
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

loadCommands(client);
loadEvents(client);

client.login(config.token).catch((err) => {
  console.error('❌ Failed to log in. Check DISCORD_TOKEN in your .env file.', err);
  process.exit(1);
});
