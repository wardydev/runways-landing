# Status Website Statis

Diperbarui: 27 Oktober 2026. Arah implementasi sekarang Astro SSG dengan data JSON lokal.

## Selesai pada source

- Sembilan file JSON menjadi sumber konten tunggal untuk identitas, homepage, layanan, paket, artikel, kategori, portfolio, galeri, dan FAQ.
- Loader konten tidak memakai jaringan, database, autentikasi, atau pilihan mode sumber data.
- Landing mengikuti sepuluh section termasuk footer, template `index2.html`, warna brand, logo pengguna, serta CTA WhatsApp dengan nomor sementara yang diberikan pengguna.
- Halaman layanan/detail, artikel/detail/kategori/pagination, galeri/filter/lightbox, portfolio yang disetujui, tentang kami, privasi, dan 404 tetap tersedia.
- Catatan pricing dapat diedit atau disembunyikan lewat `home.json`, terpisah dari status placeholder global.
- Metadata, canonical, sitemap/robots, validasi konten, markup aman, dan analytics opsional tetap tersedia.
- Dependency/config/script/runtime source CMS, provisioning database, pemeriksaan lisensi, webhook, service backend, serta pengujian khusus backend telah dihapus.
- `.env` dibersihkan menjadi konfigurasi publik website; password/token/license key lama tidak disalin ke source. Cache npm proyek dan output lama dibersihkan.
- CI, contoh Nginx, release statis, PRD, serta panduan JSON/GitHub/VPS diperbarui. `AGENTS.md` lama dipertahankan sesuai instruksi awal pengguna.
- Domain `runways.sewaclaude.id` ditambahkan ke allowlist Astro development/preview secara eksplisit.
- `ecosystem.config.cjs` mengelola server file statis sebagai `runways-web` pada loopback port 8080. Contoh proxy Nginx dan panduan PM2/reboot tersedia; release mengikuti symlink `current` tanpa restart proses untuk perubahan konten.

## Pengujian yang berhasil

- 24 tes otomatis mencakup publikasi, tanggal artikel, slug/ID, kategori, harga, portfolio consent, galeri draft, catatan pricing, WhatsApp, keamanan markup, metadata, route, aset, server statis, dan konfigurasi PM2.
- Loader berhasil ketika seluruh pemanggilan fetch sengaja dibuat gagal: sumber konten tidak memerlukan API.
- `npm run check`: sintaks modul serta 16 halaman valid.
- Build Astro nyata dengan perubahan sementara pada file JSON menghasilkan halaman artikel baru, tautan daftar artikel, item galeri, dan pembaruan galeri beranda.
- JSON asli dipulihkan dan build diulang: halaman/item uji yang dihapus tidak tertinggal. Build akhir kembali menjadi 16 halaman dengan metadata dan tiga stylesheet yang terverifikasi.
- Preview mandiri `.local-preview/` berhasil dibuat ulang; sintaks script release lolos pemeriksaan shell.
- Nilai secret lama tidak ditemukan pada source yang diperiksa setelah pembersihan `.env`.
- Handler server diuji terhadap hasil build nyata: 16 HTML, tiga stylesheet, logo, sitemap, robots, redirect, dan 404 lolos. Pengujian juga memverifikasi HEAD, penolakan write/traversal/symlink keluar root, dan pergantian release tanpa restart.
- Parser PM2 6.0.13 berhasil membaca konfigurasi CommonJS pada repository ESM. Build dan pemeriksaan sintaks konfigurasi/release lolos.
- Listener HTTP lokal ditolak sandbox dengan `EPERM` pada `127.0.0.1:8080`; tes handler tetap dijalankan tanpa membuka socket. Daemon PM2, service reboot, konfigurasi/TLS Nginx, dan domain pada VPS belum diuji langsung.

## Resource eksternal yang belum dibersihkan

Pengguna telah mengonfirmasi Docker lama dihapus/dihentikan. Pemeriksaan ulang tidak menemukan listener yang terlihat pada port 8055. Namun, akses agen ke socket Docker masih ditolak sehingga sisa volume tidak dapat diverifikasi. Koneksi TCP MySQL lokal juga tetap ditolak (`ERROR 2003 ... (1)`), sehingga database `db_runways` belum dapat diperiksa atau dihapus melalui agen. Tidak ada penghapusan database tanpa verifikasi kepemilikan/data. Resource tersebut tidak dibutuhkan atau dipanggil oleh website statis. Audit ulang source memastikan tidak ada folder backend/runtime/cache, perintah CMS, dependency backend, atau variabel environment rahasia yang tersisa pada konfigurasi aktif proyek.

MySQL yang terpasang pada Mac tidak dihapus. Tidak ada deployment VPS, perubahan DNS, atau push GitHub yang dijalankan pada tahap ini.

## Sebelum produksi

Konten awal masih memuat placeholder. Lengkapi identitas teks bisnis, kontak pendukung, layanan/paket/harga/cakupan final, artikel yang direview, foto sendiri, serta portfolio dengan persetujuan. Atur penanda contoh berdasarkan kesiapan sebenarnya; local/staging tetap noindex.

Pemeriksaan visual mobile/keyboard menyeluruh, Lighthouse, HTTPS/domain, release/rollback di VPS, dan persetujuan konten masih diperlukan sebelum go-live. Teknologi website statis sudah dapat dibangun tanpa backend; kesiapan konten dan operasional produksi dinilai terpisah.
