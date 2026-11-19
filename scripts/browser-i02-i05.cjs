const fs=require('node:fs');const path=require('node:path');const {spawn}=require('node:child_process');const http=require('node:http');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const output=path.join(root,'docs/execution-i02-i05');fs.mkdirSync(output,{recursive:true});
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
    await field('nama_wo','WO uji browser I02?I05');await field('katalog_id','KAT-01');await field('lokasi','Tiang uji');await field('uraian','Kebutuhan uji UI');
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
    await click('Buka');await screenshot('desktop-boundary-jsa');
    await send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true});
    await screenshot('mobile-boundary-jsa');
    await role('tl_op');await click('Buat Pengajuan WO Baru');await field('nama_wo','Uji keyboard mobile');await screenshot('mobile-proposal');
    const metrics=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,font:getComputedStyle(document.body).fontFamily})');
    assert.equal(errors.length,0,JSON.stringify(errors));
    assert.equal(metrics.scroll,metrics.width);
    fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({woId,method:'DOM input/change, button click, CDP Enter pada kartu tugas; preview dan refresh; role simulasi dalam profil terisolasi',metrics,errors,result:'PASS'},null,2));
    console.log('Browser flow passed: new WO, refresh, rejection/revision same ID, three approvals, priority, survey, feasibility, plan, mobile captures.');

  } finally {
    if (ws) ws.close();
    chrome.kill();
    server.close();
  }
}

browserChecks().catch(e=>{console.error(e);process.exitCode=1});
