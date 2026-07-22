# Pocket Book — Mulia Putri Agency

Website buku saku digital untuk agen asuransi: katalog produk (deskripsi +
lampiran multi file), pencatatan aktivitas member berbasis poin dengan
validasi Admin, serta dashboard admin untuk mengelola member, produk, dan
laporan aktivitas — lengkap dengan export ke Excel.

## Fitur

- **Login** email & password, password tersimpan ter-enkripsi (hashed).
- **Dokumen (PDF/foto) yang diupload Admin bersifat lihat-saja** — semua
  halaman yang menampilkan lampiran (Produk, Promo, Recruit, dst)
  **tidak punya tombol download**, klik kanan dan seleksi teks pada
  area viewer dinonaktifkan (kecuali di halaman **Kalkulator
  Finansial**, yang tetap punya tombol "Unduh PDF" khusus untuk hasil
  kalkulasinya sendiri). File baru yang diupload dilayani lewat proxy
  milik aplikasi sendiri (`/api/drive-file/[fileId]`) — bukan lagi lewat
  halaman viewer Google — supaya URL Drive asli tidak pernah terkirim
  ke browser dan tombol "Pop-out" bawaan Google tidak muncul. Lihat
  catatan penting soal batas kemampuan proteksi ini di bagian bawah
  README.
- **Katalog Produk** — tampilan default menampilkan **Piramida Asuransi**
  (gambar ringkasan kebutuhan nasabah); klik "Lihat Semua Produk" atau
  isi pencarian/filter untuk menjelajah katalog. Tiap produk berisi
  Nama, **Kategori** (dropdown tetap, cuma "Unit Link" / "Non Unit
  Link"), **Sub Kategori** (bebas isi, ada saran ketik dari sub kategori
  yang sudah ada supaya tidak dobel), lalu field konten: **Materi
  Training** (2 versi terpisah — **Manulife Pusat** dan **MPA**, masing-
  masing upload 1 file PDF/foto), **Tabel Premi** (upload 1 file
  PDF/foto), **Resume** dan **Tabel Medical** (upload **banyak file**
  PDF/foto), **File Ketsus** (link Google Drive), dan **Video** (link
  YouTube, otomatis disesuaikan ke format embed). Filter Kategori + Sub
  Kategori, pencarian, dan search di Kelola Produk tersedia.
- **Rekomendasi Produk** — wizard tap-pilih untuk agen: jawab 2-4
  pertanyaan tentang kebutuhan nasabah (proteksi kesehatan, sakit
  kritis, jiwa berjangka, warisan, dana pendidikan, dana pensiun,
  distribusi kekayaan), dapat rekomendasi produk + alasan + jejak
  keputusan + link ke produk serupa di Katalog Produk (kalau ada). Data
  produk & alur pertanyaan ada di `lib/productWizard.js` (terpisah dari
  halaman render).
- **Promo & Kontes** — daftar promo (dikelola Admin): Type Promo +
  **Kategori Promo** (radio button "Agen"/"Nasabah") + banyak lampiran
  PDF/foto per promo. Member bisa filter Semua/Agen/Nasabah.
- **After Sales & Claim** — daftar data (dikelola Admin): tiap entri
  wajib pilih **Kategori** (radio button "After Sales" / "Claim") +
  banyak lampiran PDF/foto. Tampilan member terpisah jadi 2 tab sesuai
  kategori.
- **Tutorial Digital** — daftar tutorial (dikelola Admin): judul + link
  Google Drive, klik untuk membuka. Ada pencarian + urut A-Z.
- **Recruit** — halaman tunggal (dikelola Admin): panduan proses recruit
  + lampiran materi (PDF/foto, bisa langsung dilihat & diunduh). Link di
  dalam teks deskripsi otomatis bisa diklik.
- **Menu Aktivitas** (dulu "Monitoring") — di posisi #1 sidebar,
  mengelompokkan **Catat Aktivitas**, **Ringkasan Aktivitas**, **Tim
  Saya**, dan (khusus Admin) **Ringkasan Aktivitas Tim** sebagai kartu
  yang bisa diklik.
- **Analisa Kebutuhan Asuransi** — halaman tunggal (dikelola Admin):
  deskripsi (teks panjang, link otomatis bisa diklik), lampiran Materi
  & Flier (masing-masing upload 1 file PDF/foto), dan Video (link
  YouTube).
- **Kalkulator Aktivitas** — hitung mundur dari target premi (APE)
  tahunan/bulanan ke jumlah aktivitas harian (Prospek → Janji Temu →
  Presentasi → Closing) berbasis rasio sales cycle LIMRA (bisa
  disesuaikan). Menampilkan funnel visual + tabel ritme aktivitas per
  bulan/minggu/hari.
- **Kalkulator Finansial** — halaman React native (bukan iframe) dengan
  4 modul (Asuransi Jiwa, Sakit Kritis, Dana Pensiun, Dana Pendidikan),
  hitung otomatis real-time saat mengetik, dengan tombol **"Unduh
  PDF"** per modul (pakai fitur cetak bawaan browser — saat cetak,
  sidebar/header aplikasi ikut disembunyikan otomatis supaya hasil PDF
  cuma berisi kartu kalkulatornya).
- **Komisi & Kompensasi** — halaman tunggal (dikelola Admin): deskripsi
  + banyak lampiran PDF/foto.
- **Urutan menu** — "Kalkulator Aktivitas" muncul tepat di bawah
  "Aktivitas"; "Analisa Kebutuhan Asuransi" di bawahnya; "Rekomendasi
  Produk" muncul tepat di bawah "Kalkulator Finansial"; "Komisi &
  Kompensasi" tepat di bawah "Rekomendasi Produk"; "After Sales & Claim"
  tepat di atas "Tutorial Digital"; sisanya tetap terurut alfabetis A-Z.
- **Menu Administratif** — sidebar admin diringkas jadi satu link
  ("Menu Administratif") yang membuka halaman index berisi daftar semua
  menu Kelola (After Sales & Claim, Analisa Kebutuhan Asuransi, Komisi &
  Kompensasi, Member, Produk, Promo & Kontes, Recruit, Tutorial) sebagai
  kartu yang bisa diklik.
- Menu di sidebar (member maupun Admin) pada dasarnya **terurut
  alfabetis A-Z**, dengan beberapa pengecualian posisi manual (lihat
  poin "Urutan menu" di atas).
- **Database Calon Nasabah / Calon Agen**: tiap member punya database
  kontak sendiri (Nama, Nomor Telepon, Kategori — Calon Agen / Calon
  Nasabah / Calon Agen & Nasabah — tanggal tercatat otomatis). Kontak
  ditambahkan langsung dari form Catat Aktivitas (opsi "➕ Tambah Kontak
  Baru").
- **Aktivitas Member (sistem poin, alur terpadu)**: form Catat Aktivitas
  sekarang satu alur — pilih **Jalur Penjualan** atau **Jalur
  Rekrutmen** dulu, baru form menyesuaikan:
  - **Jalur Penjualan**: pilih nama dari database (kategori Calon
    Nasabah / Calon Agen & Nasabah) → **Type Activity** (radio wajib):
    Fact Finding (3 poin), Presentation (5 poin), atau Closing (10
    poin, ada field tambahan **Produk yang Dijual** + **Nominal
    Premi/Tahun** — angka saja).
  - **Jalur Rekrutmen**: pilih nama dari database (kategori Calon Agen
    / Calon Agen & Nasabah) → Type Activity: Fact Finding, Presentation,
    atau Recruit (10 poin, field catatan berubah jadi **"Level Agen
    yang Direkrut"**, foto wajib berlabel **"Bukti Transfer AAJI"**).
  - Nomor Telepon otomatis terisi begitu nama dipilih. **Tanggal
    terkunci ke hari ini** (tidak bisa back-date). Field **"Hasil
    Pertemuan"** (atau label khusus di atas) **wajib diisi**, foto
    bukti **selalu wajib** di semua jenis aktivitas.
  - Poin baru terhitung sebagai **Valid Point** setelah Admin menekan
    tombol **"Valid"** — sebelum itu poin tampil sebagai **Unconfirmed
    Point**. Kedua angka ini tampil di sisi member (Ringkasan &
    Aktivitas) maupun Admin (Ringkasan Aktivitas & detail per member).
    Aktivitas bisa **diedit di hari yang sama** (edit otomatis
    membatalkan validasi, perlu divalidasi ulang).
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
2. Buat 10 tab (sheet) dengan nama **persis**: `Members`, `Products`,
   `Activities`, `Promo`, `Tutorials`, `Recruit`, `AnalisaKebutuhan`,
   `KomisiKompensasi`, `AfterSalesClaim`, `Contacts`.
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

## Catatan Penting: Batas Kemampuan Proteksi Dokumen

Halaman dengan lampiran PDF/foto (Produk, Promo, Recruit, Analisa
Kebutuhan Asuransi, Komisi & Kompensasi, dst) **tidak punya tombol
download**, klik kanan/seleksi teks pada area viewer dinonaktifkan, dan
**file baru** dilayani lewat proxy sendiri (`/api/drive-file/[fileId]`)
alih-alih lewat halaman viewer Google — jadi tombol "Pop-out" yang
mengarah ke sumber asli file di Drive juga tidak muncul lagi.

Ini menaikkan friksi secara signifikan untuk pengguna biasa yang iseng
mau menyimpan/copy — **tapi tetap bukan proteksi keamanan yang
benar-benar kedap**, karena satu batasan mendasar yang tersisa:

**Aplikasi ini belum punya sistem login/session sisi server** — login
yang ada sekarang murni dicek di browser (client-side). Karena itu,
proxy `/api/drive-file/[fileId]` kita sendiri saat ini masih bisa
diakses langsung oleh siapa pun yang tahu URL-nya (misalnya dengan
membuka **Network tab** di DevTools browser lalu menyalin URL-nya),
**tanpa perlu login ke Pocket Book sama sekali** — karena route API
ini belum memeriksa siapa yang memintanya.

**Supaya dokumen benar-benar "exclusive hanya bisa dilihat sebagai
member"** (proxy-nya sendiri menolak permintaan dari siapa pun yang
belum login), dibutuhkan perubahan arsitektur yang lebih besar: sistem
login berbasis session/cookie di server (bukan cuma di browser seperti
sekarang), ditambah pengecekan session itu di dalam
`app/api/drive-file/[fileId]/route.js` sebelum mengalirkan isi filenya.
Ini proyek tersendiri yang cukup besar — beri tahu saya kalau Anda
ingin saya bangunkan itu di sesi berikutnya.

### ⚠️ Migrasi: File Lama Perlu Diupload Ulang

Perbaikan "tanpa tombol Pop-out" ini **hanya berlaku untuk file yang
diupload setelah update ini**. File yang sudah ada sebelumnya masih
memakai link viewer Google yang lama, dan masih akan menampilkan
tombol Pop-out sampai file itu diunggah ulang. Untuk memperbaikinya:
buka halaman Kelola yang sesuai (mis. Kelola Produk) → **Ubah** produk
itu → **Ganti File** pada field yang bersangkutan → upload ulang file
yang sama → **Simpan**.

## Update Selanjutnya

```bash
git add .
git commit -m "Deskripsikan perubahan Anda di sini"
git push
```

Vercel otomatis deploy ulang setelah push ke `main`.
