"""Generate the BPMN manifest and source-backed reproduction register for I01."""
import hashlib
import json
import re
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/baseline-i01'
source = ROOT.parent / 'pdkb-vue/sources/Draft BPMN PDKB FINAL.bpmn'
data = source.read_bytes()
xml = ET.fromstring(data)
ns = {'b': 'http://www.omg.org/spec/BPMN/20100524/MODEL'}
process = xml.find('b:process', ns)
counts = {tag: len(process.findall('b:' + tag, ns)) for tag in ['task', 'exclusiveGateway', 'parallelGateway', 'startEvent', 'endEvent', 'sequenceFlow']}
assert counts == dict(task=181, exclusiveGateway=94, parallelGateway=2, startEvent=4, endEvent=18, sequenceFlow=373)
lanes = [{'id': lane.get('id'), 'name': lane.get('name'), 'nodes': [node.text for node in lane.findall('b:flowNodeRef', ns)]} for lane in process.findall('b:laneSet/b:lane', ns)]
assert len(lanes) == 17
nodes = {node.get('id'): {'name': node.get('name'), 'type': node.tag.split('}')[-1]} for node in process if node.get('id') and not node.tag.endswith('sequenceFlow') and not node.tag.endswith('laneSet')}
flows = [dict(id=node.get('id'), source=node.get('sourceRef'), target=node.get('targetRef'), label=node.get('name')) for node in process.findall('b:sequenceFlow', ns)]
assert all(flow['source'] in nodes and flow['target'] in nodes for flow in flows)
manifest = dict(source=str(source), sha256=hashlib.sha256(data).hexdigest(), counts=counts, lanes=lanes, nodes=nodes, flows=flows)
(OUT / 'bpmn.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')

steps = [
 'Buat WO melalui P01, catat ID, lalu inisialisasi ulang/refresh. Cari ID tadi.',
 'Buat WO baru dan ganti ke Asman. Bandingkan P02 dengan antrean tugas.',
 'Dengan role TL HAR panggil tiga approveStep berurutan. Bandingkan dengan kondisi tombol P02 dan tombol Super Admin.',
 'Sebagai TL OP simpan draft, lalu edit. Periksa activeRoleKey dan daftar draft TL lain.',
 'Buka P02 sebagai Bagian Terkait. Periksa tombol Tolak dan handler confirmRejectWO beserta flag approval.',
 'Tolak WO, buka lewat executeAction ke P01, lalu ajukan ulang. Bandingkan kedua ID dan status WO asal.',
 'Setujui tiga tahap, kembalikan dari P03, lalu buka P02. Periksa flag lama dan tombol yang tersedia.',
 'Buka P03 pada WO Approved. Periksa field survei/kelayakan dan preparatorScheduleWO. Bandingkan Node_supervisor_surv pada BPMN.',
 'Buka detail WO. Bandingkan activeDocData pada Approved, Scheduled, Ongoing dan Completed.',
 'Telusuri JSA/IBPPR pada pratinjau, lalu cari tugas, keputusan dan revisi versi per dokumen.',
 'Telusuri DOC-10 dan tandaTanganiPenutupanObjek. Cocokkan dengan node izin awal dan penutupan.',
 'Periksa data personel P03 serta tim pratinjau. Cari verifikasi surat per personel, pengganti dan pembaruan.',
 'Periksa isSp2bIssued/isSp3bIssued dan pratinjau. Cari perintah terbit per surat serta guard urutannya.',
 'Periksa checklist yang tersedia. Cari serah SP2B, tanda terima Pelaksana, catat Preparator dan dua penerimaan SP3B.',
 'Buat WO baru, isi permit dan tanggal P03, jadwalkan. Buka E01 dan cari aksi mengisi briefing.',
 'Buka E03 sebagai Area/APD/GI. Periksa kondisi tombol dan bandingkan objek op dengan atribut WO terkait.',
 'Telusuri DOC-11 dan E01. Cari tugas verifikasi calon, BA tanda tangan dan pemeriksaan kondisi awal.',
 'Buka E01, catat SWA dan periksa aksi pemulihan. Bandingkan tugas paralel dan join di XML.',
 'Ganti jawaban WIP pada WO A, pilih WO B. Kosongkan jawaban lalu sahkan sebagai K3L tanpa submit.',
 'Panggil selesai lapangan pada WO yang area operasinya false. Periksa status dan waktu selesai operasional.',
 'Jalankan jeda/lanjut dan bandingkan titik kembali dengan dua belas Node_resume di XML.',
 'Pada WO dengan laporan diterima dan WIP sah, kembalikan revisi. Periksa canCloseWO dan tombol tutup.',
 'Buka R03 sebagai Komisi Unit. Periksa akses tutup. Telusuri gerbang laporan harian, kelengkapan dan arsip Preparator.',
 'Buka R05. Cari periode, snapshot WO berdasar selesai operasional, tiga review dan dua penerimaan Komisi.',
 'Jalankan mulai lapangan, baca tanggalnya. Periksa tanggal R03, skor WIP dan angka contoh dashboard.',
 'Panggil cetakBAPP dan cetakLaporanEvaluasiR05. Periksa fungsi, berkas keluaran dan toast.',
]
roadmap = (ROOT / 'docs/ROADMAP_EKSEKUSI_IWOMS_ISMINA.md').read_text(encoding='utf-8')
rows = re.findall(r'^\| (T\d{2}) \| (.*?) \| (.*?) \| (.*?) \|$', roadmap, re.M)
assert len(rows) == len(steps) == 26
functions = json.loads((OUT / 'function-results.json').read_text())
reproduced = {result['id'] for result in functions['results'] if result['reproduced']}
lines = ['# Register reproduksi I01', '', 'Gunakan snapshot `index.snapshot.html` dan commit/hash pada manifest. Jalankan `node scripts/i01-baseline.cjs` dari root repo. Skrip membutuhkan Node, Chrome dan instalasi Vue workspace pada `../pdkb-vue/node_modules/vue`. Chrome memuat CDN Vue, Tailwind dan font dari jaringan. Jalankan `python scripts/i01-inventory.py` sesudahnya.', '', 'Hasil berstatus reproduced membuktikan perilaku bermasalah masih ada. Assertion memeriksa reproduksi baseline. Perbaikan nanti harus mengubah ekspektasi menjadi perilaku BPMN. Untuk cek manual, jalankan aplikasi dengan `python -m http.server 3000` dari repo, buka browser baru dan ikuti langkah di bawah. Nomor baris mengacu source kerja pada snapshot. Bukti fungsi, inspeksi kode dan tampilan browser memiliki cakupan berbeda.', '', '| ID | Temuan | Cara reproduksi/inspeksi | Bukti I01 | Batch perbaikan |', '| --- | --- | --- | --- | --- |']
for (id_, finding, batch, expected), step in zip(rows, steps):
    evidence = 'Reproduksi fungsi lulus, lihat function-results.json' if id_ in reproduced else 'Inspeksi source dan perbandingan tugas/edge XML, uji perilaku manual tersedia'
    lines.append(f'| {id_} | {finding} | {step} | {evidence} | {batch} |')
(OUT / 'REPRODUKSI.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('BPMN checked; all 26 findings mapped to reproduction steps.')

inventory = json.loads((OUT / 'inventory.json').read_text(encoding='utf-8'))
lines = ['# Inventaris I01', '', 'Data diambil dari setup Vue pada source kerja, metadata dokumen dan isi folder assets. Peta akses berikut merupakan kondisi kode baseline. Kesesuaiannya terhadap kewenangan BPMN diuji pada batch pemilik perbaikan.', '', '## Layar', '', '| Kode | Judul | Klasifikasi dan pemakaian kembali |', '| --- | --- | --- |']
classes = {
 'D01': 'Dashboard memakai WO fixture dan antrean parsial. Shell dan tabel dapat dipakai.',
 'P01': 'Draft, lampiran dan submit mengubah state memori. Layout form dapat dipakai.',
 'P02': 'Persetujuan mengubah state, dengan celah role dan revisi. Struktur review dapat dipakai.',
 'P03': 'Permit/jadwal mengubah state. Form perlu dihubungkan ke survei dan dokumen.',
 'P04': 'Rencana operasi contoh. Perlu penugasan dan konfirmasi per WO.',
 'E01': 'Kontrol mulai/jeda/lanjut/selesai mengubah status. Perlu guard BPMN.',
 'E02': 'WIP dan kesiapan parsial. Jawaban bersama antar-WO.',
 'E03': 'Operasi contoh PADAM, mutasi objek op terpisah. Layout koordinasi dapat diadaptasi.',
 'R01': 'Penutupan izin objek parsial, ekspor BAPP hanya notifikasi.',
 'R02': 'Pengesahan flag WIP, belum mengecek pengajuan/versi.',
 'R03': 'Penerimaan dan penutupan status dengan aturan lama. Detail bukti dapat diadaptasi.',
 'R04': 'Laporan operasi contoh. Sambungkan peristiwa operasi aktual.',
 'R05': 'Evaluasi contoh, ekspor hanya notifikasi. Layout rekap dapat dipakai.',
 'U01': 'Profil sesi simulasi. Memerlukan identitas server pada I25.',
}
for screens in inventory['screens'].values():
    for screen in screens:
        lines.append(f"| {screen['code']} | {screen['title']} | {classes.get(screen['code'], 'Master data demo. Tinjau ulang sesuai objek yang dipakai.')} |")
lines += ['', '## Role dan akses layar aktual', '', '| Kunci role | Nama | Layar |', '| --- | --- | --- |']
for key, role in inventory['roles'].items():
    lines.append(f"| {key} | {role['title']} | {', '.join(inventory['permissions'].get(key, []))} |")
lines += ['', '## Blangko dan aset', '', 'Pratinjau digital dan PDF arsip dapat dipakai sebagai referensi tata letak. Metadata aktor, tanggal, nomor, tanda tangan dan status harus berasal dari transaksi setelah batch terkait selesai. DOC-03 menunjuk PDF survei di pemetaan preview, sementara DOC-10/DOC-11 tercatat dalam metadata. Cek kecocokan formulir saat mengimplementasikan dokumennya.', '', '| Kode | Metadata |', '| --- | --- |']
for key, meta in inventory['documents'].items():
    lines.append(f'| {key} | {json.dumps(meta, ensure_ascii=False)} |')
lines += ['', 'Daftar berkas aset beserta SHA-256 tersedia pada `inventory.json`. Paket baseline juga menyimpan hash source, snapshot HTML kerja, diff terhadap HEAD, dan graf XML. Skrip capture lama mempunyai path pengguna LENOVO dan port tetap. Runner I01 menggunakan direktori repo, port lokal dinamis, serta profil Chrome terisolasi.', '', '## Elemen berdasarkan perilaku', '', '- State berfungsi dalam satu sesi untuk draft/submit, persetujuan, penjadwalan, kontrol lapangan, SWA, penerimaan laporan dan penutupan. Buktinya berada di function-results.json.', '- Data contoh meliputi WO awal, sampleAuditLogs, sampleCrew, operasi PADAM, jawaban WIP awal, angka evaluasi dan sejumlah identitas/tanggal dokumen.', '- cetakBAPP dan cetakLaporanEvaluasiR05 hanya memanggil notify. Tidak ada pembuatan berkas pada kedua handler ini. Cetak formulir digital mempunyai jalur print terpisah.', '- Permintaan unduh dengan preview_url mempunyai jalur klik berkas. Jalur fallback unduh hanya memberi notifikasi. Periksa ulang berdasarkan jenis dokumen saat I23.', '']
(OUT / 'INVENTARIS.md').write_text('\n'.join(lines), encoding='utf-8')
