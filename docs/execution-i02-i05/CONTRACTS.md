# Kontrak demo menuju adapter Laravel

`app/workflow.js` mengekspor `Repository` melalui CommonJS untuk tes domain dan `window.IwomsWorkflow` untuk browser. `app/workspace.js` menghubungkan repository ke ref Vue yang sudah dipakai Ismina. Komponen membaca hasil snapshot yang sama dengan antrean dan daftar WO.

| Metode | Masukan | Hasil |
| --- | --- | --- |
| `new Repository(storage, key?)` | Adapter yang mempunyai `getItem` dan `setItem` | Memuat schema dan versi proses, atau melempar error tanpa mengganti data rusak. |
| `snapshot()` | Tidak ada | Salinan state untuk tampilan. |
| `orders(actor)` | `id`, `role`, `unitId`, `name` | Salinan WO yang memenuhi scope dan kepemilikan. |
| `tasks(actor)` | Aktor yang sama | Tugas berdasarkan lane, unit dan assignee bila ada. |
| `command(request, actor)` | `action`, `woId?`, `expectedVersion?`, `idempotencyKey`, `data` | `woId`, `version`, `status`, `nextTask`, `auditId`. |
| `reload()` | Tidak ada | Snapshot terbaru dari penyimpanan. |
| `reset(actor)` | Super Admin demo | Mengosongkan dataset kerja setelah konfirmasi pada UI. |

Perintah menggunakan salinan state, memvalidasi tugas aktif, lalu menyimpan seluruh state baru melalui satu `setItem`. Error sebelum keberhasilan tulis mempertahankan state repository sebelumnya. Receipt disimpan bersama keputusan agar pengulangan request dengan key sama menghasilkan hasil yang sama. Versi WO dan revisi snapshot menahan pemakaian data usang. Adapter HTTP pada I26 dapat mempertahankan bentuk request/response sambil menjalankan validasi dan transaksi pada server.

| Entitas | Bidang yang tersedia |
| --- | --- |
| State | `schema`, `processVersion`, `revision`, `orders`, `tasks`, `documents`, `operations`, `reports`, `audits`, `notifications`, `receipts`. |
| WO | `id`, `ownerId`, `ownerRole`, `unitId`, `processVersion`, `version`, `nodeId`, `stage`, `status`, identitas proposal, `createdAt`, `updatedAt`, persetujuan saat ini, surveyVersions, initialAnalyses, plan, documentIds, operationIds. |
| Task | `id`, `woId`, `nodeId`, `role`, `assigneeId`, `unitId`, `screen`, `title`, `expectedVersion`, `actionable`. |
| Document | `id`, `woId`, `type`, `version`, `createdBy`, `at`, `data` atau metadata dan isi lampiran. Review dokumen formal dilaksanakan pada I07 dan seterusnya. |
| Audit | `id`, `woId`, `processVersion`, `nodeId`, `nextNodeId`, `edgeIds`, `taskId`, `actor`, `at`, `version`, `action`, `data`. |
| Notification | `id`, `woId`, `recipientId`, `unitId`, `message`, `at`, `kind`. |
| OperationEvent | Kontrak JSDoc berisi `id`, `woId`, `requestId`, `kind`, `nodeId`, `actorId`, `unitId`, `result`, `at`, `version`. Pencatatan transaksinya mengikuti I13/I17. |
| PeriodReport | Kontrak JSDoc berisi `id`, `period`, `unitId`, `version`, `nodeId`, `processVersion`, `createdBy`, `createdAt`, `snapshot`, `documentVersionIds`, `decisionIds`. Snapshot merujuk `woId`, waktu selesai operasional dan versi WO. Pencatatan transaksinya mengikuti I21. |

Waktu peristiwa disimpan sebagai ISO UTC. Waktu UI dan tanggal pengajuan mengikuti Asia/Jakarta. Tanggal survei dan rencana merupakan tanggal kalender yang divalidasi, beserta waktu rencana 24 jam.

Alur yang tersedia adalah create/save/submit, approve/reject/return, stop, priority, survey, analysis, feasibility, notify, plan, lampiran pengajuan, dan peninjauan legacy. Migrasi `Assignment Review` bersifat tindakan peninjauan teknis yang dicatat secara eksplisit. Setelah pemilik asal diverifikasi, usulan masuk pemeriksaan Asman. Persetujuan lama tetap menjadi bukti historis dan tidak menandai persetujuan baru.

Antrean pengajuan berhenti pada `Node_kirim_jsa`, dengan penanda belum dapat dieksekusi hingga I07. Tiap tugas berikutnya berasal dari hasil command. Klaim tanda tangan atau penerbitan dokumen mengikuti rekaman tahap dokumen terkait.
