(function (global) {
  'use strict';
  const details = typeof module !== 'undefined' && module.exports ? require('./document-details.js') : global.IwomsDocumentDetails;
  const copy = value => JSON.parse(JSON.stringify(value));
  const configurations = {
    Node_serahkan_sp2b: { documentType: 'SP2B', primary: ['sp2b-deliver', 'Serahkan SP2B kepada Pelaksana'] },
    Node_tanda_terima_sp2b: { documentType: 'SP2B', receiver: 'sp2b', primary: ['sp2b-receive', 'Tanda tangani penerimaan SP2B'], fields: [['acknowledged', 'Saya telah membaca dan memahami SP2B versi ini', 'checkbox']] },
    Node_catat_tanda_terima: { documentType: 'SP2B', primary: ['sp2b-record', 'Catat tanda terima SP2B'] },
    Node_bagikan_sp3b: { documentType: 'SP3B', primary: ['sp3b-deliver', 'Serahkan SP3B kepada kedua pengawas'] },
    Node_terima_sp3b_regu: { documentType: 'SP3B', receiver: 'sp3b-regu', primary: ['sp3b-receive-regu', 'Pahami dan terima penugasan pengawasan'], fields: [['acknowledged', 'Saya memahami SP3B dan penugasan pengawas pekerjaan', 'checkbox']] },
    Node_terima_sp3b_k3: { documentType: 'SP3B', receiver: 'sp3b-k3', primary: ['sp3b-receive-k3', 'Pahami dan terima penugasan K3'], fields: [['acknowledged', 'Saya memahami SP3B dan penugasan Pengawas K3', 'checkbox']] },
    Node_instruksi_periksa_ulang: { screen: 'E01', documentType: 'EQUIPMENT_CHECKLIST', primary: ['readiness-instruct', 'Perintahkan pemeriksaan ulang'], fields: [['reason', 'Instruksi pemeriksaan ulang', 'textarea']] },
    Node_periksa_kesiapan_lapangan: { screen: 'E01', documentType: 'EQUIPMENT_CHECKLIST', primary: ['readiness-check', 'Catat hasil pemeriksaan lapangan'], fields: [['equipmentReady', 'Peralatan siap', 'checkbox'], ['materialReady', 'Material siap', 'checkbox'], ['apdReady', 'APD layak dan lengkap', 'checkbox'], ['reason', 'Hasil pemeriksaan dan kekurangan jika ada', 'textarea']] },
    Node_job_briefing: { screen: 'E01', primary: ['job-briefing', 'Catat job briefing'], fields: [['participants', 'Peserta briefing', 'textarea'], ['instructions', 'Pembagian tugas, bahaya dan instruksi kerja', 'textarea']] },
    Node_safety_briefing: { screen: 'E02', primary: ['safety-briefing', 'Catat pemeriksaan kesehatan dan safety briefing'], fields: [['participants', 'Personel yang diperiksa', 'textarea'], ['healthOk', 'Seluruh personel memenuhi pemeriksaan kesehatan', 'checkbox'], ['apdOk', 'APD memenuhi pemeriksaan Pengawas K3', 'checkbox'], ['reason', 'Hasil pemeriksaan kesehatan / APD', 'textarea'], ['briefing', 'Materi safety briefing', 'textarea']] },
    Node_koordinasi_kepala_operasi: { screen: 'E01', primary: ['start-coordinate', 'Catat koordinasi rencana mulai'], fields: [['counterpart', 'Kepala Operasi yang dihubungi', 'text'], ['reason', 'Hasil koordinasi rencana mulai', 'textarea']] },
    Node_minta_sok: { screen: 'E03', primary: ['sok-request', 'Minta pemberlakuan SOK'], fields: [['circuit', 'Penyulang / instalasi', 'text'], ['boundary', 'Batas dan lokasi pekerjaan', 'textarea'], ['reason', 'Rincian permintaan SOK', 'textarea']] },
    Node_sok_piket_area: { screen: 'E03', primary: ['sok-area', 'Teruskan permintaan ke Piket APD'] },
    Node_sok_piket_apd: { screen: 'E03', primary: ['sok-apd', 'Koordinasikan pengaturan dengan Petugas GI'] },
    Node_sok_petugas_gi: { screen: 'E03', primary: ['sok-gi', 'Catat hasil pengaturan recloser dan relay'], fields: [['applied', 'Pengaturan SOK telah dilaksanakan', 'checkbox'], ['settings', 'Pengaturan recloser / relay yang dilaksanakan', 'textarea'], ['reason', 'Hasil pelaksanaan atau kendala', 'textarea']] },
    Node_sok_konfirmasi_apd: { screen: 'E03', primary: ['sok-confirm-apd', 'Konfirmasi hasil kepada Piket Area'] },
    Node_sok_konfirmasi_area: { screen: 'E03', primary: ['sok-confirm-area', 'Konfirmasi hasil kepada Kepala Regu'] },
    Node_sok_terkonfirmasi: { screen: 'E03', primary: ['sok-confirmed', 'Nyatakan SOK terkonfirmasi'], alternatives: [['sok-retry', 'Belum terkonfirmasi · ulangi koordinasi'], ['sok-hold', 'Belum dapat dikoordinasikan ulang · minta On Hold']] },
  };
  function configuration(wo) {
    const config = configurations[wo?.nodeId];
    return config ? { fields: [['reason', 'Catatan konfirmasi', 'textarea']], ...config } : null;
  }
  function handle(context) {
    const { state, wo, actor, now, action, data, fail, follow, requireText, markHold, latestDocument } = context;
    const origin = wo.nodeId;
    const config = configuration(wo);
    if (!config || ![config.primary[0], ...(config.alternatives || []).map(option => option[0])].includes(action)) return false;
    wo.pendingReadinessMessage = null;
    function document(type, status) {
      const doc = latestDocument(type);
      if (!doc || doc.status !== status || data.documentVersionId !== doc.id) fail('Versi dokumen belum siap atau telah berubah. Buka ulang tugas.');
      return doc;
    }
    function handoff(kind, doc, recipientId, role) {
      if (typeof recipientId !== 'string' || !recipientId.trim()) fail('Penerima penugasan wajib ditentukan.');
      wo.deliveries ||= {};
      wo.deliveries[kind] = { id: global.crypto.randomUUID(), documentVersionId: doc.id, recipientId, recipientRole: role, handedBy: actor.id, handedAt: now };
    }
    function receipt(kind, type) {
      const doc = document(type, 'issued'); const delivery = wo.deliveries?.[kind];
      if (!delivery || delivery.documentVersionId !== doc.id || delivery.recipientId !== actor.id) fail('Anda bukan penerima versi surat ini.');
      if (data.acknowledged !== true) fail('Baca dan konfirmasi pemahaman surat terlebih dahulu.');
      delivery.receivedBy = actor.id; delivery.receivedAt = now; delivery.acknowledged = true;
      if(kind==='sp2b')Object.assign(delivery,details.signature(data,fail));
    }
    if (action === 'sp2b-deliver') {
      handoff('sp2b', document('SP2B', 'issued'), data.recipientId, 'pelaksana_pdkb'); follow('Node_tanda_terima_sp2b');
    }
    if (action === 'sp2b-receive') { receipt('sp2b', 'SP2B'); follow('Node_catat_tanda_terima'); }
    if (action === 'sp2b-record') {
      const doc = document('SP2B', 'issued'); const delivery = wo.deliveries?.sp2b;
      if (!delivery?.receivedAt || delivery.documentVersionId !== doc.id) fail('Tanda terima Pelaksana belum tersedia.');
      delivery.recordedBy = actor.id; delivery.recordedAt = now; follow('Node_bagikan_sp3b');
    }
    if (action === 'sp3b-deliver') {
      const doc = document('SP3B', 'issued');
      handoff('sp3b-regu', doc, data.reguRecipientId, 'kepala_regu'); handoff('sp3b-k3', doc, data.k3RecipientId, 'pengawas_k3'); follow('Node_terima_sp3b_regu');
    }
    if (action === 'sp3b-receive-regu') { receipt('sp3b-regu', 'SP3B'); follow('Node_terima_sp3b_k3'); }
    if (action === 'sp3b-receive-k3') { receipt('sp3b-k3', 'SP3B'); follow('Node_instruksi_periksa_ulang'); }
    if (action.startsWith('sp2b-') || action.startsWith('sp3b-')) {
      wo.handoffs ||= []; wo.handoffs.push({ id: global.crypto.randomUUID(), action, nodeId: origin, actorId: actor.id, at: now, deliveries: copy(wo.deliveries) }); return true;
    }
    function readiness() {
      wo.readiness ||= [];
      const flags = action === 'readiness-check' ? ['equipmentReady','materialReady','apdReady'] : action === 'safety-briefing' ? ['healthOk','apdOk'] : [];
      wo.readiness.push({ id: global.crypto.randomUUID(), nodeId: origin, actorId: actor.id, actorName: actor.name, at: now, data: { ...copy(data), ...Object.fromEntries(flags.map(key=>[key,data[key]===true])) } });
    }
    if (action === 'readiness-instruct') {
      document('EQUIPMENT_CHECKLIST', 'approved'); requireText('reason', 'instruksi pemeriksaan'); readiness(); follow('Node_periksa_kesiapan_lapangan'); return true;
    }
    if (action === 'readiness-check') {
      const checklist=document('EQUIPMENT_CHECKLIST', 'approved');
      requireText('reason', 'hasil pemeriksaan');
      if(data.itemChecks != null){
        if(!Array.isArray(data.itemChecks) || data.itemChecks.length!==checklist.items?.length)fail('Daftar pemeriksaan berbeda dengan versi checklist.');
        data.itemChecks=data.itemChecks.map(item=>{
          if(!['yes','no'].includes(item?.answer) || typeof item.note!=='string' || item.note.length>1000 || (item.answer==='no' && !item.note.trim()))fail('Pilih Ada/Tidak untuk setiap item dan beri keterangan untuk item yang tidak tersedia.');
          return {answer:item.answer,note:item.note.trim()};
        });
        for(const [category,key] of [['equipment','equipmentReady'],['material','materialReady']]){
          if(checklist.items.some((item,index)=>item.category===category && data.itemChecks[index].answer==='no'))data[key]=false;
        }
      }
      readiness();
      if (data.equipmentReady !== true || data.materialReady !== true) { markHold('kesiapan_lapangan'); follow('Node_alat_material_siap', 'Node_hold_kesiapan_lapangan'); }
      else if (data.apdReady !== true) wo.pendingReadinessMessage = 'Hasil pemeriksaan disimpan. Lengkapi APD dan catat pemeriksaan ulang sebelum melanjutkan.';
      else follow('Node_alat_material_siap', 'Node_job_briefing');
      return true;
    }
    if (action === 'job-briefing') {
      requireText('participants', 'peserta job briefing'); requireText('instructions', 'instruksi job briefing'); readiness(); follow('Node_safety_briefing'); return true;
    }
    if (action === 'safety-briefing') {
      for (const [key, label] of [['participants','personel yang diperiksa'],['reason','hasil pemeriksaan'],['briefing','materi safety briefing']]) requireText(key,label);
      readiness(); wo.briefing_k3_selesai = data.healthOk === true && data.apdOk === true;
      if (wo.briefing_k3_selesai) follow('Node_koordinasi_kepala_operasi');
      else wo.pendingReadinessMessage = 'Pemeriksaan disimpan. Kesehatan dan APD harus memenuhi sebelum kelanjutan. Catat hasil pemeriksaan ulang pada tugas ini.';
      return true;
    }
    if (action === 'start-coordinate') {
      requireText('counterpart', 'Kepala Operasi yang dihubungi'); requireText('reason', 'hasil koordinasi');
      if (!wo.briefing_k3_selesai) fail('Pemeriksaan kesehatan dan briefing belum lengkap.');
      readiness(); follow('Node_minta_sok'); return true;
    }
    if (action === 'sok-request') {
      for (const [key, label] of [['circuit','instalasi'],['boundary','batas pekerjaan'],['reason','permintaan SOK']]) requireText(key,label);
      if (!wo.briefing_k3_selesai) fail('Kesiapan dan briefing harus selesai sebelum permintaan SOK.');
      wo.sokRequests ||= [];
      wo.sokRequests.push({ id: global.crypto.randomUUID(), woId: wo.id, kind: 'sok-start', round: wo.sokRequests.length + 1, createdBy: actor.id, createdAt: now, data: {circuit:data.circuit,boundary:data.boundary,reason:data.reason}, eventIds: [] });
      wo.sokConfirmed = null;
    }
    const request = wo.sokRequests?.at(-1);
    if (!request || (action !== 'sok-request' && request.id !== data.requestId)) fail('Permintaan SOK tidak cocok dengan WO atau putaran aktif.');
    requireText('reason', 'hasil koordinasi / konfirmasi SOK');
    const routes = { 'sok-request':'Node_sok_piket_area', 'sok-area':'Node_sok_piket_apd', 'sok-apd':'Node_sok_petugas_gi', 'sok-gi':'Node_sok_konfirmasi_apd', 'sok-confirm-apd':'Node_sok_konfirmasi_area', 'sok-confirm-area':'Node_sok_terkonfirmasi' };
    if (action === 'sok-gi') requireText('settings', 'pengaturan yang dilaksanakan atau kendalanya');
    if (routes[action]) follow(routes[action]);
    if (action === 'sok-confirmed') {
      const events = state.operations.filter(event => event.woId === wo.id && event.requestId === request.id);
      if (!['Node_minta_sok','Node_sok_piket_area','Node_sok_piket_apd','Node_sok_petugas_gi','Node_sok_konfirmasi_apd','Node_sok_konfirmasi_area'].every(node => events.some(event => event.nodeId === node)) || !events.some(event => event.nodeId === 'Node_sok_petugas_gi' && event.data.applied === true)) fail('Pengaturan dan rangkaian konfirmasi pada permintaan ini belum lengkap.');
      wo.sokConfirmed = { requestId: request.id, actorId: actor.id, at: now }; follow('Node_periksa_cuaca');
    }
    if (action === 'sok-retry') follow('Node_ulang_koordinasi_sok','Node_minta_sok');
    if (action === 'sok-hold') { markHold('sok_awal'); follow('Node_ulang_koordinasi_sok','Node_hold_sok_awal'); }
    const result = action === 'sok-gi' ? (data.applied === true ? 'applied' : 'not-applied') : { 'sok-confirmed':'confirmed', 'sok-retry':'retry', 'sok-hold':'on-hold' }[action] || 'recorded';
    const event = { id: global.crypto.randomUUID(), woId: wo.id, requestId: request.id, kind: 'sok-start', nodeId: origin, actorId: actor.id, actorName: actor.name, unitId: actor.unitId, action, result, at: now, version: wo.version + 1, data: copy(data) };
    state.operations.push(event); wo.operationIds.push(event.id); request.eventIds.push(event.id);
    return true;
  }
  const actionLabels = {
    'sp2b-deliver':'SP2B diserahkan', 'sp2b-receive':'SP2B dipahami dan diterima', 'sp2b-record':'Tanda terima SP2B dicatat',
    'sp3b-deliver':'SP3B diserahkan', 'sp3b-receive-regu':'Penugasan pengawas pekerjaan diterima', 'sp3b-receive-k3':'Penugasan K3 diterima',
    'readiness-instruct':'Pemeriksaan ulang diperintahkan', 'readiness-check':'Kesiapan lapangan diperiksa', 'job-briefing':'Job briefing dicatat',
    'safety-briefing':'Kesehatan dan safety briefing dicatat', 'start-coordinate':'Rencana mulai dikoordinasikan',
    'sok-request':'SOK diminta', 'sok-area':'Permintaan diteruskan Area', 'sok-apd':'Pengaturan dikoordinasikan APD', 'sok-gi':'Hasil pengaturan GI dicatat',
    'sok-confirm-apd':'Hasil dikonfirmasi ke Area', 'sok-confirm-area':'Hasil dikonfirmasi ke Kepala Regu', 'sok-confirmed':'SOK terkonfirmasi',
    'sok-retry':'Koordinasi SOK diulang', 'sok-hold':'Pemenuhan konfirmasi SOK diminta',
  };
  const api = { configuration, handle, actionLabels };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.IwomsFieldPreparation = api;
})(typeof window !== 'undefined' ? window : globalThis);
