(function (global) {
  'use strict';
  const PROCESS = 'pdkb-6aa0861f';
  const KEY = 'iwoms.pdkb.demo.v1';
  const UNIT = 'PLN UID YOGYAKARTA';
  const preparation = typeof module !== 'undefined' && module.exports ? require('./preparation.js') : global.IwomsPreparation;
  const monthly = typeof module !== 'undefined' && module.exports ? require('./monthly.js') : global.IwomsMonthly;
  /**
   * @typedef {Object} OperationEvent
   * @property {string} id
   * @property {string} woId
   * @property {string} requestId Correlation of the request and its confirmations.
   * @property {'sok-start'|'sok-normalization'} kind
   * @property {string} nodeId
   * @property {string} actorId
   * @property {string} unitId
   * @property {string} result
   * @property {string} at ISO UTC event time.
   * @property {number} version
   */
  /**
   * @typedef {Object} PeriodReport
   * @property {string} id
   * @property {string} period Calendar month in YYYY-MM format.
   * @property {string} unitId
   * @property {number} version
   * @property {string} nodeId
   * @property {string} processVersion
   * @property {string} createdBy
   * @property {string} createdAt
   * @property {Array<{woId:string, operationalCompletedAt:string, woVersion:number}>} snapshot
   * @property {Array<string>} documentVersionIds
   * @property {Array<string>} decisionIds
   */
  const clone = value => JSON.parse(JSON.stringify(value));
  const proposers = ['tl_op', 'tl_har', 'tl_konstruksi'];
  const knownRoles = [...proposers, 'asman_jaringan', 'supervisor_pdkb', 'manajer_area', 'preparator_pdkb', 'p2k3_k3l', 'bagian_terkait', 'kepala_regu', 'pengawas_k3', 'pelaksana_pdkb', 'piket_area', 'piket_apd', 'petugas_gi', 'komisi_unit', 'komisi_pusat', 'superadmin'];
  const suffix = role => ({ tl_op: 'op', tl_har: 'har', tl_konstruksi: 'konstruksi' })[role];
  const stages = {
    draft: ['Draft', 'P01', 'Lengkapi dan ajukan WO'],
    asman: ['Submitted', 'P02', 'Periksa usulan WO'],
    supervisor: ['Submitted', 'P02', 'Evaluasi usulan WO'],
    manager: ['Submitted', 'P02', 'Sahkan usulan WO'],
    return: ['Rejected', 'P02', 'Teruskan alasan ke pengusul asal'],
    revision: ['Rejected', 'P01', 'Perbaiki atau hentikan pengajuan'],
    priority: ['Approved', 'P03', 'Tetapkan prioritas dan rencana kerja'],
    survey: ['Survey', 'P03', 'Isi hasil survei lokasi'],
    analysis: ['Survey', 'P03', 'Susun analisis awal JSA dan IBPPR'],
    feasibility: ['Feasibility Review', 'P03', 'Periksa kelayakan pekerjaan'],
    notify: ['Survey Stopped', 'P03', 'Beritahukan hasil kepada pengusul'],
    plan: ['Planning', 'P03', 'Susun jadwal, personel dan metode'],
    jsa: ['JSA Preparation', 'P03', 'Ajukan JSA untuk diperiksa'],
    preparation: ['Document Preparation', 'P03', 'Persiapan dokumen dan kewenangan'],
    legacy: ['Assignment Review', 'P03', 'Tinjau penugasan lama'],
    stopped: ['Proposal Stopped', 'P01', 'Pengajuan dihentikan'],
    surveyStopped: ['Survey Stopped', 'P03', 'WO dihentikan karena survei tidak layak'],
  };
  const nodes = {
    asman: 'Node_periksa_wo_asman', supervisor: 'Node_periksa_wo_supervisor', manager: 'Node_periksa_wo_manajer',
    return: 'Node_identifikasi_pengaju', priority: 'Node_prioritas_wo', survey: 'Node_survei_lokasi',
    analysis: 'Node_susun_analisis_awal', feasibility: 'Node_supervisor_surv', notify: 'Node_beritahu_pengaju_survei',
    plan: 'Node_rencana_pelaksanaan', jsa: 'Node_kirim_jsa', surveyStopped: 'Node_end_survei', legacy: null,
  };
  const roles = {
    asman: 'asman_jaringan', supervisor: 'supervisor_pdkb', manager: 'manajer_area', return: 'asman_jaringan',
    priority: 'supervisor_pdkb', survey: 'preparator_pdkb', analysis: 'preparator_pdkb', feasibility: 'supervisor_pdkb',
    notify: 'supervisor_pdkb', plan: 'preparator_pdkb', jsa: 'preparator_pdkb', legacy: 'supervisor_pdkb',
  };
  function fail(message, code = 'VALIDATION') { const error = new Error(message); error.code = code; throw error; }
  function required(data, fields) {
    const labels = { nama_wo: 'nama WO', lokasi: 'lokasi', katalog_id: 'katalog pekerjaan', proses_bisnis: 'proses bisnis', uraian: 'uraian kebutuhan', reason: 'alasan keputusan', priority: 'prioritas', workPlan: 'rencana kerja', surveyDate: 'tanggal survei', location: 'lokasi survei', findings: 'hasil survei', access: 'akses lokasi', equipment: 'kebutuhan peralatan', material: 'kebutuhan material', jsa: 'analisis awal JSA', ibppr: 'analisis awal IBPPR', date: 'tanggal rencana', time: 'jam rencana', personnel: 'personel', method: 'metode kerja', ownerRole: 'pengusul asal', decision: 'keputusan' };
    for (const field of fields) if (typeof data[field] !== 'string' || !data[field].trim()) fail('Lengkapi ' + (labels[field] || field.replaceAll('_', ' ')) + '.');
  }
  function validDate(value) {
    const date = new Date(value + 'T00:00:00Z');
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
  }
  function empty() {
    return { schema: 1, processVersion: PROCESS, revision: 0, orders: [], tasks: [], documents: [], operations: [], reports: [], audits: [], notifications: [], receipts: {} };
  }
  function taskFor(wo) {
    if (preparation.activeNode(wo)) return preparation.task(wo);
    if (['stopped', 'surveyStopped'].includes(wo.stage)) return null;
    return {
      id: wo.id + ':' + wo.version, woId: wo.id, nodeId: wo.nodeId, title: stages[wo.stage][2], screen: stages[wo.stage][1],
      role: roles[wo.stage] || wo.ownerRole, assigneeId: ['draft', 'revision'].includes(wo.stage) ? wo.ownerId : null,
      unitId: wo.unitId, expectedVersion: wo.version, actionable: wo.stage !== 'jsa',
    };
  }
  function tasksFor(wo) {
    const tasks = wo.nodeId === 'Node_parallel_mulai' ? preparation.parallelTasks(wo).map(nodeId => ({
      ...preparation.task({...wo,nodeId}), id: wo.id + ':' + wo.version + ':' + nodeId
    })) : [taskFor(wo)].filter(Boolean);
    if (wo.wipVersions?.at(-1)?.status === 'submitted') tasks.push({id:wo.id+':wip',woId:wo.id,role:'p2k3_k3l',unitId:wo.unitId,screen:'R02',title:'Periksa WIP yang diajukan',actionable:true});
    return tasks;
  }
  function updateWip(wo, actor, action, data, at) {
    if (!wo.executionRounds?.length) fail('WIP tersedia setelah pelaksanaan dimulai.');
    const role = action === 'wip-approve' ? 'p2k3_k3l' : 'pengawas_k3';
    if (actor.role !== role) fail('Role tidak berwenang atas tindakan WIP.', 'FORBIDDEN');
    wo.wipVersions ||= [];
    const latest = wo.wipVersions.at(-1);
    if (action === 'wip-approve') {
      if (!latest || latest.status !== 'submitted' || latest.id !== data.wipId) fail('Pilih versi WIP aktif yang telah diajukan.');
      latest.status = 'approved'; latest.approvedAt = at; latest.approvedBy = actor.id;
      wo.wip_disahkan_k3l = true; wo.wipScore = latest.score;
      return;
    }
    if (latest?.status === 'submitted') fail('Versi aktif sedang menunggu pemeriksaan K3L.');
    const rows = data.rows;
    if (!Array.isArray(rows) || rows.length !== 22 || rows.some((row,index)=>row.no!==index+1 || !['','Ya','Tidak','N/A'].includes(row.answer) || typeof row.note!=='string')) fail('Isi format 22 butir WIP.');
    const yes=rows.filter(row=>row.answer==='Ya').length;
    const answered=rows.filter(row=>['Ya','Tidak'].includes(row.answer)).length;
    if (action==='wip-submit' && (!answered || rows.some(row=>!row.answer))) fail('Lengkapi 22 jawaban dan minimal satu Ya/Tidak.');
    const version={id:global.crypto.randomUUID(),version:(latest?.version || 0)+1,status:action==='wip-submit'?'submitted':'draft',rows:clone(rows),score:answered?Number((100*yes/answered).toFixed(1)):null,actorId:actor.id,at};
    wo.wipVersions.push(version);
    wo.wip_disahkan_k3l = false; wo.wipScore = null;
  }
  class Repository {
    constructor(storage, key = KEY) { this.storage = storage; this.key = key; this.state = this.read(); }
    read() {
      const raw = this.storage.getItem(this.key);
      if (!raw) return empty();
      let state;
      try { state = JSON.parse(raw); } catch { fail('Penyimpanan demo tidak dapat dibaca. Ekspor data tersimpan sebelum memulihkan.', 'STORAGE'); }
      if (state.schema !== 1 || state.processVersion !== PROCESS || !['orders', 'tasks', 'documents', 'operations', 'reports', 'audits', 'notifications'].every(key => Array.isArray(state[key])) || !state.receipts || !Number.isInteger(state.revision)) fail('Versi penyimpanan belum didukung.', 'STORAGE');
      state.tasks = state.orders.flatMap(tasksFor);
      return state;
    }
    reload() { this.state = this.read(); return this.snapshot(); }
    snapshot() { return clone(this.state); }
    canRead(wo, actor) {
      return knownRoles.includes(actor.role) && wo.unitId === actor.unitId && (!proposers.includes(actor.role) || wo.ownerId === actor.id);
    }
    orders(actor) { return clone(this.state.orders.filter(wo => this.canRead(wo, actor))); }
    tasks(actor) {
      return clone(this.state.tasks.filter(task => task.unitId === actor.unitId && task.role === actor.role && (!task.assigneeId || task.assigneeId === actor.id)));
    }
    command(request, actor) {
      const { action, data = {}, idempotencyKey, expectedVersion, woId } = request;
      if (!idempotencyKey || !actor.id || !actor.unitId) fail('Identitas dan kunci tindakan wajib diisi.');
      const latest = this.read();
      const receiptKey = actor.id + ':' + idempotencyKey;
      const signature = JSON.stringify({ action, data, woId, expectedVersion, role: actor.role, unit: actor.unitId });
      const receipt = latest.receipts[receiptKey];
      if (receipt) {
        if (receipt.signature !== signature) fail('Kunci tindakan sudah digunakan untuk isi berbeda.', 'CONFLICT');
        this.state = latest;
        return clone(receipt.result);
      }
      if (latest.revision !== this.state.revision) fail('Data berubah di sesi lain. Muat ulang sebelum melanjutkan.', 'CONFLICT');
      const next = clone(latest);
      if (action.startsWith('monthly-')) {
        const result=monthly.handle(next,request,actor,new Date().toISOString(),fail);
        next.receipts[receiptKey]={signature,result};
        next.revision++;
        this.storage.setItem(this.key,JSON.stringify(next));
        this.state=next;
        return clone(result);
      }
      let wo = next.orders.find(order => order.id === woId);
      const now = new Date().toISOString();
      const workDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
      const trail = [];
      let auditNode;
      let auditTarget;
      const edge = (...ids) => trail.push(...ids);
      const move = stage => { wo.stage = stage; wo.status = stages[stage][0]; wo.nodeId = nodes[stage] || 'Node_pilih_' + suffix(wo.ownerRole); };
      if (action === 'create') {
        if (!proposers.includes(actor.role)) fail('Hanya TL pengusul dapat membuat WO.', 'FORBIDDEN');
        const id = 'WO-' + workDate.replaceAll('-', '') + '-' + global.crypto.randomUUID().slice(0, 8);
        wo = { id, ownerId: actor.id, ownerRole: actor.role, unitId: actor.unitId, pengusul: actor.name, version: 0, processVersion: PROCESS,
          createdAt: now, tanggal_pengajuan: workDate, approval_asman: {}, approval_supervisor: {}, approval_manajer: {},
          surveyVersions: [], initialAnalyses: [], documentIds: [], operationIds: [], category: 'demo', progres_persen: 0,
          briefing_k3_selesai: false, working_permit_nomor: null, area_diterima_operasi: false, wip_disahkan_k3l: false, laporan_diterima: false };
        next.orders.push(wo);
        move('draft'); wo.nodeId = 'Node_buat_' + suffix(actor.role);
        edge({ tl_op: 'Flow_0001', tl_har: 'Flow_0002', tl_konstruksi: 'Flow_0003' }[actor.role]);
        Object.assign(wo, this.proposal(data, false));
      } else {
        if (!wo || !this.canRead(wo, actor)) fail('WO tidak tersedia dalam cakupan Anda.', 'FORBIDDEN');
        if (wo.version !== expectedVersion) fail('Versi WO berubah. Muat ulang sebelum menyimpan.', 'CONFLICT');
        const task = next.tasks.find(item => item.woId === wo.id && item.role === actor.role && item.screen !== 'R02');
        const wip = ['wip-save','wip-submit','wip-approve'].includes(action);
        if (!wip && (!task || task.unitId !== actor.unitId || (task.assigneeId && task.assigneeId !== actor.id))) fail('Tindakan ini bukan giliran Anda.', 'FORBIDDEN');
        switch (action) {
          case 'wip-save':
          case 'wip-submit':
          case 'wip-approve':
            updateWip(wo,actor,action,data,now);
            break;
          case 'attach':
            if (!['draft', 'revision'].includes(wo.stage)) fail('Lampiran pengajuan diperbarui saat menyusun draft atau revisi.');
            required(data, ['name', 'mime', 'content']);
            if (!/^data:(application\/pdf|image\/(png|jpeg|webp));base64,[A-Za-z0-9+/=]+$/.test(data.content)) fail('Gunakan berkas PDF, PNG, JPEG atau WebP.');
            if (data.content.length > 2800000) fail('Ukuran lampiran demo maksimal 2 MB per berkas.');
            const attachment = { id: global.crypto.randomUUID(), woId: wo.id, type: 'proposal-attachment', version: 1, ...clone(data), createdBy: actor.id, at: now };
            next.documents.push(attachment); wo.documentIds.push(attachment.id);
            break;
          case 'save':
          case 'submit': {
            if (!['draft', 'revision'].includes(wo.stage)) fail('WO tidak sedang dalam pengajuan.');
            Object.assign(wo, this.proposal(data, action === 'submit'));
            if (action === 'submit') {
              const revised = wo.stage === 'revision';
              const flows = { tl_op: revised ? ['Flow_0018', 'Flow_0019', 'Flow_0021'] : ['Flow_0004'], tl_har: revised ? ['Flow_0023', 'Flow_0024', 'Flow_0026'] : ['Flow_0005'], tl_konstruksi: revised ? ['Flow_0028', 'Flow_0029', 'Flow_0031'] : ['Flow_0006'] };
              edge(...flows[wo.ownerRole], 'Flow_0007');
              wo.approval_asman = {}; wo.approval_supervisor = {}; wo.approval_manajer = {};
              move('asman');
            }
            break;
          }
          case 'approve': {
            const approvals = { asman: ['approval_asman', 'supervisor', 'Flow_0008', 'Flow_0009'], supervisor: ['approval_supervisor', 'manager', 'Flow_0010', 'Flow_0011'], manager: ['approval_manajer', 'priority', 'Flow_0012', 'Flow_0032'] };
            const config = approvals[wo.stage];
            if (!config) fail('Tahap ini tidak memiliki persetujuan usulan.');
            wo[config[0]] = { approved: true, by: actor.name, nip: actor.id, at: now };
            edge(config[2], config[3]); move(config[1]); break;
          }
          case 'reject': {
            required(data, ['reason']);
            const rejected = { asman: ['Flow_0008', 'Flow_0013'], supervisor: ['Flow_0010', 'Flow_0014'], manager: ['Flow_0012', 'Flow_0015'] }[wo.stage];
            if (!rejected) fail('Tahap ini tidak menerima penolakan usulan.');
            wo.reject_reason = data.reason; wo.catatan_penolakan = data.reason;
            edge(...rejected, 'Flow_0016'); move('return'); break;
          }
          case 'return': {
            if (wo.stage !== 'return') fail('Tidak ada pengembalian yang menunggu diteruskan.');
            edge({ tl_op: 'Flow_0017', tl_har: 'Flow_0022', tl_konstruksi: 'Flow_0027' }[wo.ownerRole]);
            move('revision'); break;
          }
          case 'stop': {
            if (wo.stage !== 'revision') fail('Penghentian dilakukan saat meninjau penolakan.');
            required(data, ['reason']);
            edge(...({ tl_op: ['Flow_0018', 'Flow_0020'], tl_har: ['Flow_0023', 'Flow_0025'], tl_konstruksi: ['Flow_0028', 'Flow_0030'] }[wo.ownerRole]));
            move('stopped'); wo.nodeId = 'Node_stop_' + suffix(wo.ownerRole); break;
          }
          case 'priority':
            if (wo.stage !== 'priority') fail('Belum masuk penetapan prioritas.');
            required(data, ['priority', 'workPlan']); wo.priority = data.priority; wo.workPlan = data.workPlan;
            if (!['Normal', 'Tinggi', 'Mendesak'].includes(data.priority)) fail('Prioritas tidak tersedia.');
            edge('Flow_0033'); move('survey'); break;
          case 'survey':
            if (wo.stage !== 'survey') fail('WO tidak sedang disurvei.');
            required(data, ['surveyDate', 'location', 'findings', 'access', 'equipment', 'material']);
            if (!validDate(data.surveyDate)) fail('Tanggal survei tidak valid.');
            wo.surveyVersions.push({ ...clone(data), version: wo.surveyVersions.length + 1, actorId: actor.id, at: now });
            edge('Flow_0034'); move('analysis'); break;
          case 'analysis':
            if (wo.stage !== 'analysis') fail('Analisis awal menunggu hasil survei.');
            required(data, ['jsa', 'ibppr']);
            wo.initialAnalyses.push({ ...clone(data), surveyVersion: wo.surveyVersions.length, actorId: actor.id, at: now });
            edge('Flow_0035'); move('feasibility'); break;
          case 'feasibility':
            if (wo.stage !== 'feasibility') fail('Belum ada hasil survei yang menunggu diperiksa.');
            required(data, ['decision', 'reason']);
            if (!['feasible', 'repeat', 'stop'].includes(data.decision)) fail('Keputusan kelayakan tidak valid.');
            wo.feasibility = { ...clone(data), surveyVersion: wo.surveyVersions.length, at: now, actorId: actor.id };
            edge('Flow_0036');
            if (data.decision === 'feasible') { edge('Flow_0042'); move('plan'); }
            if (data.decision === 'repeat') { edge('Flow_0037', 'Flow_0038'); move('survey'); }
            if (data.decision === 'stop') { edge('Flow_0037', 'Flow_0039', 'Flow_0040'); move('notify'); }
            break;
          case 'notify':
            if (wo.stage !== 'notify') fail('Tidak ada hasil penghentian yang menunggu pemberitahuan.');
            next.notifications.push({ id: global.crypto.randomUUID(), woId: wo.id, recipientId: wo.ownerId, unitId: wo.unitId, message: wo.feasibility.reason, at: now, kind: 'survey-stopped' });
            edge('Flow_0041'); move('surveyStopped'); break;
          case 'plan':
            if (wo.stage !== 'plan' || wo.feasibility?.decision !== 'feasible') fail('Rencana menunggu keputusan layak.');
            required(data, ['date', 'time', 'personnel', 'method']);
            if (!validDate(data.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time)) fail('Tanggal atau jam rencana tidak valid.');
            wo.plan = { ...clone(data), at: now, actorId: actor.id };
            wo.jadwal_resmi_tanggal = data.date; wo.jadwal_resmi_jam = data.time;
            wo.working_permit_nomor = data.permit || null;
            edge('Flow_0043'); move('jsa'); break;
          case 'reclassify':
            if (wo.stage !== 'legacy') fail('WO ini bukan penugasan lama.');
            required(data, ['ownerRole', 'reason']);
            if (!proposers.includes(data.ownerRole)) fail('Pilih TL pengusul asal.');
            wo.ownerRole = data.ownerRole; wo.ownerId = 'demo:' + data.ownerRole;
            wo.legacyReview = { ...clone(data), at: now, actorId: actor.id };
            wo.approval_asman = {}; wo.approval_supervisor = {}; wo.approval_manajer = {};
            move('asman'); break;
          default:
            if (!preparation.handle({ state: next, wo, actor, now, action, data, edge, fail, task, auditOrigin: node => { auditNode=node; }, auditTarget: node => { auditTarget=node; } })) fail('Tindakan belum tersedia pada batch ini.');
        }
      }
      wo.version += 1; wo.updatedAt = now;
      if (['survey', 'analysis'].includes(action)) {
        const doc = { id: global.crypto.randomUUID(), woId: wo.id, type: action === 'survey' ? 'survey' : 'initial-risk-analysis', version: action === 'survey' ? wo.surveyVersions.length : wo.initialAnalyses.length, data: clone(data), createdBy: actor.id, at: now };
        next.documents.push(doc); wo.documentIds.push(doc.id);
      }
      const previous = this.state.orders.find(order => order.id === wo.id);
      const audit = { id: global.crypto.randomUUID(), woId: wo.id, processVersion: PROCESS, nodeId: auditNode || (action === 'create' ? 'Node_start_' + suffix(actor.role) : previous.nodeId),
        nextNodeId: auditTarget || wo.nodeId, edgeIds: trail, action, actor: clone(actor), at: now, version: wo.version,
        data: ['attach', 'document-file'].includes(action) ? { name: data.name, mime: data.mime } : clone(data),
        documentVersionId: data.documentVersionId || (['document-submit', 'document-file'].includes(action) ? next.documents.at(-1)?.id : null),
        taskId: previous ? wo.id + ':' + previous.version : null };
      next.audits.push(audit);
      next.tasks = next.tasks.filter(task => task.woId !== wo.id);
      const tasks = tasksFor(wo); next.tasks.push(...tasks);
      const task = tasks[0] || null;
      const result = { woId: wo.id, version: wo.version, status: wo.status, nextTask: task, auditId: audit.id, message: wo.pendingReadinessMessage || null };
      next.receipts[receiptKey] = { signature, result };
      next.revision += 1;
      this.storage.setItem(this.key, JSON.stringify(next));
      this.state = next;
      return clone(result);
    }
    proposal(data, complete) {
      if (complete) required(data, ['nama_wo', 'lokasi', 'katalog_id', 'proses_bisnis', 'uraian']);
      const result = {};
      for (const key of ['nama_wo', 'lokasi', 'katalog_id', 'nama_pekerjaan', 'proses_bisnis', 'uraian', 'kategori', 'preferensi_tanggal']) result[key] = String(data[key] || '');
      result.kondisi_operasi = 'Tanpa Padam'; result.penugasan = 'Internal PLN';
      return result;
    }
    importLegacy(orders) {
      if (this.state.orders.length || this.storage.getItem(this.key)) return;
      const next = clone(this.state);
      for (const source of orders.filter(order => order.status === 'Assignment Review')) {
        const wo = { ...clone(source), legacyApprovals: clone({ asman: source.approval_asman, supervisor: source.approval_supervisor, manager: source.approval_manajer }),
          unitId: UNIT, ownerId: null, ownerRole: null, stage: 'legacy', nodeId: null, processVersion: PROCESS, version: 1,
          surveyVersions: [], initialAnalyses: [], documentIds: [], operationIds: [], category: 'legacy-review' };
        next.orders.push(wo); next.tasks.push(taskFor(wo));
      }
      this.storage.setItem(this.key, JSON.stringify(next)); this.state = next;
    }
    reset(actor) {
      if (actor.role !== 'superadmin') fail('Reset data demo tersedia untuk Super Admin.', 'FORBIDDEN');
      const next = empty(); next.revision = this.read().revision + 1;
      this.storage.setItem(this.key, JSON.stringify(next)); this.state = next;
    }
  }
  const api = { Repository, KEY, UNIT, PROCESS, stages, proposers, clone };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.IwomsWorkflow = api;
})(typeof window !== 'undefined' ? window : globalThis);
