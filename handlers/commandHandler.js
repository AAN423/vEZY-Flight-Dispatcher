const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

// Loads every command file in /commands into client.commands
function loadCommands(client) {
  client.commands = new Collection();
  const commandsPath = path.join(__dirname, '..', 'commands');
  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const command = require(path.join(commandsPath, file));
    if (command?.data?.name) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`⚠️ Skipped invalid command file: ${file}`);
    }
  }

  console.log(`📦 Loaded ${client.commands.size} command(s).`);
}

module.exports = { loadCommands };
