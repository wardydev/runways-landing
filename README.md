# Runways — Website Statis

Landing page berbahasa Indonesia berbasis **Astro SSG**, dengan konten dari file JSON lokal. Desain mengikuti `templates/apps/templates/pages/index2.html`, primary `#C60E08`, dan secondary `#F8D11C`.

Artikel menghasilkan halaman HTML saat build; galeri, paket, layanan, dan teks landing mengikuti data JSON. Website tidak memerlukan database, token, lisensi CMS, atau backend aplikasi.

## Menjalankan proyek

Gunakan Node sesuai `.nvmrc` (`22.23.4`). Dependency frontend sudah dikunci di `package-lock.json`.

```bash
nvm use
npm ci
npm run setup:local
npm run dev
```

Alamat lokal: `http://localhost:4321`. `setup:local` membuat konfigurasi publik `.env` jika belum ada. Tanpa `.env`, default lokal tetap dapat digunakan.

## Mengubah konten

Semua sumber konten berada di `apps/web/src/data/`:

| File | Isi |
|---|---|
| `site.json` | Identitas, logo, nomor WhatsApp, footer, dan SEO default |
| `home.json` | Teks landing, gambar hero, benefit, tahapan, CTA, dan catatan pricing |
| `services.json` | Layanan dan halaman detail |
| `packages.json` | Harga, cakupan, disclaimer, dan urutan paket |
| `articles.json` | Artikel, slug, isi, kategori, tanggal, gambar, dan SEO |
| `article-categories.json` | Nama serta slug kategori artikel |
| `gallery.json` | Gambar, judul, caption, kategori, alt text, dan urutan galeri |
| `portfolios.json` | Studi kasus dan persetujuan publikasi |
| `faqs.json` | Pertanyaan umum/global atau terkait layanan |

Simpan gambar di `apps/web/public/assets/images/` lalu gunakan URL `/assets/images/nama-file.jpg`. Pengembangan Astro mengikuti perubahan JSON; hasil website yang sudah di-deploy memerlukan build dan deploy ulang. Petunjuk dan contoh lengkap: [mengelola konten JSON](docs/konten-json.md).

Untuk menghilangkan catatan pricing, ubah `pricing_note_enabled` menjadi `false` di `home.json`. Judul dan teksnya berada pada `pricing_note_title` serta `pricing_note_text`; pengaturan ini terpisah dari penanda konten contoh.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Development Astro dengan perubahan source/JSON |
| `npm run build` | Build statis ke `apps/web/dist/` dan validasi HTML/aset CSS |
| `npm start` | Sajikan hasil build melalui server statis di `127.0.0.1:4321` |
| `npm run preview` | Preview hasil build Astro |
| `npm run check` | Pemeriksaan sintaks, konten JSON, route, dan metadata |
| `npm test` | Uji konten, publikasi, harga, WhatsApp, keamanan markup, dan rendering |
| `npm run check:build` | Validasi hasil kompilasi Astro |
| `npm run build:local` | Preview HTML mandiri di `.local-preview/` |
| `npm run dev:local` | Preview HTTP sederhana tanpa framework |

## Konfigurasi dan deployment

`.env` hanya menggunakan `SITE_ENV`, `SITE_URL`, `PUBLIC_GA4_ID` opsional, dan `PREVIEW_PORT`. Tidak ada pilihan mode sumber data; konten selalu berasal dari JSON. Local/staging memakai noindex. Produksi memerlukan domain HTTPS dan konten yang sudah disetujui; build menolak penanda placeholder yang masih aktif.

Konfigurasi PM2 tersedia di `ecosystem.config.cjs`: Nginx → `127.0.0.1:4321` → server file statis → `apps/web/dist/`. Setelah `npm run build`, proses dapat dimulai dengan `pm2 start ecosystem.config.cjs --only runways-web`. Hentikan development/preview yang memakai port sama sebelum memulai PM2. Proses `runways-web` memakai satu instance tanpa watch; setelah build berikutnya selesai, file terbaru langsung dilayani.

Untuk deployment atomik, mulai PM2 dengan `RUNWAYS_WEBROOT=/var/www/runways` agar root menggunakan symlink `/var/www/runways/current`. Script release memvalidasi dan membangun output sebelum mengaktifkan release baru, sehingga rilis sebelumnya tetap dilayani jika build gagal. Alternatif Nginx yang melayani file langsung juga tersedia.

Domain `runways.sewaclaude.id` diizinkan secara eksplisit pada Astro development/preview. Untuk server publik gunakan konfigurasi PM2/Nginx pada [panduan VPS](docs/deployment-vps.md). `SITE_URL` mengatur metadata saat build; variabel runtime `RUNWAYS_STATIC_ROOT`, `RUNWAYS_HOST`, dan `RUNWAYS_PORT` mengatur server statis.

- [Mengelola JSON](docs/konten-json.md)
- [Pengembangan dan pemetaan template](docs/pengembangan-lokal.md)
- [Deployment VPS melalui GitHub/Git](docs/deployment-vps.md)
- [Persiapan GitHub](docs/persiapan-github.md)
- [Status implementasi](docs/status-implementasi.md)
- [Acuan konten placeholder](docs/acuan-konten-placeholder.md)
- [PRD terbaru](PRD.md)
