const { EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config');

// Builds the flight log review embed. Re-used for pending, accepted, and denied states.
function buildFlightLogEmbed(log, status = 'Pending', reviewerTag = null) {
  const color =
    status === 'Accepted' ? 0x2ecc71 : status === 'Denied' ? 0xe74c3c : embedColor;

  const embed = new EmbedBuilder()
    .setTitle('✈️ Flight Log Submission')
    .setColor(color)
    .addFields(
      { name: 'Pilot', value: `<@${log.user_id}>`, inline: true },
      { name: 'Callsign', value: log.callsign, inline: true },
      { name: 'Aircraft', value: log.aircraft, inline: true },
      { name: 'Departure', value: log.departure, inline: true },
      { name: 'Arrival', value: log.arrival, inline: true },
      { name: 'Flight Time', value: log.flight_time, inline: true },
      { name: 'Flight Rules', value: log.flight_rules, inline: true },
      { name: 'Notes', value: log.notes && log.notes.length > 0 ? log.notes : '—', inline: false },
      { name: 'Status', value: status, inline: true },
      {
        name: 'Submitted At',
        value: `<t:${Math.floor(new Date(log.submitted_at).getTime() / 1000)}:f>`,
        inline: true,
      }
    )
    .setFooter({ text: `Log ID #${log.id}` });

  if (status === 'Accepted' && reviewerTag) {
    embed.addFields({ name: 'Accepted By', value: reviewerTag, inline: true });
  }
  if (status === 'Denied' && reviewerTag) {
    embed.addFields({ name: 'Denied By', value: reviewerTag, inline: true });
  }

  return embed;
}

// Builds the top-10 leaderboard embed with medal emoji for the top 3
function buildLeaderboardEmbed(pilots) {
  const medals = ['🥇', '🥈', '🥉'];
  const lines = pilots.length
    ? pilots.map((p, i) => {
        const medal = medals[i] || `**${i + 1}.**`;
        return `${medal} <@${p.user_id}> • ${p.total_flights} Flights`;
      })
    : ['No flights logged yet.'];

  return new EmbedBuilder()
    .setTitle('🏆 vEZY Flight Leaderboard')
    .setColor(embedColor)
    .setDescription(lines.join('\n'))
    .setFooter({ text: 'Top 10 pilots by total flights' });
}

module.exports = { buildFlightLogEmbed, buildLeaderboardEmbed };
