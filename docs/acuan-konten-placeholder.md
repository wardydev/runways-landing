# Acuan Konten Placeholder Landing Page

Tanggal pemeriksaan: 26 Oktober 2026. Status: riset awal dan draft konten internal.

## 1. Sumber dan batas pemeriksaan

Sumber: [homepage Legal Usaha Lombok](https://lombok.legalusaha.com/).

Metode: ekstraksi teks homepage yang dapat diakses publik. Pemeriksaan ini belum mencakup isi halaman artikel, pengujian tombol WhatsApp, atau audit visual melalui browser. Harga, durasi, dan pernyataan hukum pada sumber belum diverifikasi.

Dokumen ini memisahkan ringkasan hasil ekstraksi dari usulan konten orisinal. Foto, logo, identitas, kontak, dan artikel kompetitor tidak digunakan sebagai aset website kita.

## 2. Ringkasan hasil ekstraksi kompetitor

Temuan berikut dirangkum dari [homepage sumber](https://lombok.legalusaha.com/), bukan spesifikasi layanan bisnis kita.

- Alur halaman menghubungkan pengenalan manfaat, keunggulan, pilihan paket, penjelasan kebutuhan legalitas, tahapan layanan, klien, artikel, dan kontak.
- Konversi berpusat pada WhatsApp, dengan tombol konsultasi dan pemilihan paket di beberapa posisi.
- Inventaris penawaran mencakup pendirian PT, PT perseorangan, CV, firma, koperasi, yayasan, perkumpulan; pengurusan NIB/SIUP dan IUMKM; perubahan akta; serta virtual office.
- Kartu paket memuat nominal, pembanding harga pada beberapa penawaran, cakupan dokumen, estimasi waktu pada sebagian kartu, dan tombol kontak.
- Ada dua penawaran PT perseorangan dengan nominal berbeda; jangan memperlakukannya sebagai satu harga yang telah dikonfirmasi.
- Materi artikel mencakup bentuk usaha, administrasi perpajakan, perizinan, merek, dan kebutuhan UMKM. Daftar homepage juga mencampur topik serta wilayah lain.
- Terdapat bagian klien. Portfolio studi kasus dan galeri terpisah tidak teridentifikasi pada ekstraksi teks.

Kesimpulan rancangan kita: tampilkan paket unggulan yang ringkas, arahkan pengunjung ke detail layanan, dan pilih artikel sesuai kebutuhan audiens. Harga serta layanan akhir menunggu keputusan pemilik bisnis.

## 3. Arahan visual dan pengelolaan

- Acuan UI: `templates/apps/templates/pages/index2.html`.
- Primary: `#C60E08`; secondary: `#F8D11C`.
- Pertahankan karakter layout, tipografi, kartu, tombol, dan spacing template saat menyesuaikan section.
- Gunakan label Indonesia, navigasi sederhana, CTA yang konsisten, dan tata letak mobile yang nyaman.
- Konten dikelola melalui file JSON lokal. Desain dan urutan sepuluh section mengikuti rancangan tetap.
- Nama `[Nama Brand]`, `[Wilayah Layanan]`, dan data kontak merupakan placeholder yang harus diganti.

## 4. Draft placeholder orisinal untuk sepuluh section

Seluruh teks di bagian ini merupakan usulan baru. Kemampuan layanan, harga, dan penawaran belum menjadi komitmen bisnis.

### 01 — Hero + WhatsApp CTA

- Label: Pendampingan Legalitas Usaha.
- H1: Siapkan Legalitas, Bangun Langkah Bisnis Anda.
- Deskripsi: Diskusikan kebutuhan usaha Anda bersama [Nama Brand]. Temukan pilihan layanan dan pendampingan administrasi yang sesuai dengan rencana bisnis Anda di [Wilayah Layanan].
- CTA utama: Konsultasikan Kebutuhan Saya.
- CTA pendamping: Lihat Pilihan Paket.
- Visual: placeholder ilustrasi bisnis; jangan memakai foto tim yang menyiratkan identitas nyata.
- JSON: `home.json` dan `site.json`.

### 02 — Why Choose Us

- Judul: Pendampingan yang Membantu Anda Memahami Setiap Langkah.
- Kebutuhan lebih terarah: Mulai dengan pembahasan kebutuhan dan tujuan usaha.
- Cakupan lebih jelas: Tinjau pekerjaan yang termasuk dalam paket sebelum memutuskan.
- Informasi mudah diikuti: Ketahui dokumen dan tahapan yang perlu disiapkan.
- Komunikasi praktis: Hubungi tim melalui satu jalur konsultasi WhatsApp.
- JSON: daftar `benefits` pada `home.json`.

### 03 — Pricing

- Judul: Pilih Pendampingan Sesuai Kebutuhan Usaha.
- Pengantar: Bandingkan cakupan paket, lalu diskusikan kebutuhan khusus Anda bersama tim.
- Catatan wajib pada prototipe: Harga dan cakupan berikut adalah data dummy untuk pengujian tampilan.

| Layanan contoh | Paket contoh | Harga dummy | Cakupan contoh |
|---|---|---:|---|
| Administrasi usaha | Awal | Rp750.000 | Pemetaan kebutuhan dan daftar kelengkapan awal |
| Administrasi usaha | Pendampingan | Rp1.250.000 | Cakupan Awal ditambah pendampingan administrasi sesuai kesepakatan |
| Persiapan pendirian usaha | Terarah | Rp3.500.000 | Diskusi bentuk usaha, pemeriksaan kelengkapan, dan koordinasi tahapan |

- Tombol: Diskusikan Paket Ini.
- Estimasi: Ditentukan setelah pemeriksaan kebutuhan dan kelengkapan dokumen.
- Promo dan harga coret dikosongkan sampai ada penawaran yang disetujui.
- JSON: `services.json` → `packages.json`. Contoh di atas menunjukkan satu layanan dengan beberapa paket.

### 04 — Section Explanation

- Judul: Mulai dari Kebutuhan Usaha Anda.
- Isi: Setiap usaha memiliki kebutuhan administrasi yang berbeda. Ceritakan rencana, bidang kegiatan, dan kondisi usaha Anda agar ruang lingkup pendampingan dapat dibahas dengan jelas.
- Kartu contoh: Persiapan Pendirian Usaha; Pendampingan Administrasi; Pembaruan Data Usaha.
- CTA: Pelajari Layanannya.
- JSON: `services.json`; tautkan ke `/layanan/[slug]`.

### 05 — Section How To

- Judul: Alur Pendampingan yang Mudah Diikuti.
1. Ceritakan kebutuhan: Sampaikan rencana dan pertanyaan melalui WhatsApp.
2. Tinjau pilihan: Bahas cakupan, biaya, dan perkiraan tahapan bersama tim.
3. Siapkan kelengkapan: Lengkapi data sesuai kebutuhan layanan yang disepakati.
4. Ikuti proses: Terima informasi perkembangan dan hasil sesuai kesepakatan.
- JSON: `process_steps` pada `home.json`.

### 06 — Portfolio

- Judul: Gambaran Pendampingan Usaha.
- Pengantar: Contoh berikut hanya untuk memperlihatkan format studi kasus.
- Kartu 1: Contoh Proyek — Persiapan Administrasi Usaha Kuliner.
- Kartu 2: Contoh Proyek — Penataan Kelengkapan Usaha Jasa.
- Ringkasan contoh: Pemetaan kebutuhan dan penyusunan daftar kelengkapan administrasi.
- JSON: `portfolios.json`.
- Item dummy berstatus draft. Untuk prototipe visual, gunakan mockup yang jelas berlabel contoh. Portfolio publik memerlukan status published dan `consent_to_publish=true` dari proyek nyata yang disetujui.

### 07 — Galeri

- Judul: Aktivitas dan Dokumentasi.
- Slot contoh: Ilustrasi Konsultasi; Ilustrasi Diskusi Kebutuhan; Ilustrasi Pemeriksaan Kelengkapan.
- Gunakan placeholder netral dengan caption contoh, tanpa dokumen pribadi, logo klien, atau foto yang menyiratkan kegiatan nyata.
- Isi alt sesuai gambar yang benar-benar digunakan.
- JSON: `gallery.json`; atur caption, kategori, dan urutan.

### 08 — Artikel untuk SEO

- Judul: Bekal Informasi untuk Langkah Bisnis Anda.
- Ide artikel orisinal: Pertanyaan Awal Sebelum Memilih Bentuk Usaha; Checklist Informasi untuk Konsultasi Administrasi; Cara Membandingkan Cakupan Paket Pendampingan.
- Cuplikan contoh: Kenali informasi yang sebaiknya disiapkan agar pembahasan kebutuhan usaha lebih terarah.
- CTA: Baca Artikel dan Lihat Semua Artikel.
- JSON: `articles.json`, `article-categories.json`; homepage menampilkan tiga pilihan dan menautkan halaman detail.
- Jangan menganggap daftar ide ini sebagai artikel siap terbit. Substansi hukum memerlukan rujukan resmi dan review sebelum publikasi.

### 09 — CTA + Offer

- Judul: Sudah Punya Rencana Usaha? Mari Bahas Langkah Berikutnya.
- Isi: Sampaikan kebutuhan Anda dan diskusikan pilihan pendampingan yang relevan bersama [Nama Brand].
- Penawaran awal: Diskusi Kebutuhan Usaha; status gratis atau berbayar masih TBD.
- CTA: Mulai Diskusi di WhatsApp.
- JSON: teks CTA pada `home.json`.

### 10 — Footer

- Deskripsi: [Nama Brand] — Pendampingan administrasi dan kebutuhan legalitas usaha di [Wilayah Layanan].
- Data: `[Logo]`, `[Alamat]`, `[Email]`, `[Nomor WhatsApp]`, `[Jam Operasional]`, dan tautan sosial yang valid.
- Navigasi: Layanan, Artikel, Portfolio, Galeri, Tentang Kami, Kebijakan Privasi.
- JSON: `site.json`; semua CTA menggunakan nomor dari sumber yang sama.
- Selama nomor belum tersedia, sembunyikan tautan WhatsApp aktif; prototipe dapat menampilkan tombol nonaktif berlabel kontak belum diatur.

## 5. Hubungan dengan template dan pengalaman pengguna

Pemetaan ini berdasarkan struktur HTML, belum merupakan persetujuan visual hasil render.

| Section tujuan | Blok dasar dari `index2.html` |
|---|---|
| Hero | Welcome |
| Why choose us | About, disesuaikan menjadi poin keunggulan |
| Pricing | Komponen baru mengikuti kartu dan tombol template |
| Explanation | Services |
| How to | Works, disesuaikan menjadi tahapan |
| Portfolio | Kartu proyek adaptasi pola kartu template |
| Galeri | Grid gambar yang mengikuti spacing template |
| Artikel | Blog |
| CTA + offer | CTA |
| Footer | Footer dengan navigasi dan kontak yang relevan |

Pada mobile, prioritaskan keterbacaan dan perbandingan paket; tampilkan informasi utama tanpa interaksi hover. Jangan menambahkan angka pencapaian, testimonial, atau logo klien sebagai pengisi. Navigasi demo, pencarian, dan newsletter bawaan template tidak termasuk kebutuhan awal.

## 6. Keputusan yang masih menunggu data nyata

- Brand, wilayah layanan, identitas, dan kontak.
- Inventaris layanan, paket, harga, biaya tambahan, serta estimasi pengerjaan.
- Ketentuan konsultasi dan penawaran promosi.
- Aset milik bisnis dan persetujuan publikasi portfolio.
- Review isi hukum dan materi artikel.

Pengembangan awal tetap dilakukan di lokal. Setelah implementasi siap, dokumentasi deployment ke VPS melalui GitHub/Git disusun sesuai lingkungan hosting yang tersedia.
