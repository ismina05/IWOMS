# IWOMS (Integrated Work Order Management System) - PLN UID Yogyakarta

Aplikasi web terintegrasi manajemen siklus kerja (*Work Order Lifecycle Management*) berbasis standar operasional prosedur **PDKB-TM (Pekerjaan Dalam Keadaan Bertegangan Tegangan Menengah) 20 kV** dan **Kondisi Pemadaman Terencana**, dilengkapi dengan matriks peran BPMN lintas bidang (*cross-functional lanes*).

---

## 📁 Struktur Direktori & Penjelasan File

### 1. File Aplikasi Utama
* **[`index.html`](index.html)**: 
  * Core Single-Page Application (SPA) berbasis **Vue.js 3** & **Tailwind CSS**.
  * Berisi Dashboard Kontrol Panel, Form Pembuatan WO (P01), Pratinjau 9 Blangko SOP PDKB TM, Matriks Peran BPMN 9 Lane, Sistem Evaluasi Persetujuan, dan Pop-up Toast Notifikasi interaktif.
* **[`.gitignore`](.gitignore)**: 
  * Konfigurasi Git untuk mengabaikan direktori sementara (`scratch/`), berkas tangkapan layar (`*.png`), berkas cadangan (`*.bak`), dan file log.

---

### 2. Folder Aset Standar Dokumen (`assets/`)
Menyimpan berkas SOP resmi, format kalkulasi Excel, serta logo resmi PLN UID Yogyakarta:
* **Berkas PDF Resmi Standar SOP 01 s/d SOP 08 PDKB**:
  * `DOC-01_Cover_PDKB.pdf`: Nota dinas & cover pengajuan usulan pekerjaan.
  * `DOC-02_SOP_01_Survey_Lokasi.pdf`: Formulir hasil survei teknis lapangan oleh Preparator PDKB (Tahap B.1).
  * `DOC-04_SOP_04_1_SP2B.pdf`: Surat Perintah Pelaksanaan Bertegangan dari Manajer Area (Tahap C.4).
  * `DOC-05_SOP_04_2_Susunan_Tim.pdf`: Susunan tim regu hotline beserta nomor lisensi/sertifikat kompetensi aktif (Tahap C.2).
  * `DOC-06_SOP_05_SP3B.pdf`: Surat Perintah Pengawasan Pelaksanaan Bertegangan (Tahap C.4).
  * `DOC-07_SOP_06_Tailgate_Session.pdf`: Formulir analisa potensi bahaya dan pembagian tugas regu di titik kerja (Tahap D.1).
  * `DOC-08_JSA_K3_PDKB.pdf`: Job Safety Analysis mitigasi risiko kecelakaan kerja listrik 20 kV (Tahap C.1).
  * `DOC-09_Checklist_K3_PDKB.pdf`: Lembar daftar uji pengawasan keselamatan K3 (16 butir persiapan + 7 butir pelaksanaan + 5 butir penyelesaian).
  * `pdkb_dokumen_resmi.pdf`: Kompilasi buku panduan operasional PDKB-TM lengkap.
* **Format Perhitungan Teknis**:
  * `SP2B_-_SP3B.xlsm`: Format spreadsheet makro otomasi data beban dan personel PLN.
* **Logo & Gambar**:
  * `logo_pln_resmi.jpg` & `logo_pdkb_resmi.jpg`: Logo resolusi tinggi untuk kop dokumen cetak.
  * `logos_b64.json`: Representasi Base64 logo untuk rendering instan tanpa ketergantungan koneksi jaringan.
  * `Im1.jpg` s/d `Im7.jpg`: Dokumentasi visual lapangan dan diagram Single Line Diagram (SLD).

---

### 3. Skrip Otomasi & Verifikasi Kualitas
Skrip otomasi berbasis Node.js untuk memvalidasi alur sistem dan visual antarmuka:
* `capture_tte_bottom.js` & `capture_scrolled.js`: Skrip penangkap tampilan tanda tangan elektronik (TTE) dan rincian tabel dokumen.
* `verify_blank_to_reactive_sync.js`: Pengujian sinkronisasi reaktif data form terhadap format blangko dokumen cetak.
* `generate_final_screenshots.js`: Generator tangkapan layar resolusi tinggi untuk dokumentasi implementasi sistem.

---

## 🛠️ Teknologi yang Digunakan
1. **HTML5**: Arsitektur markup semantik antarmuka.
2. **JavaScript (ES6+)**:
   * **Vue.js 3**: Reaktivitas state, routing menu/layar, dan komputasi kepatuhan alur kerja (*stage-aware*).
   * **Node.js**: Skrip otomasi pengujian dan verifikasi melalui Chrome DevTools Protocol (CDP).
3. **Tailwind CSS**: Desain UI modern responsif berstandar enterprise PLN.

---

## 🚀 Cara Menjalankan Secara Lokal
Cukup buka file `index.html` di browser modern apa saja, atau jalankan local server:
```bash
# Menggunakan Python
python -m http.server 3000

# Buka di browser
http://localhost:3000/index.html
```
