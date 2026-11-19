(function (global) {
  'use strict';
  const { ref, reactive, computed, watch, onUnmounted, nextTick } = Vue;
  const { Repository, KEY, UNIT, stages, proposers, clone } = IwomsWorkflow;
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

  function createBridge(context) {
    const { activeRoleKey, currentUser, workOrders, selectedWO, activeScreenCode, activeMenu, showDetailModal, formP01, notify, roleAllowedScreens } = context;
    const reference = clone(workOrders.value);
    let repository;
    const error = ref('');
    try { repository = new Repository(localStorage); repository.importLegacy(reference); }
    catch (cause) { error.value = cause.message; }
    const data = ref(repository ? repository.snapshot() : { orders: [], tasks: [], audits: [], notifications: [], documents: [], operations: [], reports: [] });
    const referenceMode = ref(false);
    const proposalCatalog = computed(() => context.masterKatalogList.value.filter(item => item.proses_bisnis === PDKB_PROCESS));
    try { referenceMode.value = sessionStorage.getItem('iwoms.demo.reference') === '1'; } catch {}
    const selectedId = ref(null);
    const form = reactive({});
    const busy = ref(false);
    const notice = ref('');
    const pendingKey = ref(null);
    const documentPreview = ref(null);
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
    const selectedTask = computed(() => tasks.value.find(task => task.woId === selectedId.value && task.screen !== 'R02'));
    const taskView = wo => ({...wo,nodeId:wo.nodeId === 'Node_parallel_mulai' ? (tasks.value.find(task=>task.woId===wo.id && task.screen!=='R02')?.nodeId || wo.nodeId) : wo.nodeId});
    const wipId = ref('');
    const wipRows = ref([]);
    const wipOrder = computed(()=>visibleOrders.value.find(wo=>wo.id===wipId.value));
    watch([wipId,activeRoleKey],()=>{
      const latest = wipOrder.value?.wipVersions?.at(-1);
      wipRows.value = context.wipItems.value.map((item,index)=>({no:item.no,text:item.text,answer:latest?.rows[index]?.answer || '',note:latest?.rows[index]?.note || ''}));
    });
    function loadProposal(wo) {
      context.resetFormP01();
      const draft = formP01.value;
      draft.dokumen_lampiran = draft.dokumen_lampiran.filter(item => !wo.removedProposalSlots?.includes(item.kode));
      for (const field of ['nama_wo','katalog_id','nama_pekerjaan','lokasi','uraian','preferensi_tanggal','proses_bisnis','kategori']) {
        if (wo[field]) draft[field] = wo[field];
      }
      for (const file of data.value.documents.filter(item => item.woId === wo.id && item.type === 'proposal-attachment' && item.slot)) {
        let slot = draft.dokumen_lampiran.find(item => item.kode === file.slot);
        if (!slot) {
          slot = {id:file.slot,kode:file.slot,nama:file.slot};
          draft.dokumen_lampiran.push(slot);
        }
        Object.assign(slot,{terunggah:true,is_user_uploaded:true,file_name:file.name,file_type:file.mime,preview_url:file.content});
      }
    }
    function open(wo) {
      if (!wo?.processVersion) { selectedWO.value = wo; showDetailModal.value = true; return; }
      wo = visibleOrders.value.find(order => order.id === wo.id);
      if (!wo) { error.value = 'WO tidak tersedia dalam cakupan Anda.'; return; }
      error.value = ''; notice.value = ''; selectedId.value = wo.id;
      selectedWO.value = clone(wo); showDetailModal.value = false;
      Object.keys(form).forEach(key => delete form[key]);
      if (['draft', 'revision'].includes(wo.stage)) { Object.assign(form, clone(wo)); loadProposal(wo); }
      if (wo.stage === 'survey') Object.assign(form, clone(wo.surveyVersions.at(-1) || {}), { location: wo.lokasi });
      if (wo.stage === 'analysis') Object.assign(form, clone(wo.initialAnalyses.at(-1) || {}));
      if (preparation.activeNode(wo)) {
        const config = preparation.configuration(taskView(wo));
        const doc = preparation.latestDocument(data.value, wo, config.documentType);
        if (config.upload && doc) Object.assign(form, clone(doc.payload));
        if (config.checklist) form.items = clone(doc?.items || [{category:'equipment',name:'',quantity:1,unit:'',condition:''},{category:'material',name:'',quantity:1,unit:'',condition:''}]);
        if (config.roster === 'collect') form.people = [newPerson()];
        if (['renewal', 'fulfillment'].includes(config.roster)) form.people = clone(wo.authorityRoster.people);
        if (config.roster === 'replacement') form.replacements = [{ ...newPerson(), replacesId: '' }];
        if (wo.nodeId === 'Node_minta_sok') {
          const letter = preparation.latestDocument(data.value, wo, 'SP2B');
          if (letter) Object.assign(form,{circuit:letter.payload.circuit,boundary:letter.payload.workLocation+' / '+letter.payload.limits});
        }
      }
      form.reason = ''; pendingKey.value = null;
      activeScreenCode.value = preparation.activeNode(wo) ? preparation.configuration(taskView(wo)).screen || (wo.status==='WO Completed' ? 'R03' : 'P03') : stages[wo.stage][1];
      activeMenu.value = activeScreenCode.value.startsWith('R') ? 'pelaporan' : activeScreenCode.value.startsWith('E') ? 'pelaksanaan' : 'perencanaan';
      nextTick(() => document.querySelector('[data-workflow-heading]')?.focus());
    }
    function reload() {
      try { if (!repository) repository = new Repository(localStorage); repository.reload(); error.value = ''; sync(); if (selected.value) open(selected.value); }
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
          selectedId.value = null;
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
      return {nama_wo,katalog_id,nama_pekerjaan,lokasi,uraian,preferensi_tanggal,kategori,proses_bisnis:PDKB_PROCESS,reason:form.reason};
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
      const draft = slot ? proposalPayload() : clone(form);
      try {
        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Berkas gagal dibaca.')); reader.readAsDataURL(file);
        });
        if (selectedId.value !== id || actor.value.id !== uploadActorId || selected.value?.nodeId !== uploadNodeId) throw new Error('WO atau role berubah. Pilih ulang berkas pada tugas yang benar.');
        const advanced = preparation.activeNode(selected.value);
        if (!advanced && !execute('save', draft)) return;
        const wo = data.value.orders.find(order => order.id === id);
        if (execute(advanced ? 'document-file' : 'attach', { name: file.name, mime: file.type, content, ...(slot ? {slot} : {}) }, wo)) {
          open(data.value.orders.find(order => order.id === id));
          if (advanced) Object.assign(form, draft);
          notice.value = 'Berkas pendukung tersimpan untuk versi yang akan diajukan.';
        }
      } catch (cause) { error.value = cause.message; }
      finally { event.target.value = ''; }
    }
    function onRoleChange() {
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
    const changed = event => { if (event.key === KEY) { notice.value = 'Ada perubahan dari tab lain. Muat ulang untuk melihat versi terbaru.'; } };
    global.addEventListener('storage', changed);
    onUnmounted(() => global.removeEventListener('storage', changed));
    sync();
    const actions = computed(() => tasks.value.map(task => {
      const wo = visibleOrders.value.find(order => order.id === task.woId);
      return { id: task.id, wo_id: wo.id, wo, title: task.title, status: wo.status, tag: 'Tugas Anda', location: wo.lokasi, actionButtonText: task.actionable ? 'Buka tugas' : 'Lihat persiapan', targetScreen: task.screen, actionable:task.actionable };
    }));
    const workflow = reactive({
      error, notice, busy, referenceMode, selected, form, tasks, orders: visibleOrders, actor,
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
            const slot = file.name.match(/^DOC-0[1-9](?=[_. -])/i)?.[0].toUpperCase();
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
        return execute(action, payload);
      },
      previewProposal() {
        selectedWO.value = {...clone(selected.value),...proposalPayload()};
        context.bukaPratinjauDokumen({kode:'DOC-01',nama:'Form Pengajuan WO'});
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
      primary: computed(() => selected.value && preparation.activeNode(selected.value) ? preparation.configuration(taskView(selected.value)).primary : primary[selected.value?.stage]),
      taskTitle: computed(() => selected.value ? (preparation.activeNode(selected.value) ? preparation.graph.nodes[taskView(selected.value).nodeId]?.title : stages[selected.value.stage][2]) : ''),
      canAct: computed(() => !!selectedTask.value?.actionable),
      canCreate: computed(() => proposers.includes(activeRoleKey.value)),
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
      previewRegisterDocument(doc) {
        const template = proposalTemplates.find(item => item.type === doc.type && item.kode !== 'DOC-05');
        if (template) return this.previewTemplate(template, doc);
        this.previewVersion(doc);
      },
      previewTemplate(template, version) {
        const wo = selected.value;
        if (!wo) return;
        if (template.kode === 'DOC-03') {
          const file = this.attachments.find(item => item.slot === 'DOC-03');
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
      typeLabel(value) { return { HEIGHT_CLOSURE:'Penutupan izin ketinggian',WORK_RESULT:'Laporan hasil',COMPLETION_NOTICE:'Pemberitahuan penyelesaian',DAILY_REPORT:'Laporan harian',WO_ARCHIVE:'Paket arsip WO',FILE_EVIDENCE:'Bukti kelengkapan',MISSING_FILE_REQUEST:'Permintaan kelengkapan',DELEGATION: 'Berita acara delegasi', HEIGHT_PERMIT: 'Izin Kerja Ketinggian', AUTHORITY_ROSTER: 'Surat Kewenangan personel', EQUIPMENT_CHECKLIST: 'Checklist peralatan dan material' }[value] || value; },
      statusLabel(value,type) { return value === 'issued' ? (['SP2B','SP3B'].includes(type) ? 'Terbit' : 'Izin telah dicatat') : { submitted: 'Menunggu pemeriksaan', rejected: 'Dikembalikan', approved: 'Disetujui', initial: 'Pengumpulan awal', replacement: 'Penggantian personel', renewal: 'Pembaruan surat' }[value] || value; },
      valueLabel(key,value,doc) { return ['workSupervisor','safetySupervisor'].includes(key) ? doc.rosterSnapshot?.people.find(person => person.personId === value)?.name || value : value; },
      previewVersion(doc) { documentPreview.value = clone(doc); nextTick(() => document.querySelector('[data-document-close]')?.focus()); },
      closeDocument() { documentPreview.value = null; nextTick(() => document.querySelector('[data-workflow-heading]')?.focus()); },
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
        const file = data.value.documents.find(doc => doc.id === fileId && doc.woId === selectedId.value);
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
        notify('Hasil survei', unread.map(item => item.woId + ' ? ' + item.message).join('\n'), 'info', 9000);
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
      openNewWOModal: create, editDraftWO: wo => open(wo), executeAction: act => { if(act.targetScreen==='R02'){ activeScreenCode.value='R02'; activeMenu.value='pelaporan'; wipId.value=act.wo.id; } else open(act.wo); },
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

  global.IwomsWorkspace = {
    createBridge,
    component: {
      props: ['w'],
      template: `
      <section class="space-y-5" aria-label="Perencanaan PDKB">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
            <div><h2 data-workflow-heading tabindex="-1" class="text-lg font-bold text-slate-900">{{ w.selected ? w.taskTitle : 'Perencanaan pekerjaan PDKB' }}</h2>
              <p class="text-xs text-slate-500 mt-1">{{ w.selected ? w.selected.id + ' · ' + (w.selected.nama_wo || 'Draft WO') + ' · ' + w.selected.status : 'Buka tugas pada WO untuk melanjutkan pekerjaan Anda.' }}</p></div>
            <button v-if="w.selected" type="button" @click="w.close" class="px-4 py-2 border border-slate-300 rounded-lg text-xs hover:bg-slate-50">Kembali ke daftar</button>
            <button v-else-if="w.canCreate" type="button" @click="w.create" class="bg-pln-yellow text-slate-900 px-4 py-2 rounded-lg font-bold text-xs">Buat pengajuan WO</button>
          </div>
          <template v-if="!w.selected">
            <div v-if="!w.entries.length" class="py-10 text-center text-sm text-slate-500">Belum ada WO pada halaman ini. Tugas baru akan muncul setelah serah terima dari tahap sebelumnya.</div>
            <div v-else class="overflow-x-auto"><div class="iwoms-table-host" v-datatable><table class="w-full text-left text-xs"><thead class="bg-slate-50 text-slate-600"><tr><th class="p-3">WO / lokasi</th><th class="p-3">Status</th><th class="p-3">Tugas</th><th class="p-3">Aksi</th></tr></thead>
              <tbody><tr v-for="wo in w.entries" :key="wo.id" class="border-b border-slate-100"><td class="p-3"><div class="font-medium">{{ wo.nama_wo || 'Draft WO' }}</div><div class="text-slate-500 mt-1">{{ wo.id }} · {{ wo.lokasi || 'Lokasi belum diisi' }}</div></td><td class="p-3">{{ wo.status }}</td><td class="p-3">{{ w.tasks.find(t => t.woId === wo.id)?.title || 'Menunggu aktor berikutnya' }}</td><td class="p-3"><button type="button" @click="w.open(wo)" class="text-pln-blue border border-sky-200 px-3 py-2 rounded-lg hover:bg-sky-50">Buka</button></td></tr></tbody>
            </table></div></div>
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
            <form v-if="w.canAct" @submit.prevent="w.submit(w.primary[0])" class="space-y-4">
              <div v-if="w.configuration.checklist" class="space-y-3"><fieldset v-for="(item,index) in w.form.items" :key="index" class="grid sm:grid-cols-2 gap-3 border border-slate-200 rounded-lg p-4"><legend class="text-sm px-2">Item {{ index+1 }}</legend><label class="text-xs">Jenis<select v-model="item.category" :name="'item-'+index+'-category'" class="block w-full mt-1 border border-slate-300 rounded-lg p-2"><option value="equipment">Peralatan</option><option value="material">Material</option></select></label><label v-for="field in [['name','Nama item','text'],['quantity','Jumlah','number'],['unit','Satuan','select'],['condition','Kondisi / spesifikasi','text']]" :key="field[0]" class="text-xs">{{ field[1] }}<select v-if="field[2]==='select'" v-model="item.unit" :name="'item-'+index+'-unit'" class="block w-full mt-1 border border-slate-300 rounded-lg p-2"><option value="">Pilih satuan</option><option v-if="item.unit && !w.checklistUnits.includes(item.unit)">{{ item.unit }}</option><option v-for="unit in w.checklistUnits" :key="unit">{{ unit }}</option></select><input v-else v-model="item[field[0]]" :name="'item-'+index+'-'+field[0]" :type="field[2]" class="block w-full mt-1 border border-slate-300 rounded-lg p-2"></label><button v-if="w.form.items.length>1" type="button" @click="w.form.items.splice(index,1)" class="text-xs text-red-700 underline text-left">Hapus item</button></fieldset><button type="button" @click="w.addChecklistItem" class="border border-slate-300 rounded-lg px-3 py-2 text-xs">Tambah item</button></div>
              <div v-if="w.configuration.roster" class="space-y-4">
                <p class="text-sm text-slate-600">Isi data sesuai surat dan tugas dalam rencana pelaksanaan. Masa berlaku diperiksa pada tanggal rencana {{ w.selected.plan?.date }}. Pilih masa berlaku yang mencakup tanggal rencana. Salin nomor dari Surat Kewenangan yang diterbitkan. Pisahkan kode kompetensi dengan koma bila lebih dari satu.</p>
                <fieldset v-for="(person,index) in (w.form.replacements || w.form.people)" :key="person.personId" class="border border-slate-200 rounded-lg p-4 space-y-3"><legend class="px-2 text-sm">{{ w.configuration.roster === 'replacement' ? 'Calon pengganti' : 'Personel' }} {{ index + 1 }}</legend>
                  <label v-if="w.configuration.roster === 'replacement'" class="block text-xs">Menggantikan personel<select v-model="person.replacesId" @change="w.setReplacementTask(person)" :name="'person-'+index+'-replacesId'" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih personel asal</option><option v-for="old in w.selected.authorityRoster.people" :key="old.personId" :value="old.personId">{{ old.name }} · {{ old.duty }}</option></select></label>
                  <div class="grid sm:grid-cols-2 gap-4"><label v-for="field in [['name','Nama'],['duty','Tugas'],['requiredCompetence','Kode kompetensi yang diperlukan'],['certificateNo','Nomor Surat Kewenangan'],['competence','Kode kompetensi pada surat'],['validFrom','Berlaku sejak','date'],['validUntil','Berlaku sampai','date'],['evidence','Rujukan bukti surat / nomor berkas']]" :key="field[0]" class="text-xs text-slate-700">{{ field[1] }}<input v-model="person[field[0]]" :name="'person-'+index+'-'+field[0]" :type="field[2] || 'text'" :disabled="(['renewal','fulfillment'].includes(w.configuration.roster) && ['name','duty','requiredCompetence'].includes(field[0])) || (w.configuration.roster === 'replacement' && ['duty','requiredCompetence'].includes(field[0]))" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm disabled:bg-slate-100"></label></div>
                  <button v-if="['collect','replacement'].includes(w.configuration.roster) && (w.form.replacements || w.form.people).length > 1" type="button" @click="(w.form.replacements || w.form.people).splice(index,1)" class="text-red-700 text-xs underline">Hapus baris personel ini</button>
                </fieldset>
                <button v-if="['collect','replacement'].includes(w.configuration.roster)" type="button" @click="w.addPerson" class="border border-slate-300 px-4 py-2 rounded-lg text-xs">Tambah personel</button>
              </div>
              <p v-if="w.selected.stage==='survey'" class="rounded-lg bg-sky-50 p-3 text-sm text-slate-700">Catat tanggal dan lokasi, kondisi jaringan dan hasil pengukuran, akses, kebutuhan peralatan/APD dan material, lalu rangkum analisis awal JSA dan IBPPR.</p>
              <p v-if="w.selected.nodeId==='Node_tindak_lanjut_kewenangan'" class="rounded-lg bg-sky-50 p-3 text-sm text-slate-700">Supervisor menentukan apakah calon pengganti tersedia. Preparator memasukkan data calon dan memeriksa suratnya pada tugas berikutnya.</p>
              <div class="grid sm:grid-cols-2 gap-4"><label v-for="field in w.fields" :key="field[0]" class="block text-xs text-slate-700" :class="{'sm:col-span-2': ['textarea','checkbox'].includes(field[2]), 'flex items-center gap-2': field[2]==='checkbox'}"><span>{{ field[1] }}</span>
                <textarea v-if="field[2]==='textarea'" v-model="w.form[field[0]]" :name="field[0]" rows="3" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"></textarea>
                <input v-else-if="field[2]==='checkbox'" v-model="w.form[field[0]]" type="checkbox" :name="field[0]" class="order-first h-4 w-4 shrink-0">
                <select v-else-if="field[2]==='person'" v-model="w.form[field[0]]" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih personel terverifikasi</option><option v-for="person in w.selected.authorityRoster.people" :key="person.personId" :value="person.personId">{{ person.name }} · {{ person.duty }}</option></select>
                <select v-else-if="field[2]==='catalog'" v-model="w.form[field[0]]" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih katalog</option><option v-for="item in w.catalog" :key="item.id" :value="item.id">{{ item.nama_pekerjaan }}</option></select>
                <select v-else-if="field[2]==='priority'" v-model="w.form[field[0]]" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih prioritas</option><option>Normal</option><option>Tinggi</option><option>Mendesak</option></select>
                <select v-else-if="field[2]==='owner'" v-model="w.form[field[0]]" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm"><option value="">Pilih pengusul</option><option value="tl_op">TL OP</option><option value="tl_har">TL HAR</option><option value="tl_konstruksi">TL Konstruksi</option></select>
                <input v-else v-model="w.form[field[0]]" :type="field[2] || 'text'" :name="field[0]" class="mt-1.5 w-full border border-slate-300 rounded-lg p-3 text-sm">
              </label></div>
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
            <div v-if="w.configuration.upload && w.canAct" class="mt-5 border-t border-slate-200 pt-4"><label class="block text-xs">Berkas pendukung dokumen, opsional (PDF / gambar maksimal 2 MB)<input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" @change="w.upload" class="block w-full mt-2 text-sm"></label></div>
            <ul v-if="w.uploadedFiles.length" class="mt-3 text-xs space-y-2"><li v-for="file in w.uploadedFiles" :key="file.id">{{ file.name }} · untuk versi {{ file.forVersion }} <button type="button" @click="w.downloadFile(file.id)" class="text-pln-blue underline ml-2">Unduh</button></li></ul>
            <ul v-if="w.attachments.length" class="mt-4 space-y-2 text-sm"><li v-for="doc in w.attachments" :key="doc.id"><a :href="doc.content" :download="doc.name" class="text-pln-blue underline">{{ doc.name }}</a></li></ul>
            <div v-if="w.selected.plan" class="mt-5 text-sm border border-slate-200 p-4 rounded-lg"><h3 class="font-medium mb-2">Rencana pelaksanaan</h3><p>{{ w.selected.plan.date }} · {{ w.selected.plan.time }} WIB</p><p>{{ w.selected.plan.personnel }}</p><p>{{ w.selected.plan.method }}</p></div>
            <details v-if="w.selected.status === 'WO Completed'" class="mt-5 border-t border-slate-200 pt-4">
              <summary class="text-sm font-medium cursor-pointer">Pratinjau dokumen WO</summary>
              <ul class="mt-3 divide-y divide-slate-100 text-sm">
                <li v-for="doc in w.proposalTemplates" :key="doc.kode" class="flex flex-wrap justify-between gap-2 py-2">
                  <span>{{ doc.kode }} ? {{ doc.nama }}</span>
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
        <div v-if="w.documentPreview" class="fixed inset-0 z-[100] bg-slate-950/70 flex items-center justify-center p-4" @click.self="w.closeDocument">
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
            <ul v-if="w.documentPreview.documentIds?.length" class="mt-3 text-xs"><li v-for="id in w.documentPreview.documentIds" :key="id">{{ w.typeLabel(w.documentVersions.find(doc=>doc.id===id)?.type || id) }} / versi {{ w.documentVersions.find(doc=>doc.id===id)?.version }}</li></ul>
            <p v-for="entry in w.documentPreview.objections || []" :key="entry.at" class="mt-2">Kendala penutupan / {{ entry.actorName }} / {{ entry.note }}</p>
            <p v-if="w.documentPreview.received" class="mt-3">Diterima {{ w.documentPreview.received.actorName }} / {{ w.formatTime(w.documentPreview.received.at) }}</p>
            <p v-if="w.documentPreview.recordedAt" class="mt-4">Izin dicatat pada {{ w.formatTime(w.documentPreview.recordedAt) }}</p>
            <div class="flex flex-wrap gap-3 mt-5"><button v-for="(fileId,index) in w.documentPreview.fileIds || []" :key="fileId" type="button" @click="w.downloadFile(fileId)" class="border border-slate-300 rounded-lg px-4 py-2 text-xs">Unduh berkas pendukung {{ index+1 }}</button><button type="button" @click="w.downloadVersion(w.documentPreview)" class="bg-pln-blue text-white rounded-lg px-4 py-2 text-xs">Unduh data versi ini</button></div>
          </section>
        </div>
      </section>`,
    },
  };
})(window);
