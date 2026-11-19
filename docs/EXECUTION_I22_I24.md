# Pelaksanaan IWOMS Ismina I22–I24

| Batch | Status | Bukti |
|---|---|---|
| I22 | Selesai untuk demo | Versi yang disetujui berpindah dari Preparator ke Komisi Unit/Wilayah lalu ke Komisi Pusat. Penerimaan terakhir menutup proses bulanan. Draf, versi usang, dan aksi di luar giliran ditolak. Ulang aksi tidak menggandakan penerimaan atau mengubah WO. |
| I23 | Lulus untuk keluaran demo yang tersedia | D01 menautkan indikator dengan daftar yang difilter. Ekspor R05 diunduh dan isi CSV diverifikasi terhadap snapshot. R01 menjelaskan prasyarat BAPP K07. PDF BAPP menunggu pemetaan yang disetujui. |
| I24 | Pengujian teknis lulus. UAT pengguna terbuka | Browser menjalankan satu WO baru hingga WO Completed, tiga jalur masuk, dua WO aktif, dan proses bulanan hingga Pusat. Pengamatan penggunaan pertama secara mandiri masih perlu dilakukan untuk tiap lane. |

## Menjalankan demo dan mengulang pengujian

Dari folder repo, jalankan `python -m http.server 3000 --bind 127.0.0.1` dan buka `http://127.0.0.1:3000/`. Gunakan profil browser tersendiri agar data latihan terpisah. Demo menyimpan perubahan dalam browser dan menggunakan pemilih role untuk perpindahan tugas.

```powershell
Get-ChildItem scripts/test-*.cjs | ForEach-Object { node $_.FullName; if ($LASTEXITCODE) { exit $LASTEXITCODE } }
$env:IWOMS_TEST_EXECUTION='release'
node scripts/browser-i10-i13.cjs
```

| Bukti visual I01 | Bukti I24 | Pemeriksaan |
|---|---|---|
| [Baseline Ismina](baseline-i01/) | [Desktop](execution-i10-i13/uat-i24-desktop.png) | Shell Ismina dengan antrean prioritas, KPI dan daftar WO dari data demo. |
| [Baseline Ismina](baseline-i01/) | [Mobile](execution-i10-i13/uat-i24-mobile.png) | Kartu dan tabel dapat dijangkau tanpa menggulir seluruh halaman secara horizontal. |
| Ekspor R05 pada baseline berupa notifikasi | [CSV hasil unduhan](execution-i10-i13/uat-rekap.csv) | Berkas dibuka kembali dan diperiksa untuk ID WO uji serta kolom tanggal selesai WIB. |

## Regresi terhadap temuan audit

| Temuan | Bukti teknis | Batas verifikasi |
|---|---|---|
| T01 | Data demo, audit dan keputusan bertahan setelah refresh. | Serah terima lintas akun server menunggu I26. |
| T02–T08 | Uji antrean 17 role, kepemilikan, guard, revisi dengan ID yang sama, penghentian oleh TL, peninjauan data lama, dan kelayakan survei. | UAT menemukan tugas tanpa panduan masih terbuka. |
| T09–T15 | Regresi surat berversi, JSA, IBPPR, izin ketinggian, surat kewenangan, penerbitan, checklist, serah terima dan kesiapan. | Bukti pengesahan menggunakan identitas demo. |
| T16–T20 | Regresi operasi per WO, delegasi, fork/join, SWA, WIP dan tiga peristiwa penyelesaian. | Peristiwa SOK dicatat melalui UI simulasi. |
| T21 | Empat hasil untuk masing-masing H01–H12 pada uji domain. | Jalur utama diulang di browser. |
| T22–T24 | Regresi revisi pemberitahuan, guard penutupan, rekap bulanan independen dan penerimaan Komisi Pusat di browser. | Koreksi pascadistribusi menunggu K06. |
| T25 | Filter dan jumlah KPI berasal dari kumpulan baris yang sama. Waktu aktual menggunakan WIB dengan uji batas periode. | Periode demo mengikuti bulan kalender WIB. |
| T26 | R05 membuat berkas dari snapshot terpilih. Gagal ekspor dapat dicoba ulang di browser. | R01 menampilkan prasyarat. Verifikasi PDF BAPP menunggu K07. |

## Skenario UAT tugas pertama

Siapkan antrean pada giliran yang sesuai sebelum pengamatan. Beri peserta tujuan yang tercantum pada tabel. Catat apakah peserta menemukan tugas, dapat menjelaskan konsekuensinya, menyelesaikan aksi, dan mengidentifikasi hasil atau penerima berikutnya tanpa arahan lisan. Simpan role, ID WO atau periode, hasil, dan kendala.

| Lane | Tujuan peserta |
|---|---|
| TL OP | Ajukan WO operasi. |
| TL HAR | Revisi usulan pemeliharaan yang dikembalikan. |
| TL Konstruksi | Ajukan WO konstruksi. |
| Asman Jaringan | Periksa pengajuan WO yang masuk. |
| Supervisor PDKB | Tetapkan prioritas WO yang disahkan. |
| Manajer | Tinjau usulan yang telah disetujui Asman dan Supervisor. |
| Preparator PDKB | Rekam survei dan kirim hasilnya ke Supervisor. |
| P2K3/K3L | Periksa versi JSA yang diajukan. |
| Pengawas K3 | Catat hasil pemeriksaan kesiapan K3. |
| Bagian Terkait | Putuskan izin kerja ketinggian pada gilirannya. |
| Kepala Regu | Buka dan akui penerimaan SP3B. |
| Pelaksana | Akui tanda terima SP2B untuk WO yang ditugaskan. |
| Piket Area | Teruskan permintaan pengaturan SOK ke Piket APD. |
| Piket APD | Teruskan permintaan SOK yang diterima ke Petugas GI. |
| Petugas GI | Catat hasil pengaturan SOK yang diminta. |
| Komisi PDKB Unit/Wilayah | Terima dan teruskan versi laporan yang dikirim. |
| Komisi PDKB Pusat | Terima versi laporan yang diteruskan Unit/Wilayah. |

## Keputusan sebelum Laravel dan pilot

| Keputusan roadmap | Batas demo |
|---|---|
| K01–K05 | Gunakan jalur BPMN yang tersedia. Keputusan operasional terbuka tercatat di roadmap dan dokumen alur. |
| K06 | Rekap mengikuti bulan kalender WIB. Aturan cutoff resmi dan koreksi sesudah pengiriman masih terbuka. |
| K07 | Ekspor BAPP menunggu template dan pemetaan resmi. CSV R05 memuat bidang dari snapshot demo. |
| K08–K10 | Role, persistensi dan pengesahan mengikuti mekanisme demo. Persetujuan kebijakan untuk pilot tetap mengikuti roadmap. |
| K11 | Rekap dan KPI mengikuti data yang tersimpan dalam demo. Terbitkan pemetaan workbook dan definisi indikator resmi setelah disepakati. |
