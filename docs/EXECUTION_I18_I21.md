# Hasil eksekusi I18–I21

| Batch | Implementasi dan hasil penerimaan |
| --- | --- |
| I18 | Penggunaan izin diperiksa setelah selesai operasional. Penutupan merujuk izin awal terbit, melalui empat penandatangan BPMN, lalu dicatat Preparator. Jalur tanpa penggunaan izin langsung menuju laporan hasil. |
| I19 | Kepala Regu menyerahkan laporan hasil. Pemberitahuan berversi melalui Supervisor, Kepala Regu, dan Pengawas K3. Pengembalian membuat versi baru yang kembali ke Supervisor. Preparator menyampaikan versi yang disetujui dan Manajer mencatat penerimaannya. |
| I20 | Preparator mencatat laporan harian, pengumpulan dan pemeriksaan berkas, serta pemenuhan kekurangan. Paket arsip merujuk versi dokumen WO. Penutupan administratif menghasilkan `WO Completed`. R03 menampilkan waktu fisik, operasional, dan administrasi pada detail tugas atau WO. |
| I21 | Rekap berdiri sendiri per unit dan periode WIB. Snapshot mencakup WO selesai operasional meski administrasinya masih terbuka. Supervisor, Asman dan Manajer memeriksa secara berurutan. Versi final tersedia di `Node_kirim_laporan_bulanan`, titik masuk distribusi I22. |

Node dan edge diperiksa terhadap sumber BPMN asli dan graf yang digunakan aplikasi. Uji domain mencakup dua jalur izin, penandatangan di luar urutan, pengembalian pada setiap tahap pemberitahuan, kelengkapan berkas, versi arsip, penutupan sekali, batas pergantian bulan WIB, cakupan unit, duplikasi periode, revisi, versi usang, dan refresh. Uji Chrome menjalankan izin ketinggian, satu siklus revisi pemberitahuan, penutupan WO, dan tiga review rekap lewat UI.

```powershell
node scripts/test-i18-i21.cjs
$env:IWOMS_TEST_EXECUTION='closure'
node scripts/browser-i10-i13.cjs
```

Pemeriksaan kelengkapan menggabungkan status dokumen yang tersimpan dan pernyataan pemeriksaan Preparator. Bukti tambahan dapat berupa catatan referensi atau unggahan PDF/gambar. Untuk K04, penandatangan dapat merekam kendala sambil mempertahankan tugas aktif dan tanpa menambah tanda tangan persetujuan. Jalur formal tindak lanjut mengikuti keputusan pemilik proses sebelum pilot. Identitas, tanda tangan, dan penyimpanan masih menggunakan lingkungan demo.
