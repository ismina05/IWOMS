# Roadmap eksekusi IWOMS Ismina

## 1. Dasar dan sasaran

Repo kerja `ismina05/IWOMS`, branch lokal `develop/bpmn-pdkb`. Baseline audit `main` pada commit `438e746c7d5ba46e539155bf272af9ec396f6418`. Pada baseline, aplikasi Vue berada di `index.html`. Pengajuan dan tiga persetujuan awal sudah mengubah data. Tahap berikutnya masih memakai alur parsial, dokumen contoh, atau status yang disimpulkan dari status WO. Revisi antarmuka lokal menjadi baseline visual setelah dicatat pada I01. [Repo pada commit audit](https://github.com/ismina05/IWOMS/tree/438e746c7d5ba46e539155bf272af9ec396f6418)

**Sumber urutan dan kewenangan adalah `Draft BPMN PDKB FINAL.bpmn`.** XML memuat 17 lane, 299 node, 373 sequence flow, 4 titik mulai dan 18 titik akhir. Snapshot sumber tersedia di workspace pada `pdkb-vue/sources/Draft BPMN PDKB FINAL.bpmn`, dengan SHA-256 `6aa0861fac3f0467905b234ce25f8e33f8cebd2519029fc9de3a66c931b64cfb`. Empat dokumen di `pdkb-vue/docs/` mendampingi XML: `ALUR_END_TO_END_PDKB.md`, `BLUEPRINT_WEB_APP_PDKB.md`, `LAMPIRAN_ALUR_PDKB_BPMN.md`, dan `ROADMAP_EKSEKUSI_PDKB.md`. Gunakan lampiran untuk mencari node per lane, alur untuk skenario, blueprint untuk perilaku aplikasi, dan roadmap lama untuk konteks proyek asal. ID `I01` dan seterusnya menunjuk pekerjaan khusus repo Ismina.

Pegangan eksekusi:

- Kerjakan di workspace Ismina. Gunakan shell, tabel, formulir, detail WO, dan pratinjau yang masih cocok. Pertahankan palet, font aktif, tata letak, dan revisi header yang tersedia pada baseline visual. Perubahan layar mengikuti kebutuhan tugas BPMN dan diuji berdampingan dengan baseline.
- Saat masuk, pengguna melihat **tugas yang menjadi gilirannya**, identitas WO atau periode, serta alasan tertahan bila ada. Di layar keputusan, tampilkan bukti yang perlu dibaca, aksi yang bisa dilakukan, dan alasan untuk aksi yang terkunci. Setelah simpan, tampilkan hasil serta tujuan serah terima. KPI, kolom tabel dan kartu harus menjawab kebutuhan kerja role tersebut. Metadata dan riwayat dapat dibuka dari detail.
- Gunakan Vue untuk demo dan adapter lokal yang bertahan setelah refresh. Tahap Laravel menyambungkan UI yang sama ke identitas, basis data, otorisasi, penyimpanan dan audit server. Simulasi pergantian role dipakai untuk demo. Uji lintas akun nyata dilakukan di staging Laravel.
- Setiap keputusan menyimpan WO atau periode, tugas, role dan pelaku, hasil, waktu, versi dokumen bila relevan, alasan dan tujuan serah terima. Nama status untuk UI dapat ringkas. Domain harus membedakan **selesai fisik**, **selesai operasional**, **selesai administrasi `WO Completed`**, penghentian pengajuan, penghentian karena survei dan pembatalan.
- Seri tes mencakup jalur berhasil, revisi, keputusan negatif, salah role, tindakan ulang, refresh dan konflik versi sesuai lingkup batch. Fixture dibuat dari data sintetis dengan label demo. Dokumen dan KPI kerja berasal dari transaksi yang dapat ditelusuri.

## 2. Urutan dan dependensi

Dependensi di tabel adalah prasyarat untuk menerima hasil batch. Uji suatu modul boleh memakai fixture pada titik masuk BPMN setelah kontrak dan penugasan tersedia. Jalur end-to-end diuji lagi dalam I24 dan I28. ID layar merujuk antarmuka Ismina yang diaudit. Layar dapat dipecah bila satu halaman memuat beberapa tugas yang perlu dipisah.

| Batch | Pekerjaan | Prasyarat | Layar utama |
| --- | --- | --- | --- |
| I01 | Baseline, inventaris dan reproduksi | Mulai | D01, P01–P04, E01–E03, R01–R05 |
| I02 | Repository demo dan kontrak alur Vue | I01 | State bersama, Detail WO |
| I03 | Role, kewenangan dan antrean berbasis tugas | I02 | D01, navigasi, Detail WO |
| I04 | Pengajuan, tiga persetujuan dan prioritas | I03 | P01, P02 |
| I05 | Survei, kelayakan dan rencana pelaksanaan | I04 | P03 |
| I06 | Mekanisme `On Hold`, pemulihan dan pembatalan | I03 | Detail WO, antrean Supervisor dan Manajer |
| I07 | Dokumen berversi, JSA dan IBPPR | I05, I06 | P03, pratinjau, tugas dokumen |
| I08 | Izin Kerja Ketinggian awal | I07 | Tugas izin, pratinjau DOC-10 |
| I09 | Surat Kewenangan personel | I08 | P03, penugasan personel |
| I10 | Penerbitan SP2B dan SP3B | I09 | Register dokumen, pratinjau |
| I11 | Checklist peralatan dan distribusi surat | I10 | Tugas dokumen, Detail WO, E01/E02 |
| I12 | Pemeriksaan kesiapan dan briefing lapangan | I11 | E01, E02 |
| I13 | Pemberlakuan dan konfirmasi SOK | I12 | P04, E03, Detail WO |
| I14 | Kondisi awal dan delegasi pengawasan | I13 | E01, E02, BA Delegasi |
| I15 | Pelaksanaan paralel, SWA dan selesai fisik | I14 | E01, E02, Detail WO |
| I16 | Perbaikan WIP lintas WO dan pengesahan | I15 | E02, R02, ringkasan WIP di R03 |
| I17 | Penormalan SOK dan selesai operasional | I15 | E03, R04, Detail WO |
| I18 | Penutupan Izin Kerja Ketinggian | I17, I08 | Tugas izin, R01 |
| I19 | Pemberitahuan Penyelesaian | I18 | R01, R03 |
| I20 | Laporan harian, arsip dan penutupan administratif | I19 | R03, laporan harian, Detail WO |
| I21 | Rekap bulanan, revisi dan persetujuan | I17 | R05 |
| I22 | Pengiriman bulanan dan penerimaan dua Komisi | I21 | R05, antrean Komisi |
| I23 | KPI, tabel, waktu dan ekspor yang dapat diverifikasi | I16, I20, I22 | D01, R01, R03–R05 |
| I24 | UAT lintas 17 lane dan rilis demo Vue | I23 | Seluruh jalur demo |
| I25 | Laravel, identitas dan cakupan akses | I24 | Login, profil, antrean sesuai sesi |
| I26 | Transaksi workflow server dan adapter Vue | I25 | WO, tugas, persetujuan, operasi, riwayat |
| I27 | Bukti privat, arsip, notifikasi dan laporan server | I26 | Dokumen, arsip, R01–R05 |
| I28 | Uji lintas akun, pilot dan serah terima | I27 | Seluruh jalur pada staging |

I06 dapat berjalan paralel dengan I04–I05. Setelah I15, I16 dan I17 dapat dikerjakan terpisah. I21–I22 juga dapat berjalan bersamaan dengan I18–I20 setelah peristiwa selesai operasional tersedia.

## 3. Batch eksekusi

### I01 · Baseline dan reproduksi audit

- **Tujuan** Menetapkan acuan proses, fungsi dan tampilan yang dapat dibandingkan pada tiap batch.
- **Scope** `index.html`, aset blangko, skrip verifikasi, perubahan lokal dan sumber BPMN.
- **Detail eksekusi** Catat commit dan diff lokal, hash BPMN, peta layar dan peran, lalu ambil tangkapan layar acuan desktop dan mobile untuk dashboard, P01/P02, detail, dan pratinjau. Rekam kasus audit dalam matriks bagian 5 sebagai skenario gagal yang dapat diulang. Klasifikasikan data contoh, tombol yang hanya menampilkan notifikasi, serta elemen yang sudah berfungsi.
- **Output** Baseline kode dan visual, daftar skenario regresi, dan inventaris layar serta blangko yang bisa digunakan kembali.
- **Kriteria penyelesaian** Commit, hasil cek BPMN, perbandingan dengan diff lokal, dan cara mereproduksi temuan tercatat. Bukti uji fungsi dibedakan dari bukti browser.

### I02 · Repository demo dan kontrak alur Vue

- **Tujuan** Menyediakan sumber data yang sama untuk WO, tugas, dokumen dan laporan di semua layar.
- **Scope** State Vue, adapter demo, penyimpanan browser, ID dan riwayat transaksi.
- **Detail eksekusi** Pisahkan aturan dan penyimpanan dari template `index.html` secara bertahap. Buat kontrak untuk WO, tugas, versi dokumen, peristiwa operasi, audit dan laporan periode. Simpan identitas tetap, `nodeId`, `edgeId`, versi proses dan versi objek. Perintah tugas memvalidasi role, tugas aktif, versi dan kunci idempotensi sebelum memutasi data. Simpan hasil, tugas berikutnya dan audit sebagai satu pembaruan. Catat waktu kejadian dari sistem dan tampilkan sesuai zona kerja. Sediakan dataset demo terpisah dengan pemuatan ulang dan reset yang jelas.
- **Output** Adapter Vue, skema data demo, dan kontrak yang dapat diadopsi Laravel pada I26.
- **Kriteria penyelesaian** WO dan keputusan bertahan setelah refresh. Aksi ulang tidak membuat tugas ganda. Versi usang diminta memuat ulang. Data fixture tidak mengisi riwayat WO baru dan error simpan tidak meninggalkan pembaruan parsial.

### I03 · Role, kewenangan dan antrean tugas

- **Tujuan** Setiap pengguna menemukan tugasnya dan dapat bertindak sesuai lane serta penugasannya.
- **Scope** Picker 17 role, menu, dashboard D01, panel aksi jika dipakai, dan Detail WO.
- **Detail eksekusi** Petakan role ke 17 lane dan samakan kunci role pada filter, menu dan validasi perintah. Ambil antrean dari tugas aktif, pemilik dan scope, lalu arahkan klik ke objek, versi dan tindakan yang tepat. Pisahkan akses baca dari aksi. Ganti daftar ID contoh, kunci `preparator_pln`/`preparator_mitra` dan kunci pengawas lama. Hilangkan pengesahan tiga tahap sekaligus dari workflow BPMN. Pemilih role demo mengubah sesi simulasi secara eksplisit.
- **Output** Matriks role dan tugas, arah navigasi per role, serta aturan otorisasi pada perintah demo.
- **Kriteria penyelesaian** Tugas fixture dengan ID baru muncul pada lane tujuan. Pemohon berbeda unit atau pemilik, role yang belum mendapat giliran dan role baca tidak dapat menjalankan tugas. Buka detail, simpan dan kembali ke antrean dapat dilakukan dengan keyboard dan di layar sempit.

### I04 · Pengajuan, tiga persetujuan dan prioritas

- **Tujuan** Satu WO dari salah satu TL mencapai survei dengan jejak pengajuan dan persetujuan utuh.
- **Scope** P01, P02, draft, revisi, penghentian dan tugas prioritas Supervisor.
- **Detail eksekusi** Dari TL OP, TL HAR atau TL Konstruksi, buat draft milik pengusul dan simpan identitas pada submit. Perbaiki edit agar mempertahankan role, pemilik dan ID. Jalankan persetujuan Asman → Supervisor → Manajer dengan tindakan positif dan negatif milik aktor aktif. Saat ditolak, simpan keputusan tahap itu, kembalikan ke TL asal, tawarkan revisi atau penghentian, lalu ikuti edge XML pada pengajuan ulang. Ganti pengembalian umum `Assignment Review` pada jalur BPMN dengan pengembalian milik tahap yang jelas. Untuk data legacy pada status itu, tandai perlu peninjauan dan simpan persetujuan historis. Pengesahan Manajer membuat tugas **Tetapkan prioritas dan rencana kerja** bagi Supervisor.
- **Output** Jalur A yang berfungsi dari draft sampai tugas survei Preparator dan pengajuan histori yang dapat dibaca.
- **Kriteria penyelesaian** Ketiga TL lulus kasus submit, salah satu approver menolak, revisi tetap satu ID, dan penghentian berakhir di lane TL asal. Bagian Terkait serta approver di luar giliran tidak memiliki aksi Tolak. WO `Assignment Review` lama tidak terjebak di antrean persetujuan baru atau dianggap selesai otomatis.

### I05 · Survei, kelayakan dan rencana pelaksanaan

- **Tujuan** Penjadwalan bersumber dari hasil survei yang diperiksa Supervisor.
- **Scope** P03, Form Survei, analisis risiko awal, keputusan layak dan rencana.
- **Detail eksekusi** Catat survei dan revisinya per WO, susun analisis awal JSA dan IBPPR, dan buka tugas review Supervisor. Jika belum layak, Supervisor memutuskan survei ulang atau menghentikan WO dan memberi tahu TL asal. Setelah layak, Preparator merekam jadwal, personel dan metode. Tempatkan nomor Working Permit sebagai data/konteks dengan perlakuan sesuai keputusan pemilik proses pada K07.
- **Output** Form survei tersimpan, catatan kelayakan, rencana pelaksanaan dan tugas JSA berikutnya.
- **Kriteria penyelesaian** Ada bukti untuk jalur layak, survei ulang, dan tidak layak yang berakhir serta memberi tahu pengusul. Nomor permit dan tanggal saja tidak dapat melompati keputusan kelayakan.

### I06 · Mekanisme `On Hold`, pemulihan dan pembatalan

- **Tujuan** Memulihkan WO ke pemeriksaan asal dengan penyebab dan pihak pemenuhan yang tercatat.
- **Scope** Mekanisme penahanan, penugasan kendala, perintah resume, dan keputusan pembatalan.
- **Detail eksekusi** Simpan penyebab H01–H12, node asal dan node kembali. Supervisor menetapkan penahanan, meminta pemenuhan, menilai hasil dan mengaktifkan kembali bila teratasi. Jika masih bisa ditangani, kembalikan ke pemenuhan. Jika tidak bisa diselesaikan, Supervisor mengajukan pembatalan, Manajer memutuskan, dan penolakan pembatalan kembali ke pemenuhan yang sama. Modul terkait memasang pemicu dan tugas pemulihan sesuai tabel bagian 4.
- **Output** Mekanisme penahanan yang dapat dipakai ulang, tampilan kendala, dan tes berbasis data untuk 12 penyebab.
- **Kriteria penyelesaian** Empat variasi per penyebab menghasilkan tugas atau akhir yang tepat dengan ID WO, bukti, dan riwayat yang sama. Aksi resume umum ke `Ongoing` tidak tersedia. I24 mengulang tes setelah seluruh pemicu terpasang di layar asal.

### I07 · Dokumen berversi, JSA dan IBPPR

- **Tujuan** Setiap dokumen mempunyai status, versi, pemeriksaan dan bukti sendiri.
- **Scope** Register dokumen, metadata dan pratinjau, JSA dan IBPPR, H01–H02.
- **Detail eksekusi** Buat struktur dokumen dan versi, berkas, pengajuan, review, pengesahan dan penerbitan. JSA diajukan Preparator, diperiksa P2K3/K3L dan diputus Asman. Setelah JSA disetujui, buka IBPPR dengan urutan yang sama. Penolakan kembali ke Preparator. Revisi membuat versi baru dan mengikuti titik masuk review pada XML. Sambungkan H01–H02. Survei dan JSA ditampilkan dari data aktual. Hapus penggunaan status WO sebagai proksi terbit dokumen dan gunakan penanda belum terbit sampai I10 mencatat penerbitan.
- **Output** Register dan tampilan dokumen, dua alur persetujuan berversi, serta pratinjau yang membaca rekaman tahap terkait.
- **Kriteria penyelesaian** JSA dan IBPPR tidak berbagi keputusan. Versi lama tetap bisa ditelusuri setelah revisi. Perubahan `Approved` → `Scheduled` → `Ongoing` → `Completed` tidak mengubah keadaan dokumen tanpa transaksi yang relevan.

### I08 · Izin Kerja Ketinggian awal

- **Tujuan** Menerbitkan izin hanya pada WO yang membutuhkannya dan melalui urutan persetujuan yang ditentukan.
- **Scope** DOC-10, keputusan perlu/tidak, review, revisi, catat izin, H03.
- **Detail eksekusi** Preparator merekam keputusan kebutuhan izin. Jalur perlu masuk Pengawas K3 → Asman → P2K3/K3L → Bagian Terkait. Penolakan dari pihak yang sedang mendapat giliran kembali ke Preparator, lalu ajukan versi perbaikan atau jalankan H03. Simpan versi izin yang ditandatangani dan dicatat. Jalur tidak perlu menuju verifikasi kewenangan.
- **Output** Izin berversi dengan keputusan awal per WO dan data yang bisa dipakai pada penutupan I18.
- **Kriteria penyelesaian** Jalur tidak perlu, berhasil, penolakan tiap reviewer, revisi, dan H03 teruji. Role di luar giliran tidak dapat menyetujui atau menolak.

### I09 · Surat Kewenangan personel

- **Tujuan** Memastikan setiap personel yang ditugaskan memiliki kewenangan yang sesuai.
- **Scope** Daftar tim, surat per personel, verifikasi, kandidat pengganti, pembaruan surat dan H04.
- **Detail eksekusi** Preparator mengumpulkan dan memeriksa kecocokan kompetensi serta masa berlaku terhadap penugasan. Saat tidak valid, ikuti cabang pengganti dan verifikasi ulang. Ikuti jalur pembaruan oleh Manajer bila berlaku, lalu verifikasi surat baru oleh Preparator. Tautkan keputusan dan surat ke personel yang benar. Hubungkan kondisi buntu ke H04.
- **Output** Matriks tim dan status kewenangan per orang dengan bukti versi surat.
- **Kriteria penyelesaian** Kasus seluruh personel valid, personel kedaluwarsa, pengganti, pembaruan berhasil dan H04 teruji. SP2B belum dapat diajukan selama keputusan kewenangan yang wajib belum lengkap.

### I10 · Penerbitan SP2B dan SP3B

- **Tujuan** Menjadikan penerbitan surat sebagai transaksi yang dapat dilacak per dokumen.
- **Scope** Blangko SP2B, SP3B, susunan tim terkait, revisi dan H05–H06.
- **Detail eksekusi** Untuk tiap surat, buat pengajuan Preparator, pemeriksaan dan tanda tangan Supervisor, serta penerbitan dan tanda tangan Manajer. Jalur penolakan dan revisi kembali ke Preparator, atau ke `On Hold` sesuai XML. Aktifkan SP3B setelah SP2B terbit. Gunakan nomor dan versi surat, data tim hingga penandatangan dan waktu dari rekaman terkait. Ganti nama, nomor tetap dan penanda validasi/QR contoh pada pratinjau kerja. Beri label simulasi pada tanda tangan demo.
- **Output** Register dan pratinjau dua surat yang menampilkan sumber penerbitan, versi dan riwayat keputusan.
- **Kriteria penyelesaian** Klaim terbit baru muncul setelah tindakan penerbitan berhasil. SP3B terkunci sebelum SP2B. Uji revisi kedua surat, H05–H06, dan dua WO yang menampilkan nomor serta tim masing-masing.

### I11 · Checklist peralatan dan distribusi surat

- **Tujuan** Memastikan checklist dan penyerahan surat tercatat sebelum cek kesiapan lapangan.
- **Scope** Checklist peralatan/material, H07, penerimaan SP2B dan distribusi SP3B.
- **Detail eksekusi** Preparator menyusun checklist. Supervisor lalu Kepala Regu memeriksa dan menandatangani. Sambungkan revisi dan H07. Setelah checklist selesai, Preparator menyerahkan SP2B, Pelaksana memahami dan menandatangani, lalu Preparator mencatat tanda terima. Preparator menyerahkan SP3B, Kepala Regu lalu Pengawas K3 mengakui pemahaman penugasan secara berurutan. Catat penerima, waktu dan versi dokumen.
- **Output** Checklist per WO serta register serah terima SP2B dan SP3B.
- **Kriteria penyelesaian** Pemeriksaan urutan, pengembalian checklist, H07, tanda terima, dan penerima yang salah teruji. Tugas kesiapan baru muncul setelah alur surat lengkap. Perlakuan kendala penerimaan mengikuti K04.

### I12 · Kesiapan lapangan dan briefing

- **Tujuan** Memberi pengguna jalur yang nyata untuk mencatat syarat kesiapan WO baru.
- **Scope** E01/E02, cek ulang peralatan/material/APD, kesehatan, job briefing, safety briefing, koordinasi rencana mulai dan H08.
- **Detail eksekusi** Kepala Regu menginstruksikan pemeriksaan ulang. Pelaksana memeriksa alat, material dan APD. Bila siap, Kepala Regu mencatat job briefing, Pengawas K3 mencatat kesehatan serta safety briefing, kemudian Kepala Regu mengoordinasikan rencana mulai dengan Kepala Operasi sebelum meminta SOK. Hubungkan ketidaksiapan alat/material ke H08. Tampilkan hasil pemeriksaan pada WO yang sama, syarat yang masih terbuka dan pemilik tugas berikutnya.
- **Output** Rekam kesiapan per WO dan pemicu permintaan SOK setelah syarat tahap terpenuhi.
- **Kriteria penyelesaian** WO baru dapat mencatat briefing melalui UI dan mencapai tugas SOK. H08 yang pulih kembali ke instruksi periksa ulang. Bukti kesiapan tidak otomatis muncul dari fixture lain. Hasil kesehatan/APD yang belum memenuhi ditangani sesuai K03 sebelum pilot.

### I13 · Pemberlakuan dan konfirmasi SOK

- **Tujuan** Membuat konfirmasi SOK awal tercatat pada WO yang sama dan hanya dapat dilakukan aktor yang sedang bertugas.
- **Scope** P04/E03, tugas operasi PDKB, konfirmasi balik, koordinasi ulang dan H09.
- **Detail eksekusi** Rekam permintaan **Kepala Regu → Piket Area → Piket APD → Petugas GI**, lalu konfirmasi **GI → APD → Area → Kepala Regu** mengikuti XML. Simpan ID WO, jenis permintaan, hasil dan waktu. Ulangi koordinasi bila jalur XML mengizinkan, atau hubungkan H09. Ganti empat kontrol generik E03 pada jalur PDKB dengan tugas sesuai giliran. Data simulasi `Padam 20 kV` diberi identitas skenario dan tidak mengisi status SOK PDKB. Gunakan aplikasi untuk mencatat koordinasi dan konfirmasi petugas.
- **Output** Urutan tugas SOK awal dengan status yang dapat ditelusuri dari Detail WO.
- **Kriteria penyelesaian** Konfirmasi role salah, di luar urutan dan untuk WO lain ditolak. Satu WO baru mencapai cek kondisi awal melalui konfirmasi lengkap. H09 kembali ke permintaan SOK. Status operasi saat pembatalan serta eskalasi mengikuti K01 dan K05.

### I14 · Kondisi awal dan delegasi pengawasan

- **Tujuan** Pelaksanaan hanya tersedia sesudah keputusan kondisi awal dan penugasan pengawas selesai.
- **Scope** Cek cuaca, kondisi aman dan SOK, evaluasi ulang, H10, keputusan delegasi, BA dan H11.
- **Detail eksekusi** Kepala Regu memeriksa kondisi awal. Cabang tidak aman mengikuti penghentian rencana mulai, evaluasi ulang, lalu kembali ke cek atau `On Hold` H10. Untuk kebutuhan delegasi, Supervisor memverifikasi calon atau mencari calon lain. Kepala Regu menyiapkan dan menandatangani BA, Pelaksana menerima dan menandatangani, Supervisor menandatangani sebagai pihak mengetahui, dan Preparator mengarsipkan. Jika tak ada calon kompeten, jalankan H11.
- **Output** Keputusan kondisi awal, BA delegasi per WO jika diperlukan, dan tugas siap pelaksanaan setelah syarat lengkap.
- **Kriteria penyelesaian** Jalur tanpa delegasi, delegasi sah, calon pengganti, H10 dan H11 teruji. Dokumen contoh atau SOK WO lain tidak membuka pelaksanaan.

### I15 · Pelaksanaan paralel, SWA dan selesai fisik

- **Tujuan** Menjalankan tiga pekerjaan lapangan bersamaan dan mencatat kapan pekerjaan fisik benar-benar selesai.
- **Scope** E01/E02, fork/join, putaran pelaksanaan, SWA, H12, selesai fisik.
- **Detail eksekusi** Buat tugas Pelaksana, Kepala Regu dan Pengawas K3 pada putaran yang sama. Gabungkan hasil sesuai `Node_parallel_selesai` dan lanjutkan putaran bila fisik belum selesai. Catat penghentian segera dan pengamanan di lapangan sesuai SOP dan dokumentasi XML. Ikuti keputusan gangguan dan evaluasi pada proses BPMN, termasuk lanjut jika dinyatakan aman atau H12 jika belum pulih. Pencatatan penghentian dini sebelum join mengikuti K02. Setelah laporan selesai fisik, rekam waktu dan buka tugas penormalan.
- **Output** Jejak tiga lane per putaran, catatan SWA dan keputusan lanjut, serta peristiwa selesai fisik.
- **Kriteria penyelesaian** Hasil paralel tidak tercampur antarputaran. Pengiriman ulang satu lane tidak menggantikan lane lain. SWA aktif tidak dapat dilewati melalui tombol Lanjut. Resume H12 kembali ke cek kondisi awal. Selesai fisik belum menulis tanggal selesai operasional atau penutupan administrasi.

### I16 · Perbaikan WIP lintas WO dan pengesahan

- **Tujuan** Menjaga WIP yang ada di Ismina dapat dipakai sebagai bukti pendamping per WO.
- **Scope** Form 22 butir E02, review R02, skor dan ringkasan yang ditampilkan dari R03.
- **Detail eksekusi** Simpan jawaban dan catatan per WO serta versi. Pengawas K3 mengajukan versi yang memenuhi aturan pengisian. K3L menerima tugas review untuk versi itu saja. Hitung skor dari jawaban dan simpan hasil pada versi yang disahkan. Daftar, badge review dan toast membaca rekaman yang sama. WIP diperlakukan sebagai bukti pendamping. Syarat penutupan tetap mengikuti BPMN pada I20.
- **Output** WIP tersimpan per WO, tugas review aktual, dan skor yang dapat dihitung ulang.
- **Kriteria penyelesaian** Uji dua WO, pergantian WO dan refresh, WIP kosong, versi belum diajukan, serta versi lama. K3L hanya dapat mengesahkan WIP yang memenuhi syarat. R03 menampilkan skor transaksi, termasuk ketika nilainya berbeda dari 95%.

### I17 · Penormalan dan selesai operasional

- **Tujuan** Menghasilkan tanggal selesai operasional dari konfirmasi penormalan per WO.
- **Scope** E03/R04, tugas penormalan, konfirmasi balik dan pengulangan jika belum terkonfirmasi.
- **Detail eksekusi** Sesudah selesai fisik, Kepala Regu mengirim permintaan melalui Piket Area dan Piket APD ke Petugas GI. Simpan pelaksanaan penormalan dan konfirmasi balik APD → Area → Kepala Regu, atau ulangi sesuai XML bila belum terkonfirmasi. Kepala Regu menyatakan selesai operasional setelah konfirmasi berhasil. Jadikan waktu kejadian ini sebagai sumber rekap bulanan I21. Simpan riwayat pada WO, dengan identitas permintaan berbeda dari SOK awal.
- **Output** Riwayat penormalan dan `operational_completed_at` yang dapat diverifikasi.
- **Kriteria penyelesaian** Selesai fisik belum masuk rekap periode. Percobaan tanpa konfirmasi tetap menunggu dan dapat diulang sesuai BPMN tanpa efek ganda. Konfirmasi berhasil menghasilkan satu peristiwa selesai operasional dan membuka proses izin/pelaporan WO.

### I18 · Penutupan Izin Kerja Ketinggian

- **Tujuan** Menyelesaikan izin ketinggian yang benar-benar digunakan oleh WO setelah selesai operasional.
- **Scope** R01 atau tugas izin, dokumen penutupan, empat penandatangan dan pencatatan.
- **Detail eksekusi** Dari peristiwa I17, periksa penggunaan izin pada WO. Jalur perlu penutupan merujuk izin I08 dan membuat tugas **Pengawas K3 → Asman → P2K3/K3L → Bagian Terkait**, kemudian Preparator mencatat izin lengkap. Jalur tanpa penggunaan izin menuju penyerahan hasil. Pisahkan tindakan simulasi izin objek R01 dari tugas BPMN dan gunakan nama pelaku aktual.
- **Output** Penutupan yang tertaut ke izin awal, dengan bukti tiap tanda tangan dan pencatatan.
- **Kriteria penyelesaian** Kedua jalur teruji. Penandatangan salah atau urutan lompat ditolak. Laporan hasil menunggu penutupan bila diperlukan. Kasus penutupan yang belum disetujui mengikuti keputusan K04 untuk pilot.

### I19 · Pemberitahuan Penyelesaian

- **Tujuan** Mengirim pemberitahuan pekerjaan selesai kepada Manajer melalui jalur tanda tangan BPMN.
- **Scope** R01/R03, laporan hasil dari Kepala Regu, pemberitahuan, review, revisi dan penerimaan.
- **Detail eksekusi** Kepala Regu menyerahkan laporan hasil, lalu Preparator menyusun pemberitahuan berversi. Supervisor, Kepala Regu dan Pengawas K3 bertindak berurutan. Jika dikembalikan, Preparator memperbaiki dan mengirim versi baru mulai dari Supervisor. Preparator menyampaikan versi lengkap kepada Manajer. Simpan penerimaan pada versi yang benar dan buat tugas laporan harian.
- **Output** Laporan hasil, pemberitahuan berversi, riwayat review, dan bukti penerimaan Manajer.
- **Kriteria penyelesaian** Versi dalam revisi tidak memakai status diterima dari versi lama. Tolak dan ajukan ulang dari setiap tahap mengikuti XML. Komisi Unit tidak memiliki aksi persetujuan atau penutupan WO.

### I20 · Laporan harian, kelengkapan, arsip dan `WO Completed`

- **Tujuan** Menyelesaikan administrasi melalui Preparator sesudah penerimaan pemberitahuan.
- **Scope** Laporan harian, daftar dokumen dan tanda tangan, permintaan kelengkapan, arsip, R03 dan Detail WO.
- **Detail eksekusi** Preparator mengisi laporan harian per WO, mengumpulkan berkas, memeriksa dokumen dan tanda tangan, meminta kelengkapan dan memeriksa hasilnya. Buat paket arsip dengan daftar versi yang dipakai. Berikan tindakan tutup administrasi kepada Preparator melalui tugas aktif setelah arsip tercatat. Ganti gerbang `Closed` lama menggunakan syarat BPMN. Batasi R03 sesuai fungsi role, termasuk menghapus tindakan menutup dari Komisi Unit.
- **Output** Laporan harian, rekam pengecekan, paket arsip dan peristiwa akhir `WO Completed`.
- **Kriteria penyelesaian** WO dengan berkas kurang atau pemberitahuan sedang direvisi tetap terbuka. Setelah lengkap dan diarsipkan, Preparator dapat menutup sekali. Role lain ditolak. Detail menampilkan tiga tanggal penyelesaian dari peristiwa masing-masing.

### I21 · Rekap bulanan, revisi dan persetujuan

- **Tujuan** Menjalankan proses rekap bulanan independen dengan basis tanggal yang dapat diperiksa.
- **Scope** R05, periode, snapshot WO, revisi dan review Supervisor → Asman → Manajer.
- **Detail eksekusi** Preparator memulai laporan periode melalui `Node_start_bulanan`. Pilih WO dari peristiwa selesai operasional pada periode dan cakupan kerja. Rekam snapshot dan referensi WO, beserta versi dan periode. Reviewer bekerja berurutan. Pengembalian menuju Preparator, versi perbaikan kembali ke Supervisor. Siapkan versi final untuk distribusi I22.
- **Output** Draf dan versi rekap periode, daftar WO pembentuk dan keputusan tiga reviewer.
- **Kriteria penyelesaian** WO selesai operasional dengan administrasi terbuka masuk periode yang benar. WO baru selesai fisik dan WO di luar periode tidak masuk. Uji batas bulan, pengajuan ulang, snapshot stabil dan persetujuan sesuai giliran.

### I22 · Pengiriman dan penerimaan laporan bulanan

- **Tujuan** Menyelesaikan rekap bulanan setelah seluruh serah terima antarpihak tercatat.
- **Scope** Tugas kirim Preparator, terima dan teruskan oleh Komisi Unit/Wilayah, terima oleh Komisi Pusat.
- **Detail eksekusi** Kunci versi yang disetujui untuk pergantian tugas. Preparator mengirim, Unit/Wilayah menerima dan meneruskan, lalu Pusat mencatat penerimaan dan mengakhiri proses. Tampilkan periode, versi, pengirim, penerima dan waktu. Koreksi pascapengiriman dan distribusi bermasalah dirujuk ke K06.
- **Output** Log distribusi dan penerimaan per versi, dan terminal `Laporan bulanan selesai`.
- **Kriteria penyelesaian** Versi draf tidak dapat dikirim. Komisi Pusat baru menerima setelah penerusan Unit/Wilayah. Riwayat pengiriman ulang tidak menimbulkan penerimaan ganda atau mengubah status WO penyusun.

### I23 · KPI, tabel, waktu dan ekspor yang dapat diverifikasi

- **Tujuan** Menampilkan informasi berdasarkan data yang dipakai pengguna dan menyediakan berkas yang benar-benar dapat dibuka.
- **Scope** KPI per role, tabel dan filter, status, tanggal aktual, R01 BAPP, R05 dan data sumber laporan.
- **Detail eksekusi** Hubungkan kartu dan tabel ke repository, gunakan periode/satuan serta akses ke baris pembentuk. Tempatkan tugas dan kendala aktif sebagai informasi utama. Gunakan pencarian, filter dan navigasi tabel untuk daftar yang panjang. Ganti tanggal tetap dari tampilan dan handler tersisa dengan peristiwa aktual. Sambungkan ekspor R05 ke snapshot yang dipilih. Untuk BAPP R01, buat keluaran PDF dari data yang tersedia ketika format dan mapping sudah ditentukan. Sampai itu tersedia, aksi menunjukkan prasyaratnya secara jujur. Tombol unduh menampilkan keberhasilan setelah berkas dihasilkan. Gunakan PDF dan workbook proyek sebagai rujukan format bidang yang relevan, dengan definisi KPI dan cutoff yang disepakati.
- **Output** KPI yang dapat ditelusuri, tabel yang dapat dinavigasi, rekap yang dapat diunduh, dan ekspor BAPP yang bisa diuji ketika mapping tersedia.
- **Kriteria penyelesaian** Jumlah KPI cocok dengan detail pada filter yang sama. Pergantian tanggal dan zona kerja tampil benar. Uji membuka berkas hasil dari WO/periode yang dipilih. Status gagal ekspor dapat dipulihkan. R05 dan BAPP tidak menampilkan sukses dari toast saja.

### I24 · UAT dan rilis demo Vue

- **Tujuan** Membuktikan alur BPMN dapat diperagakan dari awal hingga akhir melalui UI Ismina.
- **Scope** Seluruh tahap demo, 17 lane, bukti audit dan uji visual berdasarkan I01.
- **Detail eksekusi** Jalankan tiga jalur mulai WO, `WO Completed`, laporan bulanan independen, revisi pada tahap masing-masing, seluruh H01–H12 dan pembatalan. Uji kasus surat, delegasi, SWA, SOK awal/akhir, tanggal batas periode, dan kegagalan simpan atau ekspor. Jalankan UAT tugas pertama per role tanpa panduan lisan. Periksa keyboard, desktop, mobile, refresh dan dua WO aktif. Catat hasil per temuan pada bagian 5.
- **Output** Versi demo yang dapat dijalankan, data skenario, ringkasan UAT, perbandingan visual dan daftar keputusan untuk Laravel/pilot.
- **Kriteria penyelesaian** Satu WO baru mencapai `WO Completed` dengan ID sama dan semua serah terima dapat dibuktikan. Proses bulanan berakhir pada penerimaan Pusat. Temuan perilaku demo memiliki hasil uji dan keputusan terbuka memiliki batas pemakaian yang dicatat. Pengguna tiap role menemukan tugas pertama, memahami tujuan tindakannya, dan melihat hasilnya.

### I25 · Laravel, identitas dan cakupan akses

- **Tujuan** Menyediakan identitas nyata dan batas akses lintas akun sebelum memindah transaksi alur.
- **Scope** Staging Laravel, autentikasi, pengguna, penugasan 17 role, unit, delegasi akses dan policy baca.
- **Detail eksekusi** Siapkan lingkungan staging dan skema identitas serta penugasan. Sambungkan sesi Vue ke identitas dari server. Bedakan akses per unit, kepemilikan dan peran aktif. Buat identitas uji terpisah untuk handoff. Jaga picker demo pada lingkungan simulasi. Pakai policy untuk objek kerja, dokumen dan laporan sesuai izin baca dan kewenangan tindakan tugas.
- **Output** Lingkungan staging, kontrak identitas, akun/penugasan uji dan matriks akses yang berlaku di server.
- **Kriteria penyelesaian** Pengguna melihat data dalam scope, dan permintaan langsung yang melampaui role atau unit ditolak server. Peralihan akun mengganti sesi dengan benar dan tidak membawa data cache pengguna sebelumnya.

### I26 · Transaksi workflow server dan adapter Vue

- **Tujuan** Menyimpan WO, tugas dan keputusan agar handoff nyata dapat dilanjutkan dari sesi lain.
- **Scope** Migrasi, kontrak API, aksi workflow, operasi, audit dan adapter HTTP.
- **Detail eksekusi** Pindahkan validasi dan mutasi Tugas/WO ke Laravel menggunakan node, edge dan versi yang sama dengan demo. Dalam satu transaksi, simpan keputusan, tugas baru, audit, dan peristiwa untuk notifikasi. Terapkan pemeriksaan versi dan idempotensi untuk operasi ulang atau bersamaan. Sambungkan Vue ke adapter HTTP dan perlakukan fixture legacy sebagai data demo, lalu sediakan penanganan status yang belum dapat dipetakan melalui I01/I04. Simpan keputusan dan waktu penyelesaian di server.
- **Output** API dan penyimpanan persisten untuk WO, tugas, persetujuan, operasi, dan audit nyata.
- **Kriteria penyelesaian** Dua akun pada sesi berbeda meneruskan WO dan melihat keputusan yang sama setelah refresh. Dua keputusan bersamaan tidak membuat dua transisi. Kegagalan transaksi tidak mengubah data sebagian. Tes paritas utama demo dan server lulus.

### I27 · Bukti privat, arsip, notifikasi dan laporan server

- **Tujuan** Membuat berkas, pengiriman dan laporan tetap tersedia serta dapat diaudit pada lingkungan bersama.
- **Scope** Storage privat, versi berkas, arsip, keluaran laporan, pengiriman notifikasi dan pengulangan.
- **Detail eksekusi** Hubungkan metadata dengan berkas versi yang berizin, cek unduh menurut role/scope dan simpan referensi arsip. Hasilkan laporan harian, rekap bulanan dan ekspor yang disepakati dari data server. Kirim notifikasi penugasan/penerimaan dari peristiwa yang sudah tersimpan. Uji kegagalan pengiriman dan pengulangan tanpa duplikasi. Terapkan periode, retensi, akses dokumen dan tanda tangan sesuai keputusan yang berlaku.
- **Output** Penyimpanan privat dan arsip, ekspor yang dapat dibuka, notifikasi andal dan jejak akses yang dapat diperiksa.
- **Kriteria penyelesaian** Pengguna berizin dapat mengunduh versi yang benar dan pengguna di luar scope ditolak. Berkas dan laporan bertahan setelah restart. Pengulangan notifikasi tidak menggandakan tugas atau pesan yang sudah tercatat terkirim.

### I28 · Uji lintas akun, pilot dan serah terima

- **Tujuan** Menentukan kesiapan pemakaian operasional dari uji proses, kewenangan, dan pemulihan data pada staging.
- **Scope** Skenario UAT I24 di server, bukti 17 lane, pemulihan data, serta keputusan pilot.
- **Detail eksekusi** Jalankan kembali kasus utama dan cabang menggunakan akun terpisah. Uji salah role, versi usang, sesi lain, kegagalan penyimpanan dan pengiriman, dan pemulihan backup di staging. Cocokkan bukti dengan matriks audit, lakukan UAT bersama pemegang peran, dan catat jalur yang pemilik proses setujui untuk pilot. Siapkan catatan rilis, cara menjalankan aplikasi, pemilik dukungan dan mekanisme pemulihan layanan.
- **Output** Bukti UAT lintas akun, hasil uji pemulihan, keputusan pilot serta paket serah terima.
- **Kriteria penyelesaian** Semua temuan audit mempunyai hasil verifikasi. Tugas lintas akun dan riwayat per WO dapat dilacak. Skenario operasional yang dipakai dalam pilot telah disetujui dan keputusan sisanya tercatat. Rilis mencatat versi aplikasi dan hash BPMN yang diuji.

## 4. Peta pemicu dan titik kembali `On Hold`

I06 menyediakan mekanisme bersama. Batch pada tabel memasang pemicu pada tugas BPMN yang sesuai. Untuk setiap baris, uji **teratasi**, **belum teratasi dan masih bisa ditangani**, **usulan batal disetujui**, serta **usulan batal ditolak**. Persetujuan pembatalan menghasilkan terminal penyebab yang sesuai. Penolakan pembatalan mengembalikan tugas kepada pihak pemenuhan pada kendala yang sama.

| ID | Pemicu | Pihak pemenuhan | Node kembali setelah aktivasi | Batch pemicu |
| --- | --- | --- | --- | --- |
| H01 | JSA ditolak dan belum dapat diperbaiki | Preparator | `Node_kirim_jsa` · Ajukan JSA ke P2K3/K3L | I07 |
| H02 | IBPPR ditolak dan belum dapat diperbaiki | Preparator | `Node_kirim_ibppr` · Ajukan IBPPR ke P2K3/K3L | I07 |
| H03 | Izin ketinggian belum dapat diperbaiki | Preparator | `Node_siapkan_izin` · Siapkan izin kembali | I08 |
| H04 | Surat Kewenangan belum valid, pengganti/pembaruan belum memenuhi | Preparator | `Node_verifikasi_kewenangan` · Verifikasi kewenangan | I09 |
| H05 | SP2B ditolak dan belum dapat diperbaiki | Preparator | `Node_siapkan_sp2b` · Susun dan ajukan SP2B | I10 |
| H06 | SP3B ditolak dan belum dapat diperbaiki | Preparator | `Node_siapkan_sp3b` · Susun dan ajukan SP3B | I10 |
| H07 | Checklist ditolak dan belum dapat diperbaiki | Preparator | `Node_susun_checklist` · Isi Checklist | I11 |
| H08 | Alat/material belum siap saat periksa ulang | Preparator | `Node_instruksi_periksa_ulang` · Kepala Regu menginstruksikan pemeriksaan ulang | I12 |
| H09 | SOK awal belum terkonfirmasi dan koordinasi belum bisa diulang | Kepala Regu | `Node_minta_sok` · Minta pemberlakuan SOK | I13 |
| H10 | Kondisi awal belum aman setelah evaluasi ulang | Kepala Regu | `Node_periksa_cuaca` · Periksa cuaca, kondisi aman dan SOK | I14 |
| H11 | Delegasi dibutuhkan dan calon kompeten belum tersedia | Preparator | `Node_periksa_kompetensi_delegasi` · Supervisor verifikasi kompetensi | I14 |
| H12 | Kondisi tidak aman saat pelaksanaan belum teratasi | Kepala Regu | `Node_periksa_cuaca` · Periksa kembali kondisi awal | I15 |

## 5. Matriks temuan audit dan verifikasi

Temuan gabungan pada satu baris memakai kriteria yang sama. Batch pertama memiliki perbaikan utama. Batch berikutnya memverifikasi dampaknya pada alur yang memakai hasil tersebut. I24 menguji melalui UI demo, sedangkan I28 memeriksa kembali perilaku dan kewenangan melalui akun terpisah.

| ID | Temuan audit yang harus ditutup | Batch | Bukti yang harus tersedia |
| --- | --- | --- | --- |
| T01 | Data WO dan keputusan hilang saat inisialisasi ulang. Handoff antarsesi belum tersedia. Tab audit memakai log contoh. | I02, I26 | WO baru bertahan setelah refresh. Akun penerima melihat tugas dan riwayat transaksi yang sama pada staging. |
| T02 | Antrean approver memakai ID WO contoh. WO baru muncul di P02 tetapi tidak masuk **Perlu Aksi Saya**. Kunci role Preparator dan pengawas tidak cocok. | I03, I04 | Satu WO baru terlihat pada antrean tiap aktor saat gilirannya. Layar terbuka pada versi dan tab yang tepat. |
| T03 | Handler persetujuan menerima role yang salah. Super Admin dapat menandai tiga persetujuan sekaligus. | I03, I04, I25–I26 | Uji salah role pada perintah, uji keputusan sesuai urutan, dan uji policy server. |
| T04 | Edit draft TL OP mengubah role ke TL HAR. Daftar draft tidak memeriksa pemilik. | I04 | Tiga TL dapat edit draft sendiri dengan role dan identitas tetap. Draft orang lain tidak masuk daftar kerja pemohon. |
| T05 | Tombol Tolak di P02 dapat dilihat dari role dan tahap yang salah, termasuk Bagian Terkait. Penolakan juga mengosongkan catatan persetujuan aktif lama. | I04 | Hanya aktor aktif yang dapat menolak. Keputusan lama tersimpan dalam riwayat dengan versi dan pelaku asli. |
| T06 | Revisi terhadap WO `Rejected` membuat ID baru. Jalur menghentikan pengajuan oleh TL asal belum ada. | I04 | Pengembalian, revisi dan pengajuan ulang menggunakan satu ID. Kasus penghentian mencapai terminal untuk masing-masing TL. |
| T07 | WO `Assignment Review` tampil di P02 tetapi tiga tombol persetujuan tersembunyi karena flag lama. Setelah pengesahan, WO langsung diarahkan ke persiapan Preparator. | I04–I05 | Kasus `Assignment Review` lama dapat diidentifikasi dan ditinjau. Jalur baru memberikan prioritas ke Supervisor sebelum survei. |
| T08 | Belum ada survei per WO, analisis awal risiko, kelayakan, survei ulang, dan penghentian yang memberi tahu pengusul. Jadwal dapat ditetapkan tanpa keputusan layak. | I05 | Tiga keluaran survei teruji, termasuk penerima pemberitahuan dan jadwal yang terkunci sebelum layak. |
| T09 | Survei, JSA, SP2B dan SP3B tampak selesai/terbit saat `Approved`, hilang ketika `Scheduled`/`Ongoing`, lalu aktif lagi di `Completed`. Surat menampilkan validasi serta identitas contoh. | I07, I10 | Uji perubahan status WO dan dua WO berbeda. Pratinjau selalu mencerminkan transaksi dokumen masing-masing dan label demo. |
| T10 | JSA dan IBPPR belum mempunyai review, versi, revisi, keputusan dan `On Hold` sendiri. | I07 | Satu JSA disahkan sebelum IBPPR diajukan, dan versi yang ditolak dapat diperbaiki/diajukan ulang sesuai node. |
| T11 | DOC-10 belum mempunyai keputusan kebutuhan izin dan empat tahap persetujuan. Belum ada penutupan izin khusus per WO. R01 memakai aksi izin objek dengan penandatangan tetap. | I08, I18 | Uji jalur perlu/tidak, empat giliran, versi izin awal dan penutupan yang saling tertaut untuk WO yang sama. |
| T12 | Kewenangan personel belum memeriksa kompetensi, tanggal berlaku, pengganti dan pembaruan. | I09 | Verifikasi seluruh personel, tanggal kedaluwarsa, pengganti, surat baru dan H04. |
| T13 | SP2B dan SP3B berbagi status WO dan belum mempunyai proses penerbitan tersendiri. | I10 | Masing-masing melewati pemeriksaan dan penerbitan, dengan SP3B terkunci sebelum SP2B terbit. |
| T14 | Checklist peralatan/material dan tanda terima SP2B belum tersedia. Penyerahan SP3B kepada dua pengawas belum tercatat. | I11 | Checklist, tanda terima Pelaksana yang dicatat Preparator, serta dua pengakuan SP3B tersimpan per WO/versi. |
| T15 | Permit dan tanggal cukup untuk `Scheduled`, sedangkan WO baru buntu karena briefing tidak dapat dilengkapi melalui aksi lapangan. | I05, I12 | WO baru mengikuti survei lalu mencatat alat/material/APD, briefing dan kesehatan di UI. Guard siap baru terbuka setelah tugas terkait. |
| T16 | Kontrol E03 memakai objek simulasi padam sendiri, dapat digunakan tiga role dengan urutan longgar, dan tidak memperbarui konfirmasi pada WO terkait. | I13, I17 | Dua WO memakai konfirmasi masing-masing. Tindakan operasi salah role, tahap, jenis permintaan atau WO ditolak. |
| T17 | Kondisi awal, keputusan kebutuhan delegasi, kompetensi dan BA Delegasi belum menggerakkan tugas. | I14 | Uji kondisi aman/tidak, delegasi bila perlu, calon alternatif, H10 dan H11. |
| T18 | Pelaksanaan belum menjalankan tiga tugas paralel dan pengulangannya. SWA tidak punya pengamanan/evaluasi/pemulihan yang berjalan. | I15 | Uji dua putaran, satu lane terlambat, temuan kondisi tidak aman, lanjut setelah evaluasi, H12 dan guard SWA aktif. |
| T19 | Dua WO berbagi WIP, K3L dapat mengesahkan tanpa pengajuan atau jawaban, dan R03 mencetak 95% tetap. | I16 | WIP dan pengesahan melekat pada WO/versi. Skor dinamis sama dengan hasil hitung. Uji versi kosong, belum diajukan dan kedaluwarsa. |
| T20 | Selesai fisik langsung `Completed`, tanpa rangkaian penormalan dan peristiwa selesai operasional. | I15, I17, I20 | Tiga peristiwa penyelesaian mempunyai waktu, aksi dan pemilik berbeda. Penormalan belum terkonfirmasi dapat diulang. |
| T21 | `On Hold` langsung kembali ke `Ongoing`. Penyebab, peran pemulihan, cabang pembatalan, dan titik kembali belum tersedia. | I06–I15 | Empat variasi untuk masing-masing H01–H12. Uji kecocokan pemilik pemenuhan, keputusan akhir dan target node. |
| T22 | `Report Revision` mempertahankan penerimaan lama dan tetap dapat ditutup. Pemberitahuan akhir dan tiga tanda tangan belum berjalan. | I19–I20 | Versi yang dikembalikan tidak memenuhi guard penutupan. Versi yang lolos semua reviewer dapat diterima Manajer. |
| T23 | Gerbang `Closed` memakai WIP/laporan/area milik workflow lama dan bisa dijalankan dari Komisi Unit. Laporan harian, pemeriksaan berkas, dan arsip Preparator belum ada. | I20 | Hanya Preparator dengan tugas aktif dapat menutup sesudah laporan harian, kelengkapan dan arsip selesai. Komisi Unit hanya memegang tugas bulanan yang relevan. |
| T24 | R05 belum menjalankan rekap per periode. Belum ada review bulanan, pengiriman dan penerimaan oleh Komisi. | I21–I22 | Rekap menyertakan WO selesai operasional dengan arsip terbuka. Versi disetujui dikirim, diteruskan Unit dan diterima Pusat. |
| T25 | Tanggal mulai dan selesai memakai tanggal contoh. KPI atau indikator yang bersumber dari fixture bisa terbaca sebagai angka kerja. | I02, I23 | Dua kejadian pada waktu berbeda tampil benar. Setiap angka yang ditampilkan cocok dengan daftar pembentuk dan cakupan role. |
| T26 | BAPP dan R05 mengklaim berhasil ekspor meski tidak menghasilkan berkas. | I23, I27 | R05 menghasilkan berkas dari snapshot yang benar. BAPP menghasilkan PDF ketika mapping disetujui. Aksi menunggu atau gagal menampilkan keadaan yang sebenarnya. |

Rujukan kode untuk reproduksi: [P02 dan P03](https://github.com/ismina05/IWOMS/blob/438e746c7d5ba46e539155bf272af9ec396f6418/index.html#L1650-L1948) · [WIP dan operasi](https://github.com/ismina05/IWOMS/blob/438e746c7d5ba46e539155bf272af9ec396f6418/index.html#L2096-L2337) · [R03 dan R05](https://github.com/ismina05/IWOMS/blob/438e746c7d5ba46e539155bf272af9ec396f6418/index.html#L2733-L3014) · [Pratinjau dokumen](https://github.com/ismina05/IWOMS/blob/438e746c7d5ba46e539155bf272af9ec396f6418/index.html#L6508-L6612) · [Antrean dan fungsi transisi](https://github.com/ismina05/IWOMS/blob/438e746c7d5ba46e539155bf272af9ec396f6418/index.html#L7135-L7958).

## 6. Uji tugas pertama untuk 17 lane

Mulai dari ruang kerja dengan fixture yang berisi satu tugas relevan dan minimal satu WO atau periode lain. Pemeriksa mencatat apakah pengguna menemukan objek, konteks dan aksi yang tepat, lalu memahami siapa yang mendapat giliran berikutnya. Ulangi pada layar sempit untuk tugas yang dilakukan di lapangan.

| Lane | Aksi yang harus bisa ditemukan | Batch |
| --- | --- | --- |
| TL OP | Buat WO operasi dan buka pengembalian miliknya. | I04 |
| TL HAR | Ajukan WO pemeliharaan dan revisi pada ID yang sama. | I04 |
| TL Konstruksi | Ajukan WO konstruksi atau hentikan usulan yang dikembalikan. | I04 |
| Asisten Manajer Jaringan | Periksa usulan yang sedang mendapat giliran. | I04 |
| Supervisor PDKB | Buka prioritas atau kelayakan dari antrean. | I04–I05 |
| Preparator PDKB | Isi survei untuk WO yang ditugaskan. | I05 |
| P2K3/K3L | Buka revisi JSA yang sedang diperiksa, dengan versi terlihat. | I07 |
| Bagian Terkait | Tinjau izin ketinggian setelah giliran sampai. | I08 |
| Manajer Area / Kepala Operasi | Sahkan usulan setelah dua persetujuan sebelumnya. | I04 |
| Pengawas K3 PDKB | Catat pemeriksaan kesehatan dan safety briefing pada WO yang benar. | I12 |
| Kepala Regu PDKB | Temukan permintaan SOK untuk WO yang siap. | I13 |
| Pelaksana PDKB | Buka SP2B versi terbit dan catat penerimaan. | I11 |
| Piket Area | Teruskan permintaan SOK milik WO yang ditugaskan. | I13 |
| Piket APD | Buka permintaan dari Area atau konfirmasi yang harus diteruskan balik. | I13 |
| Petugas GI | Catat hasil tugas SOK pada WO yang benar. | I13 |
| Komisi PDKB Unit/Wilayah | Terima dan teruskan versi bulanan yang sudah dikirim. | I22 |
| Komisi PDKB Pusat | Terima versi bulanan setelah penerusan Unit/Wilayah. | I22 |

## 7. Keputusan yang dibutuhkan sebelum fitur terkait dipakai

K01–K07 mengikuti X01–X07 pada dokumen alur utama. K08–K11 membawa keputusan teknis yang relevan dari blueprint. Catat pemilik keputusan, perubahan aturan, node terdampak dan tes ulang. Jika keputusan mengubah proses, sinkronkan revisi BPMN dan versi proses. Demo memakai jalur XML yang telah terdefinisi dan memberi label pada kasus yang masih perlu keputusan.

| ID | Keputusan | Batch yang terdampak |
| --- | --- | --- |
| K01 | Penanggung jawab dan bukti kondisi SOK jika WO dibatalkan saat status operasi belum diketahui atau sesudah SOK terkonfirmasi. | I06, I13–I15, I28 |
| K02 | Cara mencatat penghentian dini sebelum join, penanggung jawabnya dan perlakuan tugas paralel yang sedang aktif. | I15, I24, I28 |
| K03 | Hasil pemeriksaan kesehatan atau APD yang menghalangi kelanjutan, penanggung jawab perbaikan dan pemeriksaan ulang. | I12, I24, I28 |
| K04 | Penanganan tanda terima SP2B/SP3B yang belum lengkap dan penutupan izin ketinggian yang belum disetujui. | I11, I18, I28 |
| K05 | Konfirmasi SOK berulang kali gagal, penormalan gagal, permintaan ulang, kanal eskalasi dan bukti yang diperlukan. | I13, I17, I27–I28 |
| K06 | Cutoff dan zona periode, koreksi sesudah distribusi, serta penanganan laporan yang gagal diteruskan. | I21–I23, I27–I28 |
| K07 | Edisi SOP/IK, definisi kelayakan, validitas permit, kriteria dokumen serta format BAPP dan ekspor. | I05–I20 sesuai dokumen, I23, I28 |
| K08 | Sumber identitas, scope lintas unit dan penugasan pengganti, basis data, hosting, serta akses integrasi. | I25–I28 |
| K09 | Kanal notifikasi, batas pengingat, kalender kerja dan eskalasi apabila fitur itu diaktifkan. | I23, I27–I28 |
| K10 | Keabsahan tanda tangan, perlakuan data sensitif, retensi/arsip dan pemulihan data. | I10, I25, I27–I28 |
| K11 | Pemetaan format laporan harian/bulanan serta workbook, kunci impor dan deduplikasi jika dipakai, rumus dan sumber KPI. | I20–I23, I27–I28 |

## 8. Bukti untuk menutup batch

Catat ID batch, commit, layar dan temuan yang ditangani, fixture atau WO uji, hasil setiap kriteria, serta catatan kasus terbuka. Untuk pekerjaan UI, sertakan layar sebelum/sesudah ketika lokasi aksi atau informasi berubah. Untuk transaksi, sertakan role pelaku, node aktif, hasil pada data, serta tugas berikutnya. Catatan batch harus menunjuk hasil uji yang dapat diulang.

| Setelah | Bukti minimum sebelum meneruskan fase |
| --- | --- |
| I05 | Tiga TL dapat mengajukan, melanjutkan atau menghentikan pengajuan. Ada WO baru yang mencapai keputusan survei dengan ID tetap. |
| I11 | WO melewati dokumen, SP2B → SP3B, checklist dan serah terima, dengan bukti versi dan penandatangan. |
| I17 | WO baru mencapai selesai operasional melalui kesiapan, SOK, pelaksanaan dan penormalan. Tahap fisik dan operasional tercatat terpisah. |
| I20 dan I22 | WO mencapai `WO Completed` melalui Preparator. Rekap independen menyertakan WO sesuai periode dan berakhir saat Komisi Pusat menerima. |
| I24 | Demo Vue lulus jalur utama, regresi tiap temuan yang relevan dan uji penggunaan 17 lane. |
| I28 | Staging lulus handoff lintas akun, aturan akses, persistensi, pemulihan dan persetujuan jalur yang masuk pilot. |

## 9. Catatan eksekusi

I01 selesai pada 19 November 2026 waktu Asia/Jakarta. Bukti, inventaris, batas pengujian dan kriteria penerimaan berada di [hasil I01](baseline-i01/README.md). Runner baseline dan inventaris tersedia di `scripts/i01-baseline.cjs` serta `scripts/i01-inventory.py`. Pengambilan menghasilkan 10 screenshot, 12 reproduksi fungsi, register 26 temuan dan pemeriksaan graf XML. I02 siap dimulai setelah penugasan eksekusi batch tersebut.

I02, I03, I04 dan I05 selesai pada 19 November 2026 untuk demo Vue. [Laporan penerimaan dan pengujian](execution-i02-i05/README.md) serta [kontrak repository](execution-i02-i05/CONTRACTS.md) mencatat implementasi dan batas pemakaiannya. Bukti mencakup 19 skenario domain, pemeriksaan edge terhadap XML, serta jalur browser dengan input, klik, Enter, preview, refresh dan screenshot desktop/mobile. Tahap berikutnya sesuai dependensi adalah I06. Tugas pengajuan JSA pada akhir I05 menunggu I07.

I06, I07, I08 dan I09 selesai pada 19 November 2026 untuk demo Vue. [Hasil eksekusi](execution-i06-i09/README.md) dan [kontrak persiapan](execution-i06-i09/CONTRACTS.md) mencatat 67 skenario domain, termasuk 48 variasi kontrak On Hold, dan regresi 19 skenario I02–I05. Jalur browser menguji H01, JSA/IBPPR berversi, izin empat reviewer, penggantian dan pembaruan surat hingga batas SP2B. H01–H04 telah tersambung ke pemicu aktual. H05–H12 diuji melalui fixture mekanisme bersama, dengan pemicu menyusul sesuai batch I10–I15. Tugas `Node_siapkan_sp2b` menunggu implementasi I10.

I10, I11, I12 dan I13 selesai untuk demo Vue pada 19 November 2026. [Hasil penerimaan](execution-i10-i13/README.md) dan [kontrak data](execution-i10-i13/CONTRACTS.md) mencatat penerbitan SP2B/SP3B, checklist, serah terima, kesiapan dan SOK. Pengujian mencakup 17 skenario domain baru, 86 regresi domain, serta jalur browser sampai `Node_periksa_cuaca`. H05–H09 telah tersambung ke pemicu aktual. K03/K04, kondisi operasi terkait pembatalan pada K01 dan eskalasi K05 tetap memerlukan keputusan pemilik proses sebelum pilot. Tahap berikutnya adalah I14.

I14, I15, I16 dan I17 diterapkan untuk demo Vue. [Laporan penerimaan](EXECUTION_I14_I17.md) mencatat jalur kondisi awal, delegasi, pelaksanaan paralel, WIP dan penormalan. H10 sampai H12 terhubung pada jalur aktual. Handoff I18 berada pada `Node_izin_tinggi_digunakan` setelah waktu selesai operasional tercatat.

I18 hingga I21 diterapkan pada demo Vue. [Laporan penerimaan](EXECUTION_I18_I21.md) mencatat penutupan izin, pemberitahuan berversi, WO Completed dan persetujuan rekap per periode WIB. Versi rekap final tersedia pada Node_kirim_laporan_bulanan untuk I22.

I22 dan keluaran demo I23 diterapkan. I24 lulus pengujian teknis dan masih memerlukan UAT mandiri tiap lane. Bukti browser, daftar skenario dan batas keputusan tercatat di [laporan I22-I24](EXECUTION_I22_I24.md).
