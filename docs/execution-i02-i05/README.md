# Hasil eksekusi I02, I03, I04 dan I05

Status keempat batch selesai pada 19 November 2026 untuk lingkup demo Vue. Implementasi berada di `app/workflow.js`, `app/workspace.js` dan integrasinya di `index.html`. Layar menggunakan shell Ismina, font Geist/Google Sans dan palet yang tersedia. Kartu tugas tetap berada di kanan pada desktop. Form baru memakai permukaan putih, garis pembatas, label bidang dan tombol yang mengikuti komponen Ismina.

## Hasil per batch

| Batch | Implementasi dan bukti penerimaan |
| --- | --- |
| I02 | Repository menyimpan WO, tugas aktif, versi dokumen pendukung, audit, pemberitahuan serta kontrak operasi/laporan dalam satu snapshot localStorage. Setiap command memeriksa aktor, tugas aktif, versi dan idempotensi. Snapshot baru dipublikasikan setelah penyimpanan berhasil. Domain test membuktikan refresh, ulangi request, versi usang, tab dengan snapshot lama, data rusak, gagal simpan dan retry. |
| I03 | Kunci 17 role konsisten dengan tugas, antrean memakai WO ID aktual, pengusul dibatasi ke owner, cakupan unit diperiksa, dan Super Admin tidak dapat menyetujui sekaligus. Bagian Terkait tidak mendapat P02 dan Komisi Unit tidak mendapat R03. Tes fixture memeriksa antrean untuk 17 role, serta penolakan akses role/owner/unit yang salah. Kartu tugas menerima Enter/Space dan membuka halaman terkait. Header role membungkus ke baris berikutnya pada mobile. |
| I04 | Tiga TL membuat draft dan mengajukan ke Asman → Supervisor → Manajer. Penolakan dari setiap tingkat menjadi tugas Asman untuk meneruskan ke TL asal. Revisi memakai ID sama, dan penghentian mencapai terminal TL terkait. Riwayat menyimpan keputusan sebelumnya. Manajer membuat tugas prioritas untuk Supervisor. Data `Assignment Review` lama mendapat tugas review eksplisit dengan pilihan pengusul hasil verifikasi, alasan, dan salinan persetujuan lama. |
| I05 | Preparator menyimpan hasil survei berversi lalu analisis awal JSA/IBPPR. Supervisor memilih layak, survei ulang, atau penghentian. Penghentian memerlukan tugas pemberitahuan dan menghasilkan catatan untuk pengusul asal. Setelah layak, Preparator mengisi jadwal, personel dan metode. Hasilnya mencapai `Node_kirim_jsa` sebagai batas batch. Permit diperlakukan sebagai konteks, sehingga nomor permit dan tanggal saja tidak membuka pelaksanaan. |

Jalur dokumen JSA berikutnya tersedia sebagai tugas persiapan dengan penjelasan bahwa implementasinya berada pada I07. Modul `On Hold` I06 tetap pekerjaan berikutnya sesuai roadmap.

## Menjalankan dan menguji

Dari root `IWOMS-Ismina`, jalankan `python -m http.server 3000`, lalu buka `http://127.0.0.1:3000/`. Server statis yang sudah tersedia juga dapat dipakai selama folder root menunjuk repo ini.

- `node scripts/test-i02-i05.cjs` menjalankan 19 skenario domain dan menulis `domain-results.json`.
- `node scripts/browser-i02-i05.cjs` menjalankan browser Chrome terisolasi melalui server lokal sementara. Runner memerlukan Chrome pada path Windows standar dan jaringan untuk CDN Vue, Tailwind serta font. Hasilnya tersimpan pada `browser-results.json` dan enam PNG. `CHROME_PATH` dapat menunjuk instalasi Chrome lain.
- `node --check app/workflow.js` dan `node --check app/workspace.js` memeriksa sintaks modul. `git diff --check` memeriksa whitespace.

Runner I01 dan screenshot I01 merupakan artefak historis baseline. Gunakan runner I02–I05 untuk verifikasi implementasi yang sudah berubah.

## Bukti pengujian

| Pengujian | Hasil |
| --- | --- |
| Jalur tiga TL dengan penolakan, revisi ID tetap, prioritas, survei ulang, layak dan rencana | Lulus. Jejak edge tiap tindakan juga diperiksa sambungannya terhadap snapshot XML BPMN I01. |
| Penghentian dari masing-masing TL | Lulus, task berakhir pada `Node_stop_op`, `Node_stop_har` atau `Node_stop_konstruksi`. |
| Penolakan oleh Asman, Supervisor dan Manajer | Lulus, kembali melalui Asman dan tetap satu ID WO. |
| Salah role, unit, owner, urutan serta bypass Super Admin | Lulus pada domain command. |
| Request idempoten dan pemakaian kunci dengan isi berbeda | Lulus, request identik menghasilkan receipt yang sama dan isi berbeda ditolak. |
| Versi usang, snapshot tab lama, kegagalan simpan dan retry | Lulus. Kegagalan simpan mempertahankan data dan tugas sebelum tindakan. |
| Lampiran dan penyimpanan ulang | Lulus, dokumen terhubung ke WO dan tetap ada saat repository dibuka ulang. |
| Survei tidak layak dan pemberitahuan kepada pengusul | Lulus, terminal baru dicapai setelah pemberitahuan disimpan. |
| Browser melalui input/change, click, Enter pada kartu tugas, pratinjau dan refresh | Lulus. Satu WO mencapai batas JSA setelah revisi tanpa berganti ID. Tidak ada exception browser yang tercatat. |
| Mobile 390 × 844 | Lulus pemeriksaan lebar, scrollWidth sama dengan viewport 390 px pada form yang diuji. |

Browser menjalankan satu jalur lengkap memakai pergantian role simulasi dalam profil terisolasi. Variasi negatif, survei ulang, penghentian dan akses diuji melalui domain. UAT lintas akun nyata mengikuti I25–I28.

| Tampilan | Bukti |
| --- | --- |
| Form pengajuan desktop | [Screenshot](desktop-proposal.png) |
| Survei desktop | [Screenshot](desktop-survey.png) |
| Review kelayakan | [Screenshot](desktop-feasibility.png) |
| Rencana selesai dan batas JSA | [Screenshot](desktop-boundary-jsa.png) |
| Batas JSA mobile | [Screenshot](mobile-boundary-jsa.png) |
| Form mobile | [Screenshot](mobile-proposal.png) |

## Data demo dan batas pemakaian

Identitas simulasi memakai `demo:<role>` dan unit `PLN UID YOGYAKARTA`. Repository mendukung pemeriksaan ownerId dan unitId yang berbeda sebagaimana diuji pada domain. Akun, autentikasi dan transaksi multiuser server mengikuti tahap Laravel. Penyimpanan dan sinkronisasi demo memakai browser yang sama. Tab dengan snapshot lama diminta memuat ulang ketika mencoba menulis. Koordinasi transaksi serentak lintas pengguna menjadi bagian I26.

Dataset kerja terpisah dari referensi I01. Opsi **Lihat referensi I01** membuka data contoh untuk pemeriksaan tampilan. Source `Assignment Review` dipertahankan sebagai kasus yang membutuhkan review, dengan persetujuan lama disimpan pada `legacyApprovals`. **Reset demo kerja** tersedia untuk Super Admin dan memerlukan konfirmasi penghapusan dataset browser.

Lampiran pengajuan mendukung PDF dan gambar PNG/JPEG/WebP, maksimal 2 MB per berkas. Penyimpanan browser memiliki kuota total. Jika penuh, error simpan ditampilkan dan snapshot kerja tetap pada keadaan sebelumnya. Formulir digital awal dan survei bisa dibuka melalui **Pratinjau formulir**. Nomor penerbitan dan klaim pengesahan dokumen berikutnya tetap menunggu transaksi batch dokumen.

I02 telah menyediakan fondasi untuk batch berikutnya. I06 dapat mulai menggunakan tugas, versi, perintah dan audit yang tersedia. Keputusan operasional K01–K11 pada roadmap tetap dicatat untuk batch yang membutuhkannya.
