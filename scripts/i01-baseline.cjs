const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFileSync, spawn } = require('node:child_process');
const http = require('node:http');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/baseline-i01');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).find(script => script.includes('function ajukanWOP01'));
fs.mkdirSync(output, { recursive: true });

function launch() {
  const Vue = require(path.join(root, '../pdkb-vue/node_modules/vue'));
  const window = {};
  vm.runInNewContext(source.replace('const rolesConfig = {', 'const rolesConfig = window.baselineRoles = {'), {
    Vue: { ...Vue, createApp: ({ setup }) => ({ mount: () => setup() }), onMounted() {}, onUnmounted() {} },
    window, document: { getElementById() { return null; } }, setTimeout() {}, clearTimeout() {}, console,
  });
  window.iwomsApp.baselineRoles = window.baselineRoles;
  return window.iwomsApp;
}

function functionChecks() {
  const results = [];
  function check(id, run) {
    try { const observation = run(); results.push({ id, reproduced: true, observation }); }
    catch (error) { results.push({ id, reproduced: false, error: error.message }); }
  }
  const a = launch();
  Object.assign(a.formP01.value, { nama_wo: 'I01 TEST', proses_bisnis: 'PDKB', katalog_id: 'I01', lokasi: 'Lokasi sintetis' });
  a.ajukanWOP01();
  const wo = a.workOrders.value[0];
  check('T01', () => { assert.ok(!launch().workOrders.value.some(w => w.id === wo.id)); return 'WO baru hilang pada inisialisasi ulang.'; });
  check('T02', () => { a.activeRoleKey.value = 'asman_jaringan'; assert.equal(a.filteredMyActions.value.some(t => t.wo?.id === wo.id), false); return 'WO Submitted baru absen di antrean Asman.'; });
  check('T03', () => { a.activeRoleKey.value = 'tl_har'; a.approveStepAsman(wo); a.approveStepSupervisor(wo); a.approveStepManajer(wo); assert.equal(wo.status, 'Approved'); return 'TL HAR diterima oleh ketiga handler persetujuan.'; });
  check('T09', () => {
    a.openDetailWO(wo);
    const observations = ['Approved', 'Scheduled', 'Ongoing', 'Completed'].map(status => {
      wo.status = status;
      return { status, flags: ['isSurveyCompleted', 'isJsaCompleted', 'isSp2bIssued', 'isSp3bIssued'].map(key => a.activeDocData.value[key]) };
    });
    assert.deepEqual(observations.map(item => item.flags[0]), [true, false, false, true]);
    return observations;
  });
  check('T15', () => { wo.working_permit_nomor = 'TEST'; wo.jadwal_resmi_tanggal = '2099-01-01'; a.preparatorScheduleWO(wo); assert.equal(wo.status, 'Scheduled'); assert.equal(a.isReadyToStart(wo), false); return 'Terjadwal tetapi briefing false menahan mulai.'; });
  check('T20', () => { a.selesaikanPekerjaanLapangan(wo); assert.equal(wo.status, 'Completed'); assert.equal(wo.area_diterima_operasi, false); return 'Handler selesai menetapkan Completed tanpa penerimaan operasi.'; });
  check('T19', () => {
    a.activeWIPWOId.value = a.workOrders.value[1].id;
    a.wipItems.value[0].answer = 'Tidak';
    a.activeWIPWOId.value = wo.id;
    assert.equal(a.wipItems.value[0].answer, 'Tidak');
    a.wipItems.value.forEach(item => { item.answer = ''; });
    a.k3lSahkanWIP(); assert.equal(wo.wip_disahkan_k3l, true);
    return 'Jawaban lintas WO sama dan WIP kosong dapat disahkan tanpa submit.';
  });
  check('T22', () => { wo.laporan_diterima = true; a.kembalikanRevisiLaporan(wo); assert.equal(a.canCloseWO(wo), true); return 'Report Revision masih memenuhi canCloseWO.'; });
  check('T23', () => { a.activeRoleKey.value = 'komisi_unit'; assert.ok(a.roleAllowedScreens.komisi_unit.includes('R03')); a.tutupWODireksi(wo); assert.equal(wo.status, 'Closed'); return 'Komisi Unit diberi R03 dan handler tutup menerima perannya.'; });
  check('T04', () => { const b = launch(); b.activeRoleKey.value = 'tl_op'; b.simpanDraftP01(); b.editDraftWO(b.draftList.value[0]); assert.equal(b.activeRoleKey.value, 'tl_har'); return 'Edit draft TL OP beralih ke TL HAR.'; });
  check('T07', () => { a.approveStepAsman(wo); a.approveStepSupervisor(wo); a.approveStepManajer(wo); a.preparatorReturnToDireksi(wo); a.rejectReasonInput.value = 'I01'; a.confirmRejectWO(); assert.equal(wo.status, 'Assignment Review'); assert.ok(wo.approval_manajer.approved); return 'Assignment Review mempertahankan seluruh flag approval.'; });
  check('T06', () => { a.rejectStep(wo); a.rejectReasonInput.value = 'I01'; a.confirmRejectWO(); a.executeAction({ targetScreen: 'P01', wo }); a.ajukanWOP01(); assert.equal(wo.status, 'Rejected'); assert.notEqual(a.workOrders.value[0].id, wo.id); return 'Ajukan ulang Rejected membuat WO baru.'; });
  const inventory = {
    roles: a.baselineRoles, screens: a.menuScreensMap, permissions: a.roleAllowedScreens, documents: a.docRoleMeta,
    assets: fs.readdirSync(path.join(root, 'assets')).map(name => ({ name, sha256: hash(fs.readFileSync(path.join(root, 'assets', name))) })),
  };
  fs.writeFileSync(path.join(output, 'inventory.json'), JSON.stringify(inventory, null, 2));
  fs.writeFileSync(path.join(output, 'function-results.json'), JSON.stringify({ method: 'Vue setup dalam VM, mutasi memori sintetis, tanpa DOM/UAT pengguna', results }, null, 2));
  assert.ok(results.every(result => result.reproduced), 'Ada reproduksi yang gagal, lihat function-results.json');
}

async function browserChecks() {
  const server = http.createServer((req, res) => {
    const requested = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (requested === '/' ? '/index.html' : decodeURIComponent(requested)));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
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
    const captures = [];
    for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: device === 'mobile' });
      await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` });
      let ready = false;
      for (let i = 0; i < 120; i++) { await new Promise(resolve => setTimeout(resolve, 500)); if (await evaluate('Boolean(window.iwomsApp)')) { ready = true; break; } }
      assert.ok(ready, 'Vue CDN gagal dimuat');
      await evaluate('document.fonts.ready.then(() => true)');
      for (const screen of ['dashboard', 'p01', 'p02', 'detail', 'preview']) {
        const setup = {
          dashboard: "a.showDetailModal=false;a.showDocPreviewModal=false;a.activeScreenCode='D01';a.activeMenu='dashboard';",
          p01: "a.activeRoleKey='tl_har';a.openNewWOModal();",
          p02: "a.activeRoleKey='asman_jaringan';a.activeMenu='perencanaan';a.activeScreenCode='P02';",
          detail: "a.openDetailWO(a.workOrders[0]);",
          preview: "a.showDetailModal=false;a.bukaPratinjauDokumen({kode:'DOC-04',nama:'SP2B',is_user_uploaded:false});",
        }[screen];
        await evaluate(`(() => { const a=window.iwomsApp; ${setup} return true; })()`);
        await new Promise(resolve => setTimeout(resolve, 700));
        const info = await evaluate("({screen:window.iwomsApp.activeScreenCode,role:window.iwomsApp.activeRoleKey,detail:window.iwomsApp.showDetailModal,preview:window.iwomsApp.showDocPreviewModal,text:document.body.innerText.length,bodyWidth:document.documentElement.scrollWidth,font:getComputedStyle(document.body).fontFamily})");
        assert.ok(info.text > 500);
        if (screen === 'preview') assert.equal(info.preview, true);
        if (screen === 'detail') assert.equal(info.detail, true);
        const filename = `${device}-${screen}.png`;
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(output, filename), Buffer.from(screenshot.data, 'base64'));
        captures.push({ filename, width, height, setup, ...info });
      }
    }
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ method: 'Chrome headless CDP, layar dibuka melalui state/fungsi Vue; bukan uji klik pengguna atau lintas akun', captures }, null, 2));
  } finally {
    if (ws) ws.close();
    chrome.kill();
    server.close();
  }
}

async function main() {
  const upstream = git('show', 'HEAD:index.html');
  const diff = git('diff', '--', 'index.html');
  fs.writeFileSync(path.join(output, 'index.snapshot.html'), html);
  fs.writeFileSync(path.join(output, 'local-changes.patch'), diff);
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({ capturedAt: new Date().toISOString(), commit: git('rev-parse', 'HEAD').trim(), branch: git('branch', '--show-current').trim(), sourceSha256: hash(html), upstreamTextSha256: hash(upstream), node: process.version, source: 'index.html', statusBefore: git('status', '--short'), scope: 'I01' }, null, 2));
  functionChecks();
  await browserChecks();
  assert.equal(hash(fs.readFileSync(path.join(root, 'index.html'))), hash(html));
  console.log('I01 baseline captured. Function reproductions and 10 browser captures completed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
