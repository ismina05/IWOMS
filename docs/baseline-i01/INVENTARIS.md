# Inventaris I01

Data diambil dari setup Vue pada source kerja, metadata dokumen dan isi folder assets. Peta akses berikut merupakan kondisi kode baseline. Kesesuaiannya terhadap kewenangan BPMN diuji pada batch pemilik perbaikan.

## Layar

| Kode | Judul | Klasifikasi dan pemakaian kembali |
| --- | --- | --- |
| D01 | Dashboard Berbasis Peran | Dashboard memakai WO fixture dan antrean parsial. Shell dan tabel dapat dipakai. |
| P01 | Daftar & Pengajuan WO | Draft, lampiran dan submit mengubah state memori. Layout form dapat dipakai. |
| P02 | Persetujuan & Penugasan | Persetujuan mengubah state, dengan celah role dan revisi. Struktur review dapat dipakai. |
| P03 | Persiapan & Penjadwalan | Permit/jadwal mengubah state. Form perlu dihubungkan ke survei dan dokumen. |
| P04 | Rencana Operasi | Rencana operasi contoh. Perlu penugasan dan konfirmasi per WO. |
| E01 | Pelaksanaan WO | Kontrol mulai/jeda/lanjut/selesai mengubah status. Perlu guard BPMN. |
| E02 | Kesiapan & Pengawasan K3 | WIP dan kesiapan parsial. Jawaban bersama antar-WO. |
| E03 | Operasi Jaringan | Operasi contoh PADAM, mutasi objek op terpisah. Layout koordinasi dapat diadaptasi. |
| R01 | Laporan Penyelesaian WO | Penutupan izin objek parsial, ekspor BAPP hanya notifikasi. |
| R02 | Pengesahan WIP | Pengesahan flag WIP, belum mengecek pengajuan/versi. |
| R03 | Pemeriksaan & Penutupan | Penerimaan dan penutupan status dengan aturan lama. Detail bukti dapat diadaptasi. |
| R04 | Laporan Operasi Distribusi | Laporan operasi contoh. Sambungkan peristiwa operasi aktual. |
| R05 | Rekap & Evaluasi | Evaluasi contoh, ekspor hanya notifikasi. Layout rekap dapat dipakai. |
| M01 | Unit Kerja | Master data demo. Tinjau ulang sesuai objek yang dipakai. |
| M02 | Personel | Master data demo. Tinjau ulang sesuai objek yang dipakai. |
| M03 | User | Master data demo. Tinjau ulang sesuai objek yang dipakai. |
| M04 | Mitra Kerja | Master data demo. Tinjau ulang sesuai objek yang dipakai. |
| M05 | Katalog WO | Master data demo. Tinjau ulang sesuai objek yang dipakai. |
| M06 | Operasi Distribusi | Master data demo. Tinjau ulang sesuai objek yang dipakai. |
| M07 | Referensi Dokumen | Master data demo. Tinjau ulang sesuai objek yang dipakai. |
| M08 | Proses Bisnis & Risiko | Master data demo. Tinjau ulang sesuai objek yang dipakai. |
| U01 | Profil Saya | Profil sesi simulasi. Memerlukan identitas server pada I25. |
| U02 | Pengaturan & Parameter | Master data demo. Tinjau ulang sesuai objek yang dipakai. |

## Role dan akses layar aktual

| Kunci role | Nama | Layar |
| --- | --- | --- |
| tl_op | Lane 01 · TL OP (Operasi) | D01, P01, U01 |
| tl_har | Lane 02 · TL HAR (Pemeliharaan) | D01, P01, U01 |
| tl_konstruksi | Lane 03 · TL Konstruksi | D01, P01, U01 |
| asman_jaringan | Lane 04 · Asisten Manajer Jaringan | D01, P01, P02, R02, R03, U01 |
| supervisor_pdkb | Lane 05 · Supervisor PDKB | D01, P01, P02, P03, R01, R03, U01 |
| preparator_pdkb | Lane 06 · Preparator PDKB | D01, P01, P03, P04, R01, R03, R05, U01 |
| p2k3_k3l | Lane 07 · P2K3 / K3L | D01, R02, R05, U01 |
| bagian_terkait | Lane 08 · Bagian Terkait | D01, P02, R01, U01 |
| manajer_area | Lane 09 · Manajer Area / Ops | D01, P01, P02, R03, R05, U01 |
| pengawas_k3 | Lane 10 · Pengawas K3 PDKB | D01, E02, R01, U01 |
| kepala_regu | Lane 11 · Kepala Regu PDKB | D01, E01, R01, U01 |
| pelaksana_pdkb | Lane 12 · Pelaksana PDKB | D01, E01, U01 |
| piket_area | Lane 13 · Piket Area | D01, P04, E03, R04, U01 |
| piket_apd | Lane 14 · Piket APD (Pengatur Distribusi) | D01, P04, E03, R04, U01 |
| petugas_gi | Lane 15 · Petugas GI (Gardu Induk) | D01, E03, R04, U01 |
| komisi_unit | Lane 16 · Komisi PDKB Unit/Wilayah | D01, R03, R05, U01 |
| komisi_pusat | Lane 17 · Komisi PDKB Pusat | D01, R05, U01 |
| superadmin | Super Admin | D01, P01, P02, P03, P04, E01, E02, E03, R01, R02, R03, R04, R05, M01, M02, M03, M04, M05, M06, M07, M08, U01, U02 |

## Blangko dan aset

Pratinjau digital dan PDF arsip dapat dipakai sebagai referensi tata letak. Metadata aktor, tanggal, nomor, tanda tangan dan status harus berasal dari transaksi setelah batch terkait selesai. DOC-03 menunjuk PDF survei di pemetaan preview, sementara DOC-10/DOC-11 tercatat dalam metadata. Cek kecocokan formulir saat mengimplementasikan dokumennya.

| Kode | Metadata |
| --- | --- |
| DOC-01 | {"kode": "DOC-01", "nama": "Nota Dinas Usulan Pekerjaan", "pengisi": "TL HAR / TL OP / TL Konstruksi (Lane 01-03)", "pengesah": "Asman Jaringan (Lane 04)", "fungsi": "Surat pembuka: dasar permohonan penanganan jaringan tanpa padam.", "lane_pengisi": "Lane 01-03", "lane_pengesah": "Lane 04", "tahap": "Tahap A (Pengusulan)", "format": "PDF", "wajib": true, "pdf_page": 1} |
| DOC-03 | {"kode": "DOC-03", "nama": "Single Line Diagram (SLD)", "pengisi": "Sistem GIS / Pengusul", "pengesah": "Asman Jaringan", "fungsi": "Denah skema section penyulang dari Gardu Induk ke titik tiang kerja.", "lane_pengisi": "Sistem GIS / Pengusul", "lane_pengesah": "Lane 04", "tahap": "Tahap A & C", "format": "PDF", "wajib": true, "pdf_page": 10} |
| DOC-02 | {"kode": "DOC-02", "nama": "SOP 01: Formulir Survey Lokasi", "pengisi": "Preparator PDKB (Lane 06)", "pengesah": "Supervisor PDKB & Asman Jaringan", "fungsi": "Mengukur kelayakan fisik tiang (struktur tanah, tinggi tiang, jarak jalan, pohon, konduktor).", "lane_pengisi": "Lane 06", "lane_pengesah": "Lane 04 & 05", "tahap": "Tahap B (Survei Lapangan)", "format": "PDF/JPG", "wajib": true, "pdf_page": 2} |
| DOC-08 | {"kode": "DOC-08", "nama": "Job Safety Analysis (JSA)", "pengisi": "Preparator & Kepala Regu (Lane 06, 11)", "pengesah": "Pejabat K3L (Lane 07) & Asman Jaringan", "fungsi": "Menetapkan bahaya sengatan 20kV, APD wajib, dan prosedur mitigasi.", "lane_pengisi": "Lane 06 & 11", "lane_pengesah": "Lane 04 & 07", "tahap": "Tahap B & C (K3L)", "format": "PDF/XLS", "wajib": true, "pdf_page": 7} |
| DOC-05 | {"kode": "DOC-05", "nama": "SOP 04.2: Susunan Tim Hotline", "pengisi": "Preparator PDKB (Lane 06)", "pengesah": "Seluruh 6 Personil Hotline (Lane 10-12)", "fungsi": "Daftar 6 personil bersertifikat kompetensi aktif yang boleh naik menyentuh kawat 20kV.", "lane_pengisi": "Lane 06", "lane_pengesah": "Lane 10-12", "tahap": "Tahap C (Penugasan)", "format": "PDF", "wajib": true, "pdf_page": 4} |
| DOC-04 | {"kode": "DOC-04", "nama": "SOP 04.1: SP2B (Perintah Pelaksanaan)", "pengisi": "Preparator (Draft) & Supervisor PDKB", "pengesah": "Manajer Area / Kepala Operasi (Lane 09)", "fungsi": "Surat Kuasa Hukum Tertinggi: Izin legal menyentuh instalasi listrik hidup 20kV.", "lane_pengisi": "Lane 05-06", "lane_pengesah": "Lane 09", "tahap": "Tahap C (Izin Operasi)", "format": "PDF", "wajib": true, "pdf_page": 3} |
| DOC-06 | {"kode": "DOC-06", "nama": "SOP 05: SP3B (Perintah Pengawasan)", "pengisi": "Preparator (Draft) & Supervisor PDKB", "pengesah": "Manajer Area / Kepala Operasi (Lane 09)", "fungsi": "Surat penugasan independen untuk Pengawas Pekerjaan dan Pengawas K3.", "lane_pengisi": "Lane 05-06", "lane_pengesah": "Lane 09", "tahap": "Tahap C (Pengawasan)", "format": "PDF", "wajib": true, "pdf_page": 5} |
| DOC-07 | {"kode": "DOC-07", "nama": "SOP 06: Tailgate Session", "pengisi": "Pengawas Pekerjaan & Pengawas K3 (Lane 10, 11)", "pengesah": "Kepala Regu & Pengawas K3", "fungsi": "Diisi di kap mobil/tarpaulin sesaat sebelum naik bucket: verifikasi bahaya pohon, lalu lintas, dan cuaca.", "lane_pengisi": "Lane 10-11", "lane_pengesah": "Lane 10-11", "tahap": "Tahap D (Hari-H Lapangan)", "format": "PDF", "wajib": true, "pdf_page": 6} |
| DOC-09 | {"kode": "DOC-09", "nama": "Checklist K3 (16+7+5 Butir)", "pengisi": "Pengawas K3 PDKB (Lane 10)", "pengesah": "Pengawas K3 & Supervisor PDKB", "fungsi": "Lembar kendali keselamatan berlapis: 16 butir persiapan -> 7 butir saat menyentuh listrik -> 5 butir saat perapihan dan doa penutup.", "lane_pengisi": "Lane 10", "lane_pengesah": "Lane 05 & 10", "tahap": "Tahap D (Hari-H Lapangan)", "format": "PDF", "wajib": true, "pdf_page": 9} |
| DOC-10 | {"kode": "DOC-10", "nama": "Formulir Izin Kerja Ketinggian & Penutupan", "pengisi": "Preparator PDKB (Lane 06)", "pengesah": "Bagian Terkait (Lane 08), P2K3 (Lane 07), Asman (Lane 04), Pengawas K3 (Lane 10)", "fungsi": "Legalitas keselamatan kerja di atas 1.8 meter & berita acara serah terima kembali area instalasi objek.", "lane_pengisi": "Lane 06", "lane_pengesah": "Lane 04, 07, 08, 10", "tahap": "Tahap C.2 & D.4", "format": "PDF", "wajib": true, "pdf_page": 7} |
| DOC-11 | {"kode": "DOC-11", "nama": "Berita Acara Delegasi Pengawasan", "pengisi": "Kepala Regu (Lane 11) & Pelaksana (Lane 12)", "pengesah": "Supervisor PDKB (Lane 05 - Pihak Mengetahui)", "fungsi": "Penunjukan resmi pengawas pengganti yang kompeten jika personil pengawas utama berhalangan hadir.", "lane_pengisi": "Lane 11-12", "lane_pengesah": "Lane 05", "tahap": "Tahap F.4 (Kondisional)", "format": "PDF", "wajib": false, "pdf_page": 5} |
| DOC-12 | {"kode": "DOC-12", "nama": "Pemberitahuan Penyelesaian WO (BAPP)", "pengisi": "Preparator (Lane 06) & Kepala Regu (Lane 11)", "pengesah": "Supervisor PDKB (Lane 05) & Manajer Area (Lane 09)", "fungsi": "Berita acara resmi tuntasnya pekerjaan fisik 100% dan penutupan administrasi Work Order.", "lane_pengisi": "Lane 06 & 11", "lane_pengesah": "Lane 05 & 09", "tahap": "Tahap E.1–E.3", "format": "PDF", "wajib": true, "pdf_page": 1} |
| DOC-13 | {"kode": "DOC-13", "nama": "Laporan Konsolidasi Bulanan Komisi PDKB", "pengisi": "Preparator PDKB (Lane 06)", "pengesah": "Asman (Lane 04), Supervisor (Lane 05), Manajer Area (Lane 09)", "fungsi": "Laporan kinerja keselamatan, saving kWh, dan audit 9 SOP ke Komisi PDKB Unit (Lane 16) & Pusat (Lane 17).", "lane_pengisi": "Lane 06", "lane_pengesah": "Lane 04, 05, 09 -> Lane 16-17", "tahap": "Tahap E.4 (Pelaporan Bulanan)", "format": "PDF/XLS", "wajib": true, "pdf_page": 10} |

Daftar berkas aset beserta SHA-256 tersedia pada `inventory.json`. Paket baseline juga menyimpan hash source, snapshot HTML kerja, diff terhadap HEAD, dan graf XML. Skrip capture lama mempunyai path pengguna LENOVO dan port tetap. Runner I01 menggunakan direktori repo, port lokal dinamis, serta profil Chrome terisolasi.

## Elemen berdasarkan perilaku

- State berfungsi dalam satu sesi untuk draft/submit, persetujuan, penjadwalan, kontrol lapangan, SWA, penerimaan laporan dan penutupan. Buktinya berada di function-results.json.
- Data contoh meliputi WO awal, sampleAuditLogs, sampleCrew, operasi PADAM, jawaban WIP awal, angka evaluasi dan sejumlah identitas/tanggal dokumen.
- cetakBAPP dan cetakLaporanEvaluasiR05 hanya memanggil notify. Tidak ada pembuatan berkas pada kedua handler ini. Cetak formulir digital mempunyai jalur print terpisah.
- Permintaan unduh dengan preview_url mempunyai jalur klik berkas. Jalur fallback unduh hanya memberi notifikasi. Periksa ulang berdasarkan jenis dokumen saat I23.
