const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { getFlightLog, decideFlightLog, incrementPilotFlights } = require('../database/db');
const { buildFlightLogEmbed } = require('../utils/embeds');
const { hasReviewPermission } = require('../utils/permissions');

// Handles Accept/Deny button presses on flight log embeds.
// customId format: flightlog_accept_<logId> or flightlog_deny_<logId>
async function handleFlightLogButton(interaction) {
  const [, action, idStr] = interaction.customId.split('_');
  const logId = parseInt(idStr, 10);

  if (!hasReviewPermission(interaction.member)) {
    return interaction.reply({ content: "You don't have permission.", ephemeral: true });
  }

  const log = getFlightLog(logId);
  if (!log) {
    return interaction.reply({ content: '⚠️ This flight log no longer exists.', ephemeral: true });
  }
  // Prevent double-processing if two reviewers click at the same time
  if (log.status !== 'pending') {
    return interaction.reply({ content: '⚠️ This flight log has already been reviewed.', ephemeral: true });
  }

  const newStatus = action === 'accept' ? 'Accepted' : 'Denied';
  decideFlightLog(logId, newStatus, interaction.user.id, interaction.user.username);

  // Only accepted flights count toward the pilot's total
  if (newStatus === 'Accepted') {
    incrementPilotFlights(log.user_id, log.username);
  }

  const updatedLog = getFlightLog(logId);
  const embed = buildFlightLogEmbed(updatedLog, newStatus, interaction.user.tag);

  // Rebuild the existing button row with both buttons disabled
  const disabledButtons = interaction.message.components[0].components.map((c) =>
    ButtonBuilder.from(c).setDisabled(true)
  );
  const row = new ActionRowBuilder().addComponents(...disabledButtons);

  await interaction.update({ embeds: [embed], components: [row] });
}

module.exports = { handleFlightLogButton };
