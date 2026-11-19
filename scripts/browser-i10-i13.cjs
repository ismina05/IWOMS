const fs=require('node:fs');const path=require('node:path');const {spawn}=require('node:child_process');const http=require('node:http');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const output=process.env.IWOMS_TEST_OUTPUT || path.join(root,'docs/execution-i10-i13');fs.mkdirSync(output,{recursive:true});
async function browserChecks() {
  const server = http.createServer((req, res) => {
    const requested = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (requested === '/' ? '/index.html' : decodeURIComponent(requested)));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.pdf') ? 'application/pdf' : file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  fs.mkdirSync(path.join(output, 'chrome-profile'), { recursive: true });
  const profile = fs.mkdtempSync(path.join(output, 'chrome-profile/run-'));
  const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let ws;
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await new Promise(resolve => setTimeout(resolve, 100));
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let id = 0;
    const pending = new Map();
    ws.onmessage = ({ data }) => { const message = JSON.parse(data); if (message.id) { const request = pending.get(message.id); pending.delete(message.id); message.error ? request.reject(message.error) : request.resolve(message.result); } };
    function send(method, params = {}) { return new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }); }
    async function evaluate(expression) { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; }
    await send('Page.enable');
    await send('Runtime.enable');
    const errors = [];
    const originalHandler = ws.onmessage;
    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params);
      originalHandler(event);
    };
    await send('Emulation.setDeviceMetricsOverride', {width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate', {url:`http://127.0.0.1:${server.address().port}/`});
    for(let i=0;i<120;i++) { await new Promise(r=>setTimeout(r,500)); if(await evaluate('Boolean(window.iwomsApp?.workflow)')) break; }
    assert.equal(await evaluate('Boolean(window.iwomsApp?.workflow)'),true);
    async function run(code) { return evaluate(`(async()=>{${code};await Vue.nextTick();return true})()`); }
    async function click(text) {
      await run(`const el=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(text)} && e.getBoundingClientRect().width && (${JSON.stringify(text)}!=='Buka' || e.closest('tr')?.textContent.includes(${JSON.stringify(currentId)}))); if(!el)throw Error('Missing button '+${JSON.stringify(text)});el.click()`);
    }
    async function field(name,value) {
      await run(`const el=document.querySelector('[name="${name}"]');if(!el)throw Error('Missing field ${name}');if(el.type==='checkbox'){el.checked=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}))}else{el.value=${JSON.stringify(value)};el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}))}`);
    }
    async function role(value) {
      await run(`const el=document.querySelector('select[aria-label="Role simulasi aktif"]');el.value='${value}';el.dispatchEvent(new Event('change',{bubbles:true}))`);
    }
    let currentId = null;
    async function openTask() {
      await run(`const el=[...document.querySelectorAll('[data-work-task], [role="button"][tabindex="0"]')].find(e=>!${JSON.stringify(currentId)} || e.textContent.includes(${JSON.stringify(currentId)}));if(!el)throw Error('Missing task');el.focus()`);
      await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});
      await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
      await run('');
    }
    async function screenshot(name) {
      await new Promise(r=>setTimeout(r,300));
      const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
    }
    if(process.env.IWOMS_TEST_EXECUTION==='release'){
      const dashboard=()=>evaluate(String.raw`[...document.querySelectorAll('h2, h3, button[aria-pressed]')].map(el=>el.textContent.trim().replace(/^\s*\d+\s*/, '')).filter(text=>/Daftar Pekerjaan|Aksi Prioritas|Total Work Order|Selesai Operasional/.test(text))`);
      const layout=await dashboard();
      assert.ok(layout.some(text=>text.includes('Daftar Pekerjaan')));
      assert.equal(await evaluate('window.iwomsApp.workflow.dashboardRows().length'),0);
      const toggle="document.querySelector('label:has(input[type=checkbox]) input').click()";
      await run(toggle);
      assert.equal(await evaluate('window.iwomsApp.workflow.referenceMode'),true);
      assert.ok(await evaluate('window.iwomsApp.workflow.dashboardRows().length > 0'));
      assert.deepEqual(await dashboard(),layout);
      await click('Mode Kalender');
      assert.ok(await evaluate('document.body.innerText.includes("2026-11-13")'));
      await click('Tabel Data');
      await run(toggle);
      assert.equal(await evaluate('window.iwomsApp.workflow.dashboardRows().length'),0);
      assert.deepEqual(await dashboard(),layout);
    }
    await click('Buat Pengajuan WO Baru');
    await field('nama_wo','WO uji I10-I13');await field('katalog_id','KAT-01');await field('lokasi','Tiang uji');await field('uraian','Kebutuhan uji UI');
    await click('Pratinjau formulir');
    assert.equal(await evaluate('window.iwomsApp.showDocPreviewModal'),true);
    await click('Tutup Pratinjau');
    await screenshot('desktop-proposal');await click('Ajukan ke Asman');
    assert.equal(await evaluate('window.iwomsApp.workflow.error'),'');
    const woId=await evaluate("window.iwomsApp.workOrders.find(w=>w.stage==='asman').id");
    currentId = woId;
    await send('Page.reload');await new Promise(r=>setTimeout(r,1500));
    assert.equal(await evaluate(`window.iwomsApp.workOrders.some(w=>w.id==='${woId}')`),true);
    await role('asman_jaringan');await openTask();await click('Setujui ke Supervisor');
    await role('supervisor_pdkb');await openTask();await field('reason','Perjelas lokasi');await click('Tolak dan kembalikan');
    await role('asman_jaringan');await openTask();await click('Teruskan ke pengusul asal');
    await role('tl_har');await openTask();await field('uraian','Kebutuhan revisi');await click('Ajukan ulang ke Asman');
    for(const [r,button] of [['asman_jaringan','Setujui ke Supervisor'],['supervisor_pdkb','Setujui ke Manajer'],['manajer_area','Sahkan dan teruskan ke Supervisor']]) {await role(r);await openTask();await click(button);}
    await role('supervisor_pdkb');
    // Skip the legacy review task when opening the newly created WO.
    await run(`document.querySelectorAll('[data-work-task], [role="button"][tabindex="0"]').forEach(el=>{if(el.textContent.includes('${woId}'))el.click()})`);
    await field('priority','Tinggi');await field('workPlan','Survei terjadwal');await click('Tetapkan dan tugaskan survei');
    await role('preparator_pdkb');await openTask();
    for(const [name,value] of Object.entries({surveyDate:'2026-11-19',location:'Tiang uji',findings:'Konduktor perlu dipelihara',access:'Jalan umum',equipment:'Peralatan PDKB',material:'Jumper'}))await field(name,value);
    await screenshot('desktop-survey');await click('Simpan survei dan susun analisis');
    await click('Buka');await field('jsa','Risiko awal dan mitigasi');await field('ibppr','Analisis risiko awal');await click('Ajukan hasil survei ke Supervisor');
    await role('supervisor_pdkb');await run(`document.querySelectorAll('[data-work-task], [role="button"][tabindex="0"]').forEach(el=>{if(el.textContent.includes('${woId}'))el.click()})`);
    await field('reason','Layak sesuai survei');await screenshot('desktop-feasibility');await click('Nyatakan layak');
    await role('preparator_pdkb');await openTask();
    for(const [name,value] of Object.entries({date:'2026-12-01',time:'09:00',personnel:'Regu A',method:'Metode sesuai SOP'}))await field(name,value);
    await click('Simpan rencana pelaksanaan');
    assert.equal(await evaluate('window.iwomsApp.workflow.error'),'');
    assert.equal(await evaluate(`window.iwomsApp.workOrders.find(w=>w.id==='${woId}').stage`),'jsa');

    async function act(roleKey, label, values = {}) {
      await role(roleKey); await openTask();
      for (const [name,value] of Object.entries(values)) await field(name,value);
      await click(label);
      assert.equal(await evaluate('window.iwomsApp.workflow.error'),'',JSON.stringify(await evaluate('({form:window.iwomsApp.workflow.form,people:window.iwomsApp.workflow.selected?.authorityRoster?.people})')));
    }
    await role('preparator_pdkb'); await openTask();
    const tree = await send('DOM.getDocument');
    const fileInput = await send('DOM.querySelector', {nodeId:tree.root.nodeId,selector:'input[type=file]'});
    await send('DOM.setFileInputFiles', {nodeId:fileInput.nodeId,files:[path.join(root,'assets/logo_pln_resmi.jpg')]});
    for(let i=0;i<40;i++) { if(await evaluate('window.iwomsApp.workflow.uploadedFiles.length===1')) break;await new Promise(resolve=>setTimeout(resolve,100)); }
    assert.equal(await evaluate('window.iwomsApp.workflow.uploadedFiles.length'),1);
    await act('preparator_pdkb','Ajukan JSA ke P2K3/K3L',{steps:'Tahapan uji',hazards:'Listrik',controls:'Pengendalian awal',responsible:'Regu A'});
    await act('p2k3_k3l','Kembalikan kepada Preparator',{reason:'Perbaiki mitigasi'});
    await act('preparator_pdkb','Belum dapat diperbaiki \u00b7 minta On Hold',{reason:'Perlu dukungan teknis'});
    await role('supervisor_pdkb');await openTask();await screenshot('desktop-hold-review');
    await field('reason','Pemenuhan dikoordinasikan Preparator');await click('Tetapkan On Hold dan tugaskan pemenuhan');
    await act('preparator_pdkb','Kirim hasil pemenuhan ke Supervisor',{reason:'Mitigasi telah diperbaiki'});
    await act('supervisor_pdkb','Kendala teratasi',{reason:'Bukti pemenuhan sesuai'});
    await act('supervisor_pdkb','Aktifkan kembali pada tahap asal',{reason:'Ajukan ulang JSA'});
    await act('preparator_pdkb','Ajukan JSA ke P2K3/K3L',{steps:'Tahapan uji',hazards:'Listrik',controls:'Pengendalian diperbaiki',responsible:'Regu A'});
    await role('p2k3_k3l');await openTask();await screenshot('desktop-document-review');
    await click('Lihat versi dan persetujuan');
    assert.equal(await evaluate('window.iwomsApp.workflow.documentPreview.version'),2);
    await screenshot('desktop-version-preview');await click('Tutup dokumen');
    await click('Setujui versi dokumen ini');
    await act('asman_jaringan','Setujui versi dokumen ini');
    await act('preparator_pdkb','Ajukan IBPPR ke P2K3/K3L',{hazards:'Listrik',riskAssessment:'Tinggi',controls:'Pengendalian terverifikasi',residualRisk:'Terkendali',responsible:'Regu A'});
    await act('p2k3_k3l','Setujui versi dokumen ini');await act('asman_jaringan','Setujui versi dokumen ini');
    await act('preparator_pdkb','Perlu izin ketinggian',{reason:'Pekerjaan berada di ketinggian'});
    await act('preparator_pdkb','Ajukan izin ke Pengawas K3',{scope:'Pekerjaan tiang',workLocation:'Tiang uji',workers:'Personel A',hazards:'Jatuh',precautions:'APD sesuai SOP'});
    for(const r of ['pengawas_k3','asman_jaringan','p2k3_k3l','bagian_terkait']) await act(r,'Setujui versi dokumen ini');
    await act('preparator_pdkb','Catat izin yang lengkap ditandatangani');
    await role('preparator_pdkb');await openTask();
    for(const [key,value] of Object.entries({name:'Personel A',duty:'Pengawas pekerjaan',requiredCompetence:'PDKB-TM',certificateNo:'SK-UJI',competence:'PDKB-TM',validFrom:'2026-01-01',validUntil:'2026-01-02',evidence:'Berkas SK UJI'})) await field('person-0-'+key,value);
    await click('Tambah personel');
    for(const [key,value] of Object.entries({name:'Personel C',duty:'Pengawas K3',requiredCompetence:'PDKB-K3',certificateNo:'SK-K3',competence:'PDKB-K3',validFrom:'2026-01-01',validUntil:'2028-12-31',evidence:'Berkas SK K3'}))await field('person-1-'+key,value);
    await screenshot('desktop-authority-roster');await click('Simpan surat personel untuk diverifikasi');
    await act('preparator_pdkb','Verifikasi kompetensi dan masa berlaku');
    await act('supervisor_pdkb','Tersedia calon pengganti',{reason:'Periksa calon pengganti'});
    await role('preparator_pdkb');await openTask();
    const replacedId=await evaluate('window.iwomsApp.workflow.selected.authorityRoster.people[0].personId');
    await field('person-0-replacesId',replacedId);
    for(const [key,value] of Object.entries({name:'Personel B',certificateNo:'SK-CALON',competence:'PDKB-TM',validFrom:'2026-01-01',validUntil:'2026-01-02',evidence:'Berkas SK calon'}))await field('person-0-'+key,value);
    await screenshot('desktop-authority-replacement');await click('Catat verifikasi pengganti dan periksa ulang tim');
    await act('preparator_pdkb','Verifikasi kompetensi dan masa berlaku');
    await act('supervisor_pdkb','Minta pembaruan surat ke Manajer',{reason:'Surat kedaluwarsa'});
    await role('manajer_area');await openTask();await field('person-0-validUntil','2027-12-31');await field('reason','Surat diperbarui');await click('Catat surat yang diperbarui');
    await act('preparator_pdkb','Verifikasi surat baru dan periksa ulang tim');
    await act('preparator_pdkb','Verifikasi kompetensi dan masa berlaku');
    assert.equal(await evaluate(`window.iwomsApp.workOrders.find(w=>w.id==='${woId}').nodeId`),'Node_siapkan_sp2b');
    await click('Buka');await screenshot('desktop-sp2b-boundary');
    const flags=await evaluate(`(()=>{const a=window.iwomsApp;const original=a.selectedWO.status;const rows=['Approved','Scheduled','Ongoing','Completed'].map(status=>{a.selectedWO.status=status;return [a.activeDocData.isJsaCompleted,a.activeDocData.isIbpprCompleted,a.activeDocData.isSp2bIssued,a.activeDocData.isSp3bIssued]});a.selectedWO.status=original;return rows})()`);
    assert.ok(flags.every(row=>JSON.stringify(row)===JSON.stringify([true,true,false,false])));
    await run('window.iwomsApp.isTemplateBlankMode=true');
    assert.equal(await evaluate('window.iwomsApp.activeDocData.isJsaCompleted'),false);
    await run('window.iwomsApp.isTemplateBlankMode=false');
    const evidence=await evaluate('({documents:window.iwomsApp.workflow.documentVersions.map(d=>({type:d.type,version:d.version,status:d.status,fileCount:d.fileIds?.length||0})),holds:window.iwomsApp.workflow.selected.holds})');

    const members=await evaluate('JSON.parse(JSON.stringify(window.iwomsApp.workflow.selected.authorityRoster.people))');
    const referenceOperations=await evaluate('JSON.stringify(window.iwomsApp.operasiJaringanList)');
    for(const type of ['SP2B','SP3B']){
      await act('preparator_pdkb',`Ajukan ${type} ke Supervisor`,{number:type+'/'+woId,scope:'Pemeliharaan jumper',...(type==='SP2B'?{circuit:'Penyulang Uji',workLocation:'Tiang Uji',limits:'Batas sesuai survei'}:{}),workSupervisor:members[0].personId,safetySupervisor:members[1].personId});
      await act('supervisor_pdkb','Setujui versi dokumen ini');
      await role('manajer_area');await openTask();await screenshot('desktop-letter-issuance-'+type.toLowerCase());
      await click(`Terbitkan dan tanda tangani ${type}`);
      assert.equal(await evaluate('window.iwomsApp.workflow.error'),'');
    }
    await role('preparator_pdkb');await openTask();
    for(const [name,value] of Object.entries({'item-0-name':'Peralatan isolasi','item-0-quantity':2,'item-0-unit':'set','item-0-condition':'Sesuai spesifikasi','item-1-name':'Jumper','item-1-quantity':1,'item-1-unit':'buah','item-1-condition':'Sesuai spesifikasi',inspection:'Pemeriksaan sesuai kebutuhan WO'}))await field(name,value);
    await screenshot('desktop-checklist');await click('Ajukan checklist ke Supervisor');
    await act('supervisor_pdkb','Setujui versi dokumen ini');await act('kepala_regu','Setujui versi dokumen ini');
    await act('preparator_pdkb','Serahkan SP2B kepada Pelaksana');
    await act('pelaksana_pdkb','Tanda tangani penerimaan SP2B',{acknowledged:true});
    await act('preparator_pdkb','Catat tanda terima SP2B');
    await act('preparator_pdkb','Serahkan SP3B kepada kedua pengawas');
    await act('kepala_regu','Pahami dan terima penugasan pengawasan',{acknowledged:true});
    await act('pengawas_k3','Pahami dan terima penugasan K3',{acknowledged:true});
    await act('kepala_regu','Perintahkan pemeriksaan ulang',{reason:'Periksa seluruh item terhadap checklist'});
    await act('pelaksana_pdkb','Catat hasil pemeriksaan lapangan',{equipmentReady:false,materialReady:true,apdReady:true,reason:'Satu peralatan belum tersedia'});
    for(const [r,label] of [['supervisor_pdkb','Tetapkan On Hold dan tugaskan pemenuhan'],['preparator_pdkb','Kirim hasil pemenuhan ke Supervisor'],['supervisor_pdkb','Kendala teratasi'],['supervisor_pdkb','Aktifkan kembali pada tahap asal']])await act(r,label,{reason:'Peralatan dilengkapi dan diperiksa ulang'});
    await act('kepala_regu','Perintahkan pemeriksaan ulang',{reason:'Ulangi pemeriksaan setelah H08'});
    await act('pelaksana_pdkb','Catat hasil pemeriksaan lapangan',{equipmentReady:true,materialReady:true,apdReady:true,reason:'Seluruh item siap'});
    const participants=members.map(person=>person.name).join(', ');
    await act('kepala_regu','Catat job briefing',{participants,instructions:'Pembagian tugas, bahaya dan pengendalian sesuai SOP'});
    await act('pengawas_k3','Catat pemeriksaan kesehatan dan safety briefing',{participants,healthOk:false,apdOk:true,reason:'Pemeriksaan kesehatan perlu diulang',briefing:'Materi keselamatan disampaikan'});
    assert.equal(await evaluate('window.iwomsApp.workOrders[0].briefing_k3_selesai'),false);
    await role('pengawas_k3');await openTask();
    for(const [name,value] of Object.entries({participants,healthOk:true,apdOk:true,reason:'Pemeriksaan kesehatan dan APD memenuhi',briefing:'Keselamatan dan komunikasi kerja'}))await field(name,value);
    await screenshot('desktop-safety-briefing');await click('Catat pemeriksaan kesehatan dan safety briefing');
    await act('kepala_regu','Catat koordinasi rencana mulai',{counterpart:'Kepala Operasi uji',reason:'Rencana mulai dikoordinasikan'});
    async function round(applied){
      await act('kepala_regu','Minta pemberlakuan SOK',{circuit:'Penyulang Uji',boundary:'Tiang Uji dan batas sesuai SP2B',reason:'Mohon pemberlakuan SOK sesuai rencana'});
      await act('piket_area','Teruskan permintaan ke Piket APD',{reason:'Permintaan WO diteruskan'});
      await act('piket_apd','Koordinasikan pengaturan dengan Petugas GI',{reason:'Pengaturan dikoordinasikan'});
      await role('petugas_gi');await openTask();await field('applied',applied);await field('settings','Pengaturan sesuai instruksi operasi');await field('reason',applied?'Pengaturan dilaksanakan':'Pengaturan belum dapat dilaksanakan');
      await screenshot('desktop-sok-gi');await click('Catat hasil pengaturan recloser dan relay');
      await act('piket_apd','Konfirmasi hasil kepada Piket Area',{reason:'Hasil GI diteruskan kepada Area'});
      await act('piket_area','Konfirmasi hasil kepada Kepala Regu',{reason:'Hasil koordinasi disampaikan kepada Kepala Regu'});
    }
    await round(false);await role('kepala_regu');await openTask();await field('reason','Konfirmasi belum lengkap, koordinasi belum dapat diulang');await click('Nyatakan SOK terkonfirmasi');
    assert.ok((await evaluate('window.iwomsApp.workflow.error')).includes('belum lengkap'));
    await click('Belum dapat dikoordinasikan ulang \u00b7 minta On Hold');
    for(const [r,label] of [['supervisor_pdkb','Tetapkan On Hold dan tugaskan pemenuhan'],['kepala_regu','Kirim hasil pemenuhan ke Supervisor'],['supervisor_pdkb','Kendala teratasi'],['supervisor_pdkb','Aktifkan kembali pada tahap asal']])await act(r,label,{reason:'Koordinasi operasi sudah dapat diulang'});
    await round(true);await act('kepala_regu','Nyatakan SOK terkonfirmasi',{reason:'Seluruh konfirmasi permintaan aktif diterima'});
    await role('kepala_regu');await openTask();
    assert.equal(await evaluate('window.iwomsApp.workflow.selected.nodeId'),'Node_periksa_cuaca');
    assert.equal(await evaluate('window.iwomsApp.workflow.canAct'),true);
    assert.equal(await evaluate('JSON.stringify(window.iwomsApp.operasiJaringanList)'),referenceOperations);
    assert.equal(await evaluate('window.iwomsApp.activeDocData.sp2b_no'),'SP2B/'+woId);
    assert.equal(await evaluate('window.iwomsApp.activeDocData.isSp3bIssued'),true);
    await screenshot('desktop-initial-condition-boundary');
    await run("window.iwomsApp.bukaPratinjauDokumen({kode:'DOC-04',nama:'SP2B'})");await screenshot('desktop-issued-sp2b-preview');await click('Tutup Pratinjau');
    await run("window.iwomsApp.bukaPratinjauDokumen({kode:'DOC-07',nama:'Briefing'})");
    assert.ok(await evaluate("document.body.innerText.includes('Keselamatan dan komunikasi kerja')"));
    await screenshot('desktop-briefing-preview');await click('Tutup Pratinjau');
    if (['1','closure','release'].includes(process.env.IWOMS_TEST_EXECUTION)) {
      const record = {reason:'Catatan pengujian'};
      await act('kepala_regu','Kondisi awal memenuhi',{...record,conditionsOk:true});
      await act('kepala_regu','Pengawasan tanpa delegasi',record);
      await act('kepala_regu','Mulai putaran pelaksanaan',record);
      await role('pengawas_k3'); await openTask();
      await run(`document.querySelectorAll('select').forEach(el=>{if(el.querySelector('option[value="${woId}"]')){el.value='${woId}';el.dispatchEvent(new Event('change',{bubbles:true}));}})`);
      await run("document.querySelectorAll('fieldset select').forEach((el,index)=>{el.value=index?'Ya':'Tidak';el.dispatchEvent(new Event('change',{bubbles:true}));})");
      await click('Ajukan WIP');
      await role('p2k3_k3l'); await openTask(); await click('Sahkan versi WIP ini');
      assert.equal(await evaluate(`window.iwomsApp.workflow.orders.find(wo=>wo.id==='${woId}').wipScore`),95.5);
      for (const lane of ['pelaksana_pdkb','kepala_regu','pengawas_k3']) await act(lane,'Kirim hasil tugas putaran',record);
      await act('pengawas_k3','Tidak ada bahaya aktif',record);
      await act('kepala_regu','Pekerjaan fisik selesai',record);
      await act('pelaksana_pdkb','Laporkan selesai fisik',record);
      for (const [lane,label] of [
        ['kepala_regu','Minta penormalan SOK'],['piket_area','Teruskan penormalan ke APD'],
        ['piket_apd','Teruskan penormalan ke GI'],['petugas_gi','Catat hasil penormalan GI'],
        ['piket_apd','Konfirmasi hasil kepada Area'],['piket_area','Konfirmasi hasil kepada Kepala Regu'],
        ['kepala_regu','Konfirmasi penormalan lengkap'],['kepala_regu','Nyatakan selesai operasional']
      ]) await act(lane,label,lane==='petugas_gi'?{...record,applied:true}:record);
      assert.ok(await evaluate("window.iwomsApp.workflow.orders.some(wo=>wo.operational_completed_at && wo.nodeId==='Node_izin_tinggi_digunakan')"));
      await role('manajer_area');
      await run("window.iwomsApp.activeScreenCode='R03'");
      assert.ok(await evaluate("document.body.innerText.includes('95.5%')"));
      if(['closure','release'].includes(process.env.IWOMS_TEST_EXECUTION)){
        for(const [lane,label,values] of [
          ['preparator_pdkb','Periksa penggunaan izin',{used:true}],['preparator_pdkb','Siapkan penutupan izin',record],
          ...['pengawas_k3','asman_jaringan','p2k3_k3l','bagian_terkait'].map(lane=>[lane,'Tanda tangani penutupan izin',{}]),
          ['preparator_pdkb','Catat izin lengkap',{}],['kepala_regu','Serahkan laporan hasil',record],
          ['preparator_pdkb','Ajukan pemberitahuan',record],['supervisor_pdkb','Kembalikan untuk revisi',record],
          ['preparator_pdkb','Ajukan versi perbaikan',record],
          ...['supervisor_pdkb','kepala_regu','pengawas_k3'].map(lane=>[lane,'Setujui pemberitahuan',record]),
          ['preparator_pdkb','Sampaikan ke Manajer',{}],['manajer_area','Terima pemberitahuan',{}],
          ['preparator_pdkb','Simpan laporan harian',record],['preparator_pdkb','Catat pengumpulan berkas',record],
          ['preparator_pdkb','Nyatakan berkas lengkap',{checked:true}],['preparator_pdkb','Arsipkan paket dokumen',{}],
          ['preparator_pdkb','Tutup administrasi WO',{}]
        ])await act(lane,label,values);
        assert.ok(await evaluate("window.iwomsApp.workflow.orders.some(wo=>wo.status==='WO Completed')"));
        await run("window.iwomsApp.activeScreenCode='R05'");
        const period=await evaluate("new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'}).slice(0,7)");
        await run(`const el=document.querySelector('input[type=month]');el.value='${period}';el.dispatchEvent(new Event('input',{bubbles:true}));`);
        await click('Buat draf');
        await run("document.querySelectorAll('details').forEach(el=>el.open=true)");
        await click('Susun snapshot dan ajukan');
        for(const lane of ['supervisor_pdkb','asman_jaringan','manajer_area']){
          await role(lane);
          await run("window.iwomsApp.activeScreenCode='R05'");
          await run("document.querySelectorAll('details').forEach(el=>el.open=true)");
          await click('Setujui versi rekap');
        }
        assert.equal(await evaluate('window.iwomsApp.workflow.monthlyReports[0].nodeId'),'Node_kirim_laporan_bulanan');
        assert.ok(await evaluate("document.body.innerText.includes('Versi final siap untuk distribusi.')"));
        if(process.env.IWOMS_TEST_EXECUTION==='release'){
          for(const [lane,label] of [['preparator_pdkb','Kirim ke Komisi Unit/Wilayah'],['komisi_unit','Terima dan teruskan ke Komisi Pusat'],['komisi_pusat','Catat penerimaan Pusat']]){
            await role(lane);
            await click(period+' / '+await evaluate('window.iwomsApp.workflow.monthlyTitle(window.iwomsApp.workflow.monthlyReports[0])'));
            await run("document.querySelectorAll('details').forEach(el=>el.open=true)");
            await click(label);
          }
          assert.equal(await evaluate('window.iwomsApp.workflow.monthlyReports[0].nodeId'),'Node_end_bulanan');
          await run("window.originalBlobUrl=URL.createObjectURL;URL.createObjectURL=()=>{throw Error('Uji kegagalan ekspor')}");
          await click('Unduh CSV versi 1');
          assert.match(await evaluate('window.iwomsApp.workflow.error'),/Ekspor gagal/);
          await run("URL.createObjectURL=blob=>{ window.exportBlob=blob;return window.originalBlobUrl(blob); }");
          await send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:profile});
          await click('Unduh CSV versi 1');
          const exported=await evaluate('window.exportBlob.text()');
          assert.ok(exported.includes(woId)&&exported.includes('Tanggal selesai WIB'));
          const csvPath=path.join(profile,'rekap-pdkb-'+period+'-v1.csv');
          for(let attempt=0;attempt<30 && !fs.existsSync(csvPath);attempt++)await new Promise(resolve=>setTimeout(resolve,100));
          assert.ok(fs.readFileSync(csvPath,'utf8').includes(woId),'CSV hasil unduhan harus dapat dibuka.');
          fs.copyFileSync(csvPath,path.join(output,'uat-rekap.csv'));
          await role('preparator_pdkb');
          await run("Array.from(document.querySelectorAll('button[aria-pressed]')).find(el=>el.textContent.includes('WO Selesai Operasional')).click()");
          assert.ok(await evaluate('window.iwomsApp.workflow.dashboardRows().some(wo=>wo.status==="WO Completed")'));
          await screenshot('uat-i24-desktop');
          await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
          await screenshot('uat-i24-mobile');
          assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'));
          const applicants=['tl_op','tl_konstruksi'];
          for(const lane of applicants){
            await role(lane);
            await click('Buat Pengajuan WO Baru');
            await field('nama_wo','UAT '+lane);await field('katalog_id','KAT-01');await field('lokasi','Tiang uji');await field('uraian','Skenario mulai WO');
            await click('Ajukan ke Asman');
          }
          await role('asman_jaringan');
          assert.equal(await evaluate("window.iwomsApp.workflow.tasks.filter(task=>task.nodeId==='Node_periksa_wo_asman').length"),2);
          console.log('Browser I22–I24: terminal Pusat, CSV snapshot, pemulihan ekspor dan KPI lulus.');
        }
        console.log('Browser I18-I21: izin, revisi, WO Completed dan rekap final lulus.');
      }
      assert.equal(errors.length,0,JSON.stringify(errors));
      console.log('Browser I14-I17: operational completion reached through UI.');
      return;
    }
    const finalEvidence=await evaluate('({nodeId:window.iwomsApp.workflow.selected.nodeId,documents:window.iwomsApp.workflow.documentVersions.map(doc=>({type:doc.type,version:doc.version,status:doc.status,number:doc.payload?.number})),sok:JSON.parse(JSON.stringify(window.iwomsApp.workflow.selected.sokConfirmed)),rounds:window.iwomsApp.workflow.selected.sokRequests.length,operations:window.iwomsApp.workflow.operationEvents.length,holds:window.iwomsApp.workflow.selected.holds.map(hold=>hold.causeId)})');

    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await screenshot('mobile-initial-condition-boundary');
    const metrics=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,font:getComputedStyle(document.body).fontFamily})');
    assert.equal(metrics.scroll,metrics.width);assert.equal(errors.length,0,JSON.stringify(errors));
    const support=require('./test-i10-i13.cjs');
    const cases=['Tim satu','Tim dua'].map(prefix=>{const f=support.setup(prefix);support.documents(f);return f.repo.snapshot()});
    const combined=cases[0];
    for(const key of ['orders','tasks','documents','audits','operations'])combined[key].push(...cases[1][key]);
    await run(`localStorage.setItem(IwomsWorkflow.KEY,${JSON.stringify(JSON.stringify(combined))});window.iwomsApp.workflow.reload()`);
    const bindingEvidence=[];
    for(const wo of combined.orders){
      await run(`const a=window.iwomsApp;a.workflow.open(a.workOrders.find(w=>w.id==='${wo.id}'));a.bukaPratinjauDokumen({kode:'DOC-04',nama:'SP2B'})`);
      bindingEvidence.push(await evaluate('({number:window.iwomsApp.activeDocData.sp2b_no,team:window.iwomsApp.activeDocData.tim_hotline.map(person=>person.nama)})'));
      await click('Tutup Pratinjau');
    }
    assert.notEqual(bindingEvidence[0].number,bindingEvidence[1].number);assert.notEqual(bindingEvidence[0].team[0],bindingEvidence[1].team[0]);
    assert.equal(errors.length,0,JSON.stringify(errors));
    fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({woId,finalEvidence,bindingEvidence,result:'PASS',method:'DOM inputs/clicks, CDP Enter, role picker, letters/checklist/receipts, H08, health recovery, two SOK rounds and H09, isolated two-WO fixture for preview binding',flags,evidence,metrics,errors},null,2));
    console.log('Browser I10-I13 passed: letters, checklist, receipts, H08, briefings, SOK chain, H09 and initial-condition boundary.');

  } finally {
    if (ws) ws.close();
    chrome.kill();
    server.close();
  }
}

browserChecks().catch(e=>{console.error(e);process.exitCode=1});
