# Kontrak surat, serah terima, kesiapan dan SOK

Modul `field-preparation.js` menerima context transaksi dari `preparation.js`, setelah repository memeriksa identitas, role, unit, tugas aktif, versi WO dan idempotensi. Seluruh perubahan tetap dipublikasikan melalui satu snapshot penyimpanan bersama audit, tugas dan receipt.

| Entitas | Bidang |
| --- | --- |
| SP2B/SP3B | Kontrak dokumen sebelumnya, ditambah `rosterSnapshot`, `sourceRosterVersion`, `sourceSp2bId` untuk SP3B, `issuedAt`, `issuedBy`. Payload memuat nomor, lingkup dan identitas pengawas. SP2B juga memuat instalasi, lokasi dan batas pekerjaan. |
| Checklist | `items` dengan kategori, nama, jumlah, satuan dan kondisi. Payload menyimpan catatan pemeriksaan serta ringkasan daftar peralatan/material. Keputusan Supervisor dan Kepala Regu merujuk versi yang sama. |
| Delivery | `id`, `documentVersionId`, `recipientId`, `recipientRole`, `handedBy`, `handedAt`, serta `receivedBy`, `receivedAt`, `acknowledged`, `recordedBy`, `recordedAt` bila tahap terkait selesai. |
| Handoff history | `id`, `action`, `nodeId`, `actorId`, `at`, snapshot `deliveries`. |
| Readiness | `id`, `nodeId`, `actorId`, `actorName`, `at`, `data`. Hasil checkbox dicatat eksplisit sebagai boolean. |
| SOK request | `id`, `woId`, `kind=sok-start`, `round`, `createdBy`, `createdAt`, `data` instalasi/batas/catatan, `eventIds`. |
| SOK event | `id`, `woId`, `requestId`, `kind`, `nodeId`, `actorId`, `actorName`, `unitId`, `action`, `result`, `at`, `version`, `data`. |
| SOK confirmation | `requestId`, `actorId`, `at` pada `wo.sokConfirmed` setelah seluruh bukti putaran aktif memenuhi pemeriksaan. |

`wo.deliveries`, `wo.handoffs`, `wo.readiness` dan `wo.sokRequests` menyimpan hasil per WO. `state.operations` menyimpan event koordinasi yang dirujuk oleh `wo.operationIds`. Data operasi contoh dari UI legacy tidak dipakai untuk mengisi koleksi tersebut.

| Tahap | Action |
| --- | --- |
| Surat dan checklist | Memakai `document-submit`, `document-approve`, `document-reject`, `document-revise`, `document-unrepairable`. H05–H07 memakai mekanisme penahanan I06. |
| SP2B | `sp2b-deliver`, `sp2b-receive`, `sp2b-record`. |
| SP3B | `sp3b-deliver`, `sp3b-receive-regu`, `sp3b-receive-k3`. |
| Kesiapan | `readiness-instruct`, `readiness-check`, `job-briefing`, `safety-briefing`, `start-coordinate`. |
| SOK awal | `sok-request`, `sok-area`, `sok-apd`, `sok-gi`, `sok-confirm-apd`, `sok-confirm-area`, `sok-confirmed`, `sok-retry`, `sok-hold`. |

Tanda terima memerlukan `documentVersionId` dan `acknowledged=true`. Task penerima mempunyai `assigneeId` dari transaksi penyerahan. Distribusi SP3B menyimpan dua penerima dalam transaksi yang sama, lalu menjalankan pengakuan mereka sesuai urutan BPMN.

Command SOK setelah permintaan awal harus menyebut `requestId` putaran aktif pada WO yang sama. Konfirmasi akhir memeriksa event permintaan, Area, APD, hasil GI dan konfirmasi balik. Hasil GI harus mencatat `applied=true`. Permintaan ulang membuat ID baru. H09 kembali ke permintaan awal dan memerlukan seluruh rantai konfirmasi lagi.

Action yang menghasilkan kegagalan simpan mempertahankan state sebelumnya. Request identik dengan kunci idempotensi yang sama mengembalikan receipt sebelumnya. Kegagalan pemeriksaan kesiapan yang sengaja disimpan menghasilkan `message` pada respons, dengan tugas tetap aktif bila APD/kesehatan belum memenuhi. Guard ini mengikuti batas demo K03, tanpa menambahkan cabang BPMN baru.
