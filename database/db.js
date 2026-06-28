const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'flightlog.sqlite'));
db.pragma('journal_mode = WAL'); // safer + faster concurrent writes

// --- Schema -----------------------------------------------------------
// pilots: persistent totals shown on the leaderboard
// flight_logs: full record of every submission, used to safely back the
//              Accept/Deny buttons (so a bot restart never loses pending logs)
db.exec(`
  CREATE TABLE IF NOT EXISTS pilots (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    total_flights INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS flight_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    callsign TEXT NOT NULL,
    departure TEXT NOT NULL,
    arrival TEXT NOT NULL,
    aircraft TEXT NOT NULL,
    flight_time TEXT NOT NULL,
    flight_rules TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewer_id TEXT,
    reviewer_username TEXT,
    submitted_at TEXT NOT NULL,
    decided_at TEXT
  );
`);

// --- Pilot helpers ------------------------------------------------------

function ensurePilot(userId, username) {
  const existing = db.prepare('SELECT * FROM pilots WHERE user_id = ?').get(userId);
  if (!existing) {
    db.prepare('INSERT INTO pilots (user_id, username, total_flights) VALUES (?, ?, 0)').run(userId, username);
  } else if (existing.username !== username) {
    // Keep the stored username fresh in case the pilot changed their Discord name
    db.prepare('UPDATE pilots SET username = ? WHERE user_id = ?').run(username, userId);
  }
}

function incrementPilotFlights(userId, username) {
  ensurePilot(userId, username);
  db.prepare('UPDATE pilots SET total_flights = total_flights + 1 WHERE user_id = ?').run(userId);
}

function setPilotFlights(userId, username, count) {
  ensurePilot(userId, username);
  db.prepare('UPDATE pilots SET total_flights = ? WHERE user_id = ?').run(count, userId);
}

function getLeaderboard(limit = 10) {
  return db.prepare('SELECT * FROM pilots ORDER BY total_flights DESC LIMIT ?').all(limit);
}

function getPilot(userId) {
  return db.prepare('SELECT * FROM pilots WHERE user_id = ?').get(userId);
}

// --- Flight log helpers --------------------------------------------------

function createFlightLog(data) {
  const stmt = db.prepare(`
    INSERT INTO flight_logs
      (user_id, username, callsign, departure, arrival, aircraft, flight_time, flight_rules, notes, status, submitted_at)
    VALUES
      (@userId, @username, @callsign, @departure, @arrival, @aircraft, @flightTime, @flightRules, @notes, 'pending', @submittedAt)
  `);
  const info = stmt.run(data);
  return info.lastInsertRowid;
}

function getFlightLog(id) {
  return db.prepare('SELECT * FROM flight_logs WHERE id = ?').get(id);
}

function decideFlightLog(id, status, reviewerId, reviewerUsername) {
  db.prepare(`
    UPDATE flight_logs
    SET status = ?, reviewer_id = ?, reviewer_username = ?, decided_at = ?
    WHERE id = ?
  `).run(status, reviewerId, reviewerUsername, new Date().toISOString(), id);
}

module.exports = {
  db,
  ensurePilot,
  incrementPilotFlights,
  setPilotFlights,
  getLeaderboard,
  getPilot,
  createFlightLog,
  getFlightLog,
  decideFlightLog,
};
