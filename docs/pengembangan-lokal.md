# Pengembangan Lokal

Website memakai Astro SSG dan data JSON lokal. Gunakan Node `22.23.4` sesuai `.nvmrc`; dependency frontend dikunci pada lockfile root. Tidak ada layanan konten atau database yang perlu dijalankan.

## Menjalankan dan memeriksa

`npm run dev` menyediakan development di port 4321. `npm run build` menghasilkan `apps/web/dist/`, lalu `npm run preview` menyajikan hasil build. Preview alternatif tanpa dependency framework tersedia melalui `build:local` dan `dev:local`; hasil ekspor `.local-preview/` memiliki tautan relatif dan noindex.

Astro/Vite melacak impor JSON sehingga perubahan konten diproses saat development. Preview alternatif memakai snapshot data saat proses dimulai, sehingga perlu dibangun atau dimulai ulang setelah mengedit JSON.

Domain `runways.sewaclaude.id` tercantum dalam `server.allowedHosts` di `apps/web/astro.config.mjs`. Jika development diproxy melalui domain itu, restart proses Astro setelah perubahan konfigurasi. Tambahkan hostname lain secara eksplisit jika diperlukan; jangan gunakan `allowedHosts: true`. `SITE_URL` hanya mengatur URL situs/metadata.

Untuk memeriksa server statis yang digunakan PM2, jalankan `npm run build` kemudian `npm start`. Default-nya `http://127.0.0.1:4321` dengan root `apps/web/dist/`. Pengaturan runtime opsional: `RUNWAYS_STATIC_ROOT` (direktori output), `RUNWAYS_HOST`, dan `RUNWAYS_PORT`; variabel ini dibaca dari environment proses. Server tidak merender source atau mengikuti perubahan JSON sebelum build ulang.

## Pemetaan template

Template asli `templates/apps/templates/pages/index2.html` dipertahankan sebagai referensi. Struktur halaman:

| Urutan | Section | Pola tampilan |
|---|---|---|
| 1 | Hero + WhatsApp | Welcome dengan portrait dan CTA |
| 2 | Why choose us | About dengan visual dan benefit |
| 3 | Pricing | Kartu paket dengan cakupan |
| 4 | Penjelasan layanan | Services dengan ikon dan detail |
| 5 | How to | Tahapan accordion native |
| 6 | Portfolio | Kartu studi kasus dengan consent |
| 7 | Galeri | Grid, filter kategori, lightbox |
| 8 | Artikel SEO | Kartu dan halaman detail/kategori |
| 9 | CTA + offer | Penutup primary/secondary |
| 10 | Footer | Logo, navigasi, dan kontak |

Urutan stylesheet: Bootstrap, `template.css`, lalu `site.css`. Warna primary `#C60E08` dan secondary `#F8D11C`. Logo menggunakan `/assets/images/logo.png`, dengan path yang dapat diganti di `site.json`. Banner pratinjau header sudah dihapus.

Menu mobile mendukung keyboard, Escape, dan pengembalian fokus. Tahapan menggunakan `<details>`; galeri memakai `<dialog>` dengan caption/alt. Aset gambar di bawah hero memakai lazy loading. Pemeriksaan visual responsif dan Lighthouse tetap diperlukan sebelum rilis produksi.

## Mengubah konten

Gunakan [panduan JSON](konten-json.md). File `home.json` mengatur teks landing serta catatan pricing; artikel dan galeri memiliki file terpisah. Kontak WhatsApp terpusat di `site.json`. Halaman detail, kategori, pagination, sitemap, dan navigasi dibentuk dari data published saat build.

Validasi mencegah slug/ID duplikat, kategori tidak ditemukan, tanggal tidak valid, harga negatif, SEO wajib yang kosong, serta konten yang belum layak produksi. Draft, artikel masa depan, dan portfolio tanpa consent tidak masuk halaman publik.

## Konfigurasi publik

`.env` hanya memuat `SITE_ENV=local|staging|production`, `SITE_URL`, analytics opsional `PUBLIC_GA4_ID`, dan `PREVIEW_PORT`. Konfigurasi lokal/staging menghasilkan noindex. Tidak ada pilihan sumber konten atau token autentikasi; JSON selalu menjadi sumber tunggal.
