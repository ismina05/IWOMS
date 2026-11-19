const fs=require('node:fs');const path=require('node:path');const {spawn}=require('node:child_process');const http=require('node:http');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const output=path.join(root,'docs/execution-i06-i09');fs.mkdirSync(output,{recursive:true});
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
      await run(`const el=document.querySelector('[name="${name}"]');if(!el)throw Error('Missing field ${name}');el.value=${JSON.stringify(value)};el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}))`);
    }
    async function role(value) {
      await run(`const el=document.querySelector('select[aria-label="Role simulasi aktif"]');el.value='${value}';el.dispatchEvent(new Event('change',{bubbles:true}))`);
    }
    let currentId = null;
    async function openTask() {
      await run(`const el=[...document.querySelectorAll('[role="button"][tabindex="0"]')].find(e=>!${JSON.stringify(currentId)} || e.textContent.includes(${JSON.stringify(currentId)}));if(!el)throw Error('Missing task');el.focus()`);
      await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
      await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
      await run('');
    }
    async function screenshot(name) {
      await new Promise(r=>setTimeout(r,300));
      const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
    }
    await click('Buat Pengajuan WO Baru');
    await field('nama_wo','WO uji I06-I09');await field('katalog_id','KAT-01');await field('lokasi','Tiang uji');await field('uraian','Kebutuhan uji UI');
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
    await run(`document.querySelectorAll('[role="button"][tabindex="0"]').forEach(el=>{if(el.textContent.includes('${woId}'))el.click()})`);
    await field('priority','Tinggi');await field('workPlan','Survei terjadwal');await click('Tetapkan dan tugaskan survei');
    await role('preparator_pdkb');await openTask();
    for(const [name,value] of Object.entries({surveyDate:'2026-11-19',location:'Tiang uji',findings:'Konduktor perlu dipelihara',access:'Jalan umum',equipment:'Peralatan PDKB',material:'Jumper'}))await field(name,value);
    await screenshot('desktop-survey');await click('Simpan survei dan susun analisis');
    await click('Buka');await field('jsa','Risiko awal dan mitigasi');await field('ibppr','Analisis risiko awal');await click('Ajukan hasil survei ke Supervisor');
    await role('supervisor_pdkb');await run(`document.querySelectorAll('[role="button"][tabindex="0"]').forEach(el=>{if(el.textContent.includes('${woId}'))el.click()})`);
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
      assert.equal(await evaluate('window.iwomsApp.workflow.error'),'');
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
    for(const [key,value] of Object.entries({name:'Personel A',duty:'Pelaksana',requiredCompetence:'PDKB-TM',certificateNo:'SK-UJI',competence:'PDKB-TM',validFrom:'2026-01-01',validUntil:'2026-01-02',evidence:'Berkas SK UJI'})) await field('person-0-'+key,value);
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
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await screenshot('mobile-sp2b-boundary');
    const metrics=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,font:getComputedStyle(document.body).fontFamily})');
    assert.equal(metrics.scroll,metrics.width);assert.equal(errors.length,0,JSON.stringify(errors));
    fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({woId,result:'PASS',method:'DOM inputs/clicks, CDP Enter, role picker, existing initial WO flow then H01, versioned JSA/IBPPR, four permit reviewers, expired authority and manager renewal, SP2B boundary',flags,evidence,metrics,errors},null,2));
    console.log('Browser I06-I09 passed: hold recovery, document revision, height permit, authority renewal and SP2B boundary.');

  } finally {
    if (ws) ws.close();
    chrome.kill();
    server.close();
  }
}

browserChecks().catch(e=>{console.error(e);process.exitCode=1});
