# Tutorial Full: Setup vEZY Flight Log Bot sampai Push ke GitHub

Ini tutorial dari nol banget — install tools, bikin bot di Discord, sampai naikin kode lo ke GitHub. Ikutin urut dari atas, jangan skip.

---

## 0. Yang Lo Butuhin Dulu

| Tools | Link | Cek udah terinstall belum |
|---|---|---|
| Node.js (LTS, v18+) | https://nodejs.org | `node -v` |
| Git | https://git-scm.com | `git -v` |
| Akun GitHub | https://github.com | - |
| Akun Discord + server testing | - | - |
| Text editor (rekomen VS Code) | https://code.visualstudio.com | - |

Cara cek di terminal/CMD:
```bash
node -v
npm -v
git -v
```
Kalau command-nya error "not recognized/not found", berarti belum terinstall — install dulu sesuai link di atas, restart terminal, cek lagi.

---

## 1. Siapin Folder Project

Pastiin folder `vezy-flight-log-bot` (yang udah gua kasih) ada di komputer lo. Buka terminal/CMD, masuk ke folder itu:

```bash
cd path/ke/vezy-flight-log-bot
```

Install semua dependency-nya:
```bash
npm install
```

Tunggu sampai selesai. Kalau muncul warning kuning (deprecated dll) itu normal, yang penting nggak ada tulisan merah besar "npm error" di akhir.

> ⚠️ Kalau ada error pas install `better-sqlite3` (biasanya soal "node-gyp" / "python" / "build tools"), itu artinya komputer lo butuh build tools buat compile native module. Di Windows install **"Visual Studio Build Tools"** (centang "Desktop development with C++"), terus install ulang. Di Mac biasanya udah ada Xcode Command Line Tools (`xcode-select --install`). Di Linux install `build-essential` dan `python3`.

---

## 2. Bikin Bot di Discord Developer Portal

1. Buka https://discord.com/developers/applications, login.
2. Klik **New Application** (pojok kanan atas) → kasih nama, misal `vEZY Flight Log` → Create.
3. Di sidebar kiri, klik tab **Bot**.
4. Klik **Reset Token** → confirm → **copy token-nya**. Token ini cuma muncul sekali, simpen baik-baik (jangan share ke siapa-siapa, jangan upload ke GitHub).
5. Masih di tab Bot, scroll ke bawah ke **Privileged Gateway Intents** — biarin semua **OFF** (Presence, Server Members, Message Content). Bot ini nggak butuh itu semua.
6. Di sidebar kiri, klik **General Information** → copy **Application ID** (ini yang jadi `CLIENT_ID`).

---

## 3. Invite Bot ke Server

1. Masih di Developer Portal, sidebar kiri klik **OAuth2** → **URL Generator**.
2. Di bagian **Scopes**, centang:
   - `bot`
   - `applications.commands`
3. Setelah itu muncul bagian **Bot Permissions** di bawahnya, centang:
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
4. Scroll ke bawah, copy **Generated URL**.
5. Paste URL itu di browser, pilih server lo, klik **Authorize**.
6. Bot bakal muncul di member list server lo (statusnya offline dulu, normal — nanti online pas kita `npm start`).

---

## 4. Setup Role & Channel di Server

### Role
Bot ini ngecek role berdasarkan **nama**, jadi pastiin di server lo ada role dengan nama **persis sama** (case-sensitive):
- `vEZY Founder`
- `Chief Directing Officer`
- `Manager`
- `Flight Dispatcher`

Cara bikin: **Server Settings → Roles → Create Role** → kasih nama sesuai daftar di atas. Kalau nama role di server lo udah beda (misal cuma "Founder"), tinggal edit `config.js` di bagian `reviewRoles` biar sesuai — nggak perlu ganti file lain.

### Channel Flight Log Review
Bikin channel text baru, misal `#flight-log-review`. Ini tempat embed submission bakal muncul.

### Aktifin Developer Mode (buat copy ID)
**User Settings → Advanced → Developer Mode** → ON.

Setelah itu, lo bisa klik kanan apapun di Discord buat **Copy ID**:
- Klik kanan icon/nama server → **Copy Server ID** → ini `GUILD_ID`
- Klik kanan channel `#flight-log-review` → **Copy Channel ID** → ini `FLIGHT_LOG_CHANNEL_ID`

---

## 5. Isi File `.env`

Di folder project, copy `.env.example` jadi `.env`:

```bash
cp .env.example .env
```
(Windows pakai CMD: `copy .env.example .env`)

Buka `.env`, isi semua value yang udah lo kumpulin:

```
DISCORD_TOKEN=token_dari_step_2
CLIENT_ID=application_id_dari_step_2
GUILD_ID=server_id_dari_step_4
FLIGHT_LOG_CHANNEL_ID=channel_id_dari_step_4
```

Jangan pakai tanda kutip, langsung paste value-nya. **File `.env` ini JANGAN PERNAH di-commit ke Git/GitHub** — udah otomatis di-exclude lewat `.gitignore`, tapi tetep double-check nanti di langkah push.

---

## 6. Deploy Slash Command

```bash
npm run deploy
```

Kalau sukses bakal muncul:
```
Deploying 3 slash command(s)...
✅ Deployed guild commands.
```

Karena lo isi `GUILD_ID`, command langsung muncul instant di server itu (kalau `GUILD_ID` dikosongin, command jadi global dan bisa lambat sampai 1 jam buat muncul).

---

## 7. Jalanin Bot

```bash
npm start
```

Kalau berhasil, console bakal nampilin:
```
📦 Loaded 3 command(s).
📦 Loaded 2 event(s).
✅ Logged in as vEZY Flight Log#1234
```

Cek di Discord, status bot harusnya jadi online. Biarin terminal ini tetep jalan (jangan di-close) selama mau testing — kalau di-stop (Ctrl+C), bot offline.

---

## 8. Testing

Di server Discord lo:

1. Ketik `/flight log` → isi semua field (callsign, departure, arrival, aircraft, flight time, rules, notes opsional) → submit.
2. Cek channel `#flight-log-review` → harus muncul embed "Pending" dengan 2 button ✅ Accept / ❌ Deny.
3. Login pakai akun yang punya salah satu role reviewer → klik **Accept** → embed harus update jadi "Accepted", nampilin siapa yang accept, dan kedua button jadi disabled (abu-abu).
4. Ketik `/leaderboard` → harus muncul pilot yang baru di-accept dengan 1 flight.
5. Coba `/flight log` lagi, kali ini klik **Deny** → status jadi "Denied", flight count nggak nambah.
6. Coba klik button pakai akun yang **nggak** punya role reviewer → harus muncul balasan ephemeral "You don't have permission."
7. Coba `/edit flights` (pakai akun reviewer) → set manual flight count seseorang → cek lagi di `/leaderboard`.

Kalau semua itu jalan, bot lo udah beres dan siap dipush.

---

## 9. Push ke GitHub

### 9.1 Bikin repo di GitHub
1. Buka https://github.com/new
2. Isi nama repo (misal `vezy-flight-log-bot`)
3. **JANGAN** centang "Add a README file" / ".gitignore" / "license" — biarin kosong, biar nggak conflict sama project lokal lo.
4. Klik **Create repository**. GitHub bakal nampilin halaman dengan instruksi `git remote add origin ...` — biarin tab itu terbuka, kita pakai nanti.

### 9.2 Init git di folder lokal
Di terminal, masih di folder `vezy-flight-log-bot`:

```bash
git init
git add .
```

**PENTING — cek dulu sebelum commit:**
```bash
git status
```
Baca daftar file yang mau di-commit. Pastiin **`.env` TIDAK ADA** di daftar itu (kalau ada, berarti ada yang salah sama `.gitignore` — stop, jangan commit, cek lagi isi file `.gitignore` harus ada baris `.env`).

Kalau udah aman:
```bash
git commit -m "Initial commit: vEZY Flight Log Discord Bot"
git branch -M main
```

### 9.3 Connect ke repo GitHub & push
Ganti `USERNAME` dan `REPO_NAME` sesuai punya lo (URL ini ada di halaman repo yang lo buka di step 9.1):

```bash
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

Kalau diminta login, GitHub sekarang udah nggak terima password biasa buat `git push` — lo butuh **Personal Access Token** sebagai pengganti password:
1. https://github.com/settings/tokens → **Generate new token (classic)**
2. Centang scope `repo` → Generate
3. Copy token-nya, pakai itu sebagai "password" pas diminta terminal (username tetep username GitHub lo)

Setelah push sukses, refresh halaman repo di GitHub — semua file (kecuali `.env`, `node_modules`, file `.sqlite`) harusnya udah muncul di sana.

### 9.4 Update kode di masa depan
Setiap kali lo edit kode dan mau update ke GitHub:
```bash
git add .
git commit -m "deskripsi perubahan lo"
git push
```

---

## 10. (Bonus) Biar Bot Online 24/7

Sekarang bot cuma online selama terminal di laptop lo nyala. Kalau mau online terus tanpa laptop nyala, beberapa opsi (di luar scope kode yang udah dibuat, tinggal pilih sesuai budget):

- **VPS** (DigitalOcean, Contabo, dll) → paling fleksibel, install Node.js di server, jalanin pakai `pm2` (`npm install -g pm2` → `pm2 start index.js --name vezy-bot`) biar auto-restart kalau crash.
- **Railway / Render** → gampang deploy dari GitHub repo langsung, ada free tier tapi biasanya terbatas buat bot yang harus nyala 24/7.
- **Raspberry Pi / komputer bekas** di rumah yang dibiarin nyala terus + `pm2`.

Kalau lo mau, bilang aja platform mana yang lo pilih, gua bisa kasih tutorial deploy spesifik buat itu.

---

## Troubleshooting Cepat

| Masalah | Kemungkinan Sebab |
|---|---|
| `npm start` error "Failed to log in" | `DISCORD_TOKEN` di `.env` salah/kosong, atau ada spasi nyangkut |
| Slash command nggak muncul di Discord | Belum `npm run deploy`, atau `GUILD_ID`/`CLIENT_ID` salah, atau bot belum di-invite ke server itu |
| Klik button gak ada respon / "interaction failed" | Bot-nya lagi nggak jalan (`npm start` ke-stop), cek terminal |
| Selalu kena "You don't have permission." padahal udah punya role | Nama role di server beda persis sama yang di `config.js` (cek typo/kapital) |
| Channel review nggak ke-post embed | `FLIGHT_LOG_CHANNEL_ID` salah, atau bot nggak punya akses ke channel itu |
| `.env` ketauan ke-push ke GitHub | Hapus repo, bikin baru, **revoke/reset token bot** di Developer Portal (anggap token itu bocor), ulang dari step 9 dengan `.env` yang udah bener di-ignore |
