const { SlashCommandBuilder } = require('discord.js');
const { getLeaderboard } = require('../database/db');
const { buildLeaderboardEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top 10 pilots by total flights'),

  async execute(interaction) {
    const pilots = getLeaderboard(10);
    const embed = buildLeaderboardEmbed(pilots);
    await interaction.reply({ embeds: [embed] });
  },
};
