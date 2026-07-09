"use client";

/**
 * Utilitas hashing password menggunakan SHA-256 (sinkron, tanpa dependensi
 * eksternal) + salt acak per-user + iterasi berulang (stretching sederhana)
 * agar lebih tahan terhadap brute-force dibanding SHA-256 polos.
 *
 * PENTING: karena aplikasi ini (Tahap 1/2) berjalan sepenuhnya di sisi
 * browser tanpa server otentikasi, ini BUKAN pengganti keamanan tingkat
 * server sungguhan. Ini mencegah password tersimpan sebagai teks polos di
 * localStorage / Google Sheet, tapi begitu aplikasi punya backend
 * sungguhan, sebaiknya autentikasi dipindah ke sana (misalnya via NextAuth
 * atau Google Sign-In) agar proses verifikasi tidak lagi berjalan di
 * browser pengguna.
 */

const HASH_ITERATIONS = 1000;

// ---- Implementasi SHA-256 murni (public domain, disederhanakan) ----
function sha256Hex(asciiString) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = "";

  const words = [];
  const asciiBitLength = asciiString.length * 8;

  let hash = (sha256Hex.h = sha256Hex.h || []);
  let k = (sha256Hex.k = sha256Hex.k || []);
  let primeCounter = k.length;

  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  asciiString += "\x80";
  while ((asciiString.length % 64) - 56) asciiString += "\x00";
  for (let i = 0; i < asciiString.length; i++) {
    const j = asciiString.charCodeAt(i);
    if (j >> 8) return "";
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    hash = hash.slice(0, 8);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

function randomSaltHex(bytes = 16) {
  const arr = new Uint8Array(bytes);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function stretchedHash(password, salt) {
  let value = salt + ":" + password;
  for (let i = 0; i < HASH_ITERATIONS; i++) {
    value = sha256Hex(value + salt);
  }
  return value;
}

/** Menghasilkan string tersimpan berformat "salt:hash" dari password polos. */
export function hashPassword(password) {
  const salt = randomSaltHex();
  const hash = stretchedHash(password, salt);
  return `${salt}:${hash}`;
}

/** Mengecek apakah sebuah string sudah dalam format hash "salt:hash". */
export function isHashed(value) {
  return typeof value === "string" && /^[0-9a-f]{32}:[0-9a-f]{64}$/.test(value);
}

/** Membandingkan password polos dengan hash tersimpan. */
export function verifyPassword(password, stored) {
  if (!isHashed(stored)) return false;
  const [salt, hash] = stored.split(":");
  return stretchedHash(password, salt) === hash;
}
