# Deployment Statis ke VPS melalui GitHub dan Git

Website disajikan sebagai file HTML/CSS/JS. Konfigurasi utama: **Nginx HTTPS → server statis Node di `127.0.0.1:4321` yang dikelola PM2 → `/var/www/runways/current`**. Database dan CMS tidak digunakan. Panduan ini belum dijalankan pada VPS pengguna.

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

Sediakan Git, Node/npm sesuai `.nvmrc`, PM2, Nginx, TLS, serta user deploy. Clone ke `/srv/runways/repository`. Berikan akses user deploy ke `/var/www/runways/releases` dan symlink `/var/www/runways/current`. Gunakan deploy key GitHub read-only untuk repository privat. Jalankan PM2 sebagai user deploy yang sama, bukan root. Versi PM2 yang menjadi acuan konfigurasi ini adalah `6.0.13`.

Install dependency dengan `npm ci`. Buat `.env` publik dari contoh, lalu atur domain sebenarnya:

```dotenv
SITE_ENV=staging
SITE_URL=https://runways.sewaclaude.id
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

## 4. PM2 dan Nginx

Setelah release pertama membuat symlink `current`, mulai server statis dari clone repository:

```bash
cd /srv/runways/repository
npm install --global pm2@6.0.13
RUNWAYS_WEBROOT=/var/www/runways pm2 start ecosystem.config.cjs --only runways-web
pm2 save
pm2 startup
```

`pm2 startup` menampilkan perintah instalasi service sesuai user, OS, dan path Node. Administrator menjalankan perintah tersebut agar proses pulih setelah reboot, lalu `pm2 save`. Jika versi/path Node berubah, perbarui service startup. Jangan menjalankan daftar PM2 yang sama sebagai root dan user deploy.

Default PM2 tanpa variabel root adalah `apps/web/dist/` di dalam repository. Untuk menjalankan langsung dari clone, lakukan `npm run build`, kemudian `pm2 start ecosystem.config.cjs --only runways-web`. Mode ini tidak menjamin release atomik ketika build ulang. Panduan release di atas memakai `RUNWAYS_WEBROOT=/var/www/runways` secara eksplisit agar tetap melayani symlink `current`.

Port yang disepakati adalah **4321** untuk PM2 dan App Port pada panel Nginx. Hentikan proses `npm run dev`/preview yang memakai port tersebut sebelum memulai PM2; keduanya tidak dapat memakai alamat dan port yang sama bersamaan.

`ecosystem.config.cjs` kompatibel dengan repository ESM. Satu proses fork menjalankan `scripts/serve-static.mjs`, watch dinonaktifkan, restart otomatis dibatasi ketika startup berulang kali gagal, dan PM2 menunggu sinyal siap. Server memeriksa `index.html` sebelum listen. `NODE_ENV=production` di PM2 tidak mengganti `SITE_ENV` yang dipakai ketika build.

| Variabel environment proses PM2 | Default | Fungsi |
|---|---|---|
| `RUNWAYS_STATIC_ROOT` | `apps/web/dist/` pada repository | Root hasil build; hanya file di root ini yang dilayani |
| `RUNWAYS_WEBROOT` | Tidak diisi | Jika diisi, root menjadi `<RUNWAYS_WEBROOT>/current`, kecuali `RUNWAYS_STATIC_ROOT` juga diisi |
| `RUNWAYS_HOST` | `127.0.0.1` | Bind lokal untuk reverse proxy |
| `RUNWAYS_PORT` | `4321` | Port server statis |

Variabel runtime ini diberikan melalui environment shell/PM2, bukan `.env` konten Astro. Untuk konfigurasi release pada panduan ini, terapkan ulang dengan `RUNWAYS_WEBROOT=/var/www/runways pm2 restart ecosystem.config.cjs --only runways-web --update-env`, kemudian `pm2 save`. Pertahankan override root/port ketika menerapkan ulang konfigurasi. Restart singkat diperlukan jika script server berubah. Pada mode release, deploy JSON/aset cukup mengganti symlink `current`; proses mengambil root release terbaru pada setiap request.

Gunakan `infra/deploy/nginx.pm2.conf.example` untuk domain `runways.sewaclaude.id`, kemudian uji konfigurasi Nginx dan aktifkan sertifikat TLS serta redirect HTTPS. Contoh menyediakan HTTP untuk bootstrap; sertifikat harus dipasang pada VPS. Port 4321 tetap loopback. Hentikan proses development/preview lama yang sebelumnya diproxy setelah upstream baru terverifikasi; jangan menghapus proses PM2 aplikasi lain.

```bash
pm2 status runways-web
pm2 logs runways-web --lines 50
curl -I -H 'Host: runways.sewaclaude.id' http://127.0.0.1:4321/
curl -I http://127.0.0.1:4321/artikel/
curl -I http://127.0.0.1:4321/halaman-tidak-ada/
nginx -t
```

Harapan: beranda/daftar artikel 200, URL hilang 404. Pastikan upstream Nginx mengarah ke proses PM2 pada port 4321. Dev/preview memiliki allowlist domain eksplisit di konfigurasi Astro, tetapi tidak dipakai pada proses PM2 ini. Tidak perlu mengizinkan semua hostname untuk memperbaiki error Vite. Lihat [Astro allowedHosts](https://docs.astro.build/en/reference/configuration-reference/#serverallowedhosts) dan [konfigurasi PM2](https://pm2.keymetrics.io/docs/usage/application-declaration/).

Pastikan URL seperti `/artikel/slug/` dilayani dari `artikel/slug/index.html`, dan URL yang hilang memberikan status 404 dengan halaman `404.html`. Sitemap/robots harus sesuai environment dan domain.

Alternatif tanpa proses Node runtime: `infra/deploy/nginx.conf.example` melayani `/var/www/runways/current` langsung. Pilih satu konfigurasi Nginx untuk domain tersebut; jangan aktifkan kedua contoh sekaligus.

## 5. Rollback dan backup

Simpan rilis sebelumnya. Jika build gagal, symlink aktif tidak diganti. Untuk rollback pada Linux, arahkan symlink ke direktori rilis sebelumnya yang sudah diverifikasi. Backup mencakup repository/aset, konfigurasi publik server, serta rilis yang ingin dipertahankan; tidak ada database konten yang perlu dipindahkan.

Jangan menghapus resource lama di luar repository tanpa memastikan kepemilikannya. Resource backend dari pendekatan sebelumnya belum terhapus bila lingkungan eksekusi tidak memiliki akses; resource tersebut tidak digunakan website statis ini.

## 6. Verifikasi

Periksa beranda, logo, CTA WhatsApp, paket, artikel/detail/kategori/pagination, galeri/filter/lightbox, sitemap, canonical, dan 404. Uji perubahan JSON hingga muncul setelah release serta penghapusan/unpublish artikel agar URL lama tidak tertinggal. Lakukan pemeriksaan mobile, keyboard, Lighthouse, dan persetujuan konten sebelum go-live.
