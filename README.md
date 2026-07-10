# Pocket Book — Mulia Putri Agency

Website buku saku digital untuk agen asuransi: katalog produk (Summary,
Ilustrasi, Cara Menjual, Video Penjelasan per produk), pencatatan aktivitas
member dengan foto + data nasabah, serta dashboard admin untuk mengelola
member, produk, dan laporan aktivitas — lengkap dengan export ke Excel.

## Fitur

- **Login** email & password, password tersimpan ter-enkripsi (hashed).
- **Katalog Produk** dengan 4 sub-menu per produk.
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
- Super Admin: `syam.rakhmany@gmail.com` / `Dolar@13`
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
2. Buat 3 tab (sheet) dengan nama **persis**: `Members`, `Products`,
   `Activities`.
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

### 5. Yang sudah otomatis jalan vs yang masih perlu disambungkan

- ✅ **Foto aktivitas**: begitu 4 env variable di atas terisi, form "Catat
  Aktivitas" otomatis mencoba upload foto ke folder Drive tersebut lewat
  `/api/upload-photo`, dan menyimpan URL Drive-nya (bukan lagi teks base64
  raksasa). Kalau env belum diisi / gagal, otomatis fallback ke penyimpanan
  lokal seperti biasa — tidak ada fitur yang rusak.
- 🔧 **Data Member / Produk / Aktivitas**: endpoint API-nya sudah siap dan
  bisa dites langsung (`GET /api/members`, `GET /api/products`,
  `GET /api/activities`, serta `POST` ke masing-masing untuk menyimpan).
  Menyambungkan `lib/store.js` supaya otomatis baca/tulis lewat endpoint
  ini (bukan lagi localStorage) adalah langkah lanjutan yang bisa saya
  bantu kerjakan berikutnya — beri tahu saya kalau Anda sudah selesai
  membuat Service Account & Sheet-nya, dan saya sambungkan sisanya.

## Update Selanjutnya

```bash
git add .
git commit -m "Deskripsikan perubahan Anda di sini"
git push
```

Vercel otomatis deploy ulang setelah push ke `main`.
