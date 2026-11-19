# Hasil Batch I01

Status selesai untuk scope baseline, inventaris dan reproduksi. Pelaksanaan menggunakan source kerja pada branch `develop/bpmn-pdkb` dengan HEAD `438e746c7d5ba46e539155bf272af9ec396f6418`. Hash sumber kerja, waktu pengambilan dan versi Node tersimpan di [manifest.json](manifest.json). `index.snapshot.html` adalah salinan source kerja saat pengambilan. `local-changes.patch` mencatat perbandingan dengan HEAD.

## Baseline aktual

Diff source kerja sebelum I01 berisi 60 baris tambahan dan 27 penghapusan. Perubahan itu meliputi font Geist/Google Sans dan skala typography, header PLN UID YOGYAKARTA, penghilangan label produk panjang, kartu perlu aksi di header, pemindahan salam, dan pengurangan label/emoji pada beberapa area. Hasil tangkapan layar menggunakan source kerja tersebut. I01 menambahkan runner dan bukti baseline pada repo.

Sumber BPMN memiliki SHA-256 `6aa0861fac3f0467905b234ce25f8e33f8cebd2519029fc9de3a66c931b64cfb`. Pemeriksaan XML menghasilkan 17 lane, 181 task, 94 exclusive gateway, 2 parallel gateway, 4 start, 18 end, dan 373 sequence flow. Semua endpoint flow ditemukan dalam node proses. Snapshot graf dan lane tersedia di [bpmn.json](bpmn.json). Pembacaan pendamping mencakup alur end-to-end, lampiran XML dan bagian desain/arsitektur blueprint pada `pdkb-vue/docs`.

## Bukti dan cara menjalankan ulang

Jalankan dari root repo Ismina dengan `node scripts/i01-baseline.cjs`, lalu `python scripts/i01-inventory.py`. Runner membutuhkan Node yang menyediakan fetch/WebSocket, Chrome pada path default Windows atau environment `CHROME_PATH`, Vue workspace pada `../pdkb-vue/node_modules/vue`, dan jaringan untuk CDN aplikasi. Dependensi workspace ini dicatat agar eksekusi ulang di mesin lain dapat disiapkan. Skrip menggunakan port HTTP/debug dinamis dan profil Chrome terisolasi di folder yang diabaikan Git.

| Artefak | Cakupan |
| --- | --- |
| [INVENTARIS.md](INVENTARIS.md) dan inventory.json | Seluruh menu/layar, 17 role ditambah Super Admin, izin layar, metadata blangko, klasifikasi dan hash aset. |
| [REPRODUKSI.md](REPRODUKSI.md) | Seluruh T01–T26, langkah reproduksi atau inspeksi dan batch perbaikan. |
| [function-results.json](function-results.json) | 12 reproduksi fungsi berhasil pada setup Vue dalam VM. Ekspektasi memeriksa keberadaan celah baseline. |
| [browser-results.json](browser-results.json) | 10 layar Chrome desktop/mobile, ukuran, role, state modal dan font aktual. |
| index.snapshot.html dan local-changes.patch | Salinan source kerja dan perubahan terhadap commit audit. |

Uji fungsi menjalankan mutasi sintetis langsung pada handler. Pengambilan browser membuka layar melalui state/fungsi Vue, memeriksa konten dan kondisi modal, lalu mengambil screenshot. Bukti ini membantu membandingkan tampilan dan perilaku baseline. UAT klik pengguna dan pengujian antar akun berada pada I24/I28.

## Galeri baseline

| Layar | Desktop 1440 × 1000 | Mobile 390 × 844 |
| --- | --- | --- |
| Dashboard | [Buka](desktop-dashboard.png) | [Buka](mobile-dashboard.png) |
| Pengajuan P01 | [Buka](desktop-p01.png) | [Buka](mobile-p01.png) |
| Persetujuan P02 | [Buka](desktop-p02.png) | [Buka](mobile-p02.png) |
| Detail WO | [Buka](desktop-detail.png) | [Buka](mobile-detail.png) |
| Pratinjau SP2B | [Buka](desktop-preview.png) | [Buka](mobile-preview.png) |

Inspeksi visual menemukan pemilih role menimpa sebagian identitas header pada mobile. Screenshot mencatat kondisi itu untuk perbandingan UI pada I03/I24. Status label validasi global pada preview juga perlu diperiksa bersama status per dokumen di I07/I10. Template, warna dan hierarchy yang tersedia tetap menjadi bahan reuse sesuai inventaris.

## Penerimaan I01

| Kriteria | Hasil dan bukti |
| --- | --- |
| Commit, branch dan diff lokal tercatat | Lulus melalui manifest dan local-changes.patch. |
| Sumber BPMN diperiksa dan dapat ditelusuri | Lulus melalui hash, hitungan XML, lane, node dan flow di bpmn.json. |
| Peta layar, role dan blangko tersedia | Lulus melalui INVENTARIS.md dan inventory.json. |
| Desktop/mobile untuk lima layar tersedia | Lulus melalui 10 PNG dan browser-results.json. |
| Semua temuan mempunyai cara reproduksi | Lulus melalui 26 baris REPRODUKSI.md. Dua belas kasus juga direproduksi lewat fungsi. |
| Cakupan bukti fungsi dan browser dijelaskan | Lulus pada tabel artefak dan metode tiap hasil. |

I02 siap dimulai dengan snapshot source, kontrak perilaku awal, graf BPMN dan kasus regresi yang tersedia. Source saat ini masih mempunyai celah yang direkam I01. Perbaikan transisi, penyimpanan, role dan tampilan mengikuti batch pemiliknya pada roadmap.
