# Hasil eksekusi I06, I07, I08 dan I09

Keempat batch selesai untuk demo Vue pada 19 November 2026. Alur melanjutkan WO tersimpan dari akhir I05. Hasil akhir yang tersedia adalah tugas **Susun dan ajukan SP2B** pada `Node_siapkan_sp2b`, setelah kewenangan seluruh tim memenuhi pemeriksaan. Implementasi penerbitan surat mengikuti I10.

## Dasar implementasi

Generator `scripts/build-preparation-graph.py` memeriksa SHA-256 sumber BPMN `6aa0861fac3f0467905b234ce25f8e33f8cebd2519029fc9de3a66c931b64cfb`, lalu mengekstrak 299 node, 373 edge dan pemilik lane. `app/preparation-graph.js` berisi metadata sumber tersebut. `app/preparation.js` menjalankan keputusan batch ini dengan mencari edge yang benar-benar menghubungkan node asal dan tujuan. Metadata node tahap mendatang disediakan untuk titik kembali H05–H12 dan handoff. Tindakan tahap mendatang tetap mengikuti batch pemiliknya.

`Repository.command` menjalankan aturan persiapan dalam snapshot transaksi yang sama dengan WO, tugas, audit, versi dan receipt idempotensi. Tugas dari snapshot I05 direkonstruksi ketika dibaca agar pengajuan JSA tersedia dengan identitas WO dan versi yang sama. State lama dan keputusan sebelumnya dipertahankan.

## Penerimaan per batch

| Batch | Implementasi | Bukti penerimaan |
| --- | --- | --- |
| I06 | Dua belas penyebab menyimpan node pemicu, node kembali, koordinator, waktu, alasan dan upaya pemenuhan. Supervisor menetapkan On Hold, meminta pemenuhan dan menilai hasilnya. Pembatalan mempunyai tugas pengajuan Supervisor dan keputusan Manajer. | Empat variasi untuk masing-masing H01–H12 lulus. Resume mengikuti edge ke titik asal. Penolakan batal kembali ke koordinator penyebab yang sama. ID WO, survei dan bukti terdahulu tetap tersedia. |
| I07 | JSA diajukan Preparator, diperiksa P2K3/K3L, lalu disetujui Asman. IBPPR menyusul dengan keputusan tersendiri. Register menyimpan payload, sumber survei, snapshot rencana, berkas, versi dan keputusan. Penolakan kembali ke Preparator untuk revisi atau H01/H02. | Revisi pada kedua tingkat reviewer lulus untuk JSA dan IBPPR. Versi lama tetap dapat dibaca. Browser menguji bahwa perubahan status WO tidak mengubah pengesahan JSA/IBPPR atau menandai SP2B/SP3B terbit. |
| I08 | Preparator memutus kebutuhan izin ketinggian. Jika diperlukan, versi izin melalui Pengawas K3 → Asman → P2K3/K3L → Bagian Terkait. Setelah empat persetujuan, Preparator mencatat izin. Versi terbit tertaut melalui `heightPermitId`. | Jalur perlu/tidak perlu, penolakan pada empat reviewer, revisi dari Pengawas K3, pencatatan dan H03 lulus. Role di luar giliran dan versi yang salah ditolak. |
| I09 | Daftar personel terstruktur menyimpan tugas, kode kompetensi yang diperlukan, nomor surat, kompetensi pada surat, masa berlaku dan rujukan bukti. Preparator memeriksa seluruh tim terhadap tanggal rencana. Supervisor menentukan pengganti atau pembaruan. Manajer mencatat hasil pembaruan, lalu Preparator memverifikasi lagi. | Seluruh personel valid, tanggal kedaluwarsa, kompetensi tidak sesuai, pengganti, pembaruan dan H04 lulus. Pengganti mempertahankan kebutuhan tugas asal. Surat baru harus melewati pemeriksaan ulang sebelum tugas SP2B muncul. |

## Pengujian

| Pemeriksaan | Hasil |
| --- | --- |
| Regresi domain I02–I05 | 19 skenario lulus. |
| Domain I06–I09 | 67 skenario lulus, termasuk 48 variasi kontrak On Hold. |
| Jejak BPMN | Rangkaian edge audit pada jalur yang diuji cocok dengan asal/tujuan graf XML. |
| Ketahanan transaksi | Reviewer salah, versi dokumen lama, request diulang, penyimpanan gagal dan buka ulang repository diuji. |
| Versi dan berkas | Berkas pendukung terikat ke versi pengajuan. Versi revisi tidak mengambil berkas versi lama secara otomatis. Versi ditolak dan bukti lamanya tetap tersimpan. |
| Pemulihan H04 nyata | Surat dapat dicatat ulang saat pemenuhan. Supervisor tidak dapat menyatakan teratasi selama data tim belum memenuhi. Setelah resume, tugas verifikasi Preparator tetap dijalankan. |
| Browser | Input, klik, Enter pada kartu tugas, picker role, unggah berkas, modal versi, revisi, H01, JSA, IBPPR, empat reviewer izin, pengganti dan pembaruan surat lulus sampai batas SP2B. |
| Status dokumen | Pada Approved, Scheduled, Ongoing dan Completed, pengesahan tetap mengikuti versi dokumen. SP2B dan SP3B tetap belum terbit. Mode blangko kosong juga diperiksa. |
| Responsif dan sintaks | Browser mobile mempunyai scrollWidth sama dengan viewport 390 px pada layar yang diuji. Tidak ada exception browser yang tercatat. Pemeriksaan sintaks dan whitespace lulus. |

Empat variasi H01–H12 adalah teratasi, belum teratasi dan masih bisa ditangani, batal disetujui, serta batal ditolak. Untuk H05–H12, tes memulai fixture langsung di node penahanan. Pemicu surat dan lapangannya menyusul pada I10–I15. H01–H04 sudah tersambung ke proses batch ini. Browser memakai role simulasi dalam satu profil terisolasi. UAT lintas akun nyata mengikuti tahap Laravel.

Jalankan dari root repo:

```powershell
node scripts/test-i02-i05.cjs
node scripts/test-i06-i09.cjs
node scripts/browser-i06-i09.cjs
```

Tes domain memakai Node dan modul repo tanpa paket tambahan. Tes browser memakai Chrome, server lokal sementara dan CDN yang sudah digunakan aplikasi. `CHROME_PATH` dapat menunjuk instalasi Chrome lain. Folder profil browser diabaikan Git. Generator graf memerlukan Python dan sumber BPMN pada `../pdkb-vue/sources/`.

## Bukti visual

| Layar | Bukti |
| --- | --- |
| Penetapan On Hold | [Screenshot](desktop-hold-review.png) |
| Pemeriksaan JSA versi revisi | [Screenshot](desktop-document-review.png) |
| Pratinjau versi dan keputusan | [Screenshot](desktop-version-preview.png) |
| Form surat personel | [Screenshot](desktop-authority-roster.png) |
| Calon pengganti | [Screenshot](desktop-authority-replacement.png) |
| Batas persiapan SP2B | [Screenshot](desktop-sp2b-boundary.png) |
| Batas persiapan SP2B pada mobile | [Screenshot](mobile-sp2b-boundary.png) |

Hasil terperinci terdapat pada `domain-results.json` dan `browser-results.json`. Tangkapan pengajuan, survei dan kelayakan juga tersedia dari jalur browser yang sama.

## Perilaku UI dan data

Judul layar tugas menyebut aksi aktif, seperti **Periksa JSA**. Konteks pengajuan dan survei dapat dibuka melalui details agar bukti dokumen dan tombol keputusan segera terlihat. Register memungkinkan pengguna membuka versi lama, membaca keputusan pada versi itu, mengunduh berkas pendukung dan mengunduh data versi dalam JSON. Modal dapat ditutup dengan Escape dan menahan fokus Tab. Form personel memakai baris berlabel yang dapat ditambahkan, tanpa masukan JSON manual.

Pratinjau JSA mengambil tahapan, bahaya, pengendalian dan nama pemeriksa dari transaksi. Checklist APD contoh pada template lama tidak mengisi versi JSA kerja. Survei menampilkan hasil dan pelaku yang tercatat. Detail tim membaca roster WO terkait. Data contoh I01 tetap tersedia melalui pilihan referensi.

Pengumpulan surat menetapkan daftar personel terstruktur dari rencana tim I05 yang berbentuk teks. Preparator memeriksa kesesuaiannya dengan rencana yang terlihat. Pemeriksaan aplikasi memakai kode kompetensi dan tanggal rencana yang diinput, sedangkan bukti surat ditautkan melalui rujukan per personel. Integrasi penerbit surat dan identitas produksi mengikuti tahap Laravel. Penandatanganan pada demo adalah rekam keputusan simulasi.

Penyimpanan tetap menggunakan browser. Berkas pendukung mendukung PDF dan PNG/JPEG/WebP maksimal 2 MB per berkas, dengan kuota total mengikuti browser. Jika penyimpanan gagal, tindakan tidak dipublikasikan. Unggahan dibatalkan bila pengguna mengganti WO atau role selama berkas sedang dibaca. Pembatalan terkait operasi pada H09–H12 mengikuti terminal XML dan masih membawa keputusan K01 pada roadmap untuk pemakaian lapangan.

## Berkas pekerjaan dan tahap berikutnya

- `app/preparation.js` dan `app/preparation-graph.js` menambahkan aturan serta metadata BPMN.
- `app/workflow.js`, `app/workspace.js` dan `index.html` menyambungkan repository, tugas, form, register serta pratinjau.
- `scripts/build-preparation-graph.py`, `scripts/test-i06-i09.cjs` dan `scripts/browser-i06-i09.cjs` menyediakan generator dan pengujian.
- Folder ini menyimpan bukti hasil, dan roadmap mencatat penerimaan batch.

Fondasi I02 tetap digunakan dan telah lolos regresi. I10 siap dimulai dari tugas SP2B setelah I09. Penerbitan surat dan pemicu H05/H06 merupakan scope I10.
