const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\d7926f2d-6758-4121-a4ee-4917db8bebae';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9992',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1050',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9992/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let idCounter = 1;
    const callbacks = new Map();
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.id && callbacks.has(d.id)) {
        const cb = callbacks.get(d.id);
        callbacks.delete(d.id);
        cb(d);
      }
    };
    await new Promise(r => ws.onopen = r);

    function call(method, params = {}) {
      return new Promise((resolve) => {
        const id = idCounter++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evalCode(expr) {
      const res = await call('Runtime.evaluate', { expression: expr, returnByValue: true });
      return res.result && res.result.result ? res.result.result.value : null;
    }

    async function snap(filename) {
      const res = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      if (res.result && res.result.data) {
        fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(res.result.data, 'base64'));
        console.log('Successfully captured:', filename);
      }
    }

    await call('Page.enable');
    await call('Runtime.enable');

    // 1. Open P01 and fill active WO data
    await evalCode(`
      const p01Btn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText && (b.innerText.includes('P01') || b.innerText.includes('Pengajuan WO')));
      if (p01Btn) p01Btn.click();
    `);
    await new Promise(r => setTimeout(r, 600));

    await evalCode(`
      const inputNama = document.querySelector('input[placeholder*="Pemeliharaan"]');
      if (inputNama) {
        inputNama.value = 'Pemeliharaan Jamper JTM Tiang BTL-45 Bantul';
        inputNama.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const inputLokasi = document.querySelector('input[placeholder*="Penyulang"]');
      if (inputLokasi) {
        inputLokasi.value = 'Penyulang Bantul 04 - Tiang BTL-45, Jl. Bantul Km 7';
        inputLokasi.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `);
    await new Promise(r => setTimeout(r, 500));

    // 2. Open DOC-02 (Survey Lokasi)
    await evalCode(`
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('Lihat Dokumen'));
      if (btns.length > 1) btns[1].click();
      else if (btns.length > 0) btns[0].click();
    `);
    await new Promise(r => setTimeout(r, 1000));
    await snap('final_sop01_survey_dynamic.png');

    // 3. Switch to DOC-04 (SP2B)
    await evalCode(`
      const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('4. SP2B'));
      if (b) b.click();
    `);
    await new Promise(r => setTimeout(r, 700));
    await snap('final_sop04_1_sp2b_dynamic.png');

    // 4. Switch to DOC-05 (Susunan Tim)
    await evalCode(`
      const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('5. Susunan Tim'));
      if (b) b.click();
    `);
    await new Promise(r => setTimeout(r, 700));
    await snap('final_sop04_2_susunan_tim_dynamic.png');

    // 5. Switch to DOC-09 (Checklist K3)
    await evalCode(`
      const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('9. Checklist K3'));
      if (b) b.click();
    `);
    await new Promise(r => setTimeout(r, 700));
    await snap('final_sop09_checklist_k3_dynamic.png');

    // 6. Test Blangko Kosong mode on Checklist K3
    await evalCode(`
      const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('Blangko Kosong'));
      if (b) b.click();
    `);
    await new Promise(r => setTimeout(r, 700));
    await snap('final_blangko_kosong_mode.png');

    // 7. Test Berkas Arsip PDF Asli tab
    await evalCode(`
      const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes('Berkas Arsip PDF'));
      if (b) b.click();
    `);
    await new Promise(r => setTimeout(r, 1800));
    await snap('final_berkas_arsip_pdf_tab.png');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

main();

