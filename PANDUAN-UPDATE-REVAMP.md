# Tambahan Fitur: Revamp per Produk

## Apa yang Ditambahkan

Tab baru **"Revamp"** di halaman detail produk, muncul di antara tab
**File Ketsus** dan **Video**.

Isinya dua field yang diisi Admin lewat **Kelola Produk**:

| Field | Keterangan |
|---|---|
| **Deskripsi Revamp** | Teks bebas (kotak panjang). Link http/https di dalamnya otomatis jadi bisa diklik di sisi member. |
| **Google Drive Link** | Opsional. Kalau diisi, member melihat tombol "🔗 Buka Materi Revamp di Google Drive". |

Kalau kedua-duanya kosong, member melihat pesan *"Belum ada materi
Revamp untuk produk ini."* — jadi produk lama yang belum diisi tidak
menampilkan tab kosong yang membingungkan.

Di daftar produk (Kelola Produk), produk yang sudah punya materi Revamp
ditandai **"· Revamp ✓"**.

---

## Catatan Teknis

Kolom baru `revampDescription` dan `revampLinkUrl` ditambahkan ke tab
`Products` di Google Sheet. Kolomnya akan **otomatis terbuat** saat ada
produk disimpan — tidak perlu Anda tambahkan manual.

Berkat perbaikan pembacaan Sheet kemarin (pemetaan berdasarkan **nama
kolom**, bukan posisi), penambahan kolom di tengah daftar seperti ini
**tidak lagi menggeser data lama**. Masalah "Tanggal jadi TRUE" yang
kemarin tidak akan terulang.

---

# Cara Deploy

## ⚠️ Langkah 1: Cek Akun GitHub Dulu

Anda punya dua akun GitHub di komputer ini. Pastikan yang aktif adalah
akun yang benar untuk project ini (**Djebod**), bukan akun kantor
(ITM-achcc).

```powershell
cd C:\Users\057ITM01\Documents\mpa_pocket_book
```

```powershell
git config user.name
```

```powershell
git config user.email
```

**Harus muncul:**
- `Djebod`
- `syam.rakhmany@gmail.com`

**Kalau yang muncul akun kantor (ITM-achcc / itm@astoncirebon.com)**,
perbaiki dulu khusus untuk folder project ini:

```powershell
git config user.name "Djebod"
```

```powershell
git config user.email "syam.rakhmany@gmail.com"
```

*(Tanpa `--global`, jadi hanya berlaku di folder project ini dan tidak
mengganggu project kantor Anda.)*

## Langkah 2: Salin File Update

```powershell
Copy-Item -Path "C:\Users\057ITM01\Downloads\mulia-putri-pocketbook\*" -Destination "C:\Users\057ITM01\Documents\mpa_pocket_book" -Recurse -Force
```

## Langkah 3: Push ke GitHub

```powershell
cd C:\Users\057ITM01\Documents\mpa_pocket_book
```

```powershell
git add .
```

```powershell
git commit -m "catatan perubahan"
```

```powershell
git push
```

💡 Ganti `catatan perubahan` dengan keterangan yang sesuai, misalnya:
`Tambah tab Revamp pada produk`

Kalau diminta login, gunakan username **Djebod** + token GitHub Anda.

---

# Tes Setelah Deploy

1. Tunggu Vercel selesai (status **Ready**, 1-2 menit).
2. Login sebagai **Admin** → **Menu Administratif** → **Kelola Produk**.
3. Pilih salah satu produk → **Ubah**.
4. Scroll ke bagian **Revamp** → isi **Deskripsi Revamp** dan
   **Google Drive Link** → **Simpan Perubahan**.
5. Cek di daftar produk muncul tanda **"· Revamp ✓"**.
6. Buka **Produk** (sisi member) → pilih produk tadi → klik tab
   **Revamp**.
7. Pastikan deskripsi tampil dan tombol **"🔗 Buka Materi Revamp di
   Google Drive"** berfungsi.
8. Cek produk lain yang belum diisi → harus muncul pesan "Belum ada
   materi Revamp untuk produk ini."

Kabari kalau ada yang belum sesuai.
