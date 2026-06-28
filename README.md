# vEZY Flight Log Discord Bot

Bot Discord buat virtual airline vEZY. Cuma 3 sistem: **Flight Log Review**, **Leaderboard**, dan **Flight Count Management**. Discord.js v14 + SQLite (better-sqlite3), slash command doang.

## Struktur Folder

```
vezy-flight-log-bot/
├── index.js              # entry point, login bot
├── deploy-commands.js    # daftarin slash command ke Discord
├── config.js             # baca .env + daftar role yang diizinkan
├── commands/
│   ├── flight.js         # /flight log
│   ├── leaderboard.js    # /leaderboard
│   └── edit.js           # /edit flights
├── events/
│   ├── ready.js
│   └── interactionCreate.js
├── handlers/
│   ├── commandHandler.js # auto-load semua file di /commands
│   ├── eventHandler.js   # auto-load semua file di /events
│   └── buttonHandler.js  # logic Accept/Deny
├── database/
│   └── db.js             # schema + query helper (better-sqlite3)
└── utils/
    ├── embeds.js          # builder embed flight log & leaderboard
    └── permissions.js      # cek role reviewer
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Bikin bot di Discord Developer Portal**
   - https://discord.com/developers/applications → New Application
   - Tab **Bot** → Reset Token → copy token-nya
   - Tab **OAuth2 → URL Generator** → centang scope `bot` dan `applications.commands`
   - Permission minimal: `Send Messages`, `Embed Links`, `Read Message History`
   - Invite bot ke server lo pakai URL yang di-generate

3. **Isi file `.env`** (copy dari `.env.example`)
   ```
   DISCORD_TOKEN=token_bot_lo
   CLIENT_ID=application_id_lo
   GUILD_ID=id_server_lo          # buat testing, biar command langsung muncul
   FLIGHT_LOG_CHANNEL_ID=id_channel_review
   ```

4. **Deploy slash command**
   ```bash
   npm run deploy
   ```

5. **Jalanin bot**
   ```bash
   npm start
   ```

## Customize Role

Nama role yang dianggap "reviewer" (boleh Accept/Deny dan pakai `/edit flights`) ada di `config.js`:

```js
reviewRoles: [
  'vEZY Founder',
  'Chief Directing Officer',
  'Manager',
  'Flight Dispatcher',
],
```

Tinggal edit array ini kalau nama role di server lo beda. Dicek berdasarkan **nama role**, bukan role ID — pastiin nama role di server sama persis (case-sensitive).

## Cara Kerja Singkat

- `/flight log` → simpan submission ke tabel `flight_logs` (status `pending`), lalu kirim embed + 2 button ke channel `FLIGHT_LOG_CHANNEL_ID`.
- Klik **Accept/Deny** → dicek role reviewer dulu. Kalau lolos: update status di DB, kalau Accept langsung `+1` ke `pilots.total_flights`, terus embed di-update (status + siapa yang approve) dan kedua button di-disable.
- `/leaderboard` → query 10 pilot dengan `total_flights` tertinggi dari tabel `pilots`.
- `/edit flights` → reviewer set ulang total flight seorang pilot secara manual (replace, bukan nambah).
- Semua data (termasuk log yang masih pending) disimpan di `database/flightlog.sqlite`, jadi aman walau bot restart.

## Catatan soal Webhook

Lo sempet kirim satu Discord webhook URL di chat — tapi sistem yang lo minta ini semua jalan lewat **bot** (slash command, button interaction), bukan lewat webhook, jadi webhook itu nggak kepake di kode ini sama sekali. Kalau emang ada rencana lain (misal buat error logging ke channel terpisah, atau notifikasi eksternal), bilang aja, gampang ditambahin sebagai modul kecil di `utils/`. Untuk sekarang webhook URL itu nggak gua taro di kode manapun.

## Extend Ideas (opsional, belum diimplementasi)
- Auto-role pilot berdasarkan total flights (milestone role)
- `/profile` buat liat history flight log sendiri
- Export leaderboard ke CSV
