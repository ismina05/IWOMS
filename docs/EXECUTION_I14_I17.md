# Hasil eksekusi I14–I17

| Batch | Hasil |
| --- | --- |
| I14 | Pemeriksaan awal membaca konfirmasi SOK WO yang sama. Keputusan tidak aman melalui evaluasi ulang dan H10. Delegasi memerlukan calon dari tim, verifikasi kewenangan oleh Supervisor, BA, penerimaan, tanda tangan mengetahui, dan arsip. Jalur calon pengganti serta H11 tersedia. |
| I15 | Pelaksana, Kepala Regu, dan Pengawas K3 menerima tugas pada putaran yang sama. Join menunggu ketiganya. Penghentian aktif memerlukan pengamanan dan evaluasi K3. H12 kembali ke pemeriksaan awal. Laporan fisik mencatat `physical_completed_at`. |
| I16 | WIP 22 butir tersimpan per WO dan versi. Pengawas K3 mengisi atau mengajukan. K3L mengesahkan versi aktif yang diajukan. R03 membaca skor dari transaksi. |
| I17 | Permintaan penormalan dan konfirmasi balik tersimpan per putaran dan WO. Penormalan yang belum memenuhi dapat diulang. Kepala Regu mencatat `operational_completed_at` setelah konfirmasi. Handoff untuk I18 berada pada `Node_izin_tinggi_digunakan`. |

Sumber BPMN diperiksa terhadap hash `6aa0861fac3f0467905b234ce25f8e33f8cebd2519029fc9de3a66c931b64cfb`. Skenario domain memeriksa jejak edge terhadap graf, H10–H12, calon pengganti, revisi putaran, SWA, pemisahan WIP antar-WO, refresh, versi yang salah, pengulangan penormalan dan pemisahan waktu selesai.

```powershell
node scripts/test-i14-i17.cjs
$env:IWOMS_TEST_EXECUTION='1'
node scripts/browser-i10-i13.cjs
```

Browser memakai role simulasi. Penerimaan BA dilakukan melalui akun Pelaksana demo. Untuk K02, penghentian dapat dicatat sebelum join dan tugas tersisa dapat melaporkan bukti putaran. Jalur lanjut mensyaratkan evaluasi K3. Penanggung jawab dan perlakuan tugas aktif untuk pilot mengikuti keputusan pemilik proses. Penyimpanan tetap menggunakan browser.
