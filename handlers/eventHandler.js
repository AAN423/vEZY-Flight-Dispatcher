const fs = require('fs');
const path = require('path');

// Loads every event file in /events and registers it on the client
function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  console.log(`📦 Loaded ${files.length} event(s).`);
}

module.exports = { loadEvents };
