const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { createFlightLog, getFlightLog } = require('../database/db');
const { buildFlightLogEmbed } = require('../utils/embeds');
const { flightLogChannelId } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flight')
    .setDescription('Flight log commands')
    .addSubcommand((sub) =>
      sub
        .setName('log')
        .setDescription('Submit a flight log for review')
        .addStringOption((o) => o.setName('callsign').setDescription('Your callsign').setRequired(true))
        .addStringOption((o) => o.setName('departure').setDescription('Departure airport (ICAO)').setRequired(true))
        .addStringOption((o) => o.setName('arrival').setDescription('Arrival airport (ICAO)').setRequired(true))
        .addStringOption((o) => o.setName('aircraft').setDescription('Aircraft type').setRequired(true))
        .addStringOption((o) => o.setName('flighttime').setDescription('Flight time, e.g. 1h30m').setRequired(true))
        .addStringOption((o) =>
          o
            .setName('rules')
            .setDescription('Flight rules')
            .setRequired(true)
            .addChoices({ name: 'IFR', value: 'IFR' }, { name: 'VFR', value: 'VFR' })
        )
        .addStringOption((o) => o.setName('notes').setDescription('Additional notes').setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'log') return;

    const reviewChannel = interaction.client.channels.cache.get(flightLogChannelId);
    if (!reviewChannel || reviewChannel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: '⚠️ Flight Log Review channel is not configured correctly. Contact an admin.',
        ephemeral: true,
      });
    }

    // Build the row of data once and store it - the embed is rebuilt from this on every decision
    const data = {
      userId: interaction.user.id,
      username: interaction.user.username,
      callsign: interaction.options.getString('callsign'),
      departure: interaction.options.getString('departure').toUpperCase(),
      arrival: interaction.options.getString('arrival').toUpperCase(),
      aircraft: interaction.options.getString('aircraft'),
      flightTime: interaction.options.getString('flighttime'),
      flightRules: interaction.options.getString('rules'),
      notes: interaction.options.getString('notes') || '',
      submittedAt: new Date().toISOString(),
    };

    const logId = createFlightLog(data);
    const log = getFlightLog(logId);

    const embed = buildFlightLogEmbed(log, 'Pending');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`flightlog_accept_${logId}`)
        .setLabel('Accept')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`flightlog_deny_${logId}`)
        .setLabel('Deny')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger)
    );

    await reviewChannel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content: `✅ Flight log submitted for review (Log #${logId}).`,
      ephemeral: true,
    });
  },
};
