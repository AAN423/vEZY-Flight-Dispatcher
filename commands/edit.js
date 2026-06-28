const { SlashCommandBuilder } = require('discord.js');
const { setPilotFlights } = require('../database/db');
const { hasReviewPermission } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edit')
    .setDescription('Edit pilot records')
    .addSubcommand((sub) =>
      sub
        .setName('flights')
        .setDescription("Set a pilot's total flight count")
        .addUserOption((o) => o.setName('user').setDescription('Pilot to edit').setRequired(true))
        .addIntegerOption((o) =>
          o.setName('count').setDescription('New total flight count').setRequired(true).setMinValue(0)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'flights') return;

    // Role gate: only review staff can edit flight counts
    if (!hasReviewPermission(interaction.member)) {
      return interaction.reply({ content: "You don't have permission.", ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const count = interaction.options.getInteger('count');

    setPilotFlights(targetUser.id, targetUser.username, count);

    await interaction.reply({
      content: `✅ Updated **${targetUser.username}**'s total flights to **${count}**.`,
      ephemeral: true,
    });
  },
};
