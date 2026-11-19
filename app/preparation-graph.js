(function (global) {
  const graph = {
  "hash": "6aa0861fac3f0467905b234ce25f8e33f8cebd2519029fc9de3a66c931b64cfb",
  "nodes": {
    "Node_start_op": {
      "title": "Mulai pengajuan WO",
      "type": "startEvent",
      "role": "tl_op"
    },
    "Node_start_har": {
      "title": "Mulai pengajuan WO",
      "type": "startEvent",
      "role": "tl_har"
    },
    "Node_start_konstruksi": {
      "title": "Mulai pengajuan WO",
      "type": "startEvent",
      "role": "tl_konstruksi"
    },
    "Node_buat_op": {
      "title": "Identifikasi kebutuhan dan ajukan WO",
      "type": "task",
      "role": "tl_op"
    },
    "Node_buat_har": {
      "title": "Identifikasi kebutuhan dan ajukan WO",
      "type": "task",
      "role": "tl_har"
    },
    "Node_buat_konstruksi": {
      "title": "Identifikasi kebutuhan dan ajukan WO",
      "type": "task",
      "role": "tl_konstruksi"
    },
    "Node_gabung_pengajuan": {
      "title": "Satu pengaju WO",
      "type": "exclusiveGateway",
      "role": "asman_jaringan"
    },
    "Node_periksa_wo_asman": {
      "title": "Periksa WO",
      "type": "task",
      "role": "asman_jaringan"
    },
    "Node_setuju_wo_asman": {
      "title": "WO disetujui Asman?",
      "type": "exclusiveGateway",
      "role": "asman_jaringan"
    },
    "Node_periksa_wo_supervisor": {
      "title": "Periksa dan evaluasi WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_setuju_wo_supervisor": {
      "title": "WO disetujui Supervisor?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_periksa_wo_manajer": {
      "title": "Periksa dan setujui WO",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_setuju_wo_manajer": {
      "title": "WO disetujui Manajer?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_gabung_penolakan": {
      "title": "WO ditolak",
      "type": "exclusiveGateway",
      "role": "asman_jaringan"
    },
    "Node_identifikasi_pengaju": {
      "title": "Siapa pengaju awal?",
      "type": "exclusiveGateway",
      "role": "asman_jaringan"
    },
    "Node_pilih_op": {
      "title": "Tinjau alasan penolakan",
      "type": "task",
      "role": "tl_op"
    },
    "Node_revisi_op": {
      "title": "WO akan direvisi?",
      "type": "exclusiveGateway",
      "role": "tl_op"
    },
    "Node_perbaiki_op": {
      "title": "Revisi dan ajukan ulang WO",
      "type": "task",
      "role": "tl_op"
    },
    "Node_stop_op": {
      "title": "Pengajuan WO dihentikan",
      "type": "endEvent",
      "role": "tl_op"
    },
    "Node_pilih_har": {
      "title": "Tinjau alasan penolakan",
      "type": "task",
      "role": "tl_har"
    },
    "Node_revisi_har": {
      "title": "WO akan direvisi?",
      "type": "exclusiveGateway",
      "role": "tl_har"
    },
    "Node_perbaiki_har": {
      "title": "Revisi dan ajukan ulang WO",
      "type": "task",
      "role": "tl_har"
    },
    "Node_stop_har": {
      "title": "Pengajuan WO dihentikan",
      "type": "endEvent",
      "role": "tl_har"
    },
    "Node_pilih_konstruksi": {
      "title": "Tinjau alasan penolakan",
      "type": "task",
      "role": "tl_konstruksi"
    },
    "Node_revisi_konstruksi": {
      "title": "WO akan direvisi?",
      "type": "exclusiveGateway",
      "role": "tl_konstruksi"
    },
    "Node_perbaiki_konstruksi": {
      "title": "Revisi dan ajukan ulang WO",
      "type": "task",
      "role": "tl_konstruksi"
    },
    "Node_stop_konstruksi": {
      "title": "Pengajuan WO dihentikan",
      "type": "endEvent",
      "role": "tl_konstruksi"
    },
    "Node_prioritas_wo": {
      "title": "Tetapkan prioritas dan rencana kerja",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_survei_lokasi": {
      "title": "Survei lokasi dan isi Form Survei",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_susun_analisis_awal": {
      "title": "Susun IBPPR dan JSA hasil survei",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_supervisor_surv": {
      "title": "Periksa hasil survei dan risiko",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_survei_layak": {
      "title": "Pekerjaan layak?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_perlu_survei_ulang": {
      "title": "Perlu survei ulang?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_hentikan_hasil_survei": {
      "title": "Hentikan WO karena tidak layak",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_beritahu_pengaju_survei": {
      "title": "Beritahukan hasil kepada pengaju",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_end_survei": {
      "title": "WO dihentikan: survei tidak layak",
      "type": "endEvent",
      "role": "supervisor_pdkb"
    },
    "Node_rencana_pelaksanaan": {
      "title": "Susun jadwal, personel dan metode kerja",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_kirim_jsa": {
      "title": "Ajukan JSA untuk diperiksa",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_periksa_jsa_k3l": {
      "title": "Periksa JSA",
      "type": "task",
      "role": "p2k3_k3l"
    },
    "Node_sesuai_jsa_k3l": {
      "title": "JSA sesuai?",
      "type": "exclusiveGateway",
      "role": "p2k3_k3l"
    },
    "Node_setuju_jsa_asman": {
      "title": "Periksa dan setujui JSA",
      "type": "task",
      "role": "asman_jaringan"
    },
    "Node_disetujui_jsa_asman": {
      "title": "JSA disetujui?",
      "type": "exclusiveGateway",
      "role": "asman_jaringan"
    },
    "Node_revisi_jsa": {
      "title": "Perbaiki JSA yang ditolak",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_bisa_revisi_jsa": {
      "title": "JSA bisa diperbaiki?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_hold_jsa": {
      "title": "Tetapkan WO On Hold: dokumen JSA",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_jsa": {
      "title": "Koordinasikan pemenuhan: dokumen JSA",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_jsa": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_jsa": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_jsa": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_jsa": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_jsa": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_jsa": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_jsa": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_kirim_ibppr": {
      "title": "Ajukan IBPPR untuk diperiksa",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_periksa_ibppr_k3l": {
      "title": "Periksa IBPPR",
      "type": "task",
      "role": "p2k3_k3l"
    },
    "Node_sesuai_ibppr_k3l": {
      "title": "IBPPR sesuai?",
      "type": "exclusiveGateway",
      "role": "p2k3_k3l"
    },
    "Node_setuju_ibppr_asman": {
      "title": "Periksa dan setujui IBPPR",
      "type": "task",
      "role": "asman_jaringan"
    },
    "Node_disetujui_ibppr_asman": {
      "title": "IBPPR disetujui?",
      "type": "exclusiveGateway",
      "role": "asman_jaringan"
    },
    "Node_revisi_ibppr": {
      "title": "Perbaiki IBPPR yang ditolak",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_bisa_revisi_ibppr": {
      "title": "IBPPR bisa diperbaiki?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_hold_ibppr": {
      "title": "Tetapkan WO On Hold: dokumen IBPPR",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_ibppr": {
      "title": "Koordinasikan pemenuhan: dokumen IBPPR",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_ibppr": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_ibppr": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_ibppr": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_ibppr": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_ibppr": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_ibppr": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_ibppr": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_perlu_izin_ketinggian": {
      "title": "Perlu Izin Kerja Ketinggian?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_siapkan_izin": {
      "title": "Siapkan Izin Kerja Ketinggian",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_tandatangan_izin_k3": {
      "title": "Periksa dan tanda tangani izin",
      "type": "task",
      "role": "pengawas_k3"
    },
    "Node_izin_ok_k3": {
      "title": "Izin disetujui Pengawas K3?",
      "type": "exclusiveGateway",
      "role": "pengawas_k3"
    },
    "Node_tandatangan_izin_asman": {
      "title": "Periksa dan tanda tangani izin",
      "type": "task",
      "role": "asman_jaringan"
    },
    "Node_izin_ok_asman": {
      "title": "Izin disetujui Asman Jaringan?",
      "type": "exclusiveGateway",
      "role": "asman_jaringan"
    },
    "Node_tandatangan_izin_p2k3": {
      "title": "Periksa dan tanda tangani izin",
      "type": "task",
      "role": "p2k3_k3l"
    },
    "Node_izin_ok_p2k3": {
      "title": "Izin disetujui P2K3/K3L?",
      "type": "exclusiveGateway",
      "role": "p2k3_k3l"
    },
    "Node_tandatangan_izin_bagian": {
      "title": "Periksa dan tanda tangani izin",
      "type": "task",
      "role": "bagian_terkait"
    },
    "Node_izin_ok_bagian": {
      "title": "Izin disetujui Bagian Terkait?",
      "type": "exclusiveGateway",
      "role": "bagian_terkait"
    },
    "Node_revisi_izin": {
      "title": "Perbaiki Izin Kerja Ketinggian",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_izin_bisa_diperbaiki": {
      "title": "Izin dapat diperbaiki?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_hold_izin_ketinggian": {
      "title": "Tetapkan WO On Hold: izin ketinggian",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_izin_ketinggian": {
      "title": "Koordinasikan pemenuhan: izin ketinggian",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_izin_ketinggian": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_izin_ketinggian": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_izin_ketinggian": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_izin_ketinggian": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_izin_ketinggian": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_izin_ketinggian": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_izin_ketinggian": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_izin_ketinggian_selesai": {
      "title": "Catat izin yang telah ditandatangani",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_gabung_izin": {
      "title": "Lanjut tanpa/berdasarkan izin",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_minta_kewenangan": {
      "title": "Kumpulkan Surat Kewenangan personel",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_verifikasi_kewenangan": {
      "title": "Verifikasi masa berlaku dan kompetensi",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_kewenangan_valid": {
      "title": "Surat Kewenangan valid?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_tindak_lanjut_kewenangan": {
      "title": "Tentukan penggantian atau pembaruan",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_pengganti_tersedia": {
      "title": "Pengganti yang valid tersedia?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_verifikasi_pengganti": {
      "title": "Verifikasi Surat Kewenangan pengganti",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_terbitkan_surat": {
      "title": "Proses pembaruan Surat Kewenangan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_pembaruan_berhasil": {
      "title": "Surat dapat diperbarui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_verifikasi_surat_baru": {
      "title": "Verifikasi surat yang diperbarui",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_hold_surat_kewenangan": {
      "title": "Tetapkan WO On Hold: Surat Kewenangan",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_surat_kewenangan": {
      "title": "Koordinasikan pemenuhan: Surat Kewenangan",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_surat_kewenangan": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_surat_kewenangan": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_surat_kewenangan": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_surat_kewenangan": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_surat_kewenangan": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_surat_kewenangan": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_surat_kewenangan": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_siapkan_sp2b": {
      "title": "Susun dan ajukan SP2B",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_ttd_sp2b_sup": {
      "title": "Periksa dan tanda tangani SP2B",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_valid_sp2b_sup": {
      "title": "SP2B sesuai?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_ttd_sp2b_mgr": {
      "title": "Terbitkan dan tanda tangani SP2B",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_valid_sp2b_mgr": {
      "title": "SP2B disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_perbaiki_sp2b": {
      "title": "Perbaiki SP2B yang ditolak",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_bisa_perbaiki_sp2b": {
      "title": "SP2B dapat diperbaiki?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_hold_sp2b": {
      "title": "Tetapkan WO On Hold: SP2B",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_sp2b": {
      "title": "Koordinasikan pemenuhan: SP2B",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_sp2b": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_sp2b": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_sp2b": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_sp2b": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_sp2b": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_sp2b": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_sp2b": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_siapkan_sp3b": {
      "title": "Susun dan ajukan SP3B",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_ttd_sp3b_sup": {
      "title": "Periksa dan tanda tangani SP3B",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_valid_sp3b_sup": {
      "title": "SP3B sesuai?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_ttd_sp3b_mgr": {
      "title": "Terbitkan dan tanda tangani SP3B",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_valid_sp3b_mgr": {
      "title": "SP3B disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_perbaiki_sp3b": {
      "title": "Perbaiki SP3B yang ditolak",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_bisa_perbaiki_sp3b": {
      "title": "SP3B dapat diperbaiki?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_hold_sp3b": {
      "title": "Tetapkan WO On Hold: SP3B",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_sp3b": {
      "title": "Koordinasikan pemenuhan: SP3B",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_sp3b": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_sp3b": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_sp3b": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_sp3b": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_sp3b": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_sp3b": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_sp3b": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_susun_checklist": {
      "title": "Isi Checklist peralatan dan material",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_cek_checklist_sup": {
      "title": "Periksa dan tanda tangani Checklist",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_checklist_sesuai_sup": {
      "title": "Checklist sesuai?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_cek_checklist_reg": {
      "title": "Periksa dan tanda tangani Checklist",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_checklist_sesuai_reg": {
      "title": "Checklist disetujui?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_perbaiki_checklist": {
      "title": "Perbaiki Checklist",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_bisa_perbaiki_checklist": {
      "title": "Checklist dapat diperbaiki?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_hold_checklist": {
      "title": "Tetapkan WO On Hold: Checklist",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_checklist": {
      "title": "Koordinasikan pemenuhan: Checklist",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_checklist": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_checklist": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_checklist": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_checklist": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_checklist": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_checklist": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_checklist": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_serahkan_sp2b": {
      "title": "Serahkan SP2B kepada pelaksana",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_tanda_terima_sp2b": {
      "title": "Pahami dan tanda tangani terima SP2B",
      "type": "task",
      "role": "pelaksana_pdkb"
    },
    "Node_catat_tanda_terima": {
      "title": "Catat tanda terima SP2B",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_bagikan_sp3b": {
      "title": "Serahkan SP3B kepada pengawas",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_terima_sp3b_regu": {
      "title": "Pahami SP3B dan penugasan pengawas",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_terima_sp3b_k3": {
      "title": "Pahami SP3B dan penugasan K3",
      "type": "task",
      "role": "pengawas_k3"
    },
    "Node_instruksi_periksa_ulang": {
      "title": "Perintahkan cek ulang peralatan",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_periksa_kesiapan_lapangan": {
      "title": "Periksa peralatan, material dan APD",
      "type": "task",
      "role": "pelaksana_pdkb"
    },
    "Node_alat_material_siap": {
      "title": "Peralatan dan material siap?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_hold_kesiapan_lapangan": {
      "title": "Tetapkan WO On Hold: peralatan/material",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_kesiapan_lapangan": {
      "title": "Koordinasikan pemenuhan: peralatan/material",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_kesiapan_lapangan": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_kesiapan_lapangan": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_kesiapan_lapangan": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_kesiapan_lapangan": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_kesiapan_lapangan": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_kesiapan_lapangan": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_kesiapan_lapangan": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_job_briefing": {
      "title": "Berikan job briefing",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_safety_briefing": {
      "title": "Periksa kesehatan, APD; safety briefing",
      "type": "task",
      "role": "pengawas_k3"
    },
    "Node_koordinasi_kepala_operasi": {
      "title": "Koordinasikan rencana mulai pekerjaan",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_minta_sok": {
      "title": "Minta pemberlakuan SOK",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_sok_piket_area": {
      "title": "Teruskan permintaan SOK",
      "type": "task",
      "role": "piket_area"
    },
    "Node_sok_piket_apd": {
      "title": "Koordinasikan pengaturan SOK",
      "type": "task",
      "role": "piket_apd"
    },
    "Node_sok_petugas_gi": {
      "title": "Atur recloser dan relay sesuai SOK",
      "type": "task",
      "role": "petugas_gi"
    },
    "Node_sok_konfirmasi_apd": {
      "title": "Konfirmasi SOK kepada Piket Area",
      "type": "task",
      "role": "piket_apd"
    },
    "Node_sok_konfirmasi_area": {
      "title": "Konfirmasi SOK kepada Kepala Regu",
      "type": "task",
      "role": "piket_area"
    },
    "Node_sok_terkonfirmasi": {
      "title": "SOK sudah dikonfirmasi?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_ulang_koordinasi_sok": {
      "title": "Koordinasi SOK bisa diulang?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_hold_sok_awal": {
      "title": "Tetapkan WO On Hold: konfirmasi SOK",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_sok_awal": {
      "title": "Koordinasikan pemenuhan: konfirmasi SOK",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_siap_sok_awal": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_sok_awal": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_sok_awal": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_sok_awal": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_sok_awal": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_sok_awal": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_sok_awal": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_periksa_cuaca": {
      "title": "Periksa cuaca, kondisi aman dan SOK",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_kondisi_awal_aman": {
      "title": "Kondisi awal aman?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_evaluasi_kondisi_awal": {
      "title": "Hentikan rencana mulai; evaluasi risiko",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_cek_ulang_kondisi_awal": {
      "title": "Periksa ulang risiko dan keselamatan",
      "type": "task",
      "role": "pengawas_k3"
    },
    "Node_kondisi_bisa_dipulihkan": {
      "title": "Kondisi aman kembali?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_hold_kondisi_awal": {
      "title": "Tetapkan WO On Hold: keselamatan sebelum kerja",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_kondisi_awal": {
      "title": "Koordinasikan pemenuhan: keselamatan sebelum kerja",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_siap_kondisi_awal": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_kondisi_awal": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_kondisi_awal": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_kondisi_awal": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_kondisi_awal": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_kondisi_awal": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_kondisi_awal": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_perlu_delegasi": {
      "title": "Perlu delegasi pengawasan?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_periksa_kompetensi_delegasi": {
      "title": "Verifikasi kompetensi penerima delegasi",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_kompeten_delegasi": {
      "title": "Penerima delegasi kompeten?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_berita_acara_kepala_regu": {
      "title": "Siapkan dan tanda tangani BA delegasi",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_berita_acara_pelaksana": {
      "title": "Terima dan tanda tangani BA delegasi",
      "type": "task",
      "role": "pelaksana_pdkb"
    },
    "Node_berita_acara_supervisor": {
      "title": "Tanda tangani BA sebagai pihak mengetahui",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_arsip_berita_acara": {
      "title": "Catat dan arsipkan BA delegasi",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_pilih_penerima_lain": {
      "title": "Tunjuk penerima delegasi lain",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_ada_calon_delegasi": {
      "title": "Ada calon pengawas lain?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_hold_penerima_delegasi": {
      "title": "Tetapkan WO On Hold: personel pengawas pengganti",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_penerima_delegasi": {
      "title": "Koordinasikan pemenuhan: personel pengawas pengganti",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_siap_penerima_delegasi": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_penerima_delegasi": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_penerima_delegasi": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_penerima_delegasi": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_penerima_delegasi": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_penerima_delegasi": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_penerima_delegasi": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_selesai_penunjukan": {
      "title": "Pengawasan siap dilaksanakan",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_parallel_mulai": {
      "title": "Kegiatan serentak",
      "type": "parallelGateway",
      "role": "kepala_regu"
    },
    "Node_pelaksanaan_bertegangan": {
      "title": "Laksanakan pekerjaan sesuai SP2B/SOP",
      "type": "task",
      "role": "pelaksana_pdkb"
    },
    "Node_pengawasan_regu": {
      "title": "Koordinasikan pengawasan pekerjaan",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_pengawasan_k3": {
      "title": "Awasi K3 selama pekerjaan",
      "type": "task",
      "role": "pengawas_k3"
    },
    "Node_parallel_selesai": {
      "title": "Tahap pelaksanaan terpantau",
      "type": "parallelGateway",
      "role": "kepala_regu"
    },
    "Node_periksa_gangguan_pelaksanaan": {
      "title": "Terjadi kondisi tidak aman?",
      "type": "exclusiveGateway",
      "role": "pengawas_k3"
    },
    "Node_stop_pekerjaan_sementara": {
      "title": "Hentikan sementara pekerjaan",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_amankan_kondisi_kerja": {
      "title": "Hentikan aktivitas dan amankan lokasi",
      "type": "task",
      "role": "pelaksana_pdkb"
    },
    "Node_evaluasi_k3_pelaksanaan": {
      "title": "Evaluasi dan tindak lanjuti bahaya",
      "type": "task",
      "role": "pengawas_k3"
    },
    "Node_sudah_aman_lagi": {
      "title": "Syarat aman terpenuhi?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_hold_bahaya_saat_pelaksanaan": {
      "title": "Tetapkan WO On Hold: kondisi tidak aman",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_atasi_bahaya_saat_pelaksanaan": {
      "title": "Koordinasikan pemenuhan: kondisi tidak aman",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_siap_bahaya_saat_pelaksanaan": {
      "title": "Kendala telah teratasi?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_resume_bahaya_saat_pelaksanaan": {
      "title": "Aktifkan kembali WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_permanen_bahaya_saat_pelaksanaan": {
      "title": "Tidak dapat diselesaikan?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_usul_batal_bahaya_saat_pelaksanaan": {
      "title": "Ajukan pembatalan WO",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_nilai_batal_bahaya_saat_pelaksanaan": {
      "title": "Periksa usulan pembatalan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_putusan_batal_bahaya_saat_pelaksanaan": {
      "title": "Pembatalan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_end_batal_bahaya_saat_pelaksanaan": {
      "title": "WO dibatalkan",
      "type": "endEvent",
      "role": "manajer_area"
    },
    "Node_pekerjaan_selesai": {
      "title": "Pekerjaan fisik selesai?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_lapor_pekerjaan_selesai": {
      "title": "Laporkan penyelesaian pekerjaan fisik",
      "type": "task",
      "role": "pelaksana_pdkb"
    },
    "Node_minta_penormalan": {
      "title": "Minta penormalan operasi jaringan",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_normal_piket_area": {
      "title": "Teruskan permintaan penormalan",
      "type": "task",
      "role": "piket_area"
    },
    "Node_normal_piket_apd": {
      "title": "Koordinasikan penormalan",
      "type": "task",
      "role": "piket_apd"
    },
    "Node_normal_petugas_gi": {
      "title": "Normalkan recloser dan pengaturan relay",
      "type": "task",
      "role": "petugas_gi"
    },
    "Node_normal_konfirmasi_apd": {
      "title": "Konfirmasi penormalan ke Piket Area",
      "type": "task",
      "role": "piket_apd"
    },
    "Node_normal_konfirmasi_area": {
      "title": "Konfirmasi penormalan ke Kepala Regu",
      "type": "task",
      "role": "piket_area"
    },
    "Node_normalisasi_ok": {
      "title": "Penormalan SOK dikonfirmasi?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_selesai_operasional": {
      "title": "Nyatakan pekerjaan selesai operasional",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_izin_tinggi_digunakan": {
      "title": "Menggunakan Izin Kerja Ketinggian?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_lengkapi_izin_selesai": {
      "title": "Lengkapi penyelesaian Izin Ketinggian",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_ttd_penutupan_izin_k3": {
      "title": "Periksa dan tanda tangani penyelesaian izin",
      "type": "task",
      "role": "pengawas_k3"
    },
    "Node_ttd_penutupan_izin_asman": {
      "title": "Periksa dan tanda tangani penyelesaian izin",
      "type": "task",
      "role": "asman_jaringan"
    },
    "Node_ttd_penutupan_izin_p2k3": {
      "title": "Periksa dan tanda tangani penyelesaian izin",
      "type": "task",
      "role": "p2k3_k3l"
    },
    "Node_ttd_penutupan_izin_bagian": {
      "title": "Periksa dan tanda tangani penyelesaian izin",
      "type": "task",
      "role": "bagian_terkait"
    },
    "Node_arsip_izin_ketinggian": {
      "title": "Terima dan catat izin yang lengkap",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_gabung_penutupan_izin": {
      "title": "Izin diselesaikan jika diperlukan",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_laporan_hasil_kepala_regu": {
      "title": "Serahkan laporan hasil pekerjaan",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_susun_pemberitahuan": {
      "title": "Susun Pemberitahuan Penyelesaian",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_setuju_pemberitahuan_sup": {
      "title": "Periksa dan tanda tangani pemberitahuan",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_pemberitahuan_sup_sesuai": {
      "title": "Pemberitahuan sesuai?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_setuju_pemberitahuan_reg": {
      "title": "Tanda tangani pemberitahuan",
      "type": "task",
      "role": "kepala_regu"
    },
    "Node_pemberitahuan_reg_sesuai": {
      "title": "Pengawas pekerjaan setuju?",
      "type": "exclusiveGateway",
      "role": "kepala_regu"
    },
    "Node_setuju_pemberitahuan_k3": {
      "title": "Tanda tangani pemberitahuan",
      "type": "task",
      "role": "pengawas_k3"
    },
    "Node_pemberitahuan_k3_sesuai": {
      "title": "Pengawas K3 setuju?",
      "type": "exclusiveGateway",
      "role": "pengawas_k3"
    },
    "Node_revisi_pemberitahuan": {
      "title": "Perbaiki pemberitahuan penyelesaian",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_kirim_pemberitahuan_mgr": {
      "title": "Sampaikan pemberitahuan ke Kepala Operasi",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_terima_pemberitahuan_mgr": {
      "title": "Terima pemberitahuan pekerjaan selesai",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_laporan_harian": {
      "title": "Input laporan kinerja harian",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_kumpulkan_berkas": {
      "title": "Kumpulkan seluruh dokumen pekerjaan",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_periksa_kelengkapan": {
      "title": "Periksa dokumen dan tanda tangan",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_berkas_lengkap": {
      "title": "Administrasi WO lengkap?",
      "type": "exclusiveGateway",
      "role": "preparator_pdkb"
    },
    "Node_minta_dokumen_kurang": {
      "title": "Minta perbaikan dokumen yang kurang",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_periksa_ulang_dokumen": {
      "title": "Verifikasi dokumen yang sudah dilengkapi",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_arsipkan_pekerjaan": {
      "title": "Arsipkan dokumen dan laporan pekerjaan",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_tutup_wo": {
      "title": "Tutup administrasi WO",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_end_wo": {
      "title": "WO Completed",
      "type": "endEvent",
      "role": "preparator_pdkb"
    },
    "Node_start_bulanan": {
      "title": "Mulai pelaporan bulanan",
      "type": "startEvent",
      "role": "preparator_pdkb"
    },
    "Node_susun_laporan_bulanan": {
      "title": "Rekap pekerjaan selesai operasional bulan ini",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_periksa_bulanan_sup": {
      "title": "Periksa dan tanda tangani laporan",
      "type": "task",
      "role": "supervisor_pdkb"
    },
    "Node_laporan_bulanan_sup_ok": {
      "title": "Laporan sesuai?",
      "type": "exclusiveGateway",
      "role": "supervisor_pdkb"
    },
    "Node_periksa_bulanan_asman": {
      "title": "Periksa dan tanda tangani laporan",
      "type": "task",
      "role": "asman_jaringan"
    },
    "Node_laporan_bulanan_asman_ok": {
      "title": "Laporan disetujui?",
      "type": "exclusiveGateway",
      "role": "asman_jaringan"
    },
    "Node_periksa_bulanan_mgr": {
      "title": "Periksa dan tanda tangani laporan",
      "type": "task",
      "role": "manajer_area"
    },
    "Node_laporan_bulanan_mgr_ok": {
      "title": "Laporan bulanan disetujui?",
      "type": "exclusiveGateway",
      "role": "manajer_area"
    },
    "Node_perbaiki_laporan_bulanan": {
      "title": "Revisi laporan bulanan",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_kirim_laporan_bulanan": {
      "title": "Kirim laporan yang disetujui",
      "type": "task",
      "role": "preparator_pdkb"
    },
    "Node_terima_laporan_unit": {
      "title": "Terima dan teruskan laporan bulanan",
      "type": "task",
      "role": "komisi_unit"
    },
    "Node_terima_laporan_pusat": {
      "title": "Terima laporan bulanan",
      "type": "task",
      "role": "komisi_pusat"
    },
    "Node_end_bulanan": {
      "title": "Laporan bulanan selesai",
      "type": "endEvent",
      "role": "komisi_pusat"
    }
  },
  "edges": [
    {
      "id": "Flow_0001",
      "source": "Node_start_op",
      "target": "Node_buat_op",
      "label": null
    },
    {
      "id": "Flow_0002",
      "source": "Node_start_har",
      "target": "Node_buat_har",
      "label": null
    },
    {
      "id": "Flow_0003",
      "source": "Node_start_konstruksi",
      "target": "Node_buat_konstruksi",
      "label": null
    },
    {
      "id": "Flow_0004",
      "source": "Node_buat_op",
      "target": "Node_gabung_pengajuan",
      "label": null
    },
    {
      "id": "Flow_0005",
      "source": "Node_buat_har",
      "target": "Node_gabung_pengajuan",
      "label": null
    },
    {
      "id": "Flow_0006",
      "source": "Node_buat_konstruksi",
      "target": "Node_gabung_pengajuan",
      "label": null
    },
    {
      "id": "Flow_0007",
      "source": "Node_gabung_pengajuan",
      "target": "Node_periksa_wo_asman",
      "label": null
    },
    {
      "id": "Flow_0008",
      "source": "Node_periksa_wo_asman",
      "target": "Node_setuju_wo_asman",
      "label": null
    },
    {
      "id": "Flow_0009",
      "source": "Node_setuju_wo_asman",
      "target": "Node_periksa_wo_supervisor",
      "label": "Ya"
    },
    {
      "id": "Flow_0010",
      "source": "Node_periksa_wo_supervisor",
      "target": "Node_setuju_wo_supervisor",
      "label": null
    },
    {
      "id": "Flow_0011",
      "source": "Node_setuju_wo_supervisor",
      "target": "Node_periksa_wo_manajer",
      "label": "Ya"
    },
    {
      "id": "Flow_0012",
      "source": "Node_periksa_wo_manajer",
      "target": "Node_setuju_wo_manajer",
      "label": null
    },
    {
      "id": "Flow_0013",
      "source": "Node_setuju_wo_asman",
      "target": "Node_gabung_penolakan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0014",
      "source": "Node_setuju_wo_supervisor",
      "target": "Node_gabung_penolakan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0015",
      "source": "Node_setuju_wo_manajer",
      "target": "Node_gabung_penolakan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0016",
      "source": "Node_gabung_penolakan",
      "target": "Node_identifikasi_pengaju",
      "label": null
    },
    {
      "id": "Flow_0017",
      "source": "Node_identifikasi_pengaju",
      "target": "Node_pilih_op",
      "label": "TL OP"
    },
    {
      "id": "Flow_0018",
      "source": "Node_pilih_op",
      "target": "Node_revisi_op",
      "label": null
    },
    {
      "id": "Flow_0019",
      "source": "Node_revisi_op",
      "target": "Node_perbaiki_op",
      "label": "Ya"
    },
    {
      "id": "Flow_0020",
      "source": "Node_revisi_op",
      "target": "Node_stop_op",
      "label": "Tidak"
    },
    {
      "id": "Flow_0021",
      "source": "Node_perbaiki_op",
      "target": "Node_gabung_pengajuan",
      "label": null
    },
    {
      "id": "Flow_0022",
      "source": "Node_identifikasi_pengaju",
      "target": "Node_pilih_har",
      "label": "TL HAR"
    },
    {
      "id": "Flow_0023",
      "source": "Node_pilih_har",
      "target": "Node_revisi_har",
      "label": null
    },
    {
      "id": "Flow_0024",
      "source": "Node_revisi_har",
      "target": "Node_perbaiki_har",
      "label": "Ya"
    },
    {
      "id": "Flow_0025",
      "source": "Node_revisi_har",
      "target": "Node_stop_har",
      "label": "Tidak"
    },
    {
      "id": "Flow_0026",
      "source": "Node_perbaiki_har",
      "target": "Node_gabung_pengajuan",
      "label": null
    },
    {
      "id": "Flow_0027",
      "source": "Node_identifikasi_pengaju",
      "target": "Node_pilih_konstruksi",
      "label": "TL Konstruksi"
    },
    {
      "id": "Flow_0028",
      "source": "Node_pilih_konstruksi",
      "target": "Node_revisi_konstruksi",
      "label": null
    },
    {
      "id": "Flow_0029",
      "source": "Node_revisi_konstruksi",
      "target": "Node_perbaiki_konstruksi",
      "label": "Ya"
    },
    {
      "id": "Flow_0030",
      "source": "Node_revisi_konstruksi",
      "target": "Node_stop_konstruksi",
      "label": "Tidak"
    },
    {
      "id": "Flow_0031",
      "source": "Node_perbaiki_konstruksi",
      "target": "Node_gabung_pengajuan",
      "label": null
    },
    {
      "id": "Flow_0032",
      "source": "Node_setuju_wo_manajer",
      "target": "Node_prioritas_wo",
      "label": "Ya"
    },
    {
      "id": "Flow_0033",
      "source": "Node_prioritas_wo",
      "target": "Node_survei_lokasi",
      "label": null
    },
    {
      "id": "Flow_0034",
      "source": "Node_survei_lokasi",
      "target": "Node_susun_analisis_awal",
      "label": null
    },
    {
      "id": "Flow_0035",
      "source": "Node_susun_analisis_awal",
      "target": "Node_supervisor_surv",
      "label": null
    },
    {
      "id": "Flow_0036",
      "source": "Node_supervisor_surv",
      "target": "Node_survei_layak",
      "label": null
    },
    {
      "id": "Flow_0037",
      "source": "Node_survei_layak",
      "target": "Node_perlu_survei_ulang",
      "label": "Tidak"
    },
    {
      "id": "Flow_0038",
      "source": "Node_perlu_survei_ulang",
      "target": "Node_survei_lokasi",
      "label": "Ya"
    },
    {
      "id": "Flow_0039",
      "source": "Node_perlu_survei_ulang",
      "target": "Node_hentikan_hasil_survei",
      "label": "Tidak"
    },
    {
      "id": "Flow_0040",
      "source": "Node_hentikan_hasil_survei",
      "target": "Node_beritahu_pengaju_survei",
      "label": null
    },
    {
      "id": "Flow_0041",
      "source": "Node_beritahu_pengaju_survei",
      "target": "Node_end_survei",
      "label": null
    },
    {
      "id": "Flow_0042",
      "source": "Node_survei_layak",
      "target": "Node_rencana_pelaksanaan",
      "label": "Ya"
    },
    {
      "id": "Flow_0043",
      "source": "Node_rencana_pelaksanaan",
      "target": "Node_kirim_jsa",
      "label": null
    },
    {
      "id": "Flow_0044",
      "source": "Node_kirim_jsa",
      "target": "Node_periksa_jsa_k3l",
      "label": null
    },
    {
      "id": "Flow_0045",
      "source": "Node_periksa_jsa_k3l",
      "target": "Node_sesuai_jsa_k3l",
      "label": null
    },
    {
      "id": "Flow_0046",
      "source": "Node_sesuai_jsa_k3l",
      "target": "Node_setuju_jsa_asman",
      "label": "Ya"
    },
    {
      "id": "Flow_0047",
      "source": "Node_setuju_jsa_asman",
      "target": "Node_disetujui_jsa_asman",
      "label": null
    },
    {
      "id": "Flow_0048",
      "source": "Node_sesuai_jsa_k3l",
      "target": "Node_revisi_jsa",
      "label": "Tidak"
    },
    {
      "id": "Flow_0049",
      "source": "Node_disetujui_jsa_asman",
      "target": "Node_revisi_jsa",
      "label": "Tidak"
    },
    {
      "id": "Flow_0050",
      "source": "Node_revisi_jsa",
      "target": "Node_bisa_revisi_jsa",
      "label": null
    },
    {
      "id": "Flow_0051",
      "source": "Node_bisa_revisi_jsa",
      "target": "Node_kirim_jsa",
      "label": "Ya"
    },
    {
      "id": "Flow_0052",
      "source": "Node_bisa_revisi_jsa",
      "target": "Node_hold_jsa",
      "label": "Tidak"
    },
    {
      "id": "Flow_0053",
      "source": "Node_hold_jsa",
      "target": "Node_atasi_jsa",
      "label": null
    },
    {
      "id": "Flow_0054",
      "source": "Node_atasi_jsa",
      "target": "Node_siap_jsa",
      "label": null
    },
    {
      "id": "Flow_0055",
      "source": "Node_siap_jsa",
      "target": "Node_resume_jsa",
      "label": "Ya"
    },
    {
      "id": "Flow_0056",
      "source": "Node_resume_jsa",
      "target": "Node_kirim_jsa",
      "label": null
    },
    {
      "id": "Flow_0057",
      "source": "Node_siap_jsa",
      "target": "Node_permanen_jsa",
      "label": "Tidak"
    },
    {
      "id": "Flow_0058",
      "source": "Node_permanen_jsa",
      "target": "Node_atasi_jsa",
      "label": "Tidak"
    },
    {
      "id": "Flow_0059",
      "source": "Node_permanen_jsa",
      "target": "Node_usul_batal_jsa",
      "label": "Ya"
    },
    {
      "id": "Flow_0060",
      "source": "Node_usul_batal_jsa",
      "target": "Node_nilai_batal_jsa",
      "label": null
    },
    {
      "id": "Flow_0061",
      "source": "Node_nilai_batal_jsa",
      "target": "Node_putusan_batal_jsa",
      "label": null
    },
    {
      "id": "Flow_0062",
      "source": "Node_putusan_batal_jsa",
      "target": "Node_end_batal_jsa",
      "label": "Ya"
    },
    {
      "id": "Flow_0063",
      "source": "Node_putusan_batal_jsa",
      "target": "Node_atasi_jsa",
      "label": "Tidak"
    },
    {
      "id": "Flow_0064",
      "source": "Node_disetujui_jsa_asman",
      "target": "Node_kirim_ibppr",
      "label": "Ya"
    },
    {
      "id": "Flow_0065",
      "source": "Node_kirim_ibppr",
      "target": "Node_periksa_ibppr_k3l",
      "label": null
    },
    {
      "id": "Flow_0066",
      "source": "Node_periksa_ibppr_k3l",
      "target": "Node_sesuai_ibppr_k3l",
      "label": null
    },
    {
      "id": "Flow_0067",
      "source": "Node_sesuai_ibppr_k3l",
      "target": "Node_setuju_ibppr_asman",
      "label": "Ya"
    },
    {
      "id": "Flow_0068",
      "source": "Node_setuju_ibppr_asman",
      "target": "Node_disetujui_ibppr_asman",
      "label": null
    },
    {
      "id": "Flow_0069",
      "source": "Node_sesuai_ibppr_k3l",
      "target": "Node_revisi_ibppr",
      "label": "Tidak"
    },
    {
      "id": "Flow_0070",
      "source": "Node_disetujui_ibppr_asman",
      "target": "Node_revisi_ibppr",
      "label": "Tidak"
    },
    {
      "id": "Flow_0071",
      "source": "Node_revisi_ibppr",
      "target": "Node_bisa_revisi_ibppr",
      "label": null
    },
    {
      "id": "Flow_0072",
      "source": "Node_bisa_revisi_ibppr",
      "target": "Node_kirim_ibppr",
      "label": "Ya"
    },
    {
      "id": "Flow_0073",
      "source": "Node_bisa_revisi_ibppr",
      "target": "Node_hold_ibppr",
      "label": "Tidak"
    },
    {
      "id": "Flow_0074",
      "source": "Node_hold_ibppr",
      "target": "Node_atasi_ibppr",
      "label": null
    },
    {
      "id": "Flow_0075",
      "source": "Node_atasi_ibppr",
      "target": "Node_siap_ibppr",
      "label": null
    },
    {
      "id": "Flow_0076",
      "source": "Node_siap_ibppr",
      "target": "Node_resume_ibppr",
      "label": "Ya"
    },
    {
      "id": "Flow_0077",
      "source": "Node_resume_ibppr",
      "target": "Node_kirim_ibppr",
      "label": null
    },
    {
      "id": "Flow_0078",
      "source": "Node_siap_ibppr",
      "target": "Node_permanen_ibppr",
      "label": "Tidak"
    },
    {
      "id": "Flow_0079",
      "source": "Node_permanen_ibppr",
      "target": "Node_atasi_ibppr",
      "label": "Tidak"
    },
    {
      "id": "Flow_0080",
      "source": "Node_permanen_ibppr",
      "target": "Node_usul_batal_ibppr",
      "label": "Ya"
    },
    {
      "id": "Flow_0081",
      "source": "Node_usul_batal_ibppr",
      "target": "Node_nilai_batal_ibppr",
      "label": null
    },
    {
      "id": "Flow_0082",
      "source": "Node_nilai_batal_ibppr",
      "target": "Node_putusan_batal_ibppr",
      "label": null
    },
    {
      "id": "Flow_0083",
      "source": "Node_putusan_batal_ibppr",
      "target": "Node_end_batal_ibppr",
      "label": "Ya"
    },
    {
      "id": "Flow_0084",
      "source": "Node_putusan_batal_ibppr",
      "target": "Node_atasi_ibppr",
      "label": "Tidak"
    },
    {
      "id": "Flow_0085",
      "source": "Node_disetujui_ibppr_asman",
      "target": "Node_perlu_izin_ketinggian",
      "label": "Ya"
    },
    {
      "id": "Flow_0086",
      "source": "Node_perlu_izin_ketinggian",
      "target": "Node_siapkan_izin",
      "label": "Ya"
    },
    {
      "id": "Flow_0087",
      "source": "Node_siapkan_izin",
      "target": "Node_tandatangan_izin_k3",
      "label": null
    },
    {
      "id": "Flow_0088",
      "source": "Node_tandatangan_izin_k3",
      "target": "Node_izin_ok_k3",
      "label": null
    },
    {
      "id": "Flow_0089",
      "source": "Node_izin_ok_k3",
      "target": "Node_tandatangan_izin_asman",
      "label": "Ya"
    },
    {
      "id": "Flow_0090",
      "source": "Node_tandatangan_izin_asman",
      "target": "Node_izin_ok_asman",
      "label": null
    },
    {
      "id": "Flow_0091",
      "source": "Node_izin_ok_asman",
      "target": "Node_tandatangan_izin_p2k3",
      "label": "Ya"
    },
    {
      "id": "Flow_0092",
      "source": "Node_tandatangan_izin_p2k3",
      "target": "Node_izin_ok_p2k3",
      "label": null
    },
    {
      "id": "Flow_0093",
      "source": "Node_izin_ok_p2k3",
      "target": "Node_tandatangan_izin_bagian",
      "label": "Ya"
    },
    {
      "id": "Flow_0094",
      "source": "Node_tandatangan_izin_bagian",
      "target": "Node_izin_ok_bagian",
      "label": null
    },
    {
      "id": "Flow_0095",
      "source": "Node_izin_ok_k3",
      "target": "Node_revisi_izin",
      "label": "Tidak"
    },
    {
      "id": "Flow_0096",
      "source": "Node_izin_ok_asman",
      "target": "Node_revisi_izin",
      "label": "Tidak"
    },
    {
      "id": "Flow_0097",
      "source": "Node_izin_ok_p2k3",
      "target": "Node_revisi_izin",
      "label": "Tidak"
    },
    {
      "id": "Flow_0098",
      "source": "Node_izin_ok_bagian",
      "target": "Node_revisi_izin",
      "label": "Tidak"
    },
    {
      "id": "Flow_0099",
      "source": "Node_revisi_izin",
      "target": "Node_izin_bisa_diperbaiki",
      "label": null
    },
    {
      "id": "Flow_0100",
      "source": "Node_izin_bisa_diperbaiki",
      "target": "Node_siapkan_izin",
      "label": "Ya"
    },
    {
      "id": "Flow_0101",
      "source": "Node_izin_bisa_diperbaiki",
      "target": "Node_hold_izin_ketinggian",
      "label": "Tidak"
    },
    {
      "id": "Flow_0102",
      "source": "Node_hold_izin_ketinggian",
      "target": "Node_atasi_izin_ketinggian",
      "label": null
    },
    {
      "id": "Flow_0103",
      "source": "Node_atasi_izin_ketinggian",
      "target": "Node_siap_izin_ketinggian",
      "label": null
    },
    {
      "id": "Flow_0104",
      "source": "Node_siap_izin_ketinggian",
      "target": "Node_resume_izin_ketinggian",
      "label": "Ya"
    },
    {
      "id": "Flow_0105",
      "source": "Node_resume_izin_ketinggian",
      "target": "Node_siapkan_izin",
      "label": null
    },
    {
      "id": "Flow_0106",
      "source": "Node_siap_izin_ketinggian",
      "target": "Node_permanen_izin_ketinggian",
      "label": "Tidak"
    },
    {
      "id": "Flow_0107",
      "source": "Node_permanen_izin_ketinggian",
      "target": "Node_atasi_izin_ketinggian",
      "label": "Tidak"
    },
    {
      "id": "Flow_0108",
      "source": "Node_permanen_izin_ketinggian",
      "target": "Node_usul_batal_izin_ketinggian",
      "label": "Ya"
    },
    {
      "id": "Flow_0109",
      "source": "Node_usul_batal_izin_ketinggian",
      "target": "Node_nilai_batal_izin_ketinggian",
      "label": null
    },
    {
      "id": "Flow_0110",
      "source": "Node_nilai_batal_izin_ketinggian",
      "target": "Node_putusan_batal_izin_ketinggian",
      "label": null
    },
    {
      "id": "Flow_0111",
      "source": "Node_putusan_batal_izin_ketinggian",
      "target": "Node_end_batal_izin_ketinggian",
      "label": "Ya"
    },
    {
      "id": "Flow_0112",
      "source": "Node_putusan_batal_izin_ketinggian",
      "target": "Node_atasi_izin_ketinggian",
      "label": "Tidak"
    },
    {
      "id": "Flow_0113",
      "source": "Node_izin_ok_bagian",
      "target": "Node_izin_ketinggian_selesai",
      "label": "Ya"
    },
    {
      "id": "Flow_0114",
      "source": "Node_izin_ketinggian_selesai",
      "target": "Node_gabung_izin",
      "label": null
    },
    {
      "id": "Flow_0115",
      "source": "Node_perlu_izin_ketinggian",
      "target": "Node_gabung_izin",
      "label": "Tidak"
    },
    {
      "id": "Flow_0116",
      "source": "Node_gabung_izin",
      "target": "Node_minta_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0117",
      "source": "Node_minta_kewenangan",
      "target": "Node_verifikasi_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0118",
      "source": "Node_verifikasi_kewenangan",
      "target": "Node_kewenangan_valid",
      "label": null
    },
    {
      "id": "Flow_0119",
      "source": "Node_kewenangan_valid",
      "target": "Node_tindak_lanjut_kewenangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0120",
      "source": "Node_tindak_lanjut_kewenangan",
      "target": "Node_pengganti_tersedia",
      "label": null
    },
    {
      "id": "Flow_0121",
      "source": "Node_pengganti_tersedia",
      "target": "Node_verifikasi_pengganti",
      "label": "Ya"
    },
    {
      "id": "Flow_0122",
      "source": "Node_verifikasi_pengganti",
      "target": "Node_verifikasi_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0123",
      "source": "Node_pengganti_tersedia",
      "target": "Node_terbitkan_surat",
      "label": "Tidak"
    },
    {
      "id": "Flow_0124",
      "source": "Node_terbitkan_surat",
      "target": "Node_pembaruan_berhasil",
      "label": null
    },
    {
      "id": "Flow_0125",
      "source": "Node_pembaruan_berhasil",
      "target": "Node_verifikasi_surat_baru",
      "label": "Ya"
    },
    {
      "id": "Flow_0126",
      "source": "Node_verifikasi_surat_baru",
      "target": "Node_verifikasi_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0127",
      "source": "Node_pembaruan_berhasil",
      "target": "Node_hold_surat_kewenangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0128",
      "source": "Node_hold_surat_kewenangan",
      "target": "Node_atasi_surat_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0129",
      "source": "Node_atasi_surat_kewenangan",
      "target": "Node_siap_surat_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0130",
      "source": "Node_siap_surat_kewenangan",
      "target": "Node_resume_surat_kewenangan",
      "label": "Ya"
    },
    {
      "id": "Flow_0131",
      "source": "Node_resume_surat_kewenangan",
      "target": "Node_verifikasi_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0132",
      "source": "Node_siap_surat_kewenangan",
      "target": "Node_permanen_surat_kewenangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0133",
      "source": "Node_permanen_surat_kewenangan",
      "target": "Node_atasi_surat_kewenangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0134",
      "source": "Node_permanen_surat_kewenangan",
      "target": "Node_usul_batal_surat_kewenangan",
      "label": "Ya"
    },
    {
      "id": "Flow_0135",
      "source": "Node_usul_batal_surat_kewenangan",
      "target": "Node_nilai_batal_surat_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0136",
      "source": "Node_nilai_batal_surat_kewenangan",
      "target": "Node_putusan_batal_surat_kewenangan",
      "label": null
    },
    {
      "id": "Flow_0137",
      "source": "Node_putusan_batal_surat_kewenangan",
      "target": "Node_end_batal_surat_kewenangan",
      "label": "Ya"
    },
    {
      "id": "Flow_0138",
      "source": "Node_putusan_batal_surat_kewenangan",
      "target": "Node_atasi_surat_kewenangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0139",
      "source": "Node_kewenangan_valid",
      "target": "Node_siapkan_sp2b",
      "label": "Ya"
    },
    {
      "id": "Flow_0140",
      "source": "Node_siapkan_sp2b",
      "target": "Node_ttd_sp2b_sup",
      "label": null
    },
    {
      "id": "Flow_0141",
      "source": "Node_ttd_sp2b_sup",
      "target": "Node_valid_sp2b_sup",
      "label": null
    },
    {
      "id": "Flow_0142",
      "source": "Node_valid_sp2b_sup",
      "target": "Node_ttd_sp2b_mgr",
      "label": "Ya"
    },
    {
      "id": "Flow_0143",
      "source": "Node_ttd_sp2b_mgr",
      "target": "Node_valid_sp2b_mgr",
      "label": null
    },
    {
      "id": "Flow_0144",
      "source": "Node_valid_sp2b_sup",
      "target": "Node_perbaiki_sp2b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0145",
      "source": "Node_valid_sp2b_mgr",
      "target": "Node_perbaiki_sp2b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0146",
      "source": "Node_perbaiki_sp2b",
      "target": "Node_bisa_perbaiki_sp2b",
      "label": null
    },
    {
      "id": "Flow_0147",
      "source": "Node_bisa_perbaiki_sp2b",
      "target": "Node_siapkan_sp2b",
      "label": "Ya"
    },
    {
      "id": "Flow_0148",
      "source": "Node_bisa_perbaiki_sp2b",
      "target": "Node_hold_sp2b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0149",
      "source": "Node_hold_sp2b",
      "target": "Node_atasi_sp2b",
      "label": null
    },
    {
      "id": "Flow_0150",
      "source": "Node_atasi_sp2b",
      "target": "Node_siap_sp2b",
      "label": null
    },
    {
      "id": "Flow_0151",
      "source": "Node_siap_sp2b",
      "target": "Node_resume_sp2b",
      "label": "Ya"
    },
    {
      "id": "Flow_0152",
      "source": "Node_resume_sp2b",
      "target": "Node_siapkan_sp2b",
      "label": null
    },
    {
      "id": "Flow_0153",
      "source": "Node_siap_sp2b",
      "target": "Node_permanen_sp2b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0154",
      "source": "Node_permanen_sp2b",
      "target": "Node_atasi_sp2b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0155",
      "source": "Node_permanen_sp2b",
      "target": "Node_usul_batal_sp2b",
      "label": "Ya"
    },
    {
      "id": "Flow_0156",
      "source": "Node_usul_batal_sp2b",
      "target": "Node_nilai_batal_sp2b",
      "label": null
    },
    {
      "id": "Flow_0157",
      "source": "Node_nilai_batal_sp2b",
      "target": "Node_putusan_batal_sp2b",
      "label": null
    },
    {
      "id": "Flow_0158",
      "source": "Node_putusan_batal_sp2b",
      "target": "Node_end_batal_sp2b",
      "label": "Ya"
    },
    {
      "id": "Flow_0159",
      "source": "Node_putusan_batal_sp2b",
      "target": "Node_atasi_sp2b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0160",
      "source": "Node_valid_sp2b_mgr",
      "target": "Node_siapkan_sp3b",
      "label": "Ya"
    },
    {
      "id": "Flow_0161",
      "source": "Node_siapkan_sp3b",
      "target": "Node_ttd_sp3b_sup",
      "label": null
    },
    {
      "id": "Flow_0162",
      "source": "Node_ttd_sp3b_sup",
      "target": "Node_valid_sp3b_sup",
      "label": null
    },
    {
      "id": "Flow_0163",
      "source": "Node_valid_sp3b_sup",
      "target": "Node_ttd_sp3b_mgr",
      "label": "Ya"
    },
    {
      "id": "Flow_0164",
      "source": "Node_ttd_sp3b_mgr",
      "target": "Node_valid_sp3b_mgr",
      "label": null
    },
    {
      "id": "Flow_0165",
      "source": "Node_valid_sp3b_sup",
      "target": "Node_perbaiki_sp3b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0166",
      "source": "Node_valid_sp3b_mgr",
      "target": "Node_perbaiki_sp3b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0167",
      "source": "Node_perbaiki_sp3b",
      "target": "Node_bisa_perbaiki_sp3b",
      "label": null
    },
    {
      "id": "Flow_0168",
      "source": "Node_bisa_perbaiki_sp3b",
      "target": "Node_siapkan_sp3b",
      "label": "Ya"
    },
    {
      "id": "Flow_0169",
      "source": "Node_bisa_perbaiki_sp3b",
      "target": "Node_hold_sp3b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0170",
      "source": "Node_hold_sp3b",
      "target": "Node_atasi_sp3b",
      "label": null
    },
    {
      "id": "Flow_0171",
      "source": "Node_atasi_sp3b",
      "target": "Node_siap_sp3b",
      "label": null
    },
    {
      "id": "Flow_0172",
      "source": "Node_siap_sp3b",
      "target": "Node_resume_sp3b",
      "label": "Ya"
    },
    {
      "id": "Flow_0173",
      "source": "Node_resume_sp3b",
      "target": "Node_siapkan_sp3b",
      "label": null
    },
    {
      "id": "Flow_0174",
      "source": "Node_siap_sp3b",
      "target": "Node_permanen_sp3b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0175",
      "source": "Node_permanen_sp3b",
      "target": "Node_atasi_sp3b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0176",
      "source": "Node_permanen_sp3b",
      "target": "Node_usul_batal_sp3b",
      "label": "Ya"
    },
    {
      "id": "Flow_0177",
      "source": "Node_usul_batal_sp3b",
      "target": "Node_nilai_batal_sp3b",
      "label": null
    },
    {
      "id": "Flow_0178",
      "source": "Node_nilai_batal_sp3b",
      "target": "Node_putusan_batal_sp3b",
      "label": null
    },
    {
      "id": "Flow_0179",
      "source": "Node_putusan_batal_sp3b",
      "target": "Node_end_batal_sp3b",
      "label": "Ya"
    },
    {
      "id": "Flow_0180",
      "source": "Node_putusan_batal_sp3b",
      "target": "Node_atasi_sp3b",
      "label": "Tidak"
    },
    {
      "id": "Flow_0181",
      "source": "Node_valid_sp3b_mgr",
      "target": "Node_susun_checklist",
      "label": "Ya"
    },
    {
      "id": "Flow_0182",
      "source": "Node_susun_checklist",
      "target": "Node_cek_checklist_sup",
      "label": null
    },
    {
      "id": "Flow_0183",
      "source": "Node_cek_checklist_sup",
      "target": "Node_checklist_sesuai_sup",
      "label": null
    },
    {
      "id": "Flow_0184",
      "source": "Node_checklist_sesuai_sup",
      "target": "Node_cek_checklist_reg",
      "label": "Ya"
    },
    {
      "id": "Flow_0185",
      "source": "Node_cek_checklist_reg",
      "target": "Node_checklist_sesuai_reg",
      "label": null
    },
    {
      "id": "Flow_0186",
      "source": "Node_checklist_sesuai_sup",
      "target": "Node_perbaiki_checklist",
      "label": "Tidak"
    },
    {
      "id": "Flow_0187",
      "source": "Node_checklist_sesuai_reg",
      "target": "Node_perbaiki_checklist",
      "label": "Tidak"
    },
    {
      "id": "Flow_0188",
      "source": "Node_perbaiki_checklist",
      "target": "Node_bisa_perbaiki_checklist",
      "label": null
    },
    {
      "id": "Flow_0189",
      "source": "Node_bisa_perbaiki_checklist",
      "target": "Node_susun_checklist",
      "label": "Ya"
    },
    {
      "id": "Flow_0190",
      "source": "Node_bisa_perbaiki_checklist",
      "target": "Node_hold_checklist",
      "label": "Tidak"
    },
    {
      "id": "Flow_0191",
      "source": "Node_hold_checklist",
      "target": "Node_atasi_checklist",
      "label": null
    },
    {
      "id": "Flow_0192",
      "source": "Node_atasi_checklist",
      "target": "Node_siap_checklist",
      "label": null
    },
    {
      "id": "Flow_0193",
      "source": "Node_siap_checklist",
      "target": "Node_resume_checklist",
      "label": "Ya"
    },
    {
      "id": "Flow_0194",
      "source": "Node_resume_checklist",
      "target": "Node_susun_checklist",
      "label": null
    },
    {
      "id": "Flow_0195",
      "source": "Node_siap_checklist",
      "target": "Node_permanen_checklist",
      "label": "Tidak"
    },
    {
      "id": "Flow_0196",
      "source": "Node_permanen_checklist",
      "target": "Node_atasi_checklist",
      "label": "Tidak"
    },
    {
      "id": "Flow_0197",
      "source": "Node_permanen_checklist",
      "target": "Node_usul_batal_checklist",
      "label": "Ya"
    },
    {
      "id": "Flow_0198",
      "source": "Node_usul_batal_checklist",
      "target": "Node_nilai_batal_checklist",
      "label": null
    },
    {
      "id": "Flow_0199",
      "source": "Node_nilai_batal_checklist",
      "target": "Node_putusan_batal_checklist",
      "label": null
    },
    {
      "id": "Flow_0200",
      "source": "Node_putusan_batal_checklist",
      "target": "Node_end_batal_checklist",
      "label": "Ya"
    },
    {
      "id": "Flow_0201",
      "source": "Node_putusan_batal_checklist",
      "target": "Node_atasi_checklist",
      "label": "Tidak"
    },
    {
      "id": "Flow_0202",
      "source": "Node_checklist_sesuai_reg",
      "target": "Node_serahkan_sp2b",
      "label": "Ya"
    },
    {
      "id": "Flow_0203",
      "source": "Node_serahkan_sp2b",
      "target": "Node_tanda_terima_sp2b",
      "label": null
    },
    {
      "id": "Flow_0204",
      "source": "Node_tanda_terima_sp2b",
      "target": "Node_catat_tanda_terima",
      "label": null
    },
    {
      "id": "Flow_0205",
      "source": "Node_catat_tanda_terima",
      "target": "Node_bagikan_sp3b",
      "label": null
    },
    {
      "id": "Flow_0206",
      "source": "Node_bagikan_sp3b",
      "target": "Node_terima_sp3b_regu",
      "label": null
    },
    {
      "id": "Flow_0207",
      "source": "Node_terima_sp3b_regu",
      "target": "Node_terima_sp3b_k3",
      "label": null
    },
    {
      "id": "Flow_0208",
      "source": "Node_terima_sp3b_k3",
      "target": "Node_instruksi_periksa_ulang",
      "label": null
    },
    {
      "id": "Flow_0209",
      "source": "Node_instruksi_periksa_ulang",
      "target": "Node_periksa_kesiapan_lapangan",
      "label": null
    },
    {
      "id": "Flow_0210",
      "source": "Node_periksa_kesiapan_lapangan",
      "target": "Node_alat_material_siap",
      "label": null
    },
    {
      "id": "Flow_0211",
      "source": "Node_alat_material_siap",
      "target": "Node_hold_kesiapan_lapangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0212",
      "source": "Node_hold_kesiapan_lapangan",
      "target": "Node_atasi_kesiapan_lapangan",
      "label": null
    },
    {
      "id": "Flow_0213",
      "source": "Node_atasi_kesiapan_lapangan",
      "target": "Node_siap_kesiapan_lapangan",
      "label": null
    },
    {
      "id": "Flow_0214",
      "source": "Node_siap_kesiapan_lapangan",
      "target": "Node_resume_kesiapan_lapangan",
      "label": "Ya"
    },
    {
      "id": "Flow_0215",
      "source": "Node_resume_kesiapan_lapangan",
      "target": "Node_instruksi_periksa_ulang",
      "label": null
    },
    {
      "id": "Flow_0216",
      "source": "Node_siap_kesiapan_lapangan",
      "target": "Node_permanen_kesiapan_lapangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0217",
      "source": "Node_permanen_kesiapan_lapangan",
      "target": "Node_atasi_kesiapan_lapangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0218",
      "source": "Node_permanen_kesiapan_lapangan",
      "target": "Node_usul_batal_kesiapan_lapangan",
      "label": "Ya"
    },
    {
      "id": "Flow_0219",
      "source": "Node_usul_batal_kesiapan_lapangan",
      "target": "Node_nilai_batal_kesiapan_lapangan",
      "label": null
    },
    {
      "id": "Flow_0220",
      "source": "Node_nilai_batal_kesiapan_lapangan",
      "target": "Node_putusan_batal_kesiapan_lapangan",
      "label": null
    },
    {
      "id": "Flow_0221",
      "source": "Node_putusan_batal_kesiapan_lapangan",
      "target": "Node_end_batal_kesiapan_lapangan",
      "label": "Ya"
    },
    {
      "id": "Flow_0222",
      "source": "Node_putusan_batal_kesiapan_lapangan",
      "target": "Node_atasi_kesiapan_lapangan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0223",
      "source": "Node_alat_material_siap",
      "target": "Node_job_briefing",
      "label": "Ya"
    },
    {
      "id": "Flow_0224",
      "source": "Node_job_briefing",
      "target": "Node_safety_briefing",
      "label": null
    },
    {
      "id": "Flow_0225",
      "source": "Node_safety_briefing",
      "target": "Node_koordinasi_kepala_operasi",
      "label": null
    },
    {
      "id": "Flow_0226",
      "source": "Node_koordinasi_kepala_operasi",
      "target": "Node_minta_sok",
      "label": null
    },
    {
      "id": "Flow_0227",
      "source": "Node_minta_sok",
      "target": "Node_sok_piket_area",
      "label": null
    },
    {
      "id": "Flow_0228",
      "source": "Node_sok_piket_area",
      "target": "Node_sok_piket_apd",
      "label": null
    },
    {
      "id": "Flow_0229",
      "source": "Node_sok_piket_apd",
      "target": "Node_sok_petugas_gi",
      "label": null
    },
    {
      "id": "Flow_0230",
      "source": "Node_sok_petugas_gi",
      "target": "Node_sok_konfirmasi_apd",
      "label": null
    },
    {
      "id": "Flow_0231",
      "source": "Node_sok_konfirmasi_apd",
      "target": "Node_sok_konfirmasi_area",
      "label": null
    },
    {
      "id": "Flow_0232",
      "source": "Node_sok_konfirmasi_area",
      "target": "Node_sok_terkonfirmasi",
      "label": null
    },
    {
      "id": "Flow_0233",
      "source": "Node_sok_terkonfirmasi",
      "target": "Node_ulang_koordinasi_sok",
      "label": "Tidak"
    },
    {
      "id": "Flow_0234",
      "source": "Node_ulang_koordinasi_sok",
      "target": "Node_minta_sok",
      "label": "Ya"
    },
    {
      "id": "Flow_0235",
      "source": "Node_ulang_koordinasi_sok",
      "target": "Node_hold_sok_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0236",
      "source": "Node_hold_sok_awal",
      "target": "Node_atasi_sok_awal",
      "label": null
    },
    {
      "id": "Flow_0237",
      "source": "Node_atasi_sok_awal",
      "target": "Node_siap_sok_awal",
      "label": null
    },
    {
      "id": "Flow_0238",
      "source": "Node_siap_sok_awal",
      "target": "Node_resume_sok_awal",
      "label": "Ya"
    },
    {
      "id": "Flow_0239",
      "source": "Node_resume_sok_awal",
      "target": "Node_minta_sok",
      "label": null
    },
    {
      "id": "Flow_0240",
      "source": "Node_siap_sok_awal",
      "target": "Node_permanen_sok_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0241",
      "source": "Node_permanen_sok_awal",
      "target": "Node_atasi_sok_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0242",
      "source": "Node_permanen_sok_awal",
      "target": "Node_usul_batal_sok_awal",
      "label": "Ya"
    },
    {
      "id": "Flow_0243",
      "source": "Node_usul_batal_sok_awal",
      "target": "Node_nilai_batal_sok_awal",
      "label": null
    },
    {
      "id": "Flow_0244",
      "source": "Node_nilai_batal_sok_awal",
      "target": "Node_putusan_batal_sok_awal",
      "label": null
    },
    {
      "id": "Flow_0245",
      "source": "Node_putusan_batal_sok_awal",
      "target": "Node_end_batal_sok_awal",
      "label": "Ya"
    },
    {
      "id": "Flow_0246",
      "source": "Node_putusan_batal_sok_awal",
      "target": "Node_atasi_sok_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0247",
      "source": "Node_sok_terkonfirmasi",
      "target": "Node_periksa_cuaca",
      "label": "Ya"
    },
    {
      "id": "Flow_0248",
      "source": "Node_periksa_cuaca",
      "target": "Node_kondisi_awal_aman",
      "label": null
    },
    {
      "id": "Flow_0249",
      "source": "Node_kondisi_awal_aman",
      "target": "Node_evaluasi_kondisi_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0250",
      "source": "Node_evaluasi_kondisi_awal",
      "target": "Node_cek_ulang_kondisi_awal",
      "label": null
    },
    {
      "id": "Flow_0251",
      "source": "Node_cek_ulang_kondisi_awal",
      "target": "Node_kondisi_bisa_dipulihkan",
      "label": null
    },
    {
      "id": "Flow_0252",
      "source": "Node_kondisi_bisa_dipulihkan",
      "target": "Node_periksa_cuaca",
      "label": "Ya"
    },
    {
      "id": "Flow_0253",
      "source": "Node_kondisi_bisa_dipulihkan",
      "target": "Node_hold_kondisi_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0254",
      "source": "Node_hold_kondisi_awal",
      "target": "Node_atasi_kondisi_awal",
      "label": null
    },
    {
      "id": "Flow_0255",
      "source": "Node_atasi_kondisi_awal",
      "target": "Node_siap_kondisi_awal",
      "label": null
    },
    {
      "id": "Flow_0256",
      "source": "Node_siap_kondisi_awal",
      "target": "Node_resume_kondisi_awal",
      "label": "Ya"
    },
    {
      "id": "Flow_0257",
      "source": "Node_resume_kondisi_awal",
      "target": "Node_periksa_cuaca",
      "label": null
    },
    {
      "id": "Flow_0258",
      "source": "Node_siap_kondisi_awal",
      "target": "Node_permanen_kondisi_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0259",
      "source": "Node_permanen_kondisi_awal",
      "target": "Node_atasi_kondisi_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0260",
      "source": "Node_permanen_kondisi_awal",
      "target": "Node_usul_batal_kondisi_awal",
      "label": "Ya"
    },
    {
      "id": "Flow_0261",
      "source": "Node_usul_batal_kondisi_awal",
      "target": "Node_nilai_batal_kondisi_awal",
      "label": null
    },
    {
      "id": "Flow_0262",
      "source": "Node_nilai_batal_kondisi_awal",
      "target": "Node_putusan_batal_kondisi_awal",
      "label": null
    },
    {
      "id": "Flow_0263",
      "source": "Node_putusan_batal_kondisi_awal",
      "target": "Node_end_batal_kondisi_awal",
      "label": "Ya"
    },
    {
      "id": "Flow_0264",
      "source": "Node_putusan_batal_kondisi_awal",
      "target": "Node_atasi_kondisi_awal",
      "label": "Tidak"
    },
    {
      "id": "Flow_0265",
      "source": "Node_kondisi_awal_aman",
      "target": "Node_perlu_delegasi",
      "label": "Ya"
    },
    {
      "id": "Flow_0266",
      "source": "Node_perlu_delegasi",
      "target": "Node_periksa_kompetensi_delegasi",
      "label": "Ya"
    },
    {
      "id": "Flow_0267",
      "source": "Node_periksa_kompetensi_delegasi",
      "target": "Node_kompeten_delegasi",
      "label": null
    },
    {
      "id": "Flow_0268",
      "source": "Node_kompeten_delegasi",
      "target": "Node_berita_acara_kepala_regu",
      "label": "Ya"
    },
    {
      "id": "Flow_0269",
      "source": "Node_berita_acara_kepala_regu",
      "target": "Node_berita_acara_pelaksana",
      "label": null
    },
    {
      "id": "Flow_0270",
      "source": "Node_berita_acara_pelaksana",
      "target": "Node_berita_acara_supervisor",
      "label": null
    },
    {
      "id": "Flow_0271",
      "source": "Node_berita_acara_supervisor",
      "target": "Node_arsip_berita_acara",
      "label": null
    },
    {
      "id": "Flow_0272",
      "source": "Node_kompeten_delegasi",
      "target": "Node_pilih_penerima_lain",
      "label": "Tidak"
    },
    {
      "id": "Flow_0273",
      "source": "Node_pilih_penerima_lain",
      "target": "Node_ada_calon_delegasi",
      "label": null
    },
    {
      "id": "Flow_0274",
      "source": "Node_ada_calon_delegasi",
      "target": "Node_periksa_kompetensi_delegasi",
      "label": "Ya"
    },
    {
      "id": "Flow_0275",
      "source": "Node_ada_calon_delegasi",
      "target": "Node_hold_penerima_delegasi",
      "label": "Tidak"
    },
    {
      "id": "Flow_0276",
      "source": "Node_hold_penerima_delegasi",
      "target": "Node_atasi_penerima_delegasi",
      "label": null
    },
    {
      "id": "Flow_0277",
      "source": "Node_atasi_penerima_delegasi",
      "target": "Node_siap_penerima_delegasi",
      "label": null
    },
    {
      "id": "Flow_0278",
      "source": "Node_siap_penerima_delegasi",
      "target": "Node_resume_penerima_delegasi",
      "label": "Ya"
    },
    {
      "id": "Flow_0279",
      "source": "Node_resume_penerima_delegasi",
      "target": "Node_periksa_kompetensi_delegasi",
      "label": null
    },
    {
      "id": "Flow_0280",
      "source": "Node_siap_penerima_delegasi",
      "target": "Node_permanen_penerima_delegasi",
      "label": "Tidak"
    },
    {
      "id": "Flow_0281",
      "source": "Node_permanen_penerima_delegasi",
      "target": "Node_atasi_penerima_delegasi",
      "label": "Tidak"
    },
    {
      "id": "Flow_0282",
      "source": "Node_permanen_penerima_delegasi",
      "target": "Node_usul_batal_penerima_delegasi",
      "label": "Ya"
    },
    {
      "id": "Flow_0283",
      "source": "Node_usul_batal_penerima_delegasi",
      "target": "Node_nilai_batal_penerima_delegasi",
      "label": null
    },
    {
      "id": "Flow_0284",
      "source": "Node_nilai_batal_penerima_delegasi",
      "target": "Node_putusan_batal_penerima_delegasi",
      "label": null
    },
    {
      "id": "Flow_0285",
      "source": "Node_putusan_batal_penerima_delegasi",
      "target": "Node_end_batal_penerima_delegasi",
      "label": "Ya"
    },
    {
      "id": "Flow_0286",
      "source": "Node_putusan_batal_penerima_delegasi",
      "target": "Node_atasi_penerima_delegasi",
      "label": "Tidak"
    },
    {
      "id": "Flow_0287",
      "source": "Node_perlu_delegasi",
      "target": "Node_selesai_penunjukan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0288",
      "source": "Node_arsip_berita_acara",
      "target": "Node_selesai_penunjukan",
      "label": null
    },
    {
      "id": "Flow_0289",
      "source": "Node_selesai_penunjukan",
      "target": "Node_parallel_mulai",
      "label": null
    },
    {
      "id": "Flow_0290",
      "source": "Node_parallel_mulai",
      "target": "Node_pelaksanaan_bertegangan",
      "label": null
    },
    {
      "id": "Flow_0291",
      "source": "Node_pelaksanaan_bertegangan",
      "target": "Node_parallel_selesai",
      "label": null
    },
    {
      "id": "Flow_0292",
      "source": "Node_parallel_mulai",
      "target": "Node_pengawasan_regu",
      "label": null
    },
    {
      "id": "Flow_0293",
      "source": "Node_pengawasan_regu",
      "target": "Node_parallel_selesai",
      "label": null
    },
    {
      "id": "Flow_0294",
      "source": "Node_parallel_mulai",
      "target": "Node_pengawasan_k3",
      "label": null
    },
    {
      "id": "Flow_0295",
      "source": "Node_pengawasan_k3",
      "target": "Node_parallel_selesai",
      "label": null
    },
    {
      "id": "Flow_0296",
      "source": "Node_parallel_selesai",
      "target": "Node_periksa_gangguan_pelaksanaan",
      "label": null
    },
    {
      "id": "Flow_0297",
      "source": "Node_periksa_gangguan_pelaksanaan",
      "target": "Node_stop_pekerjaan_sementara",
      "label": "Ya"
    },
    {
      "id": "Flow_0298",
      "source": "Node_stop_pekerjaan_sementara",
      "target": "Node_amankan_kondisi_kerja",
      "label": null
    },
    {
      "id": "Flow_0299",
      "source": "Node_amankan_kondisi_kerja",
      "target": "Node_evaluasi_k3_pelaksanaan",
      "label": null
    },
    {
      "id": "Flow_0300",
      "source": "Node_evaluasi_k3_pelaksanaan",
      "target": "Node_sudah_aman_lagi",
      "label": null
    },
    {
      "id": "Flow_0301",
      "source": "Node_sudah_aman_lagi",
      "target": "Node_parallel_mulai",
      "label": "Ya"
    },
    {
      "id": "Flow_0302",
      "source": "Node_sudah_aman_lagi",
      "target": "Node_hold_bahaya_saat_pelaksanaan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0303",
      "source": "Node_hold_bahaya_saat_pelaksanaan",
      "target": "Node_atasi_bahaya_saat_pelaksanaan",
      "label": null
    },
    {
      "id": "Flow_0304",
      "source": "Node_atasi_bahaya_saat_pelaksanaan",
      "target": "Node_siap_bahaya_saat_pelaksanaan",
      "label": null
    },
    {
      "id": "Flow_0305",
      "source": "Node_siap_bahaya_saat_pelaksanaan",
      "target": "Node_resume_bahaya_saat_pelaksanaan",
      "label": "Ya"
    },
    {
      "id": "Flow_0306",
      "source": "Node_resume_bahaya_saat_pelaksanaan",
      "target": "Node_periksa_cuaca",
      "label": null
    },
    {
      "id": "Flow_0307",
      "source": "Node_siap_bahaya_saat_pelaksanaan",
      "target": "Node_permanen_bahaya_saat_pelaksanaan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0308",
      "source": "Node_permanen_bahaya_saat_pelaksanaan",
      "target": "Node_atasi_bahaya_saat_pelaksanaan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0309",
      "source": "Node_permanen_bahaya_saat_pelaksanaan",
      "target": "Node_usul_batal_bahaya_saat_pelaksanaan",
      "label": "Ya"
    },
    {
      "id": "Flow_0310",
      "source": "Node_usul_batal_bahaya_saat_pelaksanaan",
      "target": "Node_nilai_batal_bahaya_saat_pelaksanaan",
      "label": null
    },
    {
      "id": "Flow_0311",
      "source": "Node_nilai_batal_bahaya_saat_pelaksanaan",
      "target": "Node_putusan_batal_bahaya_saat_pelaksanaan",
      "label": null
    },
    {
      "id": "Flow_0312",
      "source": "Node_putusan_batal_bahaya_saat_pelaksanaan",
      "target": "Node_end_batal_bahaya_saat_pelaksanaan",
      "label": "Ya"
    },
    {
      "id": "Flow_0313",
      "source": "Node_putusan_batal_bahaya_saat_pelaksanaan",
      "target": "Node_atasi_bahaya_saat_pelaksanaan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0314",
      "source": "Node_periksa_gangguan_pelaksanaan",
      "target": "Node_pekerjaan_selesai",
      "label": "Tidak"
    },
    {
      "id": "Flow_0315",
      "source": "Node_pekerjaan_selesai",
      "target": "Node_parallel_mulai",
      "label": "Tidak"
    },
    {
      "id": "Flow_0316",
      "source": "Node_pekerjaan_selesai",
      "target": "Node_lapor_pekerjaan_selesai",
      "label": "Ya"
    },
    {
      "id": "Flow_0317",
      "source": "Node_lapor_pekerjaan_selesai",
      "target": "Node_minta_penormalan",
      "label": null
    },
    {
      "id": "Flow_0318",
      "source": "Node_minta_penormalan",
      "target": "Node_normal_piket_area",
      "label": null
    },
    {
      "id": "Flow_0319",
      "source": "Node_normal_piket_area",
      "target": "Node_normal_piket_apd",
      "label": null
    },
    {
      "id": "Flow_0320",
      "source": "Node_normal_piket_apd",
      "target": "Node_normal_petugas_gi",
      "label": null
    },
    {
      "id": "Flow_0321",
      "source": "Node_normal_petugas_gi",
      "target": "Node_normal_konfirmasi_apd",
      "label": null
    },
    {
      "id": "Flow_0322",
      "source": "Node_normal_konfirmasi_apd",
      "target": "Node_normal_konfirmasi_area",
      "label": null
    },
    {
      "id": "Flow_0323",
      "source": "Node_normal_konfirmasi_area",
      "target": "Node_normalisasi_ok",
      "label": null
    },
    {
      "id": "Flow_0324",
      "source": "Node_normalisasi_ok",
      "target": "Node_minta_penormalan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0325",
      "source": "Node_normalisasi_ok",
      "target": "Node_selesai_operasional",
      "label": "Ya"
    },
    {
      "id": "Flow_0326",
      "source": "Node_selesai_operasional",
      "target": "Node_izin_tinggi_digunakan",
      "label": null
    },
    {
      "id": "Flow_0327",
      "source": "Node_izin_tinggi_digunakan",
      "target": "Node_lengkapi_izin_selesai",
      "label": "Ya"
    },
    {
      "id": "Flow_0328",
      "source": "Node_lengkapi_izin_selesai",
      "target": "Node_ttd_penutupan_izin_k3",
      "label": null
    },
    {
      "id": "Flow_0329",
      "source": "Node_ttd_penutupan_izin_k3",
      "target": "Node_ttd_penutupan_izin_asman",
      "label": null
    },
    {
      "id": "Flow_0330",
      "source": "Node_ttd_penutupan_izin_asman",
      "target": "Node_ttd_penutupan_izin_p2k3",
      "label": null
    },
    {
      "id": "Flow_0331",
      "source": "Node_ttd_penutupan_izin_p2k3",
      "target": "Node_ttd_penutupan_izin_bagian",
      "label": null
    },
    {
      "id": "Flow_0332",
      "source": "Node_ttd_penutupan_izin_bagian",
      "target": "Node_arsip_izin_ketinggian",
      "label": null
    },
    {
      "id": "Flow_0333",
      "source": "Node_arsip_izin_ketinggian",
      "target": "Node_gabung_penutupan_izin",
      "label": null
    },
    {
      "id": "Flow_0334",
      "source": "Node_izin_tinggi_digunakan",
      "target": "Node_gabung_penutupan_izin",
      "label": "Tidak"
    },
    {
      "id": "Flow_0335",
      "source": "Node_gabung_penutupan_izin",
      "target": "Node_laporan_hasil_kepala_regu",
      "label": null
    },
    {
      "id": "Flow_0336",
      "source": "Node_laporan_hasil_kepala_regu",
      "target": "Node_susun_pemberitahuan",
      "label": null
    },
    {
      "id": "Flow_0337",
      "source": "Node_susun_pemberitahuan",
      "target": "Node_setuju_pemberitahuan_sup",
      "label": null
    },
    {
      "id": "Flow_0338",
      "source": "Node_setuju_pemberitahuan_sup",
      "target": "Node_pemberitahuan_sup_sesuai",
      "label": null
    },
    {
      "id": "Flow_0339",
      "source": "Node_pemberitahuan_sup_sesuai",
      "target": "Node_setuju_pemberitahuan_reg",
      "label": "Ya"
    },
    {
      "id": "Flow_0340",
      "source": "Node_setuju_pemberitahuan_reg",
      "target": "Node_pemberitahuan_reg_sesuai",
      "label": null
    },
    {
      "id": "Flow_0341",
      "source": "Node_pemberitahuan_reg_sesuai",
      "target": "Node_setuju_pemberitahuan_k3",
      "label": "Ya"
    },
    {
      "id": "Flow_0342",
      "source": "Node_setuju_pemberitahuan_k3",
      "target": "Node_pemberitahuan_k3_sesuai",
      "label": null
    },
    {
      "id": "Flow_0343",
      "source": "Node_pemberitahuan_sup_sesuai",
      "target": "Node_revisi_pemberitahuan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0344",
      "source": "Node_pemberitahuan_reg_sesuai",
      "target": "Node_revisi_pemberitahuan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0345",
      "source": "Node_pemberitahuan_k3_sesuai",
      "target": "Node_revisi_pemberitahuan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0346",
      "source": "Node_revisi_pemberitahuan",
      "target": "Node_setuju_pemberitahuan_sup",
      "label": null
    },
    {
      "id": "Flow_0347",
      "source": "Node_pemberitahuan_k3_sesuai",
      "target": "Node_kirim_pemberitahuan_mgr",
      "label": "Ya"
    },
    {
      "id": "Flow_0348",
      "source": "Node_kirim_pemberitahuan_mgr",
      "target": "Node_terima_pemberitahuan_mgr",
      "label": null
    },
    {
      "id": "Flow_0349",
      "source": "Node_terima_pemberitahuan_mgr",
      "target": "Node_laporan_harian",
      "label": null
    },
    {
      "id": "Flow_0350",
      "source": "Node_laporan_harian",
      "target": "Node_kumpulkan_berkas",
      "label": null
    },
    {
      "id": "Flow_0351",
      "source": "Node_kumpulkan_berkas",
      "target": "Node_periksa_kelengkapan",
      "label": null
    },
    {
      "id": "Flow_0352",
      "source": "Node_periksa_kelengkapan",
      "target": "Node_berkas_lengkap",
      "label": null
    },
    {
      "id": "Flow_0353",
      "source": "Node_berkas_lengkap",
      "target": "Node_minta_dokumen_kurang",
      "label": "Tidak"
    },
    {
      "id": "Flow_0354",
      "source": "Node_minta_dokumen_kurang",
      "target": "Node_periksa_ulang_dokumen",
      "label": null
    },
    {
      "id": "Flow_0355",
      "source": "Node_periksa_ulang_dokumen",
      "target": "Node_periksa_kelengkapan",
      "label": null
    },
    {
      "id": "Flow_0356",
      "source": "Node_berkas_lengkap",
      "target": "Node_arsipkan_pekerjaan",
      "label": "Ya"
    },
    {
      "id": "Flow_0357",
      "source": "Node_arsipkan_pekerjaan",
      "target": "Node_tutup_wo",
      "label": null
    },
    {
      "id": "Flow_0358",
      "source": "Node_tutup_wo",
      "target": "Node_end_wo",
      "label": null
    },
    {
      "id": "Flow_0359",
      "source": "Node_start_bulanan",
      "target": "Node_susun_laporan_bulanan",
      "label": null
    },
    {
      "id": "Flow_0360",
      "source": "Node_susun_laporan_bulanan",
      "target": "Node_periksa_bulanan_sup",
      "label": null
    },
    {
      "id": "Flow_0361",
      "source": "Node_periksa_bulanan_sup",
      "target": "Node_laporan_bulanan_sup_ok",
      "label": null
    },
    {
      "id": "Flow_0362",
      "source": "Node_laporan_bulanan_sup_ok",
      "target": "Node_periksa_bulanan_asman",
      "label": "Ya"
    },
    {
      "id": "Flow_0363",
      "source": "Node_periksa_bulanan_asman",
      "target": "Node_laporan_bulanan_asman_ok",
      "label": null
    },
    {
      "id": "Flow_0364",
      "source": "Node_laporan_bulanan_asman_ok",
      "target": "Node_periksa_bulanan_mgr",
      "label": "Ya"
    },
    {
      "id": "Flow_0365",
      "source": "Node_periksa_bulanan_mgr",
      "target": "Node_laporan_bulanan_mgr_ok",
      "label": null
    },
    {
      "id": "Flow_0366",
      "source": "Node_laporan_bulanan_sup_ok",
      "target": "Node_perbaiki_laporan_bulanan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0367",
      "source": "Node_laporan_bulanan_asman_ok",
      "target": "Node_perbaiki_laporan_bulanan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0368",
      "source": "Node_laporan_bulanan_mgr_ok",
      "target": "Node_perbaiki_laporan_bulanan",
      "label": "Tidak"
    },
    {
      "id": "Flow_0369",
      "source": "Node_perbaiki_laporan_bulanan",
      "target": "Node_periksa_bulanan_sup",
      "label": null
    },
    {
      "id": "Flow_0370",
      "source": "Node_laporan_bulanan_mgr_ok",
      "target": "Node_kirim_laporan_bulanan",
      "label": "Ya"
    },
    {
      "id": "Flow_0371",
      "source": "Node_kirim_laporan_bulanan",
      "target": "Node_terima_laporan_unit",
      "label": null
    },
    {
      "id": "Flow_0372",
      "source": "Node_terima_laporan_unit",
      "target": "Node_terima_laporan_pusat",
      "label": null
    },
    {
      "id": "Flow_0373",
      "source": "Node_terima_laporan_pusat",
      "target": "Node_end_bulanan",
      "label": null
    }
  ]
};
  if (typeof module !== "undefined" && module.exports) module.exports = graph;
  else global.IwomsPreparationGraph = graph;
})(typeof window !== "undefined" ? window : globalThis);
