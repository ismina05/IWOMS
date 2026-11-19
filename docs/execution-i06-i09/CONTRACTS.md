# Kontrak persiapan dan pemulihan

`IwomsPreparation.handle(context)` dipanggil oleh `Repository.command` setelah validasi role, unit, tugas aktif, versi WO dan idempotensi. Context membawa snapshot transaksi, WO, aktor, waktu, payload, pencatat edge serta fungsi error. Perubahan WO dan dokumen dipublikasikan bersama tugas, audit dan receipt sesudah snapshot berhasil disimpan.

| Record | Bidang utama |
| --- | --- |
| Dokumen formal | `id`, `woId`, `type`, `version`, `status`, `payload`, `sourceSurveyVersion`, `planSnapshot`, `submittedBy`, `submittedByName`, `submittedAt`, `decisions`, `fileIds`. |
| Keputusan dokumen | `id`, `result`, `actorId`, `actorName`, `role`, `nodeId`, `at`, `reason`. |
| Berkas pendukung | `id`, `woId`, `type=support-file`, `documentType`, `forVersion`, `name`, `mime`, `content`, `createdBy`, `at`. |
| Episode penahanan | `id`, `causeId`, `cause`, `originNodeId`, `holdNodeId`, `resumeNodeId`, `coordinatorRole`, `startedAt`, `actorId`, `reason`, `attempts`, serta waktu selesai atau pembatalan bila berlaku. |
| Roster kewenangan | `id`, `woId`, `type=AUTHORITY_ROSTER`, `version`, `people`, `kind`, `createdBy`, `at`. Snapshot setiap perubahan tersimpan sebagai dokumen. |
| Surat per personel | `personId`, `name`, `duty`, `requiredCompetence`, `certificateNo`, `competence`, `validFrom`, `validUntil`, `evidence`. |
| Hasil verifikasi | `rosterVersion`, `planDate`, `actorId`, `at`, `results` per personel dengan alasan. |

WO menyimpan `activeDocumentIds`, `holds`, `pendingHold`, `heightRequired`, `heightDecision`, `heightPermitId`, `authorityRoster`, `assignedPersonIds`, `authorityReviews` dan `authorityValid` ketika tahap terkait tercapai. Tugas dokumen membawa `documentVersionId`. Request reviewer harus menyebut versi yang sedang diperiksa. JSA dan IBPPR memakai tipe terpisah. Payload pengajuan lama tetap utuh ketika versi baru dibuat, sementara keputusan hanya ditambahkan pada versi yang masih menunggu review.

| Kelompok | Action yang tersedia |
| --- | --- |
| Dokumen | `document-file`, `document-submit`, `document-approve`, `document-reject`, `document-revise`, `document-unrepairable`. |
| Penahanan | `hold-establish`, `hold-fulfill`, `hold-resolved`, `hold-temporary`, `hold-permanent`, `hold-resume`, `hold-request-cancel`, `hold-approve-cancel`, `hold-reject-cancel`. |
| Izin | `height-needed`, `height-not-needed`, `height-record`. |
| Kewenangan | `authority-collect`, `authority-verify`, `authority-use-replacement`, `authority-request-renewal`, `authority-replace`, `authority-renew`, `authority-renewal-failed`, `authority-check-renewal`. |

Setiap action hanya berlaku pada node yang memiliki tindakan itu. Mekanisme tidak menerima node tujuan bebas dari UI. `follow` mencari edge asli pada graf. Penambahan versi dan keputusan juga mengikuti validasi repository sehingga gagal simpan tidak meninggalkan perubahan sebagian. Titik kembali H05–H12 dan node persiapan SP2B dapat menghasilkan handoff dengan `actionable=false` sampai implementasi batch terkait tersedia.

Pada H04, fulfillment dapat membawa roster dengan surat yang diperbarui. Identitas dan tugas asal dipertahankan. Supervisor hanya dapat meneruskan ke resume ketika data kewenangan sudah memenuhi pemeriksaan, lalu Preparator tetap menjalankan verifikasi pada node kembali. Perubahan roster tidak menghasilkan tanda tangan atau penerbitan SP2B.
