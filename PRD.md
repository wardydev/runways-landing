# PRD — Website Statis Runways

Status: arah arsitektur diperbarui pada 27 Oktober 2026 sesuai keputusan pengguna. Dokumen ini menggantikan rancangan backend sebelumnya.

## Tujuan

Website company profile dan akuisisi lead untuk pendampingan legalitas serta administrasi usaha. Pengunjung mengenali layanan, membandingkan cakupan paket, membaca artikel, melihat galeri/portfolio yang disetujui, lalu menghubungi melalui WhatsApp.

## Arsitektur

Astro SSG menghasilkan HTML statis dari file JSON lokal. Aset disimpan di public. Tidak ada CMS, database, backend autentikasi, atau lisensi layanan konten. Pembaruan mengikuti edit JSON/source → GitHub → build → deploy statis. Nginx menyajikan hasil build; Node hanya digunakan saat development/build.

## Desain dan halaman

Template utama: `templates/apps/templates/pages/index2.html`. Warna primary `#C60E08`, secondary `#F8D11C`. Logo dari aset pengguna, default `/assets/images/logo.png`.

Homepage mencakup hero + CTA WhatsApp, why choose us, pricing, penjelasan layanan, how to, portfolio, galeri, artikel SEO, CTA + offer, dan footer. Pertahankan kesesuaian visual template dan pengalaman mobile. Halaman pendukung: layanan/detail, artikel/detail/kategori/pagination, portfolio/detail yang disetujui, galeri, tentang kami, privasi, dan 404.

## Konten JSON

Data berada di `apps/web/src/data/`: `site.json`, `home.json`, `services.json`, `packages.json`, `articles.json`, `article-categories.json`, `gallery.json`, `portfolios.json`, dan `faqs.json`.

Artikel mempunyai ID, slug unik, judul, excerpt, kategori, penulis, tanggal publikasi/pembaruan, status, body, gambar/alt, dan SEO. Galeri mempunyai ID, gambar, judul, kategori, caption, alt, status, dan urutan. Identitas/kontak/WhatsApp terpusat di site; teks landing dan catatan pricing berada di home. Paket merujuk ID layanan serta memuat nominal IDR, cakupan, estimasi, dan ketentuan.

Konten awal boleh berupa placeholder Indonesia. Referensi kompetitor hanya untuk inventaris dan struktur; artikel, foto, identitas, dan klaim tidak disalin. Materi usaha/harga/editorial final perlu review pemilik bisnis.

## Perilaku dan validasi

Hanya published ditampilkan. Artikel bertanggal masa depan tidak terbit. Portfolio memerlukan consent. Build memvalidasi bentuk data, ID/slug, kategori artikel, harga, SEO wajib, tanggal, dan aset. Markup artikel dibatasi pada tag presentasi aman. Semua CTA memakai nomor WhatsApp terpusat dan pesan ter-encode.

Catatan pricing memiliki toggle, judul, serta isi yang dapat diedit melalui JSON; tampilannya terpisah dari status placeholder. Penanda konten contoh tetap mencegah build produksi sebelum review. Local/staging memakai noindex; produksi membutuhkan domain HTTPS serta metadata, canonical, sitemap, dan robots yang benar.

## Deployment dan penerimaan

Build gagal tidak mengganti rilis live. File yang dihapus atau diarsipkan tidak boleh tertinggal pada output baru. Perubahan slug membutuhkan redirect 301 pada hosting. Tidak ada dashboard editing, upload publik, atau publikasi instan tanpa rebuild.

Penerimaan mencakup edit JSON artikel/galeri yang menghasilkan HTML terbaru, navigasi/404 yang benar, CTA WhatsApp, layout responsif, akses keyboard, metadata dan aset valid, serta audit Lighthouse sebelum produksi. Dokumen deployment GitHub/Git ke VPS mengikuti arsitektur statis ini.
