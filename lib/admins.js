// Super Admin: satu-satunya akun yang boleh menghapus member ber-role Admin,
// dan satu-satunya yang bisa melihat/mengubah datanya sendiri sebagai Admin.
// Admin lain tidak bisa melihat detail maupun menghapus akun Super Admin ini.
export const SUPER_ADMIN_EMAIL = "syam.rakhmany@gmail.com";

export function isSuperAdminEmail(email) {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

// Dipertahankan untuk kompatibilitas: true jika email adalah Super Admin.
// Role Admin biasa sekarang ditentukan lewat field `role` pada data member
// (bisa diubah oleh admin lain lewat halaman Kelola Member), bukan lagi
// daftar email hardcode.
export function isAdminEmail(email) {
  return isSuperAdminEmail(email);
}
