# Hasil eksekusi I10, I11, I12 dan I13

Keempat batch selesai untuk demo Vue pada 19 November 2026. Satu WO baru dapat melanjutkan dari verifikasi kewenangan, melewati penerbitan surat dan kesiapan lapangan, sampai `Node_periksa_cuaca`. Tugas pemeriksaan kondisi awal berikutnya menjadi scope I14.

## Penerimaan per batch

| Batch | Implementasi | Bukti penerimaan |
| --- | --- | --- |
| I10 | SP2B dan SP3B mempunyai versi, nomor, tim, pemeriksaan Supervisor dan penerbitan Manajer tersendiri. SP3B merujuk versi SP2B yang terbit. | Penolakan pada kedua tingkat reviewer, revisi dan pemulihan H05/H06 lulus. Request penerbitan ulang tidak menambah tanda tangan. Pengajuan memerlukan kewenangan tim yang memenuhi. Pratinjau dua WO menampilkan nomor dan tim masing-masing. |
| I11 | Checklist peralatan/material menyimpan nama, jumlah, satuan, kondisi dan pemeriksaan Supervisor → Kepala Regu. SP2B diserahkan, diterima Pelaksana dan dicatat Preparator. SP3B diterima Kepala Regu lalu Pengawas K3. | Revisi checklist dan H07 lulus. Role, penerima, pengakuan pemahaman dan versi surat diperiksa. Distribusi SP3B yang belum lengkap tidak meninggalkan perubahan sebagian. Tugas kesiapan baru muncul setelah urutan surat selesai. |
| I12 | Kepala Regu menginstruksikan pemeriksaan ulang. Pelaksana mencatat kesiapan alat, material dan APD. Job briefing, kesehatan, safety briefing dan koordinasi rencana mulai tercatat per WO. | H08 kembali ke instruksi pemeriksaan ulang. Kekurangan alat/material memicu H08. Pemeriksaan kesehatan/APD yang belum memenuhi disimpan pada tugas yang sama. Hasil yang memenuhi membuka permintaan SOK. Catatan dan pratinjau briefing membaca rekaman aktual. |
| I13 | Permintaan SOK mengalir Kepala Regu → Area → APD → GI, lalu konfirmasi kembali APD → Area → Kepala Regu. Setiap putaran memiliki ID dan event sendiri. | Salah role, request milik WO lain, putaran lama dan konfirmasi tanpa hasil GI yang memenuhi ditolak. Pengulangan dan H09 lulus. Setelah konfirmasi lengkap, WO mencapai pemeriksaan kondisi awal. Objek operasi contoh PADAM tetap terpisah. |

## Hasil pengujian

| Pemeriksaan | Hasil |
| --- | --- |
| Regresi domain I02–I05 | 19 skenario lulus. |
| Regresi domain I06–I09 | 67 skenario lulus. Ekspektasi batas SP2B diperbarui karena tugasnya kini dapat dikerjakan pada I10. |
| Domain I10–I13 | 17 skenario lulus, termasuk revisi di setiap reviewer surat/checklist, penerima salah, H08/H09, penyimpanan gagal, idempotensi, dan pemisahan dua WO. |
| Jejak BPMN | Edge audit pada jalur yang diuji diperiksa terhadap graf XML, termasuk lintasan pemulihan ke tahap asal. |
| Browser melalui UI | Input, klik, Enter pada kartu tugas dan pergantian role melanjutkan WO sampai batas I14. Jalur mencakup checklist, seluruh tanda terima, H08, pemeriksaan kesehatan ulang, dua putaran SOK dan H09. |
| Pratinjau | Nomor surat, penandatangan dan tim berasal dari versi terbit. Berkas briefing membaca job briefing dan safety briefing yang tersimpan. Binding dua WO diperiksa menggunakan fixture terisolasi. |
| Responsif | Layar mobile yang diuji memiliki scrollWidth sama dengan viewport 390 px. Font tetap Geist dan palet Ismina tetap dipakai. |
| Sintaks dan whitespace | Pemeriksaan modul JavaScript serta `git diff --check` lulus. Tidak ada exception browser yang tercatat pada jalur uji akhir. |

Total pengujian domain adalah 103 skenario. `domain-results.json` menyimpan hasil 17 skenario baru. Hasil regresi tersimpan pada folder eksekusi sebelumnya. `browser-results.json` menyimpan node akhir, versi surat, ID konfirmasi, jumlah putaran, episode penahanan, binding dua WO serta ukuran viewport.

Jalankan dari root repo:

```powershell
node scripts/test-i02-i05.cjs
node scripts/test-i06-i09.cjs
node scripts/test-i10-i13.cjs
node scripts/browser-i10-i13.cjs
```

Tes domain memakai Node dan modul repo. Runner browser memerlukan Chrome serta jaringan untuk CDN aplikasi yang sudah digunakan. Profil dan server pengujian terisolasi. Pengujian browser memakai akun simulasi per role. UAT lintas akun nyata mengikuti tahap Laravel.

## Bukti visual

| Layar | Bukti |
| --- | --- |
| Penerbitan SP2B oleh Manajer | [Screenshot](desktop-letter-issuance-sp2b.png) |
| Penerbitan SP3B oleh Manajer | [Screenshot](desktop-letter-issuance-sp3b.png) |
| Checklist peralatan/material | [Screenshot](desktop-checklist.png) |
| Pemeriksaan kesehatan dan safety briefing | [Screenshot](desktop-safety-briefing.png) |
| Rekam pengaturan SOK oleh GI | [Screenshot](desktop-sok-gi.png) |
| Pratinjau SP2B terbit | [Screenshot](desktop-issued-sp2b-preview.png) |
| Pratinjau briefing aktual | [Screenshot](desktop-briefing-preview.png) |
| Batas pemeriksaan kondisi awal | [Screenshot](desktop-initial-condition-boundary.png) |
| Batas kondisi awal pada mobile | [Screenshot](mobile-initial-condition-boundary.png) |

## Berkas yang dikerjakan

- `app/field-preparation.js` menambahkan serah terima, kesiapan, briefing dan koordinasi SOK.
- `app/preparation.js` menambahkan SP2B, SP3B dan checklist pada kontrak dokumen berversi serta menyambungkan tahap lapangan.
- `app/workspace.js` menambahkan input checklist, pilihan pengawas, pengakuan penerimaan, tampilan pemeriksaan dan event SOK. P04 menampilkan permintaan SOK untuk pemantauan.
- `app/workflow.js` mengembalikan pesan pemeriksaan yang belum memenuhi sambil mempertahankan tugas aktif.
- `index.html` menyambungkan E01/E02/E03 ke tugas kerja, memperbarui pratinjau surat dan briefing, serta memasukkan status baru ke kelompok Kanban yang sesuai.
- `scripts/test-i10-i13.cjs` dan `scripts/browser-i10-i13.cjs` menyediakan verifikasi baru. Helper regresi I06–I09 dapat dipakai tanpa menjalankan seluruh tes saat diimpor.
- Roadmap dan folder ini mencatat penerimaan serta bukti hasil.

## Keputusan implementasi dan batas demo

Nomor surat diisi Preparator dan diperiksa per jenis surat terhadap nomor aktif pada WO lain. Revisi pada WO yang sama tetap mempunyai versi tersendiri. Surat mengambil snapshot tim terverifikasi dan rencana saat diajukan. Penandatangan dan waktu penerbitan berasal dari keputusan aktual. Penanda QR/nomor validasi contoh diganti dengan identitas transaksi dan label demo pada pratinjau kerja.

Penerima pada UI demo menggunakan akun tunggal per lane, seperti `demo:pelaksana_pdkb`. Repository mengikat tanda terima ke ID penerima dan versi surat, sehingga akun lain dengan role sama juga ditolak. Pemetaan akun ke personel produksi mengikuti K08 dan tahap identitas Laravel.

Untuk K03, hasil kesehatan atau APD yang belum memenuhi dicatat tanpa melewati edge ke tugas berikutnya. Pengguna dapat mencatat pemeriksaan ulang pada tugas tersebut. Ini merupakan guard demo yang menjaga kelanjutan tetap tertahan, dengan kriteria operasional dan penanggung jawab perbaikan menunggu keputusan pemilik proses sebelum pilot. K04 juga tetap terbuka untuk jalur formal jika penerimaan surat bermasalah. Pada demo, tugas menunggu pengakuan penerima dan tidak otomatis dianggap selesai.

K01/K05 tetap menjadi keputusan pemilik proses untuk kondisi operasi setelah pembatalan dan eskalasi konfirmasi yang gagal. Riwayat permintaan dan hasil GI dipertahankan. Aplikasi mencatat tindakan petugas dan tidak menyambungkan perintah ke perangkat jaringan.

Penyimpanan, identitas dan persetujuan masih memakai simulasi browser. I14 siap dimulai dari `Node_periksa_cuaca`. Data baru tidak menandai pekerjaan mulai atau selesai fisik hanya karena SOK telah terkonfirmasi.
