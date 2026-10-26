# Deployment Statis ke VPS melalui GitHub dan Git

Website disajikan sebagai file HTML/CSS/JS oleh Nginx. Node dibutuhkan untuk build, bukan sebagai backend website. Database dan service CMS tidak digunakan. Panduan server ini belum dijalankan pada VPS pengguna.

## 1. Persiapan repository

Gunakan Node sesuai `.nvmrc`, jalankan pemeriksaan, tes, serta build. Sertakan `package-lock.json`, source, file JSON, dan aset. Periksa staging sebelum commit; `.env`, dependency, hasil build, preview, runtime, cache, dan backup diabaikan Git.

```bash
npm run check
npm test
npm run build
git init -b main
git add .
git diff --cached
git commit -m "Build static landing page with JSON content"
git remote add origin git@github.com:ORGANISASI/REPOSITORY.git
git push -u origin main
```

Ganti URL repository dengan tujuan sebenarnya. Workflow GitHub memvalidasi source dan membangun versi staging noindex; belum melakukan deployment otomatis.

## 2. Persiapan VPS

Sediakan Git, Node/npm sesuai `.nvmrc` jika build dilakukan di VPS, Nginx, TLS, serta user deploy. Clone ke `/srv/runways/repository`. Berikan akses user deploy ke `/var/www/runways/releases` dan symlink `/var/www/runways/current`. Gunakan deploy key GitHub read-only untuk repository privat.

Install dependency dengan `npm ci`. Buat `.env` publik dari contoh, lalu atur domain sebenarnya:

```dotenv
SITE_ENV=staging
SITE_URL=https://domain-anda.id
PUBLIC_GA4_ID=
PREVIEW_PORT=4321
```

Staging dapat digunakan untuk review konten contoh dan tetap noindex. Setelah konten disetujui, nonaktifkan penanda placeholder pada JSON dan ubah `SITE_ENV=production`. Produksi memerlukan URL HTTPS publik dan konten yang lolos validasi.

## 3. Release

`infra/deploy/release.sh` melakukan Git pull fast-forward, instalasi dependency dari lockfile, pemeriksaan, tes, build, lalu menyalin output ke direktori rilis baru. Symlink aktif diganti hanya setelah seluruh tahap berhasil. Lock mencegah dua release bersamaan.

```bash
cd /srv/runways/repository
bash infra/deploy/release.sh
```

File JSON yang diubah melalui Git ikut release berikutnya. Tidak ada webhook atau penerbitan otomatis dari dashboard. Alternatifnya, build dapat dilakukan di CI/lokal lalu hanya folder `apps/web/dist/` yang diunggah ke VPS.

## 4. Nginx dan HTTPS

Adaptasikan `infra/deploy/nginx.conf.example`: ganti hostname dan root direktori, uji konfigurasi Nginx, lalu aktifkan sertifikat TLS dan redirect HTTPS. Contoh hanya memuat HTTP; TLS tetap harus dikonfigurasi pada server. Tidak ada subdomain API atau proxy backend.

Pastikan URL seperti `/artikel/slug/` dilayani dari `artikel/slug/index.html`, dan URL yang hilang memberikan status 404 dengan halaman `404.html`. Sitemap/robots harus sesuai environment dan domain.

## 5. Rollback dan backup

Simpan rilis sebelumnya. Jika build gagal, symlink aktif tidak diganti. Untuk rollback pada Linux, arahkan symlink ke direktori rilis sebelumnya yang sudah diverifikasi. Backup mencakup repository/aset, konfigurasi publik server, serta rilis yang ingin dipertahankan; tidak ada database konten yang perlu dipindahkan.

Jangan menghapus resource lama di luar repository tanpa memastikan kepemilikannya. Resource backend dari pendekatan sebelumnya belum terhapus bila lingkungan eksekusi tidak memiliki akses; resource tersebut tidak digunakan website statis ini.

## 6. Verifikasi

Periksa beranda, logo, CTA WhatsApp, paket, artikel/detail/kategori/pagination, galeri/filter/lightbox, sitemap, canonical, dan 404. Uji perubahan JSON hingga muncul setelah release serta penghapusan/unpublish artikel agar URL lama tidak tertinggal. Lakukan pemeriksaan mobile, keyboard, Lighthouse, dan persetujuan konten sebelum go-live.
