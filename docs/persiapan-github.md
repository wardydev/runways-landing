# Persiapan GitHub

Source sekarang berupa Astro statis, data JSON, serta aset. Sertakan `apps/web/src/`, `apps/web/public/`, `scripts/`, `infra/deploy/`, `tests/`, `docs/`, konfigurasi Astro, `.env.example`, dan lockfile root. Template asli tetap menjadi referensi desain.

Sebelum commit, jalankan pemeriksaan, tes, dan build; periksa `git diff --cached`. Jangan sertakan `.env`, dependency, output build, preview, runtime, cache, atau backup. Seluruh konfigurasi rahasia pendekatan lama telah dikeluarkan dari `.env` proyek. Deployment statis hanya memakai konfigurasi domain/environment dan analytics opsional.

Artikel/galeri/layanan/harga kini diatur lewat `apps/web/src/data/*.json`. Tidak ada package native, script CMS, konfigurasi database, webhook rebuild, atau token. Pipeline CI membangun staging noindex; push ke GitHub belum otomatis men-deploy VPS.

`AGENTS.md` lama dipertahankan tanpa perubahan sesuai instruksi awal pengguna. [PRD terbaru](../PRD.md) dan [panduan pengembangan](pengembangan-lokal.md) menjadi acuan arsitektur statis saat ini.

Lihat [pengelolaan konten](konten-json.md), [deployment VPS](deployment-vps.md), dan [status verifikasi](status-implementasi.md).
