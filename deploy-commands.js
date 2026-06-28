require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

for (const file of files) {
  const command = require(path.join(commandsPath, file));
  if (command?.data) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Deploying ${commands.length} slash command(s)...`);

    if (guildId) {
      // Guild-scoped: updates instantly - best for development
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log('✅ Deployed guild commands.');
    } else {
      // Global: can take up to 1 hour to propagate - use once stable
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('✅ Deployed global commands.');
    }
  } catch (err) {
    console.error('❌ Failed to deploy commands:', err);
  }
})();
