(function (global) {
  'use strict';
  const lanes = { Node_pelaksanaan_bertegangan:'pelaksana_pdkb', Node_pengawasan_regu:'kepala_regu', Node_pengawasan_k3:'pengawas_k3' };
  const routes = {
    Node_periksa_cuaca: [['initial-safe','Kondisi awal memenuhi','Node_kondisi_awal_aman','Node_perlu_delegasi'],['initial-unsafe','Tahan rencana mulai','Node_kondisi_awal_aman','Node_evaluasi_kondisi_awal']],
    Node_evaluasi_kondisi_awal: [['initial-evaluate','Catat penghentian rencana mulai','Node_cek_ulang_kondisi_awal']],
    Node_cek_ulang_kondisi_awal: [['initial-recheck','Kirim evaluasi keselamatan','Node_kondisi_bisa_dipulihkan']],
    Node_kondisi_bisa_dipulihkan: [['initial-repeat','Ulangi pemeriksaan awal','Node_periksa_cuaca'],['initial-hold','Ajukan On Hold H10','Node_hold_kondisi_awal']],
    Node_perlu_delegasi: [['delegate','Ajukan calon penerima delegasi','Node_periksa_kompetensi_delegasi'],['no-delegation','Pengawasan tanpa delegasi','Node_selesai_penunjukan']],
    Node_periksa_kompetensi_delegasi: [['candidate-valid','Verifikasi calon kompeten','Node_kompeten_delegasi','Node_berita_acara_kepala_regu'],['candidate-invalid','Calon belum memenuhi','Node_kompeten_delegasi','Node_pilih_penerima_lain']],
    Node_pilih_penerima_lain: [['candidate-replace','Ajukan calon lain','Node_ada_calon_delegasi','Node_periksa_kompetensi_delegasi'],['candidate-hold','Ajukan On Hold H11','Node_ada_calon_delegasi','Node_hold_penerima_delegasi']],
    Node_berita_acara_kepala_regu: [['delegation-create','Siapkan dan tanda tangani BA delegasi','Node_berita_acara_pelaksana']],
    Node_berita_acara_pelaksana: [['delegation-accept','Terima dan tanda tangani delegasi','Node_berita_acara_supervisor']],
    Node_berita_acara_supervisor: [['delegation-review','Tanda tangani sebagai pihak mengetahui','Node_arsip_berita_acara']],
    Node_arsip_berita_acara: [['delegation-archive','Arsipkan BA delegasi','Node_selesai_penunjukan']],
    Node_selesai_penunjukan: [['start-round','Mulai putaran pelaksanaan','Node_parallel_mulai']],
    Node_periksa_gangguan_pelaksanaan: [['round-clear','Tidak ada bahaya aktif','Node_pekerjaan_selesai'],['round-danger','Catat bahaya saat pelaksanaan','Node_stop_pekerjaan_sementara']],
    Node_stop_pekerjaan_sementara: [['round-stop','Catat penghentian pekerjaan','Node_amankan_kondisi_kerja']],
    Node_amankan_kondisi_kerja: [['round-secure','Catat pengamanan lokasi','Node_evaluasi_k3_pelaksanaan']],
    Node_evaluasi_k3_pelaksanaan: [['round-safety-review','Kirim hasil evaluasi K3','Node_sudah_aman_lagi']],
    Node_sudah_aman_lagi: [['round-resume','Nyatakan aman dan buka putaran baru','Node_parallel_mulai'],['round-hold','Ajukan On Hold H12','Node_hold_bahaya_saat_pelaksanaan']],
    Node_pekerjaan_selesai: [['round-finished','Pekerjaan fisik selesai','Node_lapor_pekerjaan_selesai'],['round-repeat','Pekerjaan belum selesai','Node_parallel_mulai']],
    Node_lapor_pekerjaan_selesai: [['physical-report','Laporkan selesai fisik','Node_minta_penormalan']],
    Node_minta_penormalan: [['normal-request','Minta penormalan SOK','Node_normal_piket_area']],
    Node_normal_piket_area: [['normal-area','Teruskan penormalan ke APD','Node_normal_piket_apd']],
    Node_normal_piket_apd: [['normal-apd','Teruskan penormalan ke GI','Node_normal_petugas_gi']],
    Node_normal_petugas_gi: [['normal-gi','Catat hasil penormalan GI','Node_normal_konfirmasi_apd']],
    Node_normal_konfirmasi_apd: [['normal-return-apd','Konfirmasi hasil kepada Area','Node_normal_konfirmasi_area']],
    Node_normal_konfirmasi_area: [['normal-return-area','Konfirmasi hasil kepada Kepala Regu','Node_normalisasi_ok']],
    Node_normalisasi_ok: [['normal-confirm','Konfirmasi penormalan lengkap','Node_selesai_operasional'],['normal-retry','Ulangi permintaan penormalan','Node_minta_penormalan']],
    Node_selesai_operasional: [['operational-complete','Nyatakan selesai operasional','Node_izin_tinggi_digunakan']],
  };
  const reason = [['reason','Catatan dan bukti tindakan','textarea']];
  function configuration(wo) {
    const node = wo?.nodeId;
    if (lanes[node]) return {screen:lanes[node]==='pengawas_k3'?'E02':'E01',fields:reason,primary:['lane-report','Kirim hasil tugas putaran'],alternatives:[['lane-stop','Catat penghentian segera']]};
    const options = routes[node];
    if (!options) return null;
    const fields = [...reason];
    if (['Node_perlu_delegasi','Node_pilih_penerima_lain'].includes(node)) fields.push(['candidateId','Calon Pelaksana dari tim','person']);
    if (node === 'Node_normal_petugas_gi') fields.push(['applied','Penormalan telah dilaksanakan','checkbox']);
    if (node === 'Node_evaluasi_k3_pelaksanaan') fields.push(['safe','Evaluasi K3 menyatakan kondisi telah pulih','checkbox']);
    if (node === 'Node_periksa_cuaca') fields.push(['conditionsOk','Cuaca dan kondisi awal memenuhi pemeriksaan','checkbox']);
    const screen = node.startsWith('Node_normal') || node === 'Node_minta_penormalan' ? 'E03' : ['Node_cek_ulang_kondisi_awal','Node_periksa_gangguan_pelaksanaan','Node_evaluasi_k3_pelaksanaan'].includes(node) ? 'E02' : 'E01';
    return {screen,fields,primary:options[0],alternatives:options.slice(1)};
  }
  function parallelTasks(wo) {
    if (wo.nodeId !== 'Node_parallel_mulai') return [];
    return Object.keys(lanes).filter(node => !wo.executionRounds.at(-1).reports[node]);
  }
  function handle(c) {
    const {wo,state,actor,now,data,action,follow,fail,requireText,markHold,edge,graph}=c;
    const origin=c.task?.nodeId || wo.nodeId;
    const options=routes[origin];
    const route=options?.find(item=>item[0]===action);
    if (!route && !(lanes[origin] && ['lane-report','lane-stop'].includes(action))) return false;
    requireText('reason','catatan dan bukti tindakan');
    const round=wo.executionRounds?.at(-1);
    if (lanes[origin]) {
      if (data.roundId!==round.id) fail('Putaran telah berubah.');
      if(action==='lane-stop' && !round.stop) round.stop={actorId:actor.id,at:now,reason:data.reason};
      round.reports[origin]={actorId:actor.id,at:now,reason:data.reason};
      c.auditOrigin(origin);
      const outgoing=graph.edges.find(item=>item.source===origin && item.target==='Node_parallel_selesai');
      edge(outgoing.id);
      if(Object.keys(round.reports).length===3) {
        wo.nodeId='Node_parallel_selesai'; follow('Node_periksa_gangguan_pelaksanaan');
      } else c.auditTarget('Node_parallel_selesai');
      return true;
    }
    if(action==='initial-safe' && (!data.conditionsOk || !wo.sokConfirmed || wo.sokConfirmed.requestId !== wo.sokRequests?.at(-1)?.id || !state.operations.some(event=>event.woId===wo.id && event.requestId===wo.sokConfirmed.requestId && event.result==='confirmed'))) fail('Pemeriksaan awal dan konfirmasi SOK WO ini harus lengkap.');
    if(['delegate','candidate-replace'].includes(action)) {
      if (!wo.authorityRoster?.people.some(person=>person.personId===data.candidateId)) fail('Pilih calon dari tim WO ini.');
      wo.delegation={candidateId:data.candidateId};
    }
    if(action==='no-delegation') wo.delegation={required:false};
    if(action==='candidate-valid' && !c.checkPeople(wo).some(person=>person.personId===wo.delegation?.candidateId && person.valid)) fail('Kewenangan calon belum memenuhi.');
    if(action==='delegation-create') {
      const candidate=wo.authorityRoster.people.find(person=>person.personId===wo.delegation.candidateId);
      wo.delegation.document={id:global.crypto.randomUUID(),type:'DELEGATION',woId:wo.id,version:1,candidateId:candidate.personId,
        payload:{Penerima:candidate.name,Kewenangan:candidate.certificateNo,Lingkup:data.reason},decisions:[]};
    }
    if(action.startsWith('delegation-')) {
      const doc=wo.delegation?.document;
      if(!doc) fail('BA delegasi belum disiapkan.');
      doc.decisions.push({id:global.crypto.randomUUID(),role:actor.role,actorName:actor.name,actorId:actor.id,at:now,result:'approved',reason:data.reason});
      if(action==='delegation-archive') {doc.status='archived';state.documents.push(doc);wo.documentIds.push(doc.id);}
    }
    if(action==='round-clear' && round.stop) fail('Penghentian aktif memerlukan pengamanan dan evaluasi K3.');
    if(action==='round-danger' && !round.stop) round.stop={actorId:actor.id,at:now,reason:data.reason};
    if(action==='round-safety-review') round.safetyReview={safe:data.safe===true,actorId:actor.id,at:now,reason:data.reason};
    if(action==='round-resume') {
      if(!round.safetyReview?.safe) fail('Evaluasi K3 belum menyatakan kondisi aman.');
      round.resumedAt=now;
    }
    if(action==='physical-report') wo.physical_completed_at=now;
    if(action==='normal-request') {
      if(!wo.physical_completed_at) fail('Laporan selesai fisik belum tersedia.');
      wo.normalizationRequests ||= [];
      wo.normalizationRequests.push({id:global.crypto.randomUUID(),at:now});
    }
    if(action.startsWith('normal-') || action==='operational-complete') {
      const request=wo.normalizationRequests?.at(-1);
      if(!request || (action!=='normal-request' && request.id!==data.normalizationId)) fail('Permintaan penormalan berbeda atau sudah berubah.');
      const events=state.operations.filter(event=>event.woId===wo.id && event.requestId===request?.id);
      if(action==='normal-confirm' && !events.some(event=>event.action==='normal-gi' && event.data.applied===true)) fail('Hasil penormalan GI belum memenuhi.');
      if(action==='operational-complete') wo.operational_completed_at=now;
      const event={id:global.crypto.randomUUID(),woId:wo.id,requestId:request.id,kind:'sok-normalization',nodeId:origin,action,actorId:actor.id,actorName:actor.name,unitId:actor.unitId,at:now,version:wo.version+1,result:action,data};
      state.operations.push(event); wo.operationIds.push(event.id);
    }
    const cause={'initial-hold':'kondisi_awal','candidate-hold':'penerima_delegasi','round-hold':'bahaya_saat_pelaksanaan'}[action];
    if(cause) markHold(cause);
    follow(...route.slice(2));
    if (wo.operational_completed_at) wo.status='Operationally Completed';
    else if (wo.physical_completed_at) wo.status='Awaiting Normalization';
    else if (round?.stop) wo.status=wo.status==='Hold Review'?'Hold Review':'Work Stopped';
    else if (round) wo.status='Ongoing';
    if(wo.nodeId==='Node_parallel_mulai') {
      wo.executionRounds ||= [];
      wo.waktu_mulai_aktual ||= now;
      wo.executionRounds.push({id:global.crypto.randomUUID(),at:now,reports:{},forkEdges:graph.edges.filter(item=>item.source===wo.nodeId).map(item=>item.id)});
      wo.status='Ongoing';
    }
    return true;
  }
  const api={configuration,parallelTasks,handle};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else global.IwomsExecution=api;
})(typeof window!=='undefined'?window:globalThis);
