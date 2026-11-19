(function (global) {
  'use strict';
  const graph = typeof module !== 'undefined' && module.exports ? require('./preparation-graph.js') : global.IwomsPreparationGraph;
  const fieldPreparation = typeof module !== 'undefined' && module.exports ? require('./field-preparation.js') : global.IwomsFieldPreparation;
  const execution = typeof module !== 'undefined' && module.exports ? require('./execution.js') : global.IwomsExecution;
  const closure = typeof module !== 'undefined' && module.exports ? require('./closure.js') : global.IwomsClosure;
  const copy = value => JSON.parse(JSON.stringify(value));
  const holds = ['jsa', 'ibppr', 'izin_ketinggian', 'surat_kewenangan', 'sp2b', 'sp3b', 'checklist', 'kesiapan_lapangan', 'sok_awal', 'kondisi_awal', 'penerima_delegasi', 'bahaya_saat_pelaksanaan'].map((suffix, index) => {
    const resume = graph.edges.find(edge => edge.source === 'Node_resume_' + suffix);
    return { id: 'H' + String(index + 1).padStart(2, '0'), suffix, resumeNodeId: resume.target,
      coordinator: graph.nodes['Node_atasi_' + suffix].role, title: graph.nodes['Node_hold_' + suffix].title };
  });
  const documents = {
    SP2B: { submit: 'Node_siapkan_sp2b', revise: 'Node_perbaiki_sp2b', gateway: 'Node_bisa_perbaiki_sp2b', cause: 'sp2b', finalStatus: 'issued',
      fields: ['number', 'scope', 'circuit', 'workLocation', 'limits', 'workSupervisor', 'safetySupervisor'], submitLabel: 'Ajukan SP2B ke Supervisor', reviews: [
        ['Node_ttd_sp2b_sup', 'Node_valid_sp2b_sup', 'Node_ttd_sp2b_mgr'], ['Node_ttd_sp2b_mgr', 'Node_valid_sp2b_mgr', 'Node_siapkan_sp3b'] ] },
    SP3B: { submit: 'Node_siapkan_sp3b', revise: 'Node_perbaiki_sp3b', gateway: 'Node_bisa_perbaiki_sp3b', cause: 'sp3b', finalStatus: 'issued',
      fields: ['number', 'scope', 'workSupervisor', 'safetySupervisor'], submitLabel: 'Ajukan SP3B ke Supervisor', reviews: [
        ['Node_ttd_sp3b_sup', 'Node_valid_sp3b_sup', 'Node_ttd_sp3b_mgr'], ['Node_ttd_sp3b_mgr', 'Node_valid_sp3b_mgr', 'Node_susun_checklist'] ] },
    EQUIPMENT_CHECKLIST: { submit: 'Node_susun_checklist', revise: 'Node_perbaiki_checklist', gateway: 'Node_bisa_perbaiki_checklist', cause: 'checklist', checklist: true,
      fields: ['inspection'], submitLabel: 'Ajukan checklist ke Supervisor', reviews: [
        ['Node_cek_checklist_sup', 'Node_checklist_sesuai_sup', 'Node_cek_checklist_reg'], ['Node_cek_checklist_reg', 'Node_checklist_sesuai_reg', 'Node_serahkan_sp2b'] ] },
    JSA: { submit: 'Node_kirim_jsa', k3: 'Node_periksa_jsa_k3l', asman: 'Node_setuju_jsa_asman', revise: 'Node_revisi_jsa', gateway: 'Node_bisa_revisi_jsa', cause: 'jsa', next: 'Node_kirim_ibppr',
      k3Gateway: 'Node_sesuai_jsa_k3l', asmanGateway: 'Node_disetujui_jsa_asman', fields: ['steps', 'hazards', 'controls', 'responsible'] },
    IBPPR: { submit: 'Node_kirim_ibppr', k3: 'Node_periksa_ibppr_k3l', asman: 'Node_setuju_ibppr_asman', revise: 'Node_revisi_ibppr', gateway: 'Node_bisa_revisi_ibppr', cause: 'ibppr', next: 'Node_perlu_izin_ketinggian',
      k3Gateway: 'Node_sesuai_ibppr_k3l', asmanGateway: 'Node_disetujui_ibppr_asman', fields: ['hazards', 'riskAssessment', 'controls', 'residualRisk', 'responsible'] },
    HEIGHT_PERMIT: { submit: 'Node_siapkan_izin', revise: 'Node_revisi_izin', gateway: 'Node_izin_bisa_diperbaiki', cause: 'izin_ketinggian',
      fields: ['scope', 'workLocation', 'workers', 'hazards', 'precautions'],
      reviews: [
        ['Node_tandatangan_izin_k3', 'Node_izin_ok_k3', 'Node_tandatangan_izin_asman'],
        ['Node_tandatangan_izin_asman', 'Node_izin_ok_asman', 'Node_tandatangan_izin_p2k3'],
        ['Node_tandatangan_izin_p2k3', 'Node_izin_ok_p2k3', 'Node_tandatangan_izin_bagian'],
        ['Node_tandatangan_izin_bagian', 'Node_izin_ok_bagian', 'Node_izin_ketinggian_selesai'],
      ] },
  };
  const docAtNode = nodeId => nodeId && Object.entries(documents).find(([, config]) => [config.submit, config.k3, config.asman, config.revise, ...(config.reviews || []).map(review => review[0])].includes(nodeId));
  function latestDocument(state, wo, type) { return state.documents.filter(doc => doc.woId === wo.id && doc.type === type).at(-1); }
  function terminal(wo) { return wo.stage === 'preparation' && graph.nodes[wo.nodeId]?.type === 'endEvent'; }
  function holdAt(nodeId) { return holds.find(hold => nodeId.endsWith('_' + hold.suffix)); }
  function activeNode(wo) { return wo.stage === 'preparation' || wo.stage === 'jsa'; }
  const labels = { steps: 'Tahapan pekerjaan', hazards: 'Bahaya yang diidentifikasi', controls: 'Pengendalian risiko', responsible: 'Penanggung jawab', riskAssessment: 'Penilaian risiko awal', residualRisk: 'Risiko setelah pengendalian', scope: 'Ruang lingkup pekerjaan', workLocation: 'Lokasi pekerjaan', workers: 'Personel yang menggunakan izin', precautions: 'Pengamanan dan tindakan pencegahan', number: 'Nomor surat', circuit: 'Penyulang / instalasi', limits: 'Batas pekerjaan / ketentuan pelaksanaan', workSupervisor: 'Pengawas pekerjaan', safetySupervisor: 'Pengawas K3', inspection: 'Catatan pemeriksaan checklist', equipment: 'Peralatan', material: 'Material' };
  const actionLabels = {
    'hold-establish': 'On Hold ditetapkan', 'hold-fulfill': 'Hasil pemenuhan dikirim', 'hold-resolved': 'Kendala dinilai teratasi',
    'hold-temporary': 'Pemenuhan kendala diulang', 'hold-permanent': 'Kendala dinilai permanen', 'hold-resume': 'WO diaktifkan kembali pada tahap asal',
    'hold-request-cancel': 'Pembatalan diajukan', 'hold-approve-cancel': 'Pembatalan disetujui', 'hold-reject-cancel': 'Pembatalan ditolak',
    'document-submit': 'Versi dokumen diajukan', 'document-approve': 'Versi dokumen disetujui', 'document-reject': 'Versi dokumen dikembalikan',
    'document-revise': 'Perbaikan dokumen disiapkan', 'document-unrepairable': 'Pemenuhan dokumen diminta', 'document-file': 'Berkas pendukung disimpan',
    'height-needed': 'Izin ketinggian diperlukan', 'height-not-needed': 'Izin ketinggian tidak diperlukan', 'height-record': 'Izin lengkap dicatat',
    'authority-collect': 'Surat personel dikumpulkan', 'authority-verify': 'Kewenangan seluruh tim diperiksa', 'authority-use-replacement': 'Calon pengganti diminta',
    'authority-request-renewal': 'Pembaruan surat diminta', 'authority-replace': 'Pengganti diverifikasi', 'authority-renew': 'Pembaruan surat dicatat',
    'authority-renewal-failed': 'Pembaruan surat belum berhasil', 'authority-check-renewal': 'Surat baru diperiksa',
  };
  function validDate(value) { const date = new Date(value + 'T00:00:00Z'); return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value; }
  function normalizePeople(people, fail) {
    if (!Array.isArray(people) || !people.length) fail('Isi sedikitnya satu personel.');
    const rows = people.map(person => {
      const row = {};
      for (const key of ['personId', 'name', 'duty', 'requiredCompetence', 'certificateNo', 'competence', 'validFrom', 'validUntil', 'evidence']) {
        if (typeof person[key] !== 'string' || !person[key].trim()) fail('Lengkapi identitas, tugas, kompetensi, surat dan bukti setiap personel.');
        row[key] = person[key].trim();
      }
      if (!validDate(row.validFrom) || !validDate(row.validUntil) || row.validUntil < row.validFrom) fail('Masa berlaku surat tidak valid.');
      return row;
    });
    if (new Set(rows.map(person => person.personId)).size !== rows.length) fail('Identitas personel harus unik.');
    return rows;
  }
  function checkPeople(wo) {
    return (wo.authorityRoster?.people || []).map(person => {
      const date = wo.plan?.date || wo.jadwal_resmi_tanggal;
      const valid = !!date && person.validFrom <= date && person.validUntil >= date;
      const competence = person.competence.split(',').map(value => value.trim().toLowerCase()).includes(person.requiredCompetence.toLowerCase());
      return { personId: person.personId, name: person.name, valid: valid && competence, reason: !valid ? 'Surat tidak berlaku pada tanggal rencana' : !competence ? 'Kompetensi tidak sesuai tugas' : 'Sesuai kompetensi dan tanggal rencana' };
    });
  }
  function task(wo) {
    if (!activeNode(wo) || terminal(wo)) return null;
    const node = graph.nodes[wo.nodeId];
    const supported = !!configuration(wo).primary;
    const config = configuration(wo);
    return { id: wo.id + ':' + wo.version, woId: wo.id, nodeId: wo.nodeId, title: node.title, screen: config.screen || 'P03', role: node.role, assigneeId: config.receiver ? wo.deliveries?.[config.receiver]?.recipientId : null, unitId: wo.unitId, expectedVersion: wo.version, documentVersionId: wo.activeDocumentIds?.[config.documentType] || null, actionable: supported };
  }
  function handle(context) {
    const { state, wo, actor, now, action, data, edge, fail } = context;
    if (!activeNode(wo)) return false;
    const origin = wo.nodeId;
    function follow(...targets) {
      for (const target of targets) {
        const flow = graph.edges.find(item => item.source === wo.nodeId && item.target === target);
        if (!flow) fail('Transisi tidak ditemukan pada BPMN.');
        edge(flow.id); wo.nodeId = target;
      }
      wo.stage = 'preparation';
      const fieldStatus = { E01: 'Field Readiness', E02: 'Field Readiness', E03: 'SOK Coordination' }[fieldPreparation.configuration(wo)?.screen] || (wo.nodeId === 'Node_periksa_cuaca' ? 'Initial Condition Review' : 'Document Preparation');
      wo.status = terminal(wo) ? 'Canceled' : wo.nodeId.startsWith('Node_hold_') ? 'Hold Review' : holdAt(wo.nodeId) && /Node_(atasi|siap|resume|permanen|usul_batal|nilai_batal)_/.test(wo.nodeId) ? 'On Hold' : fieldStatus;
    }
    function requireText(key, label) { if (typeof data[key] !== 'string' || !data[key].trim()) fail('Lengkapi ' + label + '.'); }
    function preserveAssignment(updated) {
      const previous = wo.authorityRoster.people;
      if (updated.length !== previous.length || updated.some(person => !previous.some(old => old.personId === person.personId && old.name === person.name && old.duty === person.duty && old.requiredCompetence === person.requiredCompetence))) fail('Pembaruan mempertahankan identitas dan tugas personel asal.');
    }
    function markHold(suffix) { wo.pendingHold = { cause: suffix, originNodeId: origin, reason: data.reason }; }
    const hold = holdAt(origin);
    if (hold && /Node_(hold|atasi|siap|resume|usul_batal|nilai_batal)_/.test(origin)) {
      const current = wo.holds?.at(-1);
      const expectedAction = {
        ['Node_hold_' + hold.suffix]: ['hold-establish'], ['Node_atasi_' + hold.suffix]: ['hold-fulfill'],
        ['Node_siap_' + hold.suffix]: ['hold-resolved', 'hold-temporary', 'hold-permanent'],
        ['Node_resume_' + hold.suffix]: ['hold-resume'], ['Node_usul_batal_' + hold.suffix]: ['hold-request-cancel'],
        ['Node_nilai_batal_' + hold.suffix]: ['hold-approve-cancel', 'hold-reject-cancel'],
      }[origin];
      if (!expectedAction.includes(action)) fail('Pilih tindakan penanganan kendala yang tersedia.');
      requireText('reason', 'hasil penanganan / alasan keputusan');
      if (action === 'hold-establish') {
        wo.holds ||= [];
        wo.holds.push({ id: global.crypto.randomUUID(), causeId: hold.id, cause: hold.suffix, originNodeId: wo.pendingHold?.originNodeId || origin, holdNodeId: origin, resumeNodeId: hold.resumeNodeId, coordinatorRole: hold.coordinator, startedAt: now, actorId: actor.id, reason: data.reason, attempts: [] });
        follow('Node_atasi_' + hold.suffix);
      } else {
        if (!current || current.cause !== hold.suffix || current.resolvedAt || current.cancelledAt) fail('Kendala aktif tidak cocok dengan tugas ini.');
        current.attempts.push({ action, actorId: actor.id, at: now, reason: data.reason });
        if (action === 'hold-fulfill') {
          if (hold.id === 'H04' && wo.authorityRoster) {
            const updated = normalizePeople(data.people, fail); preserveAssignment(updated); storeRoster(updated, 'fulfillment');
          }
          follow('Node_siap_' + hold.suffix);
        }
        if (action === 'hold-resolved') {
          if (hold.id === 'H04' && wo.authorityRoster && !checkPeople(wo).every(person => person.valid)) fail('Kewenangan personel belum memenuhi. Lanjutkan pemenuhan atau ajukan pembatalan.');
          follow('Node_resume_' + hold.suffix);
        }
        if (action === 'hold-resume') { follow(hold.resumeNodeId); current.resolvedAt = now; wo.pendingHold = null; }
        if (action === 'hold-temporary') follow('Node_permanen_' + hold.suffix, 'Node_atasi_' + hold.suffix);
        if (action === 'hold-permanent') follow('Node_permanen_' + hold.suffix, 'Node_usul_batal_' + hold.suffix);
        if (action === 'hold-request-cancel') follow('Node_nilai_batal_' + hold.suffix);
        if (action === 'hold-approve-cancel') { follow('Node_putusan_batal_' + hold.suffix, 'Node_end_batal_' + hold.suffix); current.cancelledAt = now; wo.cancelledAt = now; }
        if (action === 'hold-reject-cancel') follow('Node_putusan_batal_' + hold.suffix, 'Node_atasi_' + hold.suffix);
      }
      return true;
    }
    const atDocument = docAtNode(origin);
    if (action === 'document-file' && atDocument && origin === atDocument[1].submit) {
      requireText('name', 'nama berkas'); requireText('content', 'isi berkas');
      if (!/^data:(application\/pdf|image\/(png|jpeg|webp));base64,[A-Za-z0-9+/=]+$/.test(data.content) || data.content.length > 2800000) fail('Pilih PDF atau gambar maksimal 2 MB.');
      const file = { id: global.crypto.randomUUID(), woId: wo.id, type: 'support-file', documentType: atDocument[0], forVersion: (latestDocument(state, wo, atDocument[0])?.version || 0) + 1, name: data.name, mime: data.mime, content: data.content, version: 1, createdBy: actor.id, at: now };
      state.documents.push(file); wo.documentIds.push(file.id);
      return true;
    }
    if (atDocument) {
      const [type, config] = atDocument;
      const latest = latestDocument(state, wo, type);
      if (origin === config.submit && action === 'document-submit') {
        if (['SP2B', 'SP3B'].includes(type)) {
          if (!wo.authorityValid || !checkPeople(wo).length || !checkPeople(wo).every(person => person.valid)) fail('Kewenangan seluruh tim harus memenuhi sebelum surat diajukan.');
          if (!wo.authorityRoster.people.some(person => person.personId === data.workSupervisor) || !wo.authorityRoster.people.some(person => person.personId === data.safetySupervisor)) fail('Pilih pengawas dari personel yang telah diverifikasi.');
          if (state.documents.some(doc => doc.type === type && doc.woId !== wo.id && ['submitted','issued'].includes(doc.status) && doc.payload?.number === data.number?.trim())) fail('Nomor surat telah digunakan WO lain.');
        }
        if (type === 'SP3B' && latestDocument(state, wo, 'SP2B')?.status !== 'issued') fail('SP2B harus terbit terlebih dahulu.');
        if (type === 'EQUIPMENT_CHECKLIST' && latestDocument(state, wo, 'SP3B')?.status !== 'issued') fail('SP3B harus terbit terlebih dahulu.');
        if (type === 'IBPPR' && latestDocument(state, wo, 'JSA')?.status !== 'approved') fail('JSA harus disetujui lebih dahulu.');
        if (type === 'HEIGHT_PERMIT' && wo.heightRequired !== true) fail('Keputusan kebutuhan izin belum tercatat.');
        for (const key of config.fields) requireText(key, labels[key]);
        const payload = Object.fromEntries(config.fields.map(key => [key, data[key].trim()]));
        let items;
        if (config.checklist) {
          if (!Array.isArray(data.items) || !data.items.length) fail('Isi daftar peralatan dan material.');
          items = data.items.map(item => {
            if (!item.name?.trim() || !['equipment', 'material'].includes(item.category) || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0 || !item.unit?.trim() || !item.condition?.trim()) fail('Lengkapi jenis, nama, jumlah, satuan dan kondisi setiap item.');
            return { category: item.category, name: item.name.trim(), quantity: Number(item.quantity), unit: item.unit.trim(), condition: item.condition.trim() };
          });
          if (!['equipment', 'material'].every(category => items.some(item => item.category === category))) fail('Checklist harus memuat peralatan dan material.');
          for (const category of ['equipment', 'material']) payload[category] = items.filter(item => item.category === category).map(item => item.name + ' · ' + item.quantity + ' ' + item.unit + ' · ' + item.condition).join('\n');
        }
        const record = { id: global.crypto.randomUUID(), woId: wo.id, type, version: (latest?.version || 0) + 1, status: 'submitted', payload,
          sourceSurveyVersion: wo.surveyVersions.length, planSnapshot: copy(wo.plan), submittedBy: actor.id, submittedByName: actor.name, submittedAt: now, decisions: [], fileIds: state.documents.filter(doc => doc.woId === wo.id && doc.type === 'support-file' && doc.documentType === type && doc.forVersion === (latest?.version || 0) + 1).map(doc => doc.id) };
        state.documents.push(record); wo.documentIds.push(record.id);
        if (items) record.items = items;
        if (['SP2B', 'SP3B'].includes(type)) {
          record.rosterSnapshot = copy(wo.authorityRoster); record.sourceRosterVersion = wo.authorityRoster.version; record.sourceSp2bId = type === 'SP3B' ? latestDocument(state, wo, 'SP2B').id : null;
          if (type === 'SP3B') { const source = latestDocument(state, wo, 'SP2B'); record.payload.circuit = source.payload.circuit; record.payload.workLocation = source.payload.workLocation; }
        }
        wo.activeDocumentIds ||= {}; wo.activeDocumentIds[type] = record.id;
        follow(config.reviews ? config.reviews[0][0] : config.k3);
      } else if (origin === config.revise && ['document-revise', 'document-unrepairable'].includes(action)) {
        requireText('reason', 'rencana perbaikan');
        if (action === 'document-revise') follow(config.gateway, config.submit);
        else { markHold(config.cause); follow(config.gateway, 'Node_hold_' + config.cause); }
      } else if (['document-approve', 'document-reject'].includes(action)) {
        if (!latest || latest.id !== data.documentVersionId || latest.status !== 'submitted') fail('Versi dokumen berubah. Buka ulang tugas untuk memeriksa versi aktif.', 'CONFLICT');
        const review = config.reviews ? config.reviews.find(row => row[0] === origin) : origin === config.k3 ? [origin, config.k3Gateway, config.asman] : origin === config.asman ? [origin, config.asmanGateway, config.next] : null;
        if (!review) fail('Dokumen belum berada di tahap pemeriksaan.');
        const approved = action === 'document-approve';
        if (!approved) requireText('reason', 'alasan pengembalian');
        latest.decisions.push({ id: global.crypto.randomUUID(), result: approved ? 'approved' : 'rejected', actorId: actor.id, actorName: actor.name, role: actor.role, nodeId: origin, at: now, reason: data.reason || '' });
        if (!approved) { latest.status = 'rejected'; latest.rejectedReason = data.reason; follow(review[1], config.revise); }
        else {
          if (origin === config.asman || (config.reviews && origin === config.reviews.at(-1)[0])) {
            latest.status = config.finalStatus || 'approved'; latest.approvedAt = now;
            if (latest.status === 'issued') { latest.issuedAt = now; latest.issuedBy = actor.id; }
          }
          follow(review[1], review[2]);
        }
      } else fail('Tindakan tidak sesuai dengan tugas dokumen.');
      return true;
    }
    if (origin === 'Node_perlu_izin_ketinggian' && ['height-needed', 'height-not-needed'].includes(action)) {
      requireText('reason', 'dasar kebutuhan izin');
      wo.heightRequired = action === 'height-needed'; wo.heightDecision = { required: wo.heightRequired, reason: data.reason, actorId: actor.id, at: now };
      if (wo.heightRequired) follow('Node_siapkan_izin');
      else follow('Node_gabung_izin', 'Node_minta_kewenangan');
      return true;
    }
    if (origin === 'Node_izin_ketinggian_selesai' && action === 'height-record') {
      const permit = latestDocument(state, wo, 'HEIGHT_PERMIT');
      if (!permit || permit.status !== 'approved' || permit.decisions.length !== 4 || permit.id !== data.documentVersionId) fail('Izin belum lengkap ditandatangani atau versinya telah berubah.');
      permit.status = 'issued'; permit.recordedAt = now; permit.recordedBy = actor.id; wo.heightPermitId = permit.id;
      follow('Node_gabung_izin', 'Node_minta_kewenangan'); return true;
    }
    function storeRoster(people, kind) {
      const roster = { id: global.crypto.randomUUID(), woId: wo.id, type: 'AUTHORITY_ROSTER', version: (wo.authorityRoster?.version || 0) + 1, people, kind, createdBy: actor.id, at: now };
      state.documents.push(copy(roster)); wo.documentIds.push(roster.id); wo.authorityRoster = roster;
      wo.assignedPersonIds = people.map(person => person.personId); wo.authorityValid = false;
    }
    if (origin === 'Node_minta_kewenangan' && action === 'authority-collect') {
      storeRoster(normalizePeople(data.people, fail), 'initial'); follow('Node_verifikasi_kewenangan'); return true;
    }
    if (origin === 'Node_verifikasi_kewenangan' && action === 'authority-verify') {
      const results = checkPeople(wo);
      if (!results.length) fail('Surat personel belum dikumpulkan.');
      wo.authorityReviews ||= [];
      wo.authorityReviews.push({ rosterVersion: wo.authorityRoster.version, planDate: wo.plan?.date, actorId: actor.id, at: now, results });
      wo.authorityValid = results.every(person => person.valid);
      follow('Node_kewenangan_valid', wo.authorityValid ? 'Node_siapkan_sp2b' : 'Node_tindak_lanjut_kewenangan'); return true;
    }
    if (origin === 'Node_tindak_lanjut_kewenangan' && ['authority-use-replacement', 'authority-request-renewal'].includes(action)) {
      requireText('reason', 'dasar tindak lanjut personel');
      follow('Node_pengganti_tersedia', action === 'authority-use-replacement' ? 'Node_verifikasi_pengganti' : 'Node_terbitkan_surat'); return true;
    }
    if (origin === 'Node_verifikasi_pengganti' && action === 'authority-replace') {
      if (!Array.isArray(data.replacements) || !data.replacements.length) fail('Isi calon pengganti dan personel yang diganti.');
      const people = copy(wo.authorityRoster.people);
      const changed = new Set();
      for (const replacement of data.replacements) {
        const index = people.findIndex(person => person.personId === replacement.replacesId);
        if (index < 0 || changed.has(replacement.replacesId)) fail('Pilih personel asal yang benar dan berbeda untuk setiap pengganti.');
        const candidate = normalizePeople([replacement], fail)[0];
        if (candidate.personId === replacement.replacesId) fail('Pengganti harus mempunyai identitas personel berbeda.');
        if (checkPeople(wo).find(person => person.personId === replacement.replacesId)?.valid) fail('Pilih personel dengan kewenangan yang belum memenuhi.');
        if (candidate.duty !== people[index].duty || candidate.requiredCompetence !== people[index].requiredCompetence) fail('Pengganti harus memenuhi tugas dan kompetensi yang sama dengan personel asal.');
        changed.add(replacement.replacesId); people[index] = candidate;
      }
      storeRoster(normalizePeople(people, fail), 'replacement');
      follow('Node_verifikasi_kewenangan'); return true;
    }
    if (origin === 'Node_terbitkan_surat' && ['authority-renew', 'authority-renewal-failed'].includes(action)) {
      requireText('reason', 'hasil pembaruan surat');
      if (action === 'authority-renewal-failed') { markHold('surat_kewenangan'); follow('Node_pembaruan_berhasil', 'Node_hold_surat_kewenangan'); }
      else {
        const updated = normalizePeople(data.people, fail);
        preserveAssignment(updated);
        storeRoster(updated, 'renewal'); follow('Node_pembaruan_berhasil', 'Node_verifikasi_surat_baru');
      }
      return true;
    }
    if (origin === 'Node_verifikasi_surat_baru' && action === 'authority-check-renewal') {
      wo.renewalVerification = { rosterVersion: wo.authorityRoster.version, actorId: actor.id, at: now, results: checkPeople(wo) };
      follow('Node_verifikasi_kewenangan'); return true;
    }
    const extended = { ...context, follow, requireText, markHold, graph, checkPeople, latestDocument: type => latestDocument(state, wo, type) };
    return fieldPreparation.handle(extended) || execution.handle(extended) || closure.handle(extended);
  }
  function configuration(wo) {
    const node = wo?.nodeId;
    const reason = [['reason', 'Alasan / hasil pemeriksaan', 'textarea']];
    const hold = node && holdAt(node);
    if (hold) {
      const prefix = node.slice(0, -(hold.suffix.length + 1));
      const actions = {
        Node_hold: [['hold-establish', 'Tetapkan On Hold dan tugaskan pemenuhan']],
        Node_atasi: [['hold-fulfill', 'Kirim hasil pemenuhan ke Supervisor']],
        Node_siap: [['hold-resolved', 'Kendala teratasi'], ['hold-temporary', 'Masih dapat ditangani'], ['hold-permanent', 'Kendala tidak dapat diselesaikan']],
        Node_resume: [['hold-resume', 'Aktifkan kembali pada tahap asal']],
        Node_usul_batal: [['hold-request-cancel', 'Ajukan pembatalan ke Manajer']],
        Node_nilai_batal: [['hold-approve-cancel', 'Setujui pembatalan'], ['hold-reject-cancel', 'Tolak pembatalan dan lanjutkan pemenuhan']],
      }[prefix];
      if (actions) return { fields: reason, primary: actions[0], alternatives: actions.slice(1), roster: prefix === 'Node_atasi' && hold.id === 'H04' && wo.authorityRoster ? 'fulfillment' : null };
    }
    const entry = docAtNode(node);
    if (entry) {
      const [type, config] = entry;
      if (node === config.submit) return { documentType: type, fields: config.fields.map(key => [key, labels[key], ['workSupervisor','safetySupervisor'].includes(key) ? 'person' : key === 'number' ? 'text' : 'textarea']), primary: ['document-submit', config.submitLabel || 'Ajukan ' + (type === 'HEIGHT_PERMIT' ? 'izin ke Pengawas K3' : type + ' ke P2K3/K3L')], upload: true, checklist: config.checklist };
      if (node === config.revise) return { documentType: type, fields: reason, primary: ['document-revise', 'Perbaiki dan siapkan versi baru'], alternatives: [['document-unrepairable', 'Belum dapat diperbaiki · minta On Hold']] };
      return { documentType: type, fields: reason, primary: ['document-approve', config.finalStatus === 'issued' && node === config.reviews.at(-1)[0] ? 'Terbitkan dan tanda tangani ' + type : 'Setujui versi dokumen ini'], alternatives: [['document-reject', 'Kembalikan kepada Preparator']] };
    }
    const configs = {
      Node_perlu_izin_ketinggian: { fields: reason, primary: ['height-needed', 'Perlu izin ketinggian'], alternatives: [['height-not-needed', 'Tidak memerlukan izin ketinggian']] },
      Node_izin_ketinggian_selesai: { fields: [], documentType: 'HEIGHT_PERMIT', primary: ['height-record', 'Catat izin yang lengkap ditandatangani'] },
      Node_minta_kewenangan: { fields: [], roster: 'collect', primary: ['authority-collect', 'Simpan surat personel untuk diverifikasi'] },
      Node_verifikasi_kewenangan: { fields: [], primary: ['authority-verify', 'Verifikasi kompetensi dan masa berlaku'] },
      Node_tindak_lanjut_kewenangan: { fields: reason, primary: ['authority-use-replacement', 'Tersedia calon pengganti'], alternatives: [['authority-request-renewal', 'Minta pembaruan surat ke Manajer']] },
      Node_verifikasi_pengganti: { fields: [], roster: 'replacement', primary: ['authority-replace', 'Catat verifikasi pengganti dan periksa ulang tim'] },
      Node_terbitkan_surat: { fields: reason, roster: 'renewal', primary: ['authority-renew', 'Catat surat yang diperbarui'], alternatives: [['authority-renewal-failed', 'Surat belum dapat diperbarui · minta On Hold']] },
      Node_verifikasi_surat_baru: { fields: [], primary: ['authority-check-renewal', 'Verifikasi surat baru dan periksa ulang tim'] },
    };
    const close = closure.configuration(wo);
    if(close) return {...close,documentType:closure.documentType(node)};
    return configs[node] || fieldPreparation.configuration(wo) || execution.configuration(wo) || { fields: [], boundary: graph.nodes[node]?.title || '', terminal: graph.nodes[node]?.type === 'endEvent' };
  }
  const api = { graph, holds, documents, labels, actionLabels: { ...actionLabels, ...fieldPreparation.actionLabels }, task, activeNode, terminal, configuration, latestDocument, checkPeople, handle };
  api.parallelTasks = execution.parallelTasks;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.IwomsPreparation = api;
})(typeof window !== 'undefined' ? window : globalThis);
