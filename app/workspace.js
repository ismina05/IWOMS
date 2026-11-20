(function (global) {
  'use strict';
  const { ref, reactive, computed, watch, onUnmounted, nextTick } = Vue;
  const { proposalAssetKeys, Repository, KEY, UNIT, stages, proposers, clone } = IwomsWorkflow;
  const preparation = global.IwomsPreparation;
  const PDKB_PROCESS = 'PDKB (Pekerjaan Dalam Keadaan Bertegangan)';
  const proposalTemplates = [
    ['DOC-01', 'Nota Dinas Usulan Pekerjaan'],
    ['DOC-02', 'Formulir Survei Lokasi'],
    ['DOC-03', 'Single Line Diagram (SLD)'],
    ['DOC-04', 'SP2B', 'SP2B'],
    ['DOC-05', 'Lampiran Susunan Tim', 'SP2B'],
    ['DOC-06', 'SP3B', 'SP3B'],
    ['DOC-07', 'Tailgate Session'],
    ['DOC-08', 'Job Safety Analysis', 'JSA'],
    ['DOC-09', 'Checklist Pengawasan K3', 'WIP'],
  ].map(([kode, nama, type]) => ({kode, nama, type}));
  const fields = {
    draft: [['nama_wo', 'Nama WO'], ['katalog_id', 'Katalog pekerjaan', 'catalog'], ['lokasi', 'Lokasi / aset'], ['uraian', 'Uraian kebutuhan', 'textarea'], ['preferensi_tanggal', 'Tanggal yang diusulkan', 'date']],
    revision: [['nama_wo', 'Nama WO'], ['katalog_id', 'Katalog pekerjaan', 'catalog'], ['lokasi', 'Lokasi / aset'], ['uraian', 'Uraian kebutuhan', 'textarea'], ['preferensi_tanggal', 'Tanggal yang diusulkan', 'date'], ['reason', 'Alasan jika menghentikan pengajuan', 'textarea']],
    asman: [['reason', 'Alasan pengembalian, wajib jika ditolak', 'textarea']],
    supervisor: [['reason', 'Alasan pengembalian, wajib jika ditolak', 'textarea']],
    manager: [['reason', 'Alasan pengembalian, wajib jika ditolak', 'textarea']],
    return: [],
    priority: [['priority', 'Prioritas', 'priority'], ['workPlan', 'Rencana kerja Supervisor', 'textarea']],
    survey: [['surveyDate', 'Tanggal survei', 'date'], ['location', 'Lokasi pengukuran'], ['findings', 'Kondisi jaringan dan hasil pengukuran', 'textarea'], ['access', 'Akses lokasi dan lingkungan', 'textarea'], ['equipment', 'Kebutuhan peralatan / APD', 'textarea'], ['material', 'Kebutuhan material', 'textarea'], ['jsa', 'Analisis awal JSA', 'textarea'], ['ibppr', 'Analisis awal IBPPR', 'textarea']],
    analysis: [['jsa', 'Analisis awal JSA berdasarkan survei', 'textarea'], ['ibppr', 'Analisis awal IBPPR berdasarkan survei', 'textarea']],
    feasibility: [['reason', 'Dasar keputusan kelayakan / tindak lanjut', 'textarea']],
    notify: [],
    plan: [['date', 'Tanggal rencana', 'date'], ['time', 'Jam rencana', 'time'], ['personnel', 'Personel dan pembagian tugas', 'textarea'], ['method', 'Metode kerja', 'textarea'], ['permit', 'Nomor Working Permit jika tersedia']],
    legacy: [['ownerRole', 'Pengusul asal hasil verifikasi', 'owner'], ['reason', 'Dasar peninjauan penugasan lama', 'textarea']],
    jsa: [], stopped: [], surveyStopped: [],
  };
  const primary = { draft: ['submit', 'Ajukan ke Asman'], revision: ['submit', 'Ajukan ulang ke Asman'], asman: ['approve', 'Setujui ke Supervisor'], supervisor: ['approve', 'Setujui ke Manajer'], manager: ['approve', 'Sahkan dan teruskan ke Supervisor'], return: ['return', 'Teruskan ke pengusul asal'], priority: ['priority', 'Tetapkan dan tugaskan survei'], survey: ['survey', 'Ajukan hasil survei dan analisis'], analysis: ['analysis', 'Ajukan hasil survei ke Supervisor'], feasibility: ['feasible', 'Nyatakan layak'], notify: ['notify', 'Kirim pemberitahuan ke pengusul'], plan: ['plan', 'Simpan rencana pelaksanaan'], legacy: ['reclassify', 'Kirim untuk peninjauan usulan baru'] };

  const historyTitles = ["Pengajuan & Persetujuan WO", "Survei & Rencana Pelaksanaan", "Dokumen, Kewenangan & Serah Terima", "Kesiapan Lapangan & SOK Awal", "Pelaksanaan & Pengawasan", "Penormalan & Selesai Operasional", "Laporan & Penutupan Administrasi"];
  const historyNodes = [
    ["Node_start_op", "Node_start_har", "Node_start_konstruksi", "Node_buat_op", "Node_buat_har", "Node_buat_konstruksi", "Node_gabung_pengajuan", "Node_periksa_wo_asman", "Node_setuju_wo_asman", "Node_periksa_wo_supervisor", "Node_setuju_wo_supervisor", "Node_periksa_wo_manajer", "Node_setuju_wo_manajer", "Node_gabung_penolakan", "Node_identifikasi_pengaju", "Node_pilih_op", "Node_revisi_op", "Node_perbaiki_op", "Node_stop_op", "Node_pilih_har", "Node_revisi_har", "Node_perbaiki_har", "Node_stop_har", "Node_pilih_konstruksi", "Node_revisi_konstruksi", "Node_perbaiki_konstruksi", "Node_stop_konstruksi", "Node_prioritas_wo"],
    ["Node_survei_lokasi", "Node_susun_analisis_awal", "Node_supervisor_surv", "Node_survei_layak", "Node_perlu_survei_ulang", "Node_hentikan_hasil_survei", "Node_beritahu_pengaju_survei", "Node_end_survei", "Node_rencana_pelaksanaan"],
    ["Node_kirim_jsa", "Node_periksa_jsa_k3l", "Node_sesuai_jsa_k3l", "Node_setuju_jsa_asman", "Node_disetujui_jsa_asman", "Node_revisi_jsa", "Node_bisa_revisi_jsa", "Node_hold_jsa", "Node_atasi_jsa", "Node_siap_jsa", "Node_resume_jsa", "Node_permanen_jsa", "Node_usul_batal_jsa", "Node_nilai_batal_jsa", "Node_putusan_batal_jsa", "Node_end_batal_jsa", "Node_kirim_ibppr", "Node_periksa_ibppr_k3l", "Node_sesuai_ibppr_k3l", "Node_setuju_ibppr_asman", "Node_disetujui_ibppr_asman", "Node_revisi_ibppr", "Node_bisa_revisi_ibppr", "Node_hold_ibppr", "Node_atasi_ibppr", "Node_siap_ibppr", "Node_resume_ibppr", "Node_permanen_ibppr", "Node_usul_batal_ibppr", "Node_nilai_batal_ibppr", "Node_putusan_batal_ibppr", "Node_end_batal_ibppr", "Node_perlu_izin_ketinggian", "Node_siapkan_izin", "Node_tandatangan_izin_k3", "Node_izin_ok_k3", "Node_tandatangan_izin_asman", "Node_izin_ok_asman", "Node_tandatangan_izin_p2k3", "Node_izin_ok_p2k3", "Node_tandatangan_izin_bagian", "Node_izin_ok_bagian", "Node_revisi_izin", "Node_izin_bisa_diperbaiki", "Node_hold_izin_ketinggian", "Node_atasi_izin_ketinggian", "Node_siap_izin_ketinggian", "Node_resume_izin_ketinggian", "Node_permanen_izin_ketinggian", "Node_usul_batal_izin_ketinggian", "Node_nilai_batal_izin_ketinggian", "Node_putusan_batal_izin_ketinggian", "Node_end_batal_izin_ketinggian", "Node_izin_ketinggian_selesai", "Node_gabung_izin", "Node_minta_kewenangan", "Node_verifikasi_kewenangan", "Node_kewenangan_valid", "Node_tindak_lanjut_kewenangan", "Node_pengganti_tersedia", "Node_verifikasi_pengganti", "Node_terbitkan_surat", "Node_pembaruan_berhasil", "Node_verifikasi_surat_baru", "Node_hold_surat_kewenangan", "Node_atasi_surat_kewenangan", "Node_siap_surat_kewenangan", "Node_resume_surat_kewenangan", "Node_permanen_surat_kewenangan", "Node_usul_batal_surat_kewenangan", "Node_nilai_batal_surat_kewenangan", "Node_putusan_batal_surat_kewenangan", "Node_end_batal_surat_kewenangan", "Node_siapkan_sp2b", "Node_ttd_sp2b_sup", "Node_valid_sp2b_sup", "Node_ttd_sp2b_mgr", "Node_valid_sp2b_mgr", "Node_perbaiki_sp2b", "Node_bisa_perbaiki_sp2b", "Node_hold_sp2b", "Node_atasi_sp2b", "Node_siap_sp2b", "Node_resume_sp2b", "Node_permanen_sp2b", "Node_usul_batal_sp2b", "Node_nilai_batal_sp2b", "Node_putusan_batal_sp2b", "Node_end_batal_sp2b", "Node_siapkan_sp3b", "Node_ttd_sp3b_sup", "Node_valid_sp3b_sup", "Node_ttd_sp3b_mgr", "Node_valid_sp3b_mgr", "Node_perbaiki_sp3b", "Node_bisa_perbaiki_sp3b", "Node_hold_sp3b", "Node_atasi_sp3b", "Node_siap_sp3b", "Node_resume_sp3b", "Node_permanen_sp3b", "Node_usul_batal_sp3b", "Node_nilai_batal_sp3b", "Node_putusan_batal_sp3b", "Node_end_batal_sp3b", "Node_susun_checklist", "Node_cek_checklist_sup", "Node_checklist_sesuai_sup", "Node_cek_checklist_reg", "Node_checklist_sesuai_reg", "Node_perbaiki_checklist", "Node_bisa_perbaiki_checklist", "Node_hold_checklist", "Node_atasi_checklist", "Node_siap_checklist", "Node_resume_checklist", "Node_permanen_checklist", "Node_usul_batal_checklist", "Node_nilai_batal_checklist", "Node_putusan_batal_checklist", "Node_end_batal_checklist", "Node_serahkan_sp2b", "Node_tanda_terima_sp2b", "Node_catat_tanda_terima"],
    ["Node_bagikan_sp3b", "Node_terima_sp3b_regu", "Node_terima_sp3b_k3", "Node_instruksi_periksa_ulang", "Node_periksa_kesiapan_lapangan", "Node_alat_material_siap", "Node_hold_kesiapan_lapangan", "Node_atasi_kesiapan_lapangan", "Node_siap_kesiapan_lapangan", "Node_resume_kesiapan_lapangan", "Node_permanen_kesiapan_lapangan", "Node_usul_batal_kesiapan_lapangan", "Node_nilai_batal_kesiapan_lapangan", "Node_putusan_batal_kesiapan_lapangan", "Node_end_batal_kesiapan_lapangan", "Node_job_briefing", "Node_safety_briefing", "Node_koordinasi_kepala_operasi", "Node_minta_sok", "Node_sok_piket_area", "Node_sok_piket_apd", "Node_sok_petugas_gi", "Node_sok_konfirmasi_apd", "Node_sok_konfirmasi_area", "Node_sok_terkonfirmasi", "Node_ulang_koordinasi_sok", "Node_hold_sok_awal", "Node_atasi_sok_awal", "Node_siap_sok_awal", "Node_resume_sok_awal", "Node_permanen_sok_awal", "Node_usul_batal_sok_awal", "Node_nilai_batal_sok_awal", "Node_putusan_batal_sok_awal", "Node_end_batal_sok_awal", "Node_periksa_cuaca", "Node_kondisi_awal_aman", "Node_evaluasi_kondisi_awal", "Node_cek_ulang_kondisi_awal", "Node_kondisi_bisa_dipulihkan", "Node_hold_kondisi_awal", "Node_atasi_kondisi_awal", "Node_siap_kondisi_awal", "Node_resume_kondisi_awal", "Node_permanen_kondisi_awal", "Node_usul_batal_kondisi_awal", "Node_nilai_batal_kondisi_awal", "Node_putusan_batal_kondisi_awal", "Node_end_batal_kondisi_awal"],
    ["Node_parallel_mulai", "Node_pelaksanaan_bertegangan", "Node_pengawasan_regu", "Node_pengawasan_k3", "Node_parallel_selesai", "Node_periksa_gangguan_pelaksanaan", "Node_stop_pekerjaan_sementara", "Node_amankan_kondisi_kerja", "Node_evaluasi_k3_pelaksanaan", "Node_sudah_aman_lagi", "Node_hold_bahaya_saat_pelaksanaan", "Node_atasi_bahaya_saat_pelaksanaan", "Node_siap_bahaya_saat_pelaksanaan", "Node_resume_bahaya_saat_pelaksanaan", "Node_permanen_bahaya_saat_pelaksanaan", "Node_usul_batal_bahaya_saat_pelaksanaan", "Node_nilai_batal_bahaya_saat_pelaksanaan", "Node_putusan_batal_bahaya_saat_pelaksanaan", "Node_end_batal_bahaya_saat_pelaksanaan", "Node_pekerjaan_selesai", "Node_lapor_pekerjaan_selesai"],
    ["Node_minta_penormalan", "Node_normal_piket_area", "Node_normal_piket_apd", "Node_normal_petugas_gi", "Node_normal_konfirmasi_apd", "Node_normal_konfirmasi_area", "Node_normalisasi_ok", "Node_selesai_operasional"],
    ["Node_izin_tinggi_digunakan", "Node_lengkapi_izin_selesai", "Node_ttd_penutupan_izin_k3", "Node_ttd_penutupan_izin_asman", "Node_ttd_penutupan_izin_p2k3", "Node_ttd_penutupan_izin_bagian", "Node_arsip_izin_ketinggian", "Node_gabung_penutupan_izin", "Node_laporan_hasil_kepala_regu", "Node_susun_pemberitahuan", "Node_setuju_pemberitahuan_sup", "Node_pemberitahuan_sup_sesuai", "Node_setuju_pemberitahuan_reg", "Node_pemberitahuan_reg_sesuai", "Node_setuju_pemberitahuan_k3", "Node_pemberitahuan_k3_sesuai", "Node_revisi_pemberitahuan", "Node_kirim_pemberitahuan_mgr", "Node_terima_pemberitahuan_mgr", "Node_laporan_harian", "Node_kumpulkan_berkas", "Node_periksa_kelengkapan", "Node_berkas_lengkap", "Node_minta_dokumen_kurang", "Node_periksa_ulang_dokumen", "Node_arsipkan_pekerjaan", "Node_tutup_wo", "Node_end_wo"]
  ];

  const workScreenPresentation = {
    P01: ['Daftar & Pengajuan WO','bg-blue-50 text-blue-800','border-blue-200 bg-blue-50/30'],
    P02: ['Persetujuan & Penugasan','bg-indigo-50 text-indigo-800','border-indigo-200 bg-indigo-50/30'],
    P03: ['Persiapan & Penjadwalan','bg-cyan-50 text-cyan-800','border-cyan-300 bg-cyan-50/30'],
    P04: ['Rencana Operasi','bg-blue-50 text-blue-800','border-blue-200 bg-blue-50/30'],
    E01: ['Pelaksanaan WO','bg-emerald-50 text-emerald-800','border-emerald-200 bg-emerald-50/30'],
    E02: ['Kesiapan & Pengawasan K3','bg-amber-50 text-amber-900','border-amber-200 bg-amber-50/30'],
    E03: ['Operasi Jaringan','bg-blue-50 text-blue-800','border-blue-200 bg-blue-50/30'],
    R01: ['Laporan Penyelesaian WO','bg-blue-50 text-blue-800','border-blue-200 bg-blue-50/30'],
    R03: ['Pemeriksaan & Penutupan','bg-emerald-50 text-emerald-800','border-emerald-200 bg-emerald-50/30'],
  };

  function createBridge(context) {
    const { activeRoleKey, currentUser, workOrders, selectedWO, activeScreenCode, activeMenu, showDetailModal, formP01, notify, roleAllowedScreens } = context;
    const reference = clone(workOrders.value);
    const referenceSeed = reference.find(wo => wo.kondisi_operasi === 'Tanpa Padam');
    if (referenceSeed) {
      const examples = [
        ['P01','Draft','Pemeliharaan Jumper Hotspot','tl_har'],
        ['P01','Draft','Pemasangan Jumper LBS','tl_op'],
        ['P01','Draft','Penggantian Isolator Suspension','tl_konstruksi'],
        ['P02','Submitted','Penggantian Isolator Tumpu','tl_har', {approval_asman:{},approval_supervisor:{},approval_manajer:{}}],
        ['P02','Submitted','Pemeliharaan Jumper MVTIC','tl_op', {approval_asman:{approved:true,by:'Asman Demo'},approval_supervisor:{},approval_manajer:{}}],
        ['P02','Assignment Review','Pemasangan Jumper FCO Trafo','tl_konstruksi'],
        ['P03','Approved','Pemeliharaan Jumper Hotspot','tl_har'],
        ['P03','Approved','Penggantian Isolator Tumpu','tl_har',{working_permit_nomor:'WP-DEMO-008'}],
        ['P03','Approved','Pemasangan Jumper LBS','tl_op',{working_permit_nomor:'WP-DEMO-009',kondisi_operasi:'Padam'}],
        ['E01','Scheduled','Penggantian Isolator Tumpu','tl_har',{jadwal_resmi_tanggal:'2026-11-20',jadwal_resmi_jam:'08:30',working_permit_nomor:'WP-DEMO-010'}],
        ['E01','Ready to Start','Pemasangan Jumper LBS','tl_op',{briefing_k3_selesai:true,working_permit_nomor:'WP-DEMO-011'}],
        ['E01','Pending','Pemeliharaan Jumper MVTIC','tl_har',{keterlambatan_menit:30}],
        ['E01','Ongoing','Penggantian Isolator Suspension','tl_konstruksi',{briefing_k3_selesai:true,working_permit_nomor:'WP-DEMO-013',progres_persen:55}],
        ['E01','On Hold','Pemeliharaan Jumper Hotspot','tl_har',{briefing_k3_selesai:true,working_permit_nomor:'WP-DEMO-014',progres_persen:40}],
        ['R01','Completed','Pemasangan Jumper FCO Trafo','tl_op',{progres_persen:100,laporan_diterima:false}],
        ['R03','Under Review','Penggantian Isolator Tumpu','tl_har',{progres_persen:100,laporan_diterima:true,wip_disahkan_k3l:false}],
        ['R03','Report Revision','Pemeliharaan Jumper MVTIC','tl_har',{progres_persen:100,laporan_diterima:false,reject_reason:'Lengkapi catatan hasil pengukuran demo.'}],
        ['R01','Closed','Penggantian Isolator Suspension','tl_konstruksi',{progres_persen:100,laporan_diterima:true,wip_disahkan_k3l:true,izin_objek_ditutup:true,area_diterima_operasi:true}],
      ];
      examples.forEach(([screen,status,name,role,extra],index)=>{
        reference.unshift({
          ...clone(referenceSeed),id:'I01-'+screen+'-DEMO-'+String(index+1).padStart(2,'0'),status,
          nama_wo:name,nama_pekerjaan:name,lokasi:'Tiang DEMO-'+(index+1)+', Penyulang Uji '+(index%4+1),
          penugasan:'Internal PLN',pengusul:'Pengusul Demo',pengusul_role:role,
          uraian:'Contoh latihan '+name.toLowerCase()+' pada aset dan penyulang uji.',
          working_permit_nomor:'',jadwal_resmi_tanggal:'',jadwal_resmi_jam:'',
          kondisi_operasi:'Tanpa Padam',briefing_k3_selesai:false,progres_persen:0,
          laporan_diterima:false,wip_disahkan_k3l:false,izin_objek_ditutup:false,area_diterima_operasi:false,
          ...extra,
        });
      });
    }
    let repository;
    const error = ref('');
    try { repository = new Repository(localStorage); repository.importLegacy(workOrders.value); }
    catch (cause) { error.value = cause.message; }
    const data = ref(repository ? repository.snapshot() : { orders: [], tasks: [], audits: [], notifications: [], documents: [], operations: [], reports: [] });
    let mainRepository = repository;
    const scenarioMode = ref(false);
    let scenarioRepository;
    const referenceMode = ref(false);
    const proposalCatalog = computed(() => context.masterKatalogList.value.filter(item => item.proses_bisnis === PDKB_PROCESS));
    try { referenceMode.value = sessionStorage.getItem('iwoms.demo.reference') === '1'; } catch {}
    const selectedId = ref(null);
    const detailId = ref(null);
    const detailPanel = ref('ringkasan');
    let detailTrigger;
    const form = reactive({});
    const busy = ref(false);
    const notice = ref('');
    const pendingKey = ref(null);
    const documentPreview = ref(null);
    const signaturePreview = ref('');
    const signatureAspect = ref(.707);
    let signatureRequest = 0;
    function clearSignaturePreview(){
      signatureRequest++;
      if(signaturePreview.value)URL.revokeObjectURL(signaturePreview.value);
      signaturePreview.value='';
    }
    const signatureNames={survey:'Form Survei',JSA:'JSA',IBPPR:'IBPPR',SP2B:'SP2B',SP3B:'SP3B',EQUIPMENT_CHECKLIST:'Checklist peralatan dan material',
      HEIGHT_PERMIT:'Izin Kerja Ketinggian',HEIGHT_CLOSURE:'Izin Kerja Ketinggian',DELEGATION:'Berita Acara Delegasi',COMPLETION_NOTICE:'Pemberitahuan Penyelesaian'};
    async function renderSignaturePreview(){
      clearSignaturePreview();
      const wo=selected.value;
      if(!wo)return;
      const type=preparation.configuration(taskView(wo)).documentType || 'DELEGATION';
      const name=signatureNames[type];
      if(!name)return;
      const record=preparation.latestDocument(data.value,wo,type)||wo.delegation?.document||{type,version:1,payload:{},decisions:[]};
      const request=signatureRequest;
      const result=await global.PreviewWoPdf.create({name,version:record.version},'filled',wo,data.value.audits.filter(event=>event.woId===wo.id),record);
      const pdf=await global.PDFLib.PDFDocument.load(await result.blob.arrayBuffer());
      if(request!==signatureRequest)return;
      const page=pdf.getPage(form.signature.page || 0);
      signatureAspect.value=page.getWidth()/page.getHeight();
      signaturePreview.value=URL.createObjectURL(result.blob);
    }
    const canSign = computed(()=>{
      const wo=selected.value;
      if(!wo || !selectedTask.value?.actionable)return false;
      const node=taskView(wo).nodeId;
      const action=preparation.configuration(taskView(wo)).primary?.[0];
      return action==='document-approve' || ['sp2b-receive','delegation-create','delegation-accept','delegation-review'].includes(action)
        || node.startsWith('Node_ttd_penutupan_izin_') || node.startsWith('Node_setuju_pemberitahuan_');
    });
    watch(selectedId,clearSignaturePreview);
    onUnmounted(clearSignaturePreview);
    const actor = computed(() => ({ id: 'demo:' + activeRoleKey.value, role: activeRoleKey.value, name: currentUser.value.name, unitId: UNIT }));
    const selected = computed(() => data.value.orders.find(wo => wo.id === selectedId.value));
    const tasks = computed(() => data.value.tasks.filter(task => task.unitId === actor.value.unitId && task.role === actor.value.role && (!task.assigneeId || task.assigneeId === actor.value.id)));
    const visibleOrders = computed(() => repository ? data.value.orders.filter(wo => repository.canRead(wo, actor.value)) : []);
    function sync() {
      if (!repository) { workOrders.value = []; return; }
      data.value = repository.snapshot();
      workOrders.value = referenceMode.value ? clone(reference) : repository.orders(actor.value);
      if (selectedWO.value?.processVersion) selectedWO.value = workOrders.value.find(wo => wo.id === selectedWO.value.id) || null;
    }
    const detail = computed(() => visibleOrders.value.find(wo => wo.id === detailId.value));
    const detailEvents = computed(() => data.value.audits.filter(event => event.woId === detailId.value));
    const detailDocuments = computed(() => data.value.documents.filter(doc => doc.woId === detailId.value && !['support-file','proposal-attachment'].includes(doc.type)));
    const selectedTask = computed(() => tasks.value.find(task => task.woId === selectedId.value && task.screen !== 'R02'));
    const taskView = wo => ({...wo,nodeId:wo.nodeId === 'Node_parallel_mulai' ? (tasks.value.find(task=>task.woId===wo.id && task.screen!=='R02')?.nodeId || wo.nodeId) : wo.nodeId});
    const wipId = ref('');
    const wipRows = ref([]);
    const wipOrder = computed(()=>visibleOrders.value.find(wo=>wo.id===wipId.value));
    watch([wipId,activeRoleKey],()=>{
      const latest = wipOrder.value?.wipVersions?.at(-1);
      wipRows.value = context.wipItems.value.map((item,index)=>({no:item.no,text:item.text,answer:latest?.rows[index]?.answer || '',note:latest?.rows[index]?.note || ''}));
    });
    const locationEvidence = [
      {kode:'GAMBAR-LOKASI',nama:'Gambar Lokasi'},
      {kode:'PETA-LOKASI',nama:'Peta Lokasi'},
    ];
    function loadProposal(wo) {
      context.resetFormP01();
      const draft = formP01.value;
      draft.dokumen_lampiran = draft.dokumen_lampiran.filter(item => !wo.removedProposalSlots?.includes(item.kode));
      for (const field of ['nama_wo','katalog_id','nama_pekerjaan','lokasi','uraian','preferensi_tanggal','proses_bisnis','kategori', ...proposalAssetKeys]) {
        if (wo[field]) draft[field] = wo[field];
      }
      draft.dokumen_lampiran.push(...locationEvidence.map(item=>({...item,id:item.kode})));
      for (const file of data.value.documents.filter(item => item.woId === wo.id && item.type === 'proposal-attachment' && item.slot)) {
        let slot = draft.dokumen_lampiran.find(item => item.kode === file.slot);
        if (!slot) {
          slot = {id:file.slot,kode:file.slot,nama:file.slot};
          draft.dokumen_lampiran.push(slot);
        }
        Object.assign(slot,{terunggah:true,is_user_uploaded:true,file_name:file.name,file_type:file.mime,preview_url:file.content});
      }
    }
    function open(wo, inModal = detailId.value === wo?.id) {
      if (!wo?.processVersion) { selectedWO.value = wo; showDetailModal.value = true; return; }
      wo = visibleOrders.value.find(order => order.id === wo.id);
      if (!wo) { error.value = 'WO tidak tersedia dalam cakupan Anda.'; return; }
      error.value = ''; notice.value = ''; selectedId.value = wo.id;
      selectedWO.value = clone(wo); showDetailModal.value = false;
      clearSignaturePreview();
      Object.keys(form).forEach(key => delete form[key]);
      if (['draft', 'revision'].includes(wo.stage)) { Object.assign(form, clone(wo)); loadProposal(wo); }
      if (wo.stage === 'survey') Object.assign(form, clone(wo.surveyVersions.at(-1) || {}), { location: wo.lokasi });
      if (wo.stage === 'analysis') Object.assign(form, clone(wo.initialAnalyses.at(-1) || {}));
      if (preparation.activeNode(wo)) {
        const config = preparation.configuration(taskView(wo));
        const doc = preparation.latestDocument(data.value, wo, config.documentType);
        if (config.upload && doc) Object.assign(form, clone(doc.payload));
        if (doc?.payload?.Isi && wo.nodeId==='Node_revisi_pemberitahuan') {
          Object.assign(form, clone(doc.payload));
        }
        if (global.IwomsDocumentDetails.rowFields[config.documentType] && config.upload) form.rows ||= [];
        if(config.documentType==='HEIGHT_PERMIT' && config.primary?.[0]==='document-submit')form.heightCheckAnswers ||= {};
        if(config.documentType==='JSA' && config.primary?.[0]==='document-submit')form.jsaChecks ||= [];
        if (config.checklist) form.items = clone(doc?.items || [{category:'equipment',name:'',quantity:1,unit:'',condition:''},{category:'material',name:'',quantity:1,unit:'',condition:''}]);
        if (wo.nodeId==='Node_periksa_kesiapan_lapangan') {
          const previous=wo.readiness?.findLast(item=>item.nodeId===wo.nodeId && item.data.documentVersionId===doc?.id);
          if(previous?.data.itemChecks)form.itemChecks=clone(previous.data.itemChecks);
        }
        if (config.roster === 'collect') form.people = [newPerson()];
        if (['renewal', 'fulfillment'].includes(config.roster)) form.people = clone(wo.authorityRoster.people);
        if (config.roster === 'replacement') form.replacements = [{ ...newPerson(), replacesId: '' }];
        if (wo.nodeId === 'Node_minta_sok') {
          const letter = preparation.latestDocument(data.value, wo, 'SP2B');
          if (letter) Object.assign(form,{circuit:letter.payload.circuit,boundary:letter.payload.workLocation+' / '+letter.payload.limits});
        }
      }
      form.reason = wo.nodeId==='Node_revisi_pemberitahuan' ? form.Isi || '' : ''; pendingKey.value = null;
      if (inModal) return;
      activeScreenCode.value = preparation.activeNode(wo) ? preparation.configuration(taskView(wo)).screen || (wo.status==='WO Completed' ? 'R03' : 'P03') : stages[wo.stage][1];
      activeMenu.value = activeScreenCode.value.startsWith('R') ? 'pelaporan' : activeScreenCode.value.startsWith('E') ? 'pelaksanaan' : 'perencanaan';
      nextTick(() => document.querySelector('[data-workflow-heading]')?.focus());
    }
    function reload() {
      try { if (!repository) repository = mainRepository = new Repository(localStorage); repository.reload(); error.value = ''; sync(); if (selected.value) open(selected.value); }
      catch (cause) { error.value = cause.message; }
    }
    function execute(action, payload, wo = selected.value) {
      if (!repository) { error.value = 'Penyimpanan belum tersedia. Muat ulang setelah memeriksa akses browser.'; return false; }
      if (busy.value) return false;
      busy.value = true; error.value = ''; notice.value = '';
      const key = pendingKey.value || crypto.randomUUID(); pendingKey.value = key;
      try {
        const result = repository.command({ action, woId: wo?.id, expectedVersion: wo?.version, data: payload, idempotencyKey: key }, actor.value);
        pendingKey.value = null; sync();
        if (action === 'create') open(data.value.orders.find(order => order.id === result.woId));
        else {
          const updated = visibleOrders.value.find(order => order.id === result.woId);
          const hasNextAction = tasks.value.some(task => task.woId === result.woId && task.actionable && task.screen !== 'R02');
          if (updated && hasNextAction && detailId.value === result.woId) open(updated, true);
          else selectedId.value = null;
          notice.value = result.message || 'Tersimpan. ' + (result.nextTask ? result.nextTask.title + ' · ' + result.nextTask.role.replaceAll('_', ' ') : 'Proses ini telah berakhir.');
        }
        return true;
      } catch (cause) { error.value = cause.message; pendingKey.value = null; return false; }
      finally { busy.value = false; }
    }
    function create() {
      if (referenceMode.value) return context.openNewWOModal();
      return execute('create', { nama_wo: '', proses_bisnis: PDKB_PROCESS }, null);
    }
    function proposalPayload() {
      const {nama_wo,katalog_id,nama_pekerjaan,lokasi,uraian,preferensi_tanggal,kategori} = formP01.value;
      return { ...Object.fromEntries(proposalAssetKeys.map(key=>[key,formP01.value[key] || ''])),nama_wo,katalog_id,nama_pekerjaan,lokasi,uraian,preferensi_tanggal,kategori,proses_bisnis:PDKB_PROCESS,reason:form.reason};
    }
    function submit(action) {
      const payload = clone(form);
      payload.roundId = selected.value?.executionRounds?.at(-1)?.id;
      payload.normalizationId = selected.value?.normalizationRequests?.at(-1)?.id;
      if (action === 'sp2b-deliver') payload.recipientId = 'demo:pelaksana_pdkb';
      if (action === 'sp3b-deliver') { payload.reguRecipientId = 'demo:kepala_regu'; payload.k3RecipientId = 'demo:pengawas_k3'; }
      if (selected.value && preparation.activeNode(selected.value)) {
        const config = preparation.configuration(taskView(selected.value));
        const doc = preparation.latestDocument(data.value, selected.value, config.documentType);
        if (doc) payload.documentVersionId = doc.id;
        if (action !== 'sok-request' && selected.value.sokRequests?.length) payload.requestId = selected.value.sokRequests.at(-1).id;
      }
      if (['draft', 'revision'].includes(selected.value?.stage)) {
        const catalog = context.masterKatalogList.value.find(item => item.id === payload.katalog_id);
        payload.nama_pekerjaan = catalog?.nama_pekerjaan || '';
        payload.proses_bisnis = PDKB_PROCESS;
      }
      if (['feasible', 'repeat', 'stop-survey'].includes(action)) {
        payload.decision = { feasible: 'feasible', repeat: 'repeat', 'stop-survey': 'stop' }[action];
        action = 'feasibility';
      }
      execute(action, payload);
    }
    async function upload(event, slot) {
      const file = event.target.files[0];
      if (!file) return;
      const id = selected.value.id;
      const uploadActorId = actor.value.id;
      const uploadNodeId = selected.value.nodeId;
      if (file.size > 2 * 1024 * 1024) { error.value = 'Ukuran lampiran demo maksimal 2 MB per berkas.'; return; }
      if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { error.value = 'Pilih PDF atau gambar PNG, JPEG, WebP.'; return; }
      const surveyEvidence=selected.value.stage==='survey';
      const draft = slot && !surveyEvidence ? proposalPayload() : clone(form);
      try {
        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Berkas gagal dibaca.')); reader.readAsDataURL(file);
        });
        if (selectedId.value !== id || actor.value.id !== uploadActorId || selected.value?.nodeId !== uploadNodeId) throw new Error('WO atau role berubah. Pilih ulang berkas pada tugas yang benar.');
        const advanced = surveyEvidence || preparation.activeNode(selected.value);
        if (!advanced && !execute('save', draft)) return;
        const wo = data.value.orders.find(order => order.id === id);
        if (execute(surveyEvidence ? 'survey-evidence' : advanced ? 'document-file' : 'attach', { name: file.name, mime: file.type, content, ...(slot ? {slot} : {}), ...(draft.attachmentCaption ? {caption:draft.attachmentCaption} : {}) }, wo)) {
          open(data.value.orders.find(order => order.id === id));
          if (advanced) Object.assign(form, draft);
          notice.value = 'Berkas pendukung tersimpan untuk versi yang akan diajukan.';
        }
      } catch (cause) { error.value = cause.message; }
      finally { event.target.value = ''; }
    }
    function onRoleChange() {
      detailId.value = null;
      selectedId.value = null; selectedWO.value = null; showDetailModal.value = false;
      context.showDocPreviewModal.value = false;
      documentPreview.value = null;
      notice.value = ''; error.value = '';
      activeMenu.value = 'dashboard'; activeScreenCode.value = 'D01'; sync();
    }
    watch(activeRoleKey, onRoleChange);
    watch(referenceMode, value => {
      try { sessionStorage.setItem('iwoms.demo.reference', value ? '1' : '0'); } catch {}
      selectedId.value = null; selectedWO.value = null; sync();
    }, { flush: 'sync' });
    const dashboardOrders = computed(() => referenceMode.value ? workOrders.value : visibleOrders.value);
    const changed = event => { if (!scenarioMode.value && event.key === KEY) { notice.value = 'Ada perubahan dari tab lain. Muat ulang untuk melihat versi terbaru.'; } };
    global.addEventListener('storage', changed);
    onUnmounted(() => global.removeEventListener('storage', changed));
    sync();
    const actions = computed(() => tasks.value.map(task => {
      const wo = visibleOrders.value.find(order => order.id === task.woId);
      return { id: task.id, wo_id: wo.id, wo, title: task.title, status: wo.status, tag: 'Tugas Anda', location: wo.lokasi, actionButtonText: task.actionable ? 'Buka tugas' : 'Lihat persiapan', targetScreen: task.screen, actionable:task.actionable };
    }));
    const workflow = reactive({
      error, notice, busy, referenceMode, selected, form, tasks, orders: visibleOrders, actor,
      scenarioMode,
      locationEvidenceFiles(woId) {
        return data.value.documents.filter(doc => doc.woId === woId && locationEvidence.some(slot=>slot.kode===doc.slot));
      },
      proposalAssets: [['workUnit','Unit pekerjaan'],['poleNumber','Nomor tiang'],['substation','Gardu induk'],['feeder','Penyulang'],['poleType','Jenis tiang'],['poleHeight','Tinggi tiang (m)','number'],['conductorType','Jenis penghantar'],['conductorArea','Penampang penghantar (mm?)','number']],
      async toggleScenarios() {
        if (busy.value) return;
        busy.value = true;
        try {
          if (!scenarioMode.value && !scenarioRepository) {
            const response = await fetch('app/demo-scenarios.json');
            if (!response.ok) throw Error('Data skenario gagal dimuat. Coba lagi.');
            const fixture = await response.json();
            const memory = new Map();
            scenarioRepository = new Repository({getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)});
            memory.set(KEY, JSON.stringify({...scenarioRepository.snapshot(),...fixture}));
            scenarioRepository.reload();
          }
          scenarioMode.value = !scenarioMode.value;
          repository = scenarioMode.value ? scenarioRepository : mainRepository;
          referenceMode.value = false;
          onRoleChange();
          notice.value = scenarioMode.value ? 'Skenario latihan aktif. Pilih role untuk melihat tugas.' : 'Kembali ke data kerja pada browser ini.';
        } catch (cause) { error.value = cause.message; }
        finally { busy.value = false; }
      },
      detail, detailPanel, detailDocuments,
      detailSupportingFiles: computed(() => data.value.documents.filter(doc => doc.woId === detailId.value && doc.type === 'support-file')),
      surveyEvidenceFiles: computed(() => {
        const wo=selected.value;
        return wo?.stage==='survey'?data.value.documents.filter(file=>file.woId===wo.id && file.documentType==='survey' && file.forVersion===wo.surveyVersions.length+1):[];
      }),
      detailInfo: computed(() => {
        const wo = detail.value;
        if (!wo) return [];
        const pair = (...values) => values.filter(Boolean).join(' / ');
        return [
          ['Unit pekerjaan', wo.workUnit || wo.unitId],
          ['Pegawai yang mengajukan', wo.pengusul],
          ['Tanggal pengajuan', wo.tanggal_pengajuan],
          ['Lokasi pekerjaan', wo.lokasi],
          ['Nomor tiang', wo.poleNumber],
          ['Gardu induk / Penyulang', pair(wo.substation, wo.feeder)],
          ['Jenis dan tinggi tiang', pair(wo.poleType, wo.poleHeight && wo.poleHeight + ' m')],
          ['Jenis dan penampang penghantar', pair(wo.conductorType, wo.conductorArea && wo.conductorArea + ' mm²')],
          ['Kondisi operasi', wo.kondisi_operasi],
          ['Jadwal rencana', pair(wo.plan?.date, wo.plan?.time)],
          ['Regu pelaksana', wo.plan?.personnel],
        ];
      }),
      canOpenWip: computed(() => actor.value.role === 'pengawas_k3' && !!detail.value?.executionRounds?.length),
      openDetailWip() {
        wipId.value = detailId.value;
        this.closeDetail();
        activeMenu.value = 'pelaksanaan';
        activeScreenCode.value = 'E02';
      },
      historyGroups: computed(() => {
        const groups = historyTitles.map(title=>({title,events:[]}));
        const wo = detail.value;
        const nodeGroup = node => historyNodes.findIndex(nodes=>nodes.includes(node));
        let previousGroup = 0;
        for (const event of detailEvents.value) {
          if (['create','save','attach','detach','attach-many','document-file','survey-evidence'].includes(event.action) || event.action?.startsWith('wip-')) continue;
          let group = nodeGroup(event.nodeId);
          if (group < 0) group = nodeGroup(event.nextNodeId);
          if (event.action?.startsWith('delegation') || event.action === 'no-delegation') group = 3;
          if (group >= 0) previousGroup = group;
          groups[previousGroup].events.push(event);
        }
        const node = preparation.graph.nodes[wo?.nodeId];
        const ended = node?.type === 'endEvent' || wo?.status === 'WO Completed';
        const currentGroup = nodeGroup(wo?.nodeId);
        const focus = ended || currentGroup < 0 ? previousGroup : currentGroup;
        return groups.map((group,index)=>({
          ...group,focus:index===focus,
          status:index===focus && !ended ? 'Sedang berjalan'
            : index===focus && ended && wo?.status!=='WO Completed' ? 'Berakhir'
            : group.events.length ? 'Selesai' : ended ? 'Tidak dijalankan' : 'Belum dimulai',
        }));
      }),
      roleTitle(role) { return context.roleTitle(role); },
      async copyDetailId() {
        try { await navigator.clipboard.writeText(detail.value.officialWoNumber || detail.value.id); context.notify('ID WO disalin'); }
        catch { context.notify('ID WO belum bisa disalin.'); }
      },
      historyTitle(event) {
        const role = this.roleTitle(event.actor?.role || '');
        if (event.action === 'approve') return event.actor?.role === 'manajer_area' ? 'Usulan disahkan' : 'Usulan disetujui: ' + role;
        if (event.action === 'reject') return 'Usulan dikembalikan: ' + role;
        if (event.action === 'feasibility') return {feasible:'Pekerjaan dinyatakan layak',repeat:'Survei ulang diminta',stop:'Pekerjaan dinyatakan tidak layak'}[event.data?.decision] || 'Kelayakan diputuskan';
        if (event.action === 'physical-report') return 'Selesai fisik dilaporkan';
        if (event.action === 'operational-complete') return 'Pekerjaan dinyatakan selesai operasional';
        if (event.nextNodeId === 'Node_end_wo') return 'Administrasi WO ditutup';
        const label=this.actionLabel(event.action);
        return label === event.action ? this.nodeTitle(event.nodeId) || label : label;
      },
      referenceDrafts: computed(() => workOrders.value.filter(wo => wo.id.startsWith('I01-P01-DEMO-') && wo.pengusul_role === activeRoleKey.value && wo.status === 'Draft')),
      detailEvents: computed(() => [...detailEvents.value].reverse()),
      detailParties: computed(() => {
        const wo = detail.value;
        if (!wo) return [];
        const survey = detailEvents.value.findLast(event => event.action === 'survey');
        const sp3b = detailDocuments.value.findLast(doc => doc.type === 'SP3B' && doc.status === 'issued');
        const safety = sp3b?.rosterSnapshot?.people.find(person => person.personId === sp3b.payload.safetySupervisor);
        return [
          ['Pengusul', wo.pengusul || wo.ownerRole],
          ['Direksi Pekerjaan', wo.direksi_pekerjaan],
          ['Preparator', wo.preparator || survey?.actor.name],
          ['Pengawas K3', safety?.name || wo.pengawas_k3],
        ];
      }),
      detailPreviewOpen: computed(() => !!documentPreview.value || context.showDocPreviewModal.value),
      detailAttachments: computed(() => data.value.documents.filter(doc => doc.woId === detailId.value && doc.type === 'proposal-attachment')),
      detailOperations: computed(() => data.value.operations.filter(event => event.woId === detailId.value)),
      detailTasks: computed(() => data.value.tasks.filter(task => task.woId === detailId.value && task.actionable)),
      showDetail(wo, panel = 'ringkasan') {
        if (!wo || !visibleOrders.value.some(order => order.id === wo.id)) return;
        detailTrigger = document.activeElement;
        detailPanel.value = panel === 'riwayat' ? 'riwayat' : 'dokumen';
        detailId.value = wo.id;
        open(wo, true);
        nextTick(() => {
          const target = document.querySelector(panel === 'tugas' ? '[data-wo-task]' : '[data-wo-detail-close]');
          target?.focus({preventScroll:true});
          if (panel === 'tugas') target?.scrollIntoView({block:'start'});
          else document.querySelector('[data-wo-scroll]')?.scrollTo(0,0);
        });
      },
      closeDetail() {
        detailId.value = null;
        selectedId.value = null;
        nextTick(() => detailTrigger?.isConnected && detailTrigger.focus());
      },
      trapDetailFocus(event) {
        const controls = [...event.currentTarget.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary')].filter(control => control.getClientRects().length);
        if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
        if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
      },
      proposalOpen: computed(() => !referenceMode.value && !!selectedTask.value?.actionable && ['draft','revision'].includes(selected.value?.stage)),
      clearProposal() {
        context.resetFormP01();
        if (selected.value) loadProposal({...selected.value,nama_wo:'',katalog_id:'',nama_pekerjaan:'',lokasi:'',uraian:'',preferensi_tanggal:'',kategori:''});
      },
      proposalCatalog,
      async uploadProposalFiles(event) {
        const input = event.target;
        const wo = selected.value;
        if (!wo || !input.files.length) return;
        const owner = actor.value.id;
        const draft = proposalPayload();
        try {
          const files = await Promise.all([...input.files].map(file => {
            const slot = file.name.match(/^(DOC-0[1-9]|GAMBAR-LOKASI|PETA-LOKASI)(?=[_. -])/i)?.[0].toUpperCase();
            if (!slot || !formP01.value.dokumen_lampiran.some(doc => doc.kode === slot)) throw Error('Awali nama berkas dengan kode dokumen yang tampil, misalnya DOC-01_Nota.pdf.');
            if (file.size > 2 * 1024 * 1024) throw Error(file.name + ' melebihi 2 MB.');
            return new Promise((resolve,reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({slot,name:file.name,mime:file.type,content:reader.result});
              reader.onerror = () => reject(Error('Berkas gagal dibaca.'));
              reader.readAsDataURL(file);
            });
          }));
          if (actor.value.id !== owner || selected.value?.id !== wo.id || selected.value?.version !== wo.version) throw Error('WO atau role berubah. Pilih ulang dokumen.');
          if (execute('attach-many', {files}, wo)) {
            open(data.value.orders.find(order => order.id === wo.id));
            Object.assign(formP01.value,draft);
            form.reason = draft.reason;
            notice.value = files.length + ' dokumen berhasil diunggah.';
          }
        } catch (cause) { error.value = cause.message; }
        finally { input.value = ''; }
      },
      saveProposal(action) {
        const payload = proposalPayload();
        const catalog = proposalCatalog.value.find(item => item.id === payload.katalog_id);
        if (action === 'submit' && !catalog) {
          error.value = 'Pilih katalog pekerjaan PDKB sebelum mengajukan WO.';
          return false;
        }
        payload.katalog_id = catalog?.id || '';
        payload.nama_pekerjaan = catalog?.nama_pekerjaan || '';
        payload.catalogCode = catalog?.kode || '';
        return execute(action, payload);
      },
      removeProposalFile(slot) {
        const wo = selected.value;
        const draft = proposalPayload();
        if (execute('detach', {slot}, wo)) {
          open(data.value.orders.find(order => order.id === wo.id));
          Object.assign(formP01.value,draft);
        }
      },
      dashboardFilter:{period:'',search:'',status:'',category:'all'},
      dashboardRows(category = this.dashboardFilter.category){return IwomsReporting.rows(dashboardOrders.value,tasks.value,{...this.dashboardFilter,category});},
      dashboardStatuses:computed(()=>[...new Set(dashboardOrders.value.map(wo=>wo.status))].sort()),
      monthlyOpened: '',
      openMonthly(report){this.monthlyOpened=report.id;activeMenu.value='pelaporan';activeScreenCode.value='R05';},
      distributionAction(report){return {Node_kirim_laporan_bulanan:['monthly-send','Kirim ke Komisi Unit/Wilayah'],Node_terima_laporan_unit:['monthly-forward','Terima dan teruskan ke Komisi Pusat'],Node_terima_laporan_pusat:['monthly-receive','Catat penerimaan Pusat']}[report.nodeId];},
      downloadMonthly(report,version){
        try{IwomsReporting.download(report,version);error.value='';notice.value='CSV dibuat dan unduhan dimulai.';}
        catch(cause){notice.value='';error.value='Ekspor gagal. '+cause.message+' Coba unduh ulang.';}
      },
      monthPeriod:'', monthNotes:{},
      monthlyReports:computed(()=>data.value.reports.filter(report=>report.unitId===actor.value.unitId)),
      monthlyTasks:computed(()=>referenceMode.value ? [] : data.value.reports.filter(report=>report.unitId===actor.value.unitId && report.nodeId!=='Node_end_bulanan' && preparation.graph.nodes[report.nodeId]?.role===actor.value.role)),
      monthlyOwner(report){return preparation.graph.nodes[report.nodeId]?.role;},
      monthlyTitle(report){return preparation.graph.nodes[report.nodeId]?.title;},
      monthlyAction(action,report){
        try{
          if(!repository)throw new Error('Penyimpanan belum tersedia.');
          const result=repository.command({action,expectedVersion:report?.version,idempotencyKey:crypto.randomUUID(),data:{reportId:report?.id,period:workflow.monthPeriod,note:report ? workflow.monthNotes[report.id] : undefined,documentVersion:report?.versions.at(-1)?.number}},actor.value);
          sync(); if(report) delete workflow.monthNotes[report.id];error.value='';notice.value=result.message;
        }catch(cause){error.value=cause.message;}
      },
      wipId,wipRows,wipOrder,
      saveWip(action){
        if (!wipOrder.value) return;
        execute(action,{rows:clone(wipRows.value),wipId:wipOrder.value.wipVersions?.at(-1)?.id},wipOrder.value);
      },
      preparation: computed(() => !!selected.value && preparation.activeNode(selected.value)),
      configuration: computed(() => selected.value && preparation.activeNode(selected.value) ? preparation.configuration(taskView(selected.value)) : {}),
      fields: computed(() => selected.value && preparation.activeNode(selected.value) ? preparation.configuration(taskView(selected.value)).fields : fields[selected.value?.stage] || []),
      async chooseCertificate(event,person){
        const file=event.target.files?.[0];
        event.target.value='';
        if(!file)return;
        if(!['application/pdf','image/png','image/jpeg'].includes(file.type) || file.size>512*1024){
          error.value='Pilih surat asli PDF, PNG, atau JPEG maksimal 512 KB.';
          return;
        }
        const woId=selectedId.value;
        const actorId=actor.value.id;
        const reader=new FileReader();
        reader.onload=()=>{
          if(selectedId.value===woId && actor.value.id===actorId && (form.replacements || form.people || []).includes(person))person.certificateFile={name:file.name,content:reader.result};
        };
        reader.onerror=()=>{error.value='Berkas surat gagal dibaca.';};
        reader.readAsDataURL(file);
      },
      canSign, signaturePreview, signatureAspect,
      async chooseSignature(event){
        const file=event.target.files?.[0];
        event.target.value='';
        if(!file || !canSign.value)return;
        if(file.type!=='image/png' || file.size>128*1024){error.value='Pilih gambar tanda tangan PNG maksimal 128 KB.';return;}
        const wo=selected.value;
        const actorId=actor.value.id;
        try{
          const image=await new Promise((resolve,reject)=>{
            const reader=new FileReader();
            reader.onload=()=>resolve(reader.result);
            reader.onerror=()=>reject(Error('Gambar tanda tangan gagal dibaca.'));
            reader.readAsDataURL(file);
          });
          if(selected.value!==wo || actor.value.id!==actorId || !canSign.value)return;
          const preview=new Image();
          preview.src=image;
          await preview.decode();
          if(selected.value!==wo || actor.value.id!==actorId || !canSign.value)return;
          const config=preparation.configuration(taskView(wo));
          const jsaSlot=config.documentType==='JSA' ? {'asman_jaringan':.1,'p2k3_k3l':.53}[actor.value.role] : undefined;
          form.signature=jsaSlot===undefined?{image,x:.65,y:.78}:{image,x:jsaSlot,y:.852,page:1};
          await renderSignaturePreview();
        }catch(cause){error.value=cause.message;}
      },
      moveSignature(event){
        if(!form.signature || !event.currentTarget.hasPointerCapture(event.pointerId))return;
        const bounds=event.currentTarget.getBoundingClientRect();
        form.signature.x=Math.max(0,Math.min(.8,(event.clientX-bounds.left)/bounds.width-.08));
        form.signature.y=Math.max(0,Math.min(.88,(event.clientY-bounds.top)/bounds.height-.04));
      },
      removeSignature(){ delete form.signature; clearSignaturePreview(); },
      documentInputs: computed(() => {
        const wo=selected.value;
        if(!wo)return [];
        const config=preparation.configuration(taskView(wo));
        const editable=config.primary?.[0]==='document-submit' || ['Node_laporan_hasil_kepala_regu','Node_susun_pemberitahuan','Node_revisi_pemberitahuan','Node_laporan_harian'].includes(wo.nodeId);
        return global.IwomsDocumentDetails.detailFields[wo.stage==='survey'?'survey':editable?config.documentType:''] || [];
      }),
      jsaChecks: global.IwomsDocumentDetails.jsaChecks,
      heightChecks: global.IwomsDocumentDetails.heightChecks,
      documentRows: computed(() => {
        if(!selected.value)return [];
        if(selected.value.stage==='survey')return global.IwomsDocumentDetails.rowFields.survey;
        const config=preparation.configuration(taskView(selected.value));
        return config.primary?.[0]==='document-submit' ? global.IwomsDocumentDetails.rowFields[config.documentType] || [] : [];
      }),
      addDocumentRow() { (form.rows ||= []).push({}); },
      riskLevel: global.IwomsDocumentDetails.riskLevel,
      fixedChecklist: computed(()=>selected.value ? global.IwomsDocumentDetails.workChecks[taskView(selected.value).nodeId] || [] : []),
      beginFixedChecks(){
        const node=taskView(selected.value).nodeId;
        const previous=selected.value.fixedChecklistChecks?.findLast(entry=>entry.node===node)?.checks || [];
        form.fixedChecks=global.IwomsDocumentDetails.workChecks[node].map(([row])=>{
          const old=previous.find(entry=>entry.row===row);
          return {answer:old?.answer || '',note:old?.note || ''};
        });
      },
      beginItemChecks() {
        const wo=selected.value;
        const checklist=preparation.latestDocument(data.value,wo,'EQUIPMENT_CHECKLIST');
        form.itemChecks=checklist.items.map(()=>({answer:'',note:''}));
      },

      primary: computed(() => selected.value && preparation.activeNode(selected.value) ? preparation.configuration(taskView(selected.value)).primary : primary[selected.value?.stage]),
      taskTitle: computed(() => selected.value ? (preparation.activeNode(selected.value) ? preparation.graph.nodes[taskView(selected.value).nodeId]?.title : stages[selected.value.stage][2]) : ''),
      canAct: computed(() => !!selectedTask.value?.actionable),
      canCreate: computed(() => proposers.includes(activeRoleKey.value)),
      screenCode: activeScreenCode,
      screenPresentation: computed(() => workScreenPresentation[activeScreenCode.value] || workScreenPresentation.P03),
      entries: computed(() => visibleOrders.value.filter(wo => activeScreenCode.value === 'P04' ? !!wo.sokRequests?.length || preparation.configuration(taskView(wo)).screen === 'E03' : (preparation.activeNode(wo) ? preparation.configuration(taskView(wo)).screen || (wo.status==='WO Completed' ? 'R03' : 'P03') : stages[wo.stage][1]) === activeScreenCode.value)),
      notifications: computed(() => data.value.notifications.filter(item => item.recipientId === actor.value.id && item.unitId === actor.value.unitId)),
      history: computed(() => data.value.audits.filter(item => item.woId === selectedId.value)),
      documentVersions: computed(() => data.value.documents.filter(item => item.woId === selectedId.value && item.type!=='support-file' && item.type!=='proposal-attachment')),
      currentSok: computed(() => selected.value?.sokRequests?.at(-1)),
      currentGiEvent: computed(() => data.value.operations.findLast(event=>event.woId === selectedId.value && event.requestId === selected.value?.sokRequests?.at(-1)?.id && event.nodeId === 'Node_sok_petugas_gi')),
      operationEvents: computed(() => data.value.operations.filter(event => event.woId === selectedId.value)),
      currentDocument: computed(() => selected.value ? preparation.latestDocument(data.value, selected.value, preparation.configuration(taskView(selected.value)).documentType) : null),
      uploadedFiles: computed(() => {
        if (!selected.value) return [];
        const type = preparation.configuration(taskView(selected.value)).documentType;
        const version = (preparation.latestDocument(data.value, selected.value, type)?.version || 0) + 1;
        return data.value.documents.filter(doc => doc.woId === selectedId.value && doc.type === 'support-file' && doc.documentType === type && doc.forVersion === version);
      }),
      peopleChecks: computed(() => selected.value ? preparation.checkPeople(selected.value) : []),
      documentPreview,
      proposalTemplates,
      previewRegisterDocument(doc, wo = selected.value) {
        const template = proposalTemplates.find(item => item.type === doc.type && item.kode !== 'DOC-05');
        if (template) return this.previewTemplate(template, doc, wo);
        this.previewVersion(doc);
      },
      previewTemplate(template, version, wo = selected.value) {
        if (!wo) return;
        if (template.kode === 'DOC-03') {
          const file = data.value.documents.find(item => item.woId === wo.id && item.type === 'proposal-attachment' && item.slot === 'DOC-03');
          this.previewVersion({...file, woId:wo.id, type:template.nama, version:file?.version || '—', missingFile:!file});
          return;
        }
        if (template.type === 'WIP') {
          const wip = wo.wipVersions?.at(-1);
          this.previewVersion({...wip, woId:wo.id, type:template.nama, version:wip?.version || '—', missingFile:!wip});
          return;
        }
        selectedWO.value = clone(wo);
        context.bukaPratinjauDokumen({...template, registerVersion:version});
      },
      documentByType(woId, type) { return data.value.documents.filter(doc => doc.woId === woId && doc.type === type).at(-1); },
      actorNameFor(woId, action) { return data.value.audits.findLast(event => event.woId === woId && event.action === action)?.actor.name || '(Pelaku belum dicatat)'; },
      documentLabels: preparation.labels,
      nodeTitle(nodeId) { return preparation.graph.nodes[nodeId]?.title || nodeId; },
      readinessLabel(key) { return { equipmentReady:'Peralatan siap',materialReady:'Material siap',apdReady:'APD layak',participants:'Peserta',instructions:'Instruksi kerja',healthOk:'Kesehatan memenuhi',apdOk:'APD memenuhi',reason:'Hasil / catatan',briefing:'Materi safety briefing',counterpart:'Kepala Operasi yang dihubungi' }[key] || key; },
      typeLabel(value) { return { survey:'Formulir Survei', 'initial-risk-analysis':'Analisis awal JSA dan IBPPR', HEIGHT_CLOSURE:'Penutupan izin ketinggian',WORK_RESULT:'Laporan hasil',COMPLETION_NOTICE:'Pemberitahuan penyelesaian',DAILY_REPORT:'Laporan harian',WO_ARCHIVE:'Paket arsip WO',FILE_EVIDENCE:'Bukti kelengkapan',MISSING_FILE_REQUEST:'Permintaan kelengkapan',DELEGATION: 'Berita acara delegasi', HEIGHT_PERMIT: 'Izin Kerja Ketinggian', AUTHORITY_ROSTER: 'Surat Kewenangan personel', EQUIPMENT_CHECKLIST: 'Checklist peralatan dan material' }[value] || value; },
      statusLabel(value,type) { return value === 'issued' ? (['SP2B','SP3B'].includes(type) ? 'Terbit' : 'Izin telah dicatat') : { submitted: 'Menunggu pemeriksaan', rejected: 'Dikembalikan', approved: 'Disetujui', initial: 'Pengumpulan awal', replacement: 'Penggantian personel', renewal: 'Pembaruan surat' }[value] || value; },
      valueLabel(key,value,doc) { return ['workSupervisor','safetySupervisor'].includes(key) ? doc.rosterSnapshot?.people.find(person => person.personId === value)?.name || value : value; },
      previewVersion(doc) { documentPreview.value = clone(doc); nextTick(() => document.querySelector('[data-document-close]')?.focus()); },
      closeDocument() { documentPreview.value = null; nextTick(() => (document.querySelector('[data-wo-detail-close]') || document.querySelector('[data-workflow-heading]'))?.focus()); },
      trapDocumentFocus(event) {
        const buttons = [...event.currentTarget.querySelectorAll('button, a[href]')];
        const first = buttons[0]; const last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      },
      downloadVersion(doc) {
        const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }));
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = doc.type + '-v' + doc.version + '.json'; anchor.click(); URL.revokeObjectURL(url);
      },
      downloadFile(fileId) {
        const file = data.value.documents.find(doc => doc.id === fileId && doc.woId === (documentPreview.value?.woId || selectedId.value));
        if (!file) return;
        const anchor = document.createElement('a'); anchor.href = file.content; anchor.download = file.name; anchor.click();
      },
      addPerson() { (form.replacements || form.people).push(newPerson()); },
      checklistUnits: ['buah', 'set', 'unit', 'pasang', 'liter', 'm', 'kg', 'roll', 'pak'],
      actionDisabled(action) {
        if (busy.value) return true;
        if (action === 'initial-safe') return !form.conditionsOk;
        if (action === 'survey') return fields.survey.some(([key]) => !String(form[key] || '').trim());
        if (['reject','repeat','stop-survey','stop'].includes(action)) return !String(form.reason || '').trim();
        return false;
      },
      addChecklistItem() { form.items.push({category:'equipment',name:'',quantity:1,unit:'',condition:''}); },
      setReplacementTask(person) {
        const original = selected.value.authorityRoster.people.find(row => row.personId === person.replacesId);
        if (original) { person.duty = original.duty; person.requiredCompetence = original.requiredCompetence; }
      },
      attachments: computed(() => data.value.documents.filter(item => item.woId === selectedId.value && item.type === 'proposal-attachment')),
      catalog: context.masterKatalogList, open, create, submit, reload, upload,
      preview() {
        if (!selected.value) return;
        formP01.value = clone(selected.value);
        selectedWO.value = clone(selected.value);
        context.bukaPratinjauDokumen({ kode: selected.value.surveyVersions.length ? 'DOC-02' : 'DOC-01', nama: selected.value.surveyVersions.length ? 'Form Survei' : 'Usulan WO' });
      },
      close() { selectedId.value = null; error.value = ''; },
      async clearDrafts() {
        if (!await IwomsUI.confirmRemoval('Hapus semua draf?', 'Hanya WO yang masih berstatus draf pada unit ini yang akan dihapus.')) return;
        try {
          const count = repository.clearDrafts(actor.value);
          if (selected.value?.stage === 'draft') selectedId.value = null;
          sync();
          error.value = '';
          notice.value = count ? count + ' draf dihapus dari penyimpanan browser.' : 'Tidak ada draf untuk dihapus.';
        } catch (cause) { error.value = cause.message; }
      },
      async reset() {
        if (!await IwomsUI.confirmRemoval('Reset demo kerja?', 'Seluruh WO dan keputusan demo pada browser ini akan dihapus.')) return;
        try { repository.reset(actor.value); selectedId.value = null; sync(); notice.value = 'Dataset demo kerja sudah kosong.'; } catch (cause) { error.value = cause.message; }
      },
      formatTime(value) { return Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : value || 'Belum tercatat'; },
      actionLabel(value) { return preparation.actionLabels[value] || { create: 'Draft dibuat', save: 'Draft disimpan', submit: 'Usulan diajukan', approve: 'Usulan disetujui', reject: 'Usulan dikembalikan', return: 'Diteruskan kepada pengusul', stop: 'Pengajuan dihentikan', priority: 'Prioritas ditetapkan', survey: 'Hasil survei disimpan', analysis: 'Analisis awal diajukan', feasibility: 'Kelayakan diputuskan', notify: 'Pengusul diberi tahu', plan: 'Rencana disimpan', reclassify: 'Penugasan lama ditinjau', attach: 'Lampiran disimpan' }[value] || value; },
    });
    const shownNotifications = new Set();
    watch([error, notice, () => workflow.notifications], ([failure, message, notifications], previous = []) => {
      if (failure && failure !== previous[0]) {
        notify('Tindakan belum berhasil', failure, 'error');
        return;
      }
      const unread = notifications.filter(item => !shownNotifications.has(item.id));
      if (unread.length) {
        unread.forEach(item => shownNotifications.add(item.id));
        notify('Hasil survei', unread.map(item => item.woId + ' · ' + item.message).join('\n'), 'info', 9000);
      } else if (message && message !== previous[1]) {
        notify('Informasi WO', message, 'info');
      }
    }, { immediate: true, flush: 'sync' });
    const guardLegacy = handler => wo => {
      if (wo?.processVersion) { error.value = 'Gunakan tugas aktif pada Perencanaan untuk WO BPMN ini.'; return; }
      return handler(wo);
    };
    const overrides = {
      workflow, onRoleChange, filteredMyActions: actions,
      draftList: computed(() => visibleOrders.value.filter(wo => wo.stage === 'draft')),
      openNewWOModal: create, editDraftWO: wo => referenceMode.value ? context.editDraftWO(wo) : open(wo), executeAction: act => { if(act.targetScreen==='R02'){ activeScreenCode.value='R02'; activeMenu.value='pelaporan'; wipId.value=act.wo.id; } else if (['draft','revision'].includes(act.wo.stage) || referenceMode.value) open(act.wo); else workflow.showDetail(act.wo,'tugas'); },
      approveStepAsman: wo => execute('approve', {}, wo), approveStepSupervisor: wo => execute('approve', {}, wo), approveStepManajer: wo => execute('approve', {}, wo),
      direksiApproveWO: wo => open(wo), direksiRejectWO: wo => open(wo),
      rejectStep: wo => open(wo),
      otorisasiPenuhSuperAdmin: () => { error.value = 'Persetujuan dilakukan oleh aktor pada gilirannya.'; },
      preparatorScheduleWO: wo => { open(wo); }, preparatorReturnToDireksi: wo => open(wo),
      sampleAuditLogs: computed(() => selectedWO.value?.processVersion ? data.value.audits.filter(item => item.woId === selectedWO.value.id).map(item => ({ time: workflow.formatTime(item.at), action: item.action, actor: item.actor.name, role: item.actor.role })) : context.sampleAuditLogs),
      sampleCrew: computed(() => selectedWO.value?.processVersion ? (selectedWO.value.authorityRoster?.people || []).map(person => ({ id: person.personId, name: person.name, role: person.duty })) : context.sampleCrew),
    };
    for (const name of ['mulaiPekerjaanLapangan', 'jedaOperasional', 'lanjutOperasional', 'selesaikanPekerjaanLapangan', 'tutupWODireksi', 'kembalikanRevisiLaporan']) overrides[name] = guardLegacy(context[name]);
    for (const key of ['asman_jaringan', 'manajer_area', 'supervisor_pdkb', 'preparator_pdkb', 'p2k3_k3l', 'pengawas_k3', 'bagian_terkait', 'kepala_regu']) {
      if (!roleAllowedScreens[key].includes('P03')) roleAllowedScreens[key].push('P03');
    }
    roleAllowedScreens.bagian_terkait = roleAllowedScreens.bagian_terkait.filter(code => code !== 'P02');
    roleAllowedScreens.komisi_unit = roleAllowedScreens.komisi_unit.filter(code => code !== 'R03');
    for(const code of ['asman_jaringan','manajer_area','p2k3_k3l']) if(!roleAllowedScreens[code].includes('R01'))roleAllowedScreens[code].push('R01');
    for(const code of ['supervisor_pdkb','asman_jaringan']) if(!roleAllowedScreens[code].includes('R05'))roleAllowedScreens[code].push('R05');
    for (const key of ['kepala_regu','piket_area','piket_apd','petugas_gi']) if (!roleAllowedScreens[key].includes('E03')) roleAllowedScreens[key].push('E03');
    for (const key of ['pelaksana_pdkb','kepala_regu','pengawas_k3']) if (!roleAllowedScreens[key].includes('P03')) roleAllowedScreens[key].push('P03');
    return overrides;
  }

  function newPerson() {
    return { personId: crypto.randomUUID(), name: '', duty: '', requiredCompetence: '', certificateNo: '', competence: '', validFrom: '', validUntil: '', evidence: '' };
  }

  const taskFormTemplate = `<div v-if="w.selected">
            <form v-if="w.canAct" @submit.prevent="w.submit(w.primary[0])" class="space-y-4">
              <div v-if="w.configuration.checklist" class="space-y-3"><fieldset v-for="(item,index) in w.form.items" :key="index" class="grid sm:grid-cols-2 gap-3 border border-slate-200 rounded-lg p-4"><legend class="text-sm px-2">Item {{ index+1 }}</legend><label class="text-xs">Jenis<select v-model="item.category" :name="'item-'+index+'-category'" class="block w-full mt-1 border border-slate-300 rounded-lg p-2"><option value="equipment">Peralatan</option><option value="material">Material</option></select></label><label v-for="field in [['name','Nama item','text'],['quantity','Jumlah','number'],['unit','Satuan','select'],['condition','Kondisi / spesifikasi','text']]" :key="field[0]" class="text-xs">{{ field[1] }}<select v-if="field[2]==='select'" v-model="item.unit" :name="'item-'+index+'-unit'" class="block w-full mt-1 border border-slate-300 rounded-lg p-2"><option value="">Pilih satuan</option><option v-if="item.unit && !w.checklistUnits.includes(item.unit)">{{ item.unit }}</option><option v-for="unit in w.checklistUnits" :key="unit">{{ unit }}</option></select><input v-else v-model="item[field[0]]" :name="'item-'+index+'-'+field[0]" :type="field[2]" class="block w-full mt-1 border border-slate-300 rounded-lg p-2"></label><button v-if="w.form.items.length>1" type="button" @click="w.form.items.splice(index,1)" class="text-xs text-red-700 underline text-left">Hapus item</button></fieldset><button type="button" @click="w.addChecklistItem" class="border border-slate-300 rounded-lg px-3 py-2 text-xs">Tambah item</button></div>
              <div v-if="w.configuration.roster" class="space-y-4">
                <p class="text-sm text-slate-600">Isi data sesuai surat dan tugas dalam rencana pelaksanaan. Masa berlaku diperiksa pada tanggal rencana {{ w.selected.plan?.date }}. Pilih masa berlaku yang mencakup tanggal rencana. Salin nomor dari Surat Kewenangan yang diterbitkan. Pisahkan kode kompetensi dengan koma bila lebih dari satu.</p>
                <fieldset v-for="(person,index) in (w.form.replacements || w.form.people)" :key="person.personId" class="border border-slate-200 rounded-lg p-4 space-y-3"><legend class="px-2 text-sm">{{ w.configuration.roster === 'replacement' ? 'Calon pengganti' : 'Personel' }} {{ index + 1 }}</legend>
                  <label v-if="w.configuration.roster === 'replacement'" class="block text-xs">Menggantikan personel<select v-model="person.replacesId" @change="w.setReplacementTask(person)" :name="'person-'+index+'-replacesId'" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih personel asal</option><option v-for="old in w.selected.authorityRoster.people" :key="old.personId" :value="old.personId">{{ old.name }} · {{ old.duty }}</option></select></label>
                  <div class="grid sm:grid-cols-2 gap-4"><label v-for="field in [['name','Nama'],['duty','Tugas'],['requiredCompetence','Kode kompetensi yang diperlukan'],['certificateNo','Nomor Surat Kewenangan'],['competence','Kode kompetensi pada surat'],['validFrom','Berlaku sejak','date'],['validUntil','Berlaku sampai','date'],['evidence','Rujukan bukti surat / nomor berkas']]" :key="field[0]" class="text-xs text-slate-700">{{ field[1] }}<input v-model="person[field[0]]" :name="'person-'+index+'-'+field[0]" :type="field[2] || 'text'" :disabled="(['renewal','fulfillment'].includes(w.configuration.roster) && ['name','duty','requiredCompetence'].includes(field[0])) || (w.configuration.roster === 'replacement' && ['duty','requiredCompetence'].includes(field[0]))" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm disabled:bg-slate-100"></label></div>
                  <label class="block text-xs">Surat asli per personel, PDF/PNG/JPEG maksimal 512 KB
                    <input type="file" accept="application/pdf,image/png,image/jpeg" class="mt-1 block w-full" @change="w.chooseCertificate($event,person)">
                  </label>
                  <div v-if="person.certificateFile" class="flex flex-wrap items-center gap-2 text-xs">
                    <span>{{ person.certificateFile.name }}</span><button type="button" class="text-red-700 underline" @click="delete person.certificateFile">Hapus surat</button>
                  </div>
                  <button v-if="['collect','replacement'].includes(w.configuration.roster) && (w.form.replacements || w.form.people).length > 1" type="button" @click="(w.form.replacements || w.form.people).splice(index,1)" class="text-red-700 text-xs underline">Hapus baris personel ini</button>
                </fieldset>
                <button v-if="['collect','replacement'].includes(w.configuration.roster)" type="button" @click="w.addPerson" class="border border-slate-300 px-4 py-2 rounded-lg text-xs">Tambah personel</button>
              </div>
              <p v-if="w.selected.stage==='survey'" class="rounded-lg bg-sky-50 p-3 text-sm text-slate-700">Catat tanggal dan lokasi, kondisi jaringan dan hasil pengukuran, akses, kebutuhan peralatan/APD dan material, lalu rangkum analisis awal JSA dan IBPPR.</p>
              <div v-if="w.selected.stage==='survey'" class="grid gap-2 sm:grid-cols-2">
                <label class="text-xs">Gambar lokasi, PNG/JPEG maksimal 512 KB <input type="file" accept="image/png,image/jpeg" class="block w-full" @change="w.upload($event,'GAMBAR-LOKASI')"></label>
                <label class="text-xs">Peta lokasi, PNG/JPEG maksimal 512 KB <input type="file" accept="image/png,image/jpeg" class="block w-full" @change="w.upload($event,'PETA-LOKASI')"></label>
              </div>
              <ul v-if="w.surveyEvidenceFiles.length" class="space-y-1 text-xs text-slate-600">
                <li v-for="file in w.surveyEvidenceFiles" :key="file.id">{{ file.slot==='GAMBAR-LOKASI' ? 'Gambar lokasi' : 'Peta lokasi' }} &middot; {{ file.name }}</li>
              </ul>
              <p v-if="w.selected.nodeId==='Node_tindak_lanjut_kewenangan'" class="rounded-lg bg-sky-50 p-3 text-sm text-slate-700">Supervisor menentukan apakah calon pengganti tersedia. Preparator memasukkan data calon dan memeriksa suratnya pada tugas berikutnya.</p>
              <div class="grid sm:grid-cols-2 gap-4"><label v-for="field in [...w.fields,...w.documentInputs]" :key="field[0]" v-show="!w.form.rows?.length || !w.documentRows.length || !(['steps','hazards','controls','responsible','riskAssessment','residualRisk','workers'].includes(field[0]) && (w.configuration.documentType!=='HEIGHT_PERMIT' || field[0]==='workers'))" class="block text-xs text-slate-700" :class="{'sm:col-span-2': ['textarea','checkbox'].includes(field[2]), 'flex items-center gap-2': field[2]==='checkbox'}"><span>{{ field[1] }}</span>
                <textarea v-if="field[2]==='textarea'" v-model="w.form[field[0]]" :name="field[0]" rows="3" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"></textarea>
                <input v-else-if="field[2]==='checkbox'" v-model="w.form[field[0]]" type="checkbox" :name="field[0]" class="order-first h-4 w-4 shrink-0">
                <select v-else-if="field[2]==='person'" v-model="w.form[field[0]]" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih personel terverifikasi</option><option v-for="person in w.selected.authorityRoster.people" :key="person.personId" :value="person.personId">{{ person.name }} · {{ person.duty }}</option></select>
                <select v-else-if="field[2]==='catalog'" v-model="w.form[field[0]]" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih katalog</option><option v-for="item in w.catalog" :key="item.id" :value="item.id">{{ item.nama_pekerjaan }}</option></select>
                <select v-else-if="field[2]==='priority'" v-model="w.form[field[0]]" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih prioritas</option><option>Normal</option><option>Tinggi</option><option>Mendesak</option></select>
                <select v-else-if="field[2]==='owner'" v-model="w.form[field[0]]" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih pengusul</option><option value="tl_op">TL OP</option><option value="tl_har">TL HAR</option><option value="tl_konstruksi">TL Konstruksi</option></select>
                <input v-else v-model="w.form[field[0]]" :type="field[2] || 'text'" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm">
              </label></div>
              <div v-if="w.documentRows.length" class="space-y-3">
                <fieldset v-for="(row,index) in w.form.rows" :key="index" class="rounded-lg border border-slate-200 bg-white p-3">
                  <legend class="px-1 text-xs font-bold">Baris {{ index + 1 }}</legend>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <label v-for="[key,label] in w.documentRows" :key="key" class="text-xs">
                      {{ label }}
                      <select v-if="key==='category'" v-model="row[key]" :name="'document-row-'+index+'-'+key" class="mt-1 block w-full rounded border border-slate-300 p-2">
                        <option value="">Pilih jenis</option><option value="equipment">Peralatan</option><option value="apd">APD</option><option value="material">Material</option>
                      </select>
                      <select v-else-if="['consequence',,'residualConsequence','likelihood','residualLikelihood'].includes(key)" v-model="row[key]" :name="'document-row-'+index+'-'+key" class="mt-1 block w-full rounded border border-slate-300 p-2">
                        <option value="">Pilih nilai</option><option v-for="option in (key.toLowerCase().includes('likelihood') ? ['A','B','C','D','E'] : ['1','2','3','4','5'])" :key="option">{{ option }}</option>
                      </select>
                      <output v-else-if="key==='riskAssessment' || key==='residualRisk'" class="mt-1 block rounded border border-slate-200 bg-slate-50 p-2">{{ (key==='riskAssessment' ? w.riskLevel(row.likelihood,row.consequence) : w.riskLevel(row.residualLikelihood,row.residualConsequence)) || '-' }}</output>
                      <input v-else v-model="row[key]" :name="'document-row-'+index+'-'+key" class="mt-1 block w-full rounded border border-slate-300 p-2">
                    </label>
                  </div>
                  <button type="button" class="mt-2 text-xs text-red-700 underline" @click="w.form.rows.splice(index,1)">Hapus baris</button>
                </fieldset>
                <button type="button" :disabled="w.form.rows?.length >= (w.configuration.documentType==='HEIGHT_PERMIT' ? 8 : 50)" class="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50" @click="w.addDocumentRow()">Tambah baris terstruktur</button>
              </div>
              <details v-if="w.form.heightCheckAnswers" class="rounded-lg border border-slate-200 bg-white p-3">
                <summary class="cursor-pointer text-xs font-bold">Salin hasil pemeriksaan CP</summary>
                <p class="mt-2 text-xs text-slate-600">Gunakan hasil pemeriksaan CP yang sudah tersedia dan lampirkan buktinya bila ada.</p>
                <fieldset v-for="[group,checks] in w.heightChecks" :key="group" class="mt-3 grid gap-2 rounded border p-2 sm:grid-cols-2">
                  <legend class="px-1 text-xs font-bold">{{ group }}</legend>
                  <label v-for="[row,label] in checks" :key="row" class="text-xs">
                    {{ label }}<select v-model="w.form.heightCheckAnswers[row]" class="mt-1 block w-full rounded border p-2">
                      <option value="">Belum dicatat</option><option value="yes">YES</option><option value="na">N/A</option>
                    </select>
                  </label>
                </fieldset>
              </details>
              <fieldset v-if="w.configuration.documentType==='JSA' && w.primary?.[0]==='document-submit'" class="rounded-lg border border-slate-200 bg-white p-3">
                <legend class="px-1 text-xs font-bold">APD dan perlengkapan darurat pada JSA</legend>
                <div class="grid gap-2 sm:grid-cols-2">
                  <label v-for="label in w.jsaChecks" :key="label" class="flex items-center gap-2 text-xs">
                    <input type="checkbox" v-model="w.form.jsaChecks" :value="label"> {{ label }}
                  </label>
                </div>
              </fieldset>
              <fieldset v-if="w.selected.nodeId==='Node_periksa_kesiapan_lapangan' && w.currentDocument?.items?.length" class="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                <legend class="px-1 text-xs font-bold">Pemeriksaan ulang per item</legend>
                <button v-if="!w.form.itemChecks" type="button" class="text-xs font-semibold text-pln-blue underline" @click="w.beginItemChecks()">Periksa setiap item</button>
                <div v-for="(check,index) in w.form.itemChecks" :key="index" class="grid gap-2 sm:grid-cols-3">
                  <p class="text-xs font-semibold">{{ w.currentDocument.items[index].name }}</p>
                  <label class="text-xs">Hasil<select v-model="check.answer" class="block w-full rounded border p-2"><option value="">Pilih hasil</option><option value="yes">Ada</option><option value="no">Tidak</option></select></label>
                  <label class="text-xs">Keterangan<input v-model="check.note" class="block w-full rounded border p-2"></label>
                </div>
              </fieldset>
              <fieldset v-if="w.fixedChecklist.length" class="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                <legend class="px-1 text-xs font-bold">Butir pada lembar Checklist Pengawasan K3</legend>
                <button v-if="!w.form.fixedChecks" type="button" class="text-xs font-semibold text-pln-blue underline" @click="w.beginFixedChecks()">Isi checklist lembar sumber</button>
                <div v-for="(check,index) in w.form.fixedChecks" :key="index" class="grid gap-2 sm:grid-cols-3">
                  <p class="text-xs font-semibold">{{ w.fixedChecklist[index][1] }}</p>
                  <label class="text-xs">Hasil<select v-model="check.answer" class="block w-full rounded border p-2"><option value="">Belum dicatat</option><option value="yes">Ada</option><option value="no">Tidak</option></select></label>
                  <label class="text-xs">Keterangan<input v-model="check.note" maxlength="500" class="block w-full rounded border p-2"></label>
                </div>
              </fieldset>
              <fieldset v-if="w.canSign" class="space-y-3 rounded-lg border border-slate-300 bg-white p-3">
                <legend class="px-1 text-xs font-bold">Tanda tangan pada versi ini</legend>
                <label class="block text-xs">Unggah gambar PNG, maksimal 128 KB
                  <input type="file" accept="image/png" class="mt-1 block w-full" @change="w.chooseSignature">
                </label>
                <template v-if="w.form.signature">
                  <p class="text-xs text-slate-600">Geser tanda tangan pada halaman yang tampil atau gunakan pengatur posisi.</p>
                  <div class="relative mx-auto max-w-md overflow-hidden border bg-slate-50" :style="{aspectRatio:w.signatureAspect}">
                    <iframe v-if="w.signaturePreview" tabindex="-1" class="pointer-events-none h-full w-full" :src="w.signaturePreview+'#page='+((w.form.signature.page || 0)+1)+'&toolbar=0&navpanes=0&scrollbar=0&view=Fit'" title="Posisi tanda tangan pada dokumen"></iframe>
                    <div class="absolute inset-0 touch-none" @pointerdown="$event.currentTarget.setPointerCapture($event.pointerId); w.moveSignature($event)" @pointermove="w.moveSignature">
                      <img :src="w.form.signature.image" alt="Tanda tangan yang ditempatkan" class="pointer-events-none absolute w-[17%] object-contain object-left-top" :style="{left:(w.form.signature.x*100)+'%',top:(w.form.signature.y*100)+'%',maxHeight:w.form.signature.page===1?'5%':'10%'}">
                    </div>
                  </div>
                  <div class="grid gap-2 sm:grid-cols-2">
                    <label class="text-xs">Kiri ke kanan <input type="range" min="0" max="0.8" step="0.01" v-model.number="w.form.signature.x" class="block w-full"></label>
                    <label class="text-xs">Atas ke bawah <input type="range" min="0" max="0.88" step="0.01" v-model.number="w.form.signature.y" class="block w-full"></label>
                  </div>
                  <button type="button" class="text-xs text-red-700 underline" @click="w.removeSignature">Hapus tanda tangan</button>
                </template>
              </fieldset>
              <div class="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                <button type="submit" :disabled="w.actionDisabled(w.primary[0])" class="bg-pln-blue text-white px-5 py-2.5 rounded-lg text-xs font-bold disabled:opacity-50">{{ w.primary[1] }}</button>
                <button v-for="option in w.configuration.alternatives || []" :key="option[0]" type="button" @click="w.submit(option[0])" :disabled="w.busy" class="border border-amber-300 text-slate-800 px-4 py-2.5 rounded-lg text-xs disabled:opacity-50">{{ option[1] }}</button>
                <button v-if="['draft','revision'].includes(w.selected.stage)" type="button" @click="w.submit('save')" class="border border-slate-300 px-4 py-2.5 rounded-lg text-xs">Simpan draft perbaikan</button>
                <button v-if="w.selected.stage === 'revision'" type="button" @click="w.submit('stop')" :disabled="w.actionDisabled('stop')" class="disabled:opacity-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">Hentikan pengajuan</button>
                <button v-if="['asman','supervisor','manager'].includes(w.selected.stage)" type="button" @click="w.submit('reject')" :disabled="w.actionDisabled('reject')" class="disabled:opacity-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">Tolak dan kembalikan</button>
                <template v-if="w.selected.stage === 'feasibility'"><button type="button" @click="w.submit('repeat')" :disabled="w.actionDisabled('repeat')" class="disabled:opacity-50 border border-amber-300 px-4 py-2.5 rounded-lg text-xs">Minta survei ulang</button><button type="button" @click="w.submit('stop-survey')" :disabled="w.actionDisabled('stop-survey')" class="disabled:opacity-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">Hentikan karena tidak layak</button></template>
              </div>
            </form>
            <div v-if="['draft','revision'].includes(w.selected.stage) && w.canAct" class="mt-5 border-t border-slate-200 pt-4"><label class="block text-xs text-slate-700">Simpan draft dan lampirkan PDF / gambar (maksimal 2 MB)<input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" @change="w.upload" class="block w-full mt-2 text-sm"></label></div>
            <label v-if="w.selected.nodeId==='Node_laporan_hasil_kepala_regu' && w.canAct" class="mt-4 block text-xs">Keterangan lampiran berikutnya
              <input v-model="w.form.attachmentCaption" maxlength="500" class="mt-1 block w-full rounded border border-slate-300 p-2">
            </label>
            <div v-if="w.configuration.upload && w.canAct" class="mt-5 border-t border-slate-200 pt-4"><label class="block text-xs">Berkas pendukung dokumen, opsional (PDF / gambar maksimal 2 MB)<input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" @change="w.upload" class="block w-full mt-2 text-sm"></label></div>
            <ul v-if="w.uploadedFiles.length" class="mt-3 text-xs space-y-2"><li v-for="file in w.uploadedFiles" :key="file.id">{{ file.name }} · untuk versi {{ file.forVersion }} <button type="button" @click="w.downloadFile(file.id)" class="text-pln-blue underline ml-2">Unduh</button></li></ul>
      </div>`;

  global.IwomsWorkspace = {
    createBridge,
    previewComponent: {
      props: ['w'],
      template: `        <div v-if="w.documentPreview" class="fixed inset-0 z-[100] bg-slate-950/70 flex items-center justify-center p-4" @click.self="w.closeDocument">
          <section role="dialog" aria-modal="true" aria-label="Pratinjau versi dokumen" @keydown.esc.stop="w.closeDocument" @keydown.tab="w.trapDocumentFocus" class="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-5 sm:p-7 text-sm">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4"><h2 class="font-medium text-lg">{{ w.typeLabel(w.documentPreview.type) }} · versi {{ w.documentPreview.version }}</h2><button data-document-close type="button" @click="w.closeDocument" class="border border-slate-300 rounded-lg px-4 py-2 text-xs">Tutup dokumen</button></div>

            <p class="text-xs text-slate-500 mb-3">{{ w.documentPreview.woId }} · {{ w.statusLabel(w.documentPreview.status || w.documentPreview.kind,w.documentPreview.type) }} · persetujuan dalam demo</p>
            <p v-if="w.documentPreview.sourceSurveyVersion" class="text-xs text-slate-500 mb-4">Berdasarkan survei versi {{ w.documentPreview.sourceSurveyVersion }}</p>
            <p v-if="w.documentPreview.missingFile" class="py-3 text-slate-600">Belum ada berkas atau hasil pemeriksaan tersimpan untuk WO ini.</p>
            <a v-if="w.documentPreview.content" :href="w.documentPreview.content" :download="w.documentPreview.name" class="text-pln-blue underline">Unduh berkas asli</a>
            <img v-if="w.documentPreview.mime?.startsWith('image/')" :src="w.documentPreview.content" :alt="w.documentPreview.name" class="mt-3 max-w-full">
            <iframe v-if="w.documentPreview.mime === 'application/pdf'" :src="w.documentPreview.content" title="Pratinjau PDF tersimpan" class="mt-3 h-[60vh] w-full"></iframe>
            <div class="iwoms-table-host" v-datatable v-if="w.documentPreview.rows?.length"><table class="w-full text-left text-xs"><thead><tr><th>Butir pemeriksaan</th><th>Jawaban</th><th>Catatan</th></tr></thead><tbody><tr v-for="row in w.documentPreview.rows" :key="row.no" class="border-t"><td class="p-2">{{ row.text }}</td><td class="p-2">{{ row.answer }}</td><td class="p-2">{{ row.note }}</td></tr></tbody></table></div>
            <dl class="space-y-4"><div v-for="(value,key) in w.documentPreview.payload" :key="key"><dt class="font-medium">{{ w.documentLabels[key] || key }}</dt><dd class="mt-1 whitespace-pre-wrap break-words">{{ w.valueLabel(key,value,w.documentPreview) }}</dd></div></dl>
            <ul v-if="w.documentPreview.people || w.documentPreview.rosterSnapshot" class="space-y-4 mt-4"><li v-for="person in (w.documentPreview.people || w.documentPreview.rosterSnapshot.people)" :key="person.personId" class="border border-slate-200 rounded-lg p-3"><p>{{ person.name }} · {{ person.duty }}</p><p>{{ person.certificateNo }} · {{ person.validFrom }} s.d. {{ person.validUntil }}</p><p>Kompetensi · {{ person.competence }} · bukti {{ person.evidence }}</p></li></ul>
            <h3 class="font-medium mt-5 mb-3">Keputusan pada versi ini</h3><p v-if="!w.documentPreview.decisions?.length" class="text-slate-500">Belum ada keputusan pemeriksaan pada versi ini.</p>
            <ol v-if="w.documentPreview.decisions?.length" class="iwoms-timeline" role="list">
            <li v-for="decision in w.documentPreview.decisions" :key="decision.id">
              <div class="iwoms-timeline__content">
                <div class="iwoms-timeline__heading"><strong>{{ w.statusLabel(decision.result) }}</strong><time :datetime="decision.at">{{ w.formatTime(decision.at) }}</time></div>
                <p class="iwoms-timeline__meta">{{ decision.actorName }} · {{ decision.role.replaceAll('_',' ') }}</p>
                <p v-if="decision.reason || decision.note">{{ decision.reason || decision.note }}</p>
              </div>
            </li>
            </ol>
            <ul v-if="w.documentPreview.documentIds?.length" class="mt-3 text-xs"><li v-for="id in w.documentPreview.documentIds" :key="id">{{ w.typeLabel((w.detail ? w.detailDocuments : w.documentVersions).find(doc=>doc.id===id)?.type || id) }} / versi {{ (w.detail ? w.detailDocuments : w.documentVersions).find(doc=>doc.id===id)?.version }}</li></ul>
            <p v-for="entry in w.documentPreview.objections || []" :key="entry.at" class="mt-2">Kendala penutupan / {{ entry.actorName }} / {{ entry.note }}</p>
            <p v-if="w.documentPreview.received" class="mt-3">Diterima {{ w.documentPreview.received.actorName }} / {{ w.formatTime(w.documentPreview.received.at) }}</p>
            <p v-if="w.documentPreview.recordedAt" class="mt-4">Izin dicatat pada {{ w.formatTime(w.documentPreview.recordedAt) }}</p>
            <div class="flex flex-wrap gap-3 mt-5"><button v-for="(fileId,index) in w.documentPreview.fileIds || []" :key="fileId" type="button" @click="w.downloadFile(fileId)" class="border border-slate-300 rounded-lg px-4 py-2 text-xs">Unduh berkas pendukung {{ index+1 }}</button><button type="button" @click="w.downloadVersion(w.documentPreview)" class="bg-pln-blue text-white rounded-lg px-4 py-2 text-xs">Unduh data versi ini</button></div>
          </section>
        </div>
`,
    },
    detailComponent: {
      props: ['w', 'statusClass'],
      components: { 'detail-records': global.IwomsDetailRecords },
      template: `
        <div v-if="w.detail" class="wo-modal-overlay">
          <section role="dialog" aria-modal="true" aria-labelledby="wo-detail-title" :inert="w.detailPreviewOpen"
            @keydown.esc.stop.prevent @keydown.tab="w.trapDetailFocus"
            class="wo-modal">
            <header class="wo-modal-header">
              <div class="wo-modal-title">
                <strong>Detail WO</strong>
                <button data-wo-detail-close type="button" aria-label="Tutup detail WO" @click="w.closeDetail">&times;</button>
              </div>
                <div class="inline-flex max-w-full items-stretch rounded-lg bg-gray-200 text-slate-900">
                  <span class="min-w-0 break-words px-2.5 py-1 text-sm font-bold">{{ w.detail.officialWoNumber || w.detail.id }}</span>
                  <button type="button" aria-label="Salin ID WO" title="Salin ID WO" class="grid min-w-9 shrink-0 place-items-center rounded-r-lg border-l border-gray-300 hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-700" @click="w.copyDetailId()">
                    <svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M15 8H5V3h10v5ZM5 8v7h5"/><rect x="10" y="8" width="10" height="12" rx="1"/>
                    </svg>
                  </button>
                </div>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold" :class="statusClass">{{ w.detail.status }}</span>
                  <span v-if="w.detail.kondisi_operasi" class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold" :class="w.detail.kondisi_operasi === 'Padam' ? 'bg-red-500 text-white' : 'bg-pln-yellow text-slate-900'">{{ w.detail.kondisi_operasi === 'Padam' ? 'Padam 20 kV' : 'Tanpa Padam (PDKB)' }}</span>
                </div>
                <h2 id="wo-detail-title" class="wo-modal-wo-name">{{ w.detail.nama_wo || 'Draf WO' }}</h2>
                <p class="break-words text-xs text-slate-600">{{ [w.detail.penugasan, w.detail.unitId].filter(Boolean).join(' &middot; ') }}</p>

            </header>
            <div data-wo-scroll class="wo-modal-scroll">
              <section class="wo-modal-box">
                <h3>Informasi WO</h3>
                <dl class="wo-modal-info">
                  <div v-for="[label,value] in w.detailInfo" :key="label">
                    <dt class="text-xs text-slate-600">{{ label }}</dt><dd class="break-words font-semibold">{{ value || 'Belum tercatat' }}</dd>
                  </div>
                </dl>
                <div v-if="w.detail.nama_pekerjaan || w.detail.uraian" class="wo-modal-description">
                  <p v-if="w.detail.nama_pekerjaan"><strong>Jenis pekerjaan</strong><br><span v-if="w.detail.catalogCode" class="wo-modal-muted">{{ w.detail.catalogCode }}<br></span>{{ w.detail.nama_pekerjaan }}</p>
                  <p v-if="w.detail.uraian"><strong>Uraian pekerjaan</strong><br>{{ w.detail.uraian }}</p>
                </div>
              </section>
              <section v-if="w.detailTasks.length || w.canOpenWip" data-wo-task tabindex="-1" class="wo-modal-box wo-modal-task" :class="{'wo-modal-task--hold': ['On Hold','Hold Review','Work Stopped'].includes(w.detail.status)}">
                <div class="wo-modal-task-heading">
                  <div><p class="wo-modal-task-label">Tugas aktif</p><h3>{{ w.canAct ? w.taskTitle : (w.detailTasks[0]?.title || 'Pengawasan pekerjaan') }}</h3></div>
                  <span v-if="w.detailTasks.length === 1" class="wo-modal-role">{{ w.roleTitle(w.detailTasks[0].role) }}</span>
                </div>
                <ul v-if="w.detailTasks.length > 1" class="wo-modal-task-list">
                  <li v-for="task in w.detailTasks" :key="task.id"><span>{{ task.title }}</span><span class="wo-modal-role">{{ w.roleTitle(task.role) }}</span></li>
                </ul>
                <p v-if="w.detail.pendingHold?.reason || w.detail.reject_reason" class="mb-3">{{ w.detail.pendingHold?.reason || w.detail.reject_reason }}</p>
                <template v-if="w.canAct && !w.proposalOpen">
                  <div v-if="w.currentDocument" class="mb-3 rounded-lg border border-sky-200 bg-white p-3">
                    <p class="font-semibold">{{ w.typeLabel(w.currentDocument.type) }} &middot; Versi {{ w.currentDocument.version }}</p>
                    <button type="button" class="text-pln-blue underline" @click="w.previewVersion(w.currentDocument)">Lihat versi dan persetujuan</button>
                  </div>
                  ${taskFormTemplate}
                </template>
                <button v-if="w.canOpenWip" type="button" class="mt-3 rounded-lg border border-sky-300 bg-white px-3 py-2 font-semibold text-pln-blue" @click="w.openDetailWip()">Buka formulir WIP</button>
              </section>
              <detail-records :key="w.detail.id" :w="w"></detail-records>
              <section class="wo-modal-groups"><h3>Hasil tahap sebelumnya</h3>
                <dl aria-label="Pihak terkait" class="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
                  <div v-for="[label,value] in w.detailParties" :key="label">
                    <dt class="block text-[10px] font-semibold uppercase text-slate-600">{{ label }}</dt>
                    <dd class="break-words font-bold text-slate-900">{{ value || 'Belum tercatat' }}</dd>
                  </div>
                </dl>
                <details v-for="group in w.historyGroups.filter(item=>item.events.length)" :key="group.title" class="wo-modal-group">
                  <summary><span><strong>{{ group.title }}</strong><br><span class="wo-modal-muted">{{ w.historyTitle(group.events.at(-1)) }}</span></span></summary>
                  <p class="wo-modal-stage-note">{{ group.events.at(-1).actor.name }} &middot; {{ w.formatTime(group.events.at(-1).at) }}</p>
                </details>
                <section v-if="w.detail.feasibility"><h3 class="mb-1 font-semibold">Hasil kelayakan</h3><p class="whitespace-pre-wrap break-words text-slate-700">{{ { feasible: 'Layak', repeat: 'Survei ulang', stop: 'Tidak layak' }[w.detail.feasibility.decision] }} · {{ w.detail.feasibility.reason }}</p></section>
                <details v-if="w.detail.surveyVersions?.length || w.detail.plan" class="wo-modal-group">
                  <summary >Survei dan rencana pelaksanaan</summary>
                  <dl v-if="w.detail.surveyVersions?.length" class="mt-3 grid gap-3 sm:grid-cols-2">
                    <div v-for="[label,key] in [['Tanggal survei','surveyDate'],['Lokasi survei','location'],['Temuan','findings'],['Akses','access'],['Peralatan dan APD','equipment'],['Material','material']]" :key="key">
                      <dt class="text-xs text-slate-600">{{ label }}</dt><dd class="mt-1 whitespace-pre-wrap break-words">{{ w.detail.surveyVersions.at(-1)[key] || 'Belum tercatat' }}</dd>
                    </div>
                  </dl>
                  <p v-if="w.detail.plan?.method" class="mt-3 break-words"><strong>Metode</strong> · {{ w.detail.plan.method }}</p>
                </details>
                <details v-if="w.detail.authorityRoster?.people.length" class="wo-modal-group">
                  <summary >Personel dan Surat Kewenangan</summary>
                  <ul class="mt-2 divide-y divide-slate-100">
                    <li v-for="person in w.detail.authorityRoster.people" :key="person.personId" class="py-2">
                      <p class="font-medium">{{ person.name }} · {{ person.duty }}</p>
                      <p class="text-xs text-slate-600">{{ person.certificateNo }} · {{ person.validFrom }} s.d. {{ person.validUntil }}</p>
                    </li>
                  </ul>
                </details>
                <details v-if="w.detail.readiness?.length" class="wo-modal-group">
                  <summary >Kesiapan K3</summary>
                  <ul class="mt-2 divide-y divide-slate-100">
                    <li v-for="record in w.detail.readiness" :key="record.id" class="py-2"><p class="font-medium">{{ w.nodeTitle(record.nodeId) }}</p><p class="text-xs text-slate-600">{{ record.actorName }} · {{ w.formatTime(record.at) }}</p></li>
                  </ul>
                </details>
                <dl v-if="w.detail.physical_completed_at || w.detail.operational_completed_at || w.detail.administrative_completed_at" class="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-3">
                  <div v-for="[label,date] in [['Selesai fisik',w.detail.physical_completed_at],['Selesai operasional',w.detail.operational_completed_at],['Selesai administrasi',w.detail.administrative_completed_at]]" :key="label">
                    <dt class="text-xs text-slate-600">{{ label }}</dt><dd class="mt-1 font-medium">{{ date ? w.formatTime(date) : 'Menunggu' }}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </section>
        </div>`,
    },
    component: {
      props: ['w', 'statusBadge'],
      template: `
      <section class="space-y-5" aria-label="Perencanaan PDKB">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <header class="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div class="min-w-0">
              <span class="rounded px-2 py-0.5 font-mono text-xs font-bold" :class="w.screenPresentation[1]">LAYAR {{ w.screenCode }}</span>
              <h2 data-workflow-heading tabindex="-1" class="mt-1 text-lg font-bold text-slate-800">{{ w.selected && !w.detail ? w.taskTitle : w.screenPresentation[0] }}</h2>
              <p v-if="w.selected && !w.detail" class="mt-1 break-words text-xs text-slate-600">{{ w.selected.id }} &middot; {{ w.selected.nama_wo || 'Draf WO' }}</p>
            </div>
            <button v-if="w.selected && !w.detail" type="button" @click="w.close" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold hover:bg-slate-50">Kembali ke daftar</button>
            <button v-else-if="w.canCreate && w.screenCode === 'P01'" type="button" @click="w.create" class="rounded-lg bg-pln-yellow px-4 py-2 text-xs font-bold text-slate-900">Buat pengajuan WO</button>
          </header>
          <template v-if="!w.selected || w.detail">
            <p v-if="!w.entries.length" class="rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-600">Belum ada WO pada layar ini.</p>
            <div v-else class="space-y-4">
              <article v-for="wo in w.entries" :key="wo.id" data-work-card :data-wo-id="wo.id" class="rounded-xl border-2 p-4 sm:p-5" :class="w.screenPresentation[2]">
                <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div class="min-w-0">
                    <span class="font-mono text-xs font-bold text-pln-blue">{{ wo.id }}</span>
                    <h3 class="mt-1 break-words font-bold text-slate-900">{{ wo.nama_wo || 'Draf WO' }}</h3>
                    <p class="mt-1 break-words text-xs text-slate-600">{{ wo.lokasi || 'Lokasi belum diisi' }}</p>
                  </div>
                  <span class="rounded px-2.5 py-1 text-xs font-bold" :class="statusBadge(wo.status)">{{ wo.status }}</span>
                </div>
                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div class="text-xs text-slate-700">
                    <p class="font-semibold">{{ w.tasks.find(t => t.woId === wo.id)?.title || 'Tidak ada tugas aktif untuk role Anda' }}</p>
                    <p v-if="wo.plan?.date" class="mt-1">{{ wo.plan.date }} &middot; {{ wo.plan.time }} WIB</p>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <button type="button" @click="w.showDetail(wo)" class="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-pln-blue">Detail</button>
                    <button v-if="w.tasks.some(task => task.woId === wo.id && task.actionable)" type="button" @click="w.executeAction({wo,targetScreen:w.tasks.find(task=>task.woId===wo.id && task.actionable).screen})" class="rounded-lg bg-pln-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800">Buka tugas</button>
                  </div>
                </div>
              </article>
            </div>
          </template>
          <template v-else>
            <dl v-if="w.selected.physical_completed_at" class="grid gap-3 sm:grid-cols-3 text-sm mb-5">
              <div><dt>Selesai fisik</dt><dd>{{ w.formatTime(w.selected.physical_completed_at) }}</dd></div>
              <div><dt>Selesai operasional</dt><dd>{{ w.selected.operational_completed_at ? w.formatTime(w.selected.operational_completed_at) : 'Menunggu' }}</dd></div>
              <div><dt>Selesai administrasi</dt><dd>{{ w.selected.administrative_completed_at ? w.formatTime(w.selected.administrative_completed_at) : 'Menunggu' }}</dd></div>
            </dl>
            <div class="grid sm:grid-cols-2 gap-3 text-xs text-slate-600 mb-5"><p>Pengusul · {{ w.selected.pengusul || w.selected.ownerRole || 'Perlu verifikasi pengusul' }}</p><p>Unit · {{ w.selected.unitId }}</p><p>Lokasi · {{ w.selected.lokasi || 'Belum diisi' }}</p><p>Versi · {{ w.selected.version }}</p></div>
            <p v-if="w.selected.reject_reason && ['return','revision'].includes(w.selected.stage)" class="border border-amber-200 bg-amber-50 p-3 rounded-lg text-sm mb-4">Alasan pengembalian · {{ w.selected.reject_reason }}</p>
            <details :open="!w.preparation" class="mb-5"><summary class="text-sm font-medium cursor-pointer mb-3">Konteks pengajuan, survei dan kelayakan</summary>
            <dl v-if="w.selected.poleNumber || w.selected.feeder || w.selected.workUnit || w.selected.officialWoNumber" class="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-4">
              <div v-for="[key,label] in [['officialWoNumber','Nomor WO resmi'],['catalogCode','Kode katalog'],...w.proposalAssets]" :key="key">
                <dt class="font-semibold">{{ label }}</dt><dd>{{ w.selected[key] || 'Belum tercatat' }}</dd>
              </div>
            </dl>
            <p v-if="w.selected.uraian" class="text-sm text-slate-700 whitespace-pre-wrap mb-5">{{ w.selected.uraian }}</p>
            <p v-if="w.selected.workPlan" class="text-sm mb-4">Prioritas · {{ w.selected.priority }} · {{ w.selected.workPlan }}</p>
            <button v-if="w.selected.stage !== 'legacy'" type="button" @click="w.preview" class="text-pln-blue border border-sky-200 px-3 py-2 rounded-lg text-xs mb-4">Pratinjau formulir</button>
            <div v-if="w.selected.surveyVersions.length" class="border border-slate-200 rounded-lg p-4 mb-4 text-sm space-y-2">
              <h3 class="font-medium">Survei terakhir · versi {{ w.selected.surveyVersions.length }}</h3><p>{{ w.selected.surveyVersions.at(-1).findings }}</p><p>Akses · {{ w.selected.surveyVersions.at(-1).access }}</p><p>Peralatan · {{ w.selected.surveyVersions.at(-1).equipment }}</p><p>Material · {{ w.selected.surveyVersions.at(-1).material }}</p>
              <template v-if="w.selected.initialAnalyses.length"><p>JSA awal · {{ w.selected.initialAnalyses.at(-1).jsa }}</p><p>IBPPR awal · {{ w.selected.initialAnalyses.at(-1).ibppr }}</p></template>
            </div>
            <p v-if="w.selected.feasibility" class="text-sm mb-4">Hasil kelayakan · {{ w.selected.feasibility.decision }} · {{ w.selected.feasibility.reason }}</p>
            </details>
            <div v-if="w.selected.pendingHold || (w.selected.holds?.length && !w.selected.holds.at(-1).resolvedAt)" class="border border-amber-200 bg-amber-50 rounded-lg p-4 mb-5 text-sm space-y-2">
              <h3 class="font-medium">Penanganan kendala {{ w.selected.holds?.at(-1)?.causeId || '' }}</h3>
              <p>{{ w.selected.pendingHold?.reason || w.selected.holds?.at(-1)?.reason }}</p>
              <p v-if="w.selected.holds?.length">Koordinator · {{ w.selected.holds.at(-1).coordinatorRole.replaceAll('_',' ') }} · {{ w.selected.holds.at(-1).resolvedAt ? 'Telah dipulihkan ke tahap asal' : w.selected.holds.at(-1).cancelledAt ? 'Pembatalan disetujui' : 'Menunggu penanganan sesuai tugas aktif' }}</p>
            </div>
            <div v-if="w.currentDocument" class="border border-sky-200 bg-sky-50 rounded-lg p-4 mb-5 text-sm space-y-2">
              <h3 class="font-medium">{{ w.typeLabel(w.currentDocument.type) }} · versi {{ w.currentDocument.version }} · {{ w.statusLabel(w.currentDocument.status,w.currentDocument.type) }}</h3>
              <p v-if="w.currentDocument.planSnapshot" class="text-xs">Jadwal rencana · {{ w.currentDocument.planSnapshot.date }} · {{ w.currentDocument.planSnapshot.time }} WIB</p>
              <p v-for="(value,key) in w.currentDocument.payload" :key="key" class="whitespace-pre-wrap"><span class="font-medium">{{ w.documentLabels[key] || key }}</span> · {{ w.valueLabel(key,value,w.currentDocument) }}</p>
              <p v-if="w.currentDocument.issuedAt">Terbit pada {{ w.formatTime(w.currentDocument.issuedAt) }} · persetujuan demo</p>
              <p v-if="w.currentDocument.rejectedReason" class="text-red-700">Alasan pengembalian · {{ w.currentDocument.rejectedReason }}</p>
              <button type="button" @click="w.previewVersion(w.currentDocument)" class="text-pln-blue underline">Lihat versi dan persetujuan</button>
            </div>
            <details v-if="w.selected.authorityRoster" :open="!!w.configuration.roster || ['Node_verifikasi_kewenangan','Node_tindak_lanjut_kewenangan'].includes(w.selected.nodeId)" class="mb-5 overflow-x-auto border border-slate-200 rounded-lg"><summary class="p-3 text-sm cursor-pointer font-medium">Tim dan Surat Kewenangan</summary><div class="iwoms-table-host" v-datatable><table class="w-full text-xs text-left"><caption class="text-left p-3 font-medium">Personel dan Surat Kewenangan · versi {{ w.selected.authorityRoster.version }}</caption><thead class="bg-slate-50"><tr><th class="p-3">Personel / tugas</th><th class="p-3">Surat / berlaku</th><th class="p-3">Hasil pemeriksaan pada tanggal rencana</th></tr></thead><tbody><tr v-for="person in w.selected.authorityRoster.people" :key="person.personId" class="border-t border-slate-100"><td class="p-3">{{ person.name }} · {{ person.duty }}</td><td class="p-3">{{ person.certificateNo }}<br>{{ person.validFrom }} s.d. {{ person.validUntil }}</td><td class="p-3">{{ w.peopleChecks.find(check => check.personId === person.personId)?.reason }}</td></tr></tbody></table></div></details>
            <details v-if="w.selected.deliveries" class="iwoms-history mb-5">
            <summary><span>Serah terima surat</span></summary>
            <ol  class="iwoms-timeline iwoms-history__body" role="list">
            <li v-for="(delivery,key) in w.selected.deliveries" :key="key">
              <div class="iwoms-timeline__content">
                <div class="iwoms-timeline__heading"><strong>{{ key }}</strong><time v-if="delivery.receivedAt" :datetime="delivery.receivedAt">Diterima {{ w.formatTime(delivery.receivedAt) }}</time><span v-else class="iwoms-timeline__meta">Menunggu penerimaan</span></div>
                <p class="iwoms-timeline__meta">{{ delivery.recipientRole.replaceAll('_',' ') }}</p>
                <p v-if="delivery.recordedAt">Dicatat {{ w.formatTime(delivery.recordedAt) }}</p>
              </div>
            </li>
            </ol>
            </details>
            <details v-if="w.selected.readiness?.length" class="iwoms-history mb-5">
            <summary><span>Pemeriksaan dan briefing lapangan</span><span class="iwoms-sok__badge">{{ w.selected.readiness.length }} catatan</span></summary>
            <ol  class="iwoms-timeline iwoms-history__body" role="list">
            <li v-for="check in w.selected.readiness" :key="check.id">
              <div class="iwoms-timeline__content">
                <div class="iwoms-timeline__heading"><strong>{{ w.nodeTitle(check.nodeId) }}</strong><time :datetime="check.at">{{ w.formatTime(check.at) }}</time></div>
                <p class="iwoms-timeline__meta">{{ check.actorName || check.actorId }}</p>
                <template v-for="(value,key) in check.data" :key="key"><p v-if="!['documentVersionId','requestId'].includes(key)">{{ w.readinessLabel(key) }} · {{ typeof value === 'boolean' ? (value ? 'Memenuhi' : 'Belum memenuhi') : value }}</p></template>
              </div>
            </li>
            </ol>
            </details>
            <div v-if="w.selected.delegation?.document" class="border rounded-lg p-4 mb-4 text-sm">
              <h3 class="font-medium">Berita acara delegasi</h3><p>{{ w.selected.delegation.document.payload.Penerima }}</p>
              <button type="button" class="underline text-pln-blue" @click="w.previewVersion(w.selected.delegation.document)">Lihat berita acara</button>
            </div>
            <div v-if="w.selected.executionRounds?.at(-1)?.stop && !w.selected.executionRounds.at(-1).resumedAt" class="border border-amber-300 rounded-lg p-4 mb-4 text-sm">Penghentian tercatat pada putaran ini. Lanjutkan pencatatan bukti dan evaluasi K3 sesuai tugas.</div>
            <details v-if="w.selected.normalizationRequests?.length" class="iwoms-history mb-5">
            <summary><span>Riwayat penormalan</span></summary>
            <ol  class="iwoms-timeline iwoms-history__body" role="list">
            <li v-for="event in w.operationEvents.filter(item => item.kind === 'sok-normalization')" :key="event.id">
              <div class="iwoms-timeline__content">
                <div class="iwoms-timeline__heading"><strong>{{ w.nodeTitle(event.nodeId) }}</strong><time :datetime="event.at">{{ w.formatTime(event.at) }}</time></div>
                <p class="iwoms-timeline__meta">{{ event.actorName }}</p>
                <p v-if="event.data.reason">{{ event.data.reason }}</p>
              </div>
            </li>
            <li v-if="w.selected.operational_completed_at">
              <div class="iwoms-timeline__content">
                <div class="iwoms-timeline__heading"><strong>Selesai operasional</strong><time :datetime="w.selected.operational_completed_at">{{ w.formatTime(w.selected.operational_completed_at) }}</time></div>
              </div>
            </li>
            </ol>
            </details>
            <section v-if="w.currentSok" class="iwoms-sok mb-5" aria-label="Permintaan SOK">
              <div class="iwoms-sok__overview">
                <div class="iwoms-sok__heading">
                  <h3>Permintaan SOK</h3>
                  <span class="iwoms-sok__badge">Putaran {{ w.currentSok.round }}</span>
                </div>
                <p class="iwoms-sok__location">{{ w.currentSok.data.circuit }} · {{ w.currentSok.data.boundary }}</p>
                <p>{{ w.currentSok.data.reason }}</p>
                <div v-if="w.currentGiEvent" class="iwoms-sok__result">
                  <p class="iwoms-sok__label">{{ w.currentGiEvent.data.applied ? 'GI mencatat pengaturan telah dilaksanakan' : 'GI mencatat pengaturan belum dilaksanakan' }}</p>
                  <p v-if="w.currentGiEvent.data.settings">{{ w.currentGiEvent.data.settings }}</p>
                  <p v-if="w.currentGiEvent.data.reason">{{ w.currentGiEvent.data.reason }}</p>
                </div>
                <p v-if="w.selected.sokConfirmed" class="iwoms-sok__confirmed">
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="m4.5 10 3.5 3.5 7.5-7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span><strong>Terkonfirmasi</strong> · <time :datetime="w.selected.sokConfirmed.at">{{ w.formatTime(w.selected.sokConfirmed.at) }}</time></span>
                </p>
              </div>
              <details class="iwoms-history iwoms-history--embedded">
                <summary>
                  <span>Riwayat koordinasi SOK</span>
                  <span class="iwoms-sok__badge">{{ w.operationEvents.length }} catatan</span>
                </summary>
                <ol v-if="w.operationEvents.length" class="iwoms-timeline iwoms-history__body" role="list">
                  <li v-for="event in w.operationEvents" :key="event.id">
                    <div class="iwoms-timeline__content">
                      <div class="iwoms-timeline__heading">
                        <span class="iwoms-sok__label">{{ event.actorName }}</span>
                        <time :datetime="event.at">{{ w.formatTime(event.at) }}</time>
                      </div>
                      <p v-if="event.data.reason">{{ event.data.reason }}</p>
                      <div v-if="event.nodeId === 'Node_sok_petugas_gi'" class="iwoms-sok__event-result">
                        <p class="iwoms-sok__label">{{ event.data.applied ? 'Pengaturan dilaksanakan' : 'Pengaturan belum dilaksanakan' }}</p>
                        <p v-if="event.data.settings">{{ event.data.settings }}</p>
                      </div>
                    </div>
                  </li>
                </ol>
                <p v-else class="iwoms-history__empty">Belum ada catatan koordinasi.</p>
              </details>
            </section>
            <p v-if="w.selected.stage === 'legacy'" class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm mb-5">Penugasan lama perlu ditinjau. Verifikasi pengusul asal untuk mengirim usulan ke pemeriksaan awal. Persetujuan lama tersimpan sebagai riwayat legacy.</p>
            <p v-if="!w.canAct" class="bg-slate-50 p-4 rounded-lg text-sm mb-5">{{ w.configuration.terminal ? 'Proses telah berakhir · ' + w.configuration.boundary : w.configuration.boundary ? w.configuration.boundary + ' · menunggu implementasi batch berikutnya.' : 'Tugas ini sedang menunggu aktor lain atau telah berakhir.' }}</p>
            ${taskFormTemplate}
            <ul v-if="w.attachments.length" class="mt-4 space-y-2 text-sm"><li v-for="doc in w.attachments" :key="doc.id"><a :href="doc.content" :download="doc.name" class="text-pln-blue underline">{{ doc.name }}</a></li></ul>
            <div v-if="w.selected.plan" class="mt-5 text-sm border border-slate-200 p-4 rounded-lg"><h3 class="font-medium mb-2">Rencana pelaksanaan</h3><p>{{ w.selected.plan.date }} · {{ w.selected.plan.time }} WIB</p><p>{{ w.selected.plan.personnel }}</p><p>{{ w.selected.plan.method }}</p></div>
            <details v-if="w.selected.status === 'WO Completed'" class="mt-5 border-t border-slate-200 pt-4">
              <summary class="text-sm font-medium cursor-pointer">Pratinjau dokumen WO</summary>
              <ul class="mt-3 divide-y divide-slate-100 text-sm">
                <li v-for="doc in w.proposalTemplates" :key="doc.kode" class="flex flex-wrap justify-between gap-2 py-2">
                  <span>{{ doc.kode }} · {{ doc.nama }}</span>
                  <button type="button" class="text-pln-blue underline" @click="w.previewTemplate(doc)">Lihat</button>
                </li>
              </ul>
            </details>
            <details v-if="w.documentVersions.length" class="mt-5 border-t border-slate-200 pt-4"><summary class="text-sm font-medium cursor-pointer">Register dokumen dan versi</summary><div class="overflow-x-auto mt-3"><div class="iwoms-table-host" v-datatable><table class="w-full text-xs text-left"><thead class="bg-slate-50"><tr><th class="p-3">Dokumen</th><th class="p-3">Versi</th><th class="p-3">Status</th><th class="p-3">Aksi</th></tr></thead><tbody><tr v-for="doc in w.documentVersions" :key="doc.id" class="border-t border-slate-100"><td class="p-3">{{ w.typeLabel(doc.type) }}</td><td class="p-3">{{ doc.version }}</td><td class="p-3">{{ w.statusLabel(doc.status || doc.kind,doc.type) }}</td><td class="p-3"><button type="button" @click="w.previewRegisterDocument(doc)" class="text-pln-blue underline">Lihat</button></td></tr></tbody></table></div></div></details>
            <details  class="iwoms-history mt-6">
            <summary><span>Riwayat keputusan dan revisi</span><span class="iwoms-sok__badge">{{ w.history.length }} catatan</span></summary>
            <ol v-if="w.history.length" class="iwoms-timeline iwoms-history__body" role="list">
            <li v-for="event in w.history" :key="event.id">
              <div class="iwoms-timeline__content">
                <div class="iwoms-timeline__heading"><strong>{{ w.actionLabel(event.action) }}</strong><time :datetime="event.at">{{ w.formatTime(event.at) }}</time></div>
                <p class="iwoms-timeline__meta">{{ event.actor.name }}</p>
                <p v-if="event.data.reason || event.data.workPlan">{{ event.data.reason || event.data.workPlan }}</p>
              </div>
            </li>
            </ol>
            <p v-else class="iwoms-history__empty">Belum ada keputusan atau revisi.</p>
            <section v-if="w.selected.legacyApprovals" class="iwoms-history__body iwoms-history__subsection">
              <h3>Persetujuan historis sebelum peninjauan</h3>
              <ol  class="iwoms-timeline" role="list">
              <li v-for="(approval,role) in w.selected.legacyApprovals" :key="role">
                <div class="iwoms-timeline__content">
                  <div class="iwoms-timeline__heading"><strong>{{ role }}</strong><span class="iwoms-timeline__meta">{{ approval?.at || 'Waktu belum tercatat' }}</span></div>
                  <p class="iwoms-timeline__meta">{{ approval?.by || 'Pelaku belum tercatat' }}</p>
                  <p>{{ approval?.approved ? 'Pernah disetujui' : 'Belum disetujui' }}</p>
                </div>
              </li>
              </ol>
            </section>
            </details>
          </template>
        </div>
      </section>`,
    },
  };
})(window);
