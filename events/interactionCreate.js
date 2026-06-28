const { handleFlightLogButton } = require('../handlers/buttonHandler');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      if (interaction.isButton() && interaction.customId.startsWith('flightlog_')) {
        await handleFlightLogButton(interaction);
        return;
      }
    } catch (err) {
      console.error('Interaction error:', err);
      const errorPayload = { content: '⚠️ Something went wrong while processing this interaction.', ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(errorPayload).catch(() => {});
      } else {
        await interaction.reply(errorPayload).catch(() => {});
      }
    }
  },
};
