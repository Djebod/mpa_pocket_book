# Pocket Book — Mulia Putri Agency

Website buku saku digital untuk agen asuransi: katalog produk (Summary,
Ilustrasi, Cara Menjual, Video Penjelasan per produk), pencatatan aktivitas
member dengan foto + data nasabah, serta dashboard admin untuk mengelola
member, produk, dan laporan aktivitas — lengkap dengan export ke Excel.

## Fitur

- **Login** email & password, password tersimpan ter-enkripsi (hashed).
- **Katalog Produk** — tiap produk berisi Nama, Kategori, Sub Kategori,
  **1 kolom Deskripsi**, dan **banyak lampiran PDF/foto** (konsep sama
  seperti halaman Promo). Halaman katalog punya **filter Kategori + Sub
  Kategori** dan **pencarian**.
- **Rekomendasi Produk** — wizard tap-pilih untuk agen: jawab 2-4
  pertanyaan tentang kebutuhan nasabah (proteksi kesehatan, sakit
  kritis, jiwa berjangka, warisan, dana pendidikan, dana pensiun,
  distribusi kekayaan), dapat rekomendasi produk + alasan + jejak
  keputusan + link ke produk serupa di Katalog Produk (kalau ada). Data
  produk & alur pertanyaan ada di `lib/productWizard.js` (terpisah dari
  halaman render).
- **Komisi Produk & Kompensasi** — halaman tunggal (dikelola Admin):
  deskripsi + banyak lampiran PDF/foto.
- **Promo** — daftar promo (dikelola Admin): Type Promo + banyak
  lampiran PDF/foto per promo.
- **Tutorial Digital** — daftar tutorial (dikelola Admin): judul + link
  Google Drive, klik untuk membuka. Ada pencarian + urut A-Z.
- **Konsep Warisan** — halaman tunggal (dikelola Admin): deskripsi +
  banyak lampiran PDF/foto.
- **Tabel Medical** — halaman tunggal (dikelola Admin): deskripsi +
  banyak lampiran PDF/foto.
- **Recruit** — halaman tunggal (dikelola Admin): panduan proses recruit
  + lampiran materi (PDF/foto, bisa langsung dilihat & diunduh). Link di
  dalam teks deskripsi otomatis bisa diklik.
- **Aktivitas Member**: catat Visit Customer / Recruit / Role Play / Join
  Visit / Other, lengkap dengan **Nama Nasabah**, **No. Telpon Nasabah**,
  catatan, dan foto wajib. Bisa **diedit di hari yang sama** aktivitas
  dicatat.
- **Direct Leader**: tiap member bisa diberi satu Direct Leader (member
  lain). Direct Leader bisa melihat riwayat aktivitas anak buahnya lewat
  halaman **Tim Saya** — member lain (bukan diri sendiri, bukan Direct
  Leader) tidak bisa melihatnya, kecuali Admin (Admin selalu bisa melihat
  semua).
- **Dashboard Member**: lihat jumlah aktivitas per jenis + riwayat.
- **Dashboard Admin**:
  - Kelola Member — tambah/ubah/hapus, termasuk **mengubah level member
    menjadi Admin**.
  - Ringkasan Aktivitas — data lengkap seluruh member, filter, total per
    member, **detail aktivitas per member**, dan **download Excel**.
- **Super Admin** (`syam.rakhmany@gmail.com`) adalah satu-satunya akun yang
  bisa menghapus akun ber-role Admin lain, dan satu-satunya yang datanya
  tidak bisa dilihat/dihapus oleh Admin lain.

## Status Penyimpanan Data

- **Tahap 1 (aktif sekarang):** member, produk, dan aktivitas disimpan di
  `localStorage` browser sebagai data sementara, supaya semua fitur UI bisa
  langsung dicoba tanpa setup tambahan.
- **Tahap 2 (mulai disiapkan):** koneksi ke **Google Sheets** (data) dan
  **Google Drive** (foto aktivitas) sudah dibangun di `lib/google/` dan
  `app/api/`. Foto aktivitas akan otomatis mencoba upload ke Google Drive
  begitu kredensial diisi (lihat bagian di bawah) — kalau belum
  dikonfigurasi, foto tetap tersimpan lokal seperti biasa (tidak ada fitur
  yang rusak). Menyambungkan data Member/Produk/Aktivitas sepenuhnya ke
  Google Sheets adalah langkah lanjutan — API-nya sudah siap
  (`/api/members`, `/api/products`, `/api/activities`), tinggal disambungkan
  ke `lib/store.js`.

## Menjalankan di komputer sendiri

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

**Akun contoh (data sementara):**
- Super Admin: `syam.rakhmany@gmail.com` / `##########`
- Member: `siti.rahma@muliaputri.com` / `agen123`
- Member: `budi.santoso@muliaputri.com` / `agen123`

Untuk mengubah data super admin default, edit `SUPER_ADMIN_EMAIL` di
`lib/admins.js` dan seed password di `lib/store.js` (`SEED_MEMBERS`).

## Keamanan Password

Password member **tidak** disimpan sebagai teks polos. Saat member
ditambahkan/login, password di-hash dengan SHA-256 + salt acak + 1000x
iterasi (lihat `lib/crypto.js`) sebelum disimpan. Saat login, password yang
diketik dicocokkan dengan hash tersimpan, bukan dibandingkan langsung.

Catatan jujur: karena Tahap 1 ini berjalan sepenuhnya di browser tanpa
server otentikasi sungguhan, ini mencegah password terbaca sebagai teks
polos di localStorage/Google Sheet, tapi bukan pengganti keamanan tingkat
server. Setelah aplikasi punya backend penuh, sebaiknya proses verifikasi
login dipindah ke server (atau pakai Google Sign-In) agar tidak lagi
berjalan di sisi pengguna.

## Struktur proyek

```
app/
  page.js                             -> halaman login
  dashboard/
    page.js                           -> ringkasan member
    activities/page.js                -> catat aktivitas + riwayat
    products/page.js                  -> katalog produk
    products/[id]/page.js             -> detail produk (4 tab)
    admin/
      members/page.js                 -> kelola member + ubah role
      activities/page.js              -> ringkasan semua aktivitas + export Excel
      activities/[memberId]/page.js   -> detail aktivitas per member
      products/page.js                -> kelola produk
  api/
    members/route.js                  -> baca/tulis Members ke Google Sheets
    products/route.js                 -> baca/tulis Products ke Google Sheets
    activities/route.js               -> baca/tulis Activities ke Google Sheets
    upload-photo/route.js             -> upload foto ke Google Drive
lib/
  store.js                            -> lapisan data (localStorage, Tahap 1)
  admins.js                           -> Super Admin & aturan permission
  crypto.js                           -> hashing password
  exportExcel.js                      -> export data ke .xlsx
  google/
    googleAuth.js                     -> autentikasi Service Account
    sheetsClient.js                   -> baca/tulis Google Sheets
    driveClient.js                    -> upload foto ke Google Drive
components/                           -> komponen UI yang dipakai berulang
```

## Deploy ke GitHub + Vercel

1. `git add . && git commit -m "pesan" && git push`
2. Import repo di [vercel.com](https://vercel.com) → **Deploy**.
3. Kalau memakai Google Sheets/Drive, tambahkan environment variables di
   Vercel (Project Settings → Environment Variables) — lihat daftar di
   bagian bawah.

## Menyambungkan ke Google Sheets & Google Drive

Aplikasi ini memakai **Service Account** (akun robot Google, bukan login
Google pribadi Anda) supaya server bisa membaca/menulis ke satu Google
Sheet dan satu folder Drive milik agency tanpa perlu login manual tiap
request.

### 1. Buat Service Account

1. Buka [Google Cloud Console](https://console.cloud.google.com/) → buat
   project baru (atau pakai yang sudah ada).
2. Di menu **APIs & Services → Library**, aktifkan dua API ini:
   - **Google Sheets API**
   - **Google Drive API**
3. Buka **APIs & Services → Credentials** → **Create Credentials** →
   **Service Account**. Isi nama bebas (mis. "pocketbook-service"), lalu
   **Create and Continue** → **Done**.
4. Klik Service Account yang baru dibuat → tab **Keys** → **Add Key** →
   **Create new key** → pilih **JSON** → unduh filenya. File ini berisi
   `client_email` dan `private_key` yang dibutuhkan di `.env.local`.

### 2. Siapkan Google Sheet

1. Buat spreadsheet baru di [Google Sheets](https://sheets.google.com).
2. Buat 9 tab (sheet) dengan nama **persis**: `Members`, `Products`,
   `Activities`, `Promo`, `Tutorials`, `Commission`, `Warisan`,
   `Medical`, `Recruit`.
3. Baris pertama tiap tab tidak perlu diisi manual — akan terisi otomatis
   header-nya saat pertama kali data disimpan lewat aplikasi (lihat
   `SHEET_HEADERS` di `lib/google/sheetsClient.js` untuk daftar kolomnya).
4. Klik **Share** pada spreadsheet, tambahkan email `client_email` dari
   file JSON tadi (bentuknya seperti
   `nama@nama-project.iam.gserviceaccount.com`), beri akses **Editor**.
5. Salin ID spreadsheet dari URL-nya:
   `https://docs.google.com/spreadsheets/d/`**`ID_INI`**`/edit`

### 3. Siapkan folder Google Drive untuk foto

1. Buat folder baru di [Google Drive](https://drive.google.com), misalnya
   "Foto Aktivitas MPA".
2. Klik **Share** pada folder tersebut, tambahkan email `client_email` yang
   sama, beri akses **Editor**.
3. Salin ID folder dari URL-nya:
   `https://drive.google.com/drive/folders/`**`ID_INI`**

### 4. Isi Environment Variables

Salin `.env.example` menjadi `.env.local` (untuk lokal) dan isi:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=... (dari client_email di file JSON)
GOOGLE_PRIVATE_KEY="..."          (dari private_key di file JSON, biarkan \n apa adanya)
GOOGLE_SHEET_ID=...               (dari langkah 2)
GOOGLE_DRIVE_FOLDER_ID=...        (dari langkah 3)
```

Untuk di Vercel, tambahkan 4 variabel yang sama di **Project Settings →
Environment Variables**, lalu redeploy.

### 5. Foto ke Google Drive: kenapa perlu langkah tambahan

Kalau Anda memakai akun Google **personal** (Gmail biasa, bukan Google
Workspace berbayar), upload foto lewat Service Account akan gagal dengan
pesan **"Service Accounts do not have storage quota"**. Ini bukan bug —
ini batasan resmi Google: Service Account tidak punya kuota penyimpanan
sendiri di Drive biasa, jadi tidak bisa membuat file baru di sana (beda
dengan Sheets, yang cuma mengedit isi file yang sudah ada, tidak butuh
kuota).

Solusinya: pakai token OAuth dari akun Google **asli** Anda (yang punya
kuota sungguhan), khusus untuk upload foto. Ikuti langkah ini sekali saja:

#### a. Buat OAuth Client ID (beda dari Service Account)

1. Di [Google Cloud Console](https://console.cloud.google.com/) → **APIs &
   Services** → **Credentials** → **+ Create Credentials** → **OAuth
   client ID**.
2. Kalau diminta konfigurasi **OAuth consent screen** dulu, isi seadanya
   (App name bebas, User support email isi email Anda, Developer contact
   isi email Anda) → **Save and Continue** terus sampai selesai. Pilih
   **User Type: External**, dan tambahkan email Anda sendiri di bagian
   **Test users**.
3. Kembali ke **Create OAuth client ID** → **Application type**: pilih
   **Web application**.
4. Di **Authorized redirect URIs**, tambahkan:
   ```
   https://developers.google.com/oauthplayground
   ```
5. Klik **Create**. Salin **Client ID** dan **Client Secret** yang muncul.

#### b. Ambil Refresh Token lewat OAuth Playground

1. Buka [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground/).
2. Klik ikon ⚙️ (gear) di pojok kanan atas → centang **"Use your own OAuth
   credentials"** → isi **Client ID** & **Client Secret** dari langkah (a).
3. Di panel kiri (**Step 1**), cari **Drive API v3**, centang scope
   `https://www.googleapis.com/auth/drive.file`.
4. Klik **Authorize APIs** → login dengan akun Google Anda (yang punya
   folder Drive tujuan) → **Allow**.
5. Di **Step 2**, klik **Exchange authorization code for tokens**.
6. Salin nilai **Refresh token** yang muncul.

#### c. Isi environment variables

Tambahkan 3 variabel ini (di `.env.local` untuk lokal, atau Vercel
Environment Variables untuk live):
```
GOOGLE_OAUTH_CLIENT_ID=...       (dari langkah a)
GOOGLE_OAUTH_CLIENT_SECRET=...   (dari langkah a)
GOOGLE_OAUTH_REFRESH_TOKEN=...   (dari langkah b)
```

Dengan ini, `GOOGLE_DRIVE_FOLDER_ID` cukup folder biasa di akun Google
Anda sendiri (tidak perlu di-Share ke Service Account lagi) — aplikasi
akan upload foto atas nama akun Anda sendiri, yang punya kuota
penyimpanan normal.



### 7. Status saat ini: apa yang sudah otomatis jalan

- ✅ **Data Member / Produk / Aktivitas**: `lib/store.js` otomatis menarik
  data dari Google Sheets saat aplikasi dibuka, dan mendorong setiap
  perubahan (tambah/ubah/hapus) ke Sheets di latar belakang. Endpoint
  `/api/members`, `/api/products`, `/api/activities` bisa dites langsung
  di browser untuk melihat data mentahnya.
- ✅ **Foto aktivitas**: begitu env variable OAuth2 (bagian 5 di atas)
  terisi, form "Catat Aktivitas" otomatis mengunggah foto ke Google Drive
  lewat `/api/upload-photo`, dan menyimpan URL Drive-nya (bukan lagi teks
  base64 raksasa) ke kolom `photoUrl`. Kalau belum dikonfigurasi / gagal,
  otomatis fallback ke penyimpanan lokal browser sementara — tidak ada
  fitur yang rusak, cuma foto belum ikut ter-backup ke Drive.

## Update Selanjutnya

```bash
git add .
git commit -m "Deskripsikan perubahan Anda di sini"
git push
```

Vercel otomatis deploy ulang setelah push ke `main`.
