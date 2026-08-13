# Audit & Perbaikan Keamanan — Java Origins Ecommerce

Tanggal: 2026-08-13
Status: Perbaikan inti selesai; sebagian butuh keputusan/aksi manual

## Ringkasan

Audit menyeluruh terhadap kode produksi (security, bug, hardcoded content).
Temuan diranking critical/major/minor. Sebagian besar critical & major telah
diperbaiki langsung di kode. Sisanya membutuhkan keputusan pemilik atau aksi
di server (cPanel).

---

## Fitur baru yang ditambahkan sebelumnya

### Sistem Review (asli, bukan palsu)

- **DB**: tabel `reviews` (product_id, user_id, rating 1-5, comment, UNIQUE per
  produk per user).
- **API**:
  - `GET /api/reviews?productId=` — list + rata-rata + count (publik).
  - `POST /api/reviews` — login wajib; 1 review per produk per akun (bisa update,
    pakai `ON DUPLICATE KEY UPDATE`).
  - `DELETE /api/reviews?id=` — pemilik review bisa hapus.
  - `GET /api/product-ratings` — agregat rata-rata semua produk (1 query GROUP BY).
- **UI** (produk detail): rating real (rata-rata + jumlah), form review (muncul
  jika login), daftar review, tombol hapus untuk review milik user.
- **Kartu produk** (home & shop): bintang pakai rata-rata real; tidak tampil jika
  belum ada review (tidak ada rating palsu).

### Sistem Auth lengkap

- `POST /api/auth/forgot` — buat token reset (hash SHA-256), expiry 1 jam, rate
  limit 5/15 menit/IP, tidak membocorkan apakah email terdaftar. Halaman
  `/forgot-password`.
- `POST /api/auth/reset` — verifikasi token (hash + expiry + single-use), update
  password. Halaman `/reset-password?token=...`.
- `POST /api/auth/change-password` — login wajib, verifikasi password lama.
  Tab "Security" di `/profile`.
- **SMTP**: `src/lib/mailer.ts` (nodemailer). Jika SMTP belum dikonfigurasi,
  email di-log ke console (dev tetap jalan). Konfigurasi via env `SMTP_HOST/PORT/
  SECURE/USER/PASS/FROM`.

---

## ✅ Diperbaiki di kode (commit/sesi ini)

### Security

| # | Masalah | Perbaikan |
|---|---------|-----------|
| C2 | Guard `SESSION_SECRET` bisa dilewati placeholder `change-this-to-a-random-secret-in-production` | `src/lib/auth.ts` — blokir placeholder eksplisit + wajib min 16 karakter |
| C4 | Token session tanpa `exp` (replayable selamanya) | `signPayload` embed `exp` (7 hari); `verifyPayload` tolak expired |
| C6 | Rate limit bisa dispoof via `X-Forwarded-For` | Pakai `req.ip` (forgot, upload) |
| C7 | Open redirect `?redirect=//evil.com` | `safeRedirect()` baru di `src/lib/redirect.ts`, dipakai di login/register/admin-login |
| M2 | Token reset lama tetap valid setelah request baru | `createPasswordReset` invalidasi semua reset lama email tsb |
| M5 | `updateOrderStatus` tidak transaksional | Dibungkus transaction (status + stok atomic) |
| M8 | `paymentMethodId` tidak divalidasi | Validasi metode aktif di POST order |
| M10 | `error.message` bocor ke client | Hanya error bisnis yang ditampilkan (400), selain itu 500 generic |
| M11 | Review upsert racy (duplicate → 500) | `INSERT ... ON DUPLICATE KEY UPDATE` |
| m11 | Reset URL fallback ke `Host` header (spoofable) | Produksi wajib `NEXT_PUBLIC_SITE_URL` |

### Bug / logika

| # | Masalah | Perbaikan |
|---|---------|-----------|
| C8 | Stok salah saat REJECTED↔WAITING_APPROVAL (double-restore / oversell) | Restore stok hanya dari status pengunci; re-reserve saat REJECTED→WAITING |
| m1 | Duplikasi `SHIPPING_OPTIONS` (checkout vs orders API) | Single source di `src/lib/shipping.ts` |
| m2 | WhatsApp total pakai total client (bisa beda dgn server) | Pakai `orderData.totalAmount` dari respons API |
| m3 | `in` operator rentan `__proto__` | `Object.hasOwn` |

---

## ⚠️ Butuh keputusan / aksi manual

### 1. KRITIS — Secret & PII ter-commit di git (C1, C3, m13)

**Sudah diperbaiki (sesi ini):** `.env`, `data/db.json`, `src/data/db.json` di-untrack
dari git (`git rm --cached`). File tetap ada di disk (app tetap jalan), tapi tidak
lagi ikut versi git. Catatan: db.json adalah sisa database JSON sebelum migrasi ke
MySQL — app tidak membacanya, hanya file-nya tersimpan di riwayat git.

**Masih perlu (jika repo pernah di-push publik):** purge riwayat dengan
`git filter-repo` / BFG agar file tidak bisa dipulihkan dari commit lama, lalu
rotate `SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, kredensial DB. Akun yang password
plaintext-nya tersimpan di riwayat wajib re-hash.

### 2. Rate limiting login/register & order (C5, C9)

**Sudah dikerjakan (sesi ini):** helper shared di `src/lib/rate-limit.ts`
(`isRateLimited` + config `LIMITS`). Dipasang di:

| Endpoint | Limit (per IP per 15 menit) |
|----------|------------------------------|
| `POST /api/auth/login` | 10 percobaan |
| `POST /api/auth/register` | 5 pendaftaran |
| `POST /api/admin/login` | 5 percobaan |
| `POST /api/auth/change-password` | 5 |
| `POST /api/auth/reset` | 5 |
| `POST /api/auth/forgot` | 5 |
| `POST /api/orders` | 10 pesanan |
| `POST /api/upload` | 20 (perilaku lama) |

Catatan keputusan: order TIDAK wajib login, tapi dibatasi 10/15 menit per IP —
tidak mengganggu pembeli normal, menghambat bot yang ingin mengunci stok.
Limit sengaja longgar agar alur bisnis tidak terganggu. In-memory → reset saat
process restart (acceptable untuk shared hosting).

Masih open: purge riwayat git jika repo pernah di-push publik.

### 3. Nomor WhatsApp — **DIPUTUSKAN: pakai 460**

Nomor resmi: `6282130613460`. `NEXT_PUBLIC_ADMIN_WA` di `.env`, fallback di
`checkout/page.tsx` dan `PartnerBanner.tsx` sudah diubah ke `6282130613460`.

### 4. Hardcoded kontak di Footer — **DIPUTUSKAN: biarkan** (sudah benar)

### 5. Seed data menutupi kegagalan API — **DIPUTUSKAN: tambah indikator error**

Komponen `FetchErrorBanner` baru; dipasang di home, shop, dan product detail.
Saat fetch gagal, banner amber tampil ("Gagal memuat data dari server...") dan
seed data tetap sebagai fallback agar halaman tidak kosong.

### 6. Env vars di cPanel (wajib sebelum deploy)

Tambahkan/update di cPanel → Node.js App → env:
```
SESSION_SECRET=<string acak 32+ karakter>   # JANGAN pakai nilai .env lokal
NEXT_PUBLIC_SITE_URL=https://javaorigins.co.nz
NEXT_PUBLIC_ADMIN_WA=6287864562253          # pastikan nomor benar
SMTP_HOST=smtp.javaorigins.co.nz
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@javaorigins.co.nz
SMTP_PASS=***
SMTP_FROM="Java Origins <noreply@javaorigins.co.nz>"
```

---

## Minor yang belum dikerjakan

| # | Temuan |
|---|--------|
| M1 | Enumeration via register ("Email sudah terdaftar") |
| M3 | Tabel `password_resets` tumbuh tanpa pembersihan (perlu cleanup berkala) |
| M4 | Transisi status admin tidak dibatasi (bisa REJECT order SHIPPED) |
| M6 | Upload cek MIME client saja, tanpa magic-byte sniffing |
| M7 | Tidak ada cek Origin/CSRF token (risiko rendah krn SameSite=Lax) |
| M9 | Ganti password tidak invalidasi sesi lama |
| m6-m9 | Hardcoded Unsplash URLs, default form admin (BCA 8830123456, harga 14.99), teks "ASB Bank Transfer" di order page, "Bank Transfer BCA" di cart |
| m10 | `removeConsole: false` sisa debug; `mailer.ts` log email recipient |

---

## Sudah diverifikasi bersih

- SQL injection: semua query parameterized; dynamic SET dari whitelist column map.
- Rating/review palsu ("12 Customer Reviews") sudah dihapus total.
- Reset token: disimpan SHA-256 (bukan plaintext), expiry 1 jam, single-use.
- Upload path traversal: nama file client diabaikan, random name.
- Money integrity: server recompute harga + shipping, tolak total dari client;
  stock decrement pakai `FOR UPDATE` dalam transaksi.

---

## Catatan tambahan

- `.env` lokal sekarang memakai `SESSION_SECRET` acak (`DG7LzAwUyhEkR2J8Ma34qOVuXfnjN9pc`)
  — hanya untuk dev lokal. Di cPanel WAJIB nilai acak sendiri (jangan salin dari .env).
- Perubahan kode yang berhubungan dengan env baru (SMTP) dan guard secret perlu
  verifikasi pasca-deploy: coba alur forgot-password di production dengan email
  asli setelah SMTP terisi.
