# Mengelola Konten JSON

Konten dibaca saat build dari `apps/web/src/data/`. File JSON berada di source, bukan endpoint API. Artikel, kategori, serta galeri langsung mengikuti data saat development; pada website hasil deployment, perubahan memerlukan build dan release ulang.

## Artikel

Tambahkan objek ke array `articles.json`. Gunakan ID dan slug unik. Contoh berikut memakai kategori pertama yang sudah ada; ganti isi dan gambar dengan materi sendiri.

```json
{
  "id": "artikel-004",
  "title": "Menyiapkan informasi awal usaha",
  "slug": "menyiapkan-informasi-awal-usaha",
  "excerpt": "Informasi yang dapat disiapkan sebelum konsultasi.",
  "category_id": "10000000-0000-4000-8000-000000000030",
  "author_name": "Tim Runways",
  "published_at": "2026-10-25T00:00:00Z",
  "updated_at": "2026-10-25T00:00:00Z",
  "status": "draft",
  "is_demo": true,
  "image_url": "/assets/images/blog-img1.png",
  "image_alt": "Pembahasan informasi awal usaha",
  "body": "<p>Tulis pengantar di sini.</p><h2>Informasi awal</h2><p>Tulis penjelasan yang sudah ditinjau.</p>",
  "seo_title": "Menyiapkan Informasi Awal Usaha",
  "seo_description": "Panduan menyiapkan informasi awal agar konsultasi kebutuhan usaha lebih terarah.",
  "noindex": false
}
```

Ubah `status` menjadi `published` setelah review. Tanggal publikasi di masa depan belum menghasilkan halaman publik. `draft`, `review`, dan `archived` tidak ditampilkan. URL terbentuk sebagai `/artikel/menyiapkan-informasi-awal-usaha/`; daftar, kategori, dan pagination ikut diperbarui.

`category_id` harus cocok dengan `id` pada `article-categories.json`. Slug menggunakan huruf kecil, angka, dan tanda hubung. Perubahan slug memerlukan redirect 301 pada hosting; pengelolaan redirect otomatis belum disediakan.

`body` menerima tag sederhana seperti `p`, `h2`, `h3`, `ul`, `li`, `strong`, dan `em`. Script, atribut HTML, serta tag lain tidak dijalankan. JSON wajib valid: gunakan tanda kutip ganda, escape kutip di dalam teks, dan jangan menambahkan trailing comma.

## Galeri

Tambahkan objek pada `gallery.json`:

```json
{
  "id": "galeri-005",
  "title": "Diskusi kebutuhan usaha",
  "category": "Konsultasi",
  "image_url": "/assets/images/tabs-img1.png",
  "alt_text": "Diskusi kebutuhan usaha bersama pendamping",
  "caption": "Penjelasan singkat foto yang disetujui.",
  "status": "draft",
  "is_demo": true,
  "sort": 5
}
```

Gunakan `published` untuk menampilkan gambar dan `sort` untuk mengatur urutan. Filter kategori mengikuti nilai `category`; lightbox mengikuti gambar/caption yang sama. Beranda menampilkan empat item pertama yang published, sedangkan `/galeri/` menampilkan semuanya.

File gambar disimpan di `apps/web/public/assets/images/`; URL tidak menyertakan `public`. Aset di folder public tetap berupa file publik meskipun record galerinya draft. Gunakan foto yang memang boleh disajikan sebagai aset website.

## Landing, kontak, dan harga

- `site.json`: edit `brand_name`, `logo_url`, nomor `whatsapp_number` format `+62…`, kontak, dan footer.
- `home.json`: edit hero, benefit, tahapan, judul section, serta CTA. `pricing_note_enabled=false` menyembunyikan catatan pricing; judul dan isi catatan dapat diubah terpisah.
- `packages.json`: edit nama, `price` IDR, `deliverables`, durasi, disclaimer, dan `sort`. `service_id` merujuk layanan pada `services.json`.
- `portfolios.json`: item hanya tampil jika published dan `consent_to_publish=true`.

Penanda `is_demo` berlaku per item dan `placeholder_mode` berlaku pada identitas website. Menghilangkan catatan pricing tidak mengubah penanda tersebut. Nonaktifkan setelah konten benar-benar selesai direview; build produksi menolak konten contoh yang masih tampil.

## Verifikasi

`npm run check` dan `npm test` memeriksa JSON serta rendering. `npm run build` menghasilkan HTML statis dan memeriksa stylesheet/metadata. Setelah artikel dihapus atau diarsipkan dan build ulang, URL tersebut tidak boleh tersisa pada output baru. Ikuti [deployment](deployment-vps.md) untuk menerapkan perubahan ke VPS.
