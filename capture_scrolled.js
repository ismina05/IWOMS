const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\d7926f2d-6758-4121-a4ee-4917db8bebae';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9996',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1200',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9996/json/list');
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
        if (d.error) cb.reject(d.error);
        else cb.resolve(d.result);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = idCounter++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    async function evaluate(code) {
      const res = await send('Runtime.evaluate', {
        expression: `(() => { ${code} })()`,
        returnByValue: true
      });
      if (res.result && res.result.result) {
        return res.result.result.value;
      }
      return null;
    }

    async function capture(filename) {
      const ss = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(ss.data, 'base64');
      const targetPath = path.join(artifactDir, filename);
      fs.writeFileSync(targetPath, buf);
      console.log(`Saved screenshot: ${filename}`);
    }

    await new Promise(r => setTimeout(r, 1500));

    // Open Form P01
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Buat Pengajuan WO Baru'));
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 600));

    // Fill form
    await evaluate(`
      const selProses = Array.from(document.querySelectorAll('select')).find(s => s.innerHTML.includes('PDKB (Pekerjaan Dalam Keadaan Bertegangan)'));
      if (selProses) {
        selProses.value = 'PDKB (Pekerjaan Dalam Keadaan Bertegangan)';
        selProses.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const selKat = Array.from(document.querySelectorAll('select')).find(s => s.innerHTML.includes('KAT-01'));
      if (selKat) {
        selKat.value = 'KAT-01';
        selKat.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const inputNama = document.querySelector('input[placeholder*="Pemeliharaan Jamper"]');
      if (inputNama) {
        inputNama.value = 'Pemeliharaan Jamper JTM Penyulang Bantul Section 04';
        inputNama.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const inputLokasi = document.querySelector('input[placeholder*="Penyulang Sedayu"]');
      if (inputLokasi) {
        inputLokasi.value = 'Penyulang Sedayu - Tiang BTL-142 s/d BTL-150';
        inputLokasi.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const inputTgl = document.querySelector('input[type="date"]');
      if (inputTgl) {
        inputTgl.value = '2026-11-20';
        inputTgl.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const taUraian = document.querySelector('textarea');
      if (taUraian) {
        taUraian.value = 'Penggantian isolator tumpu retak pada tiang BTL-145 demi menjaga kontinuitas pasokan listrik penyulang sedayu tanpa padam.';
        taUraian.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `);
    await new Promise(r => setTimeout(r, 600));

    // Open DOC-01
    await evaluate(`
      const docBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('Lihat Dokumen'));
      if (docBtns.length > 0) docBtns[0].click();
    `);
    await new Promise(r => setTimeout(r, 800));

    // Scroll to Nota Dinas header
    await evaluate(`
      const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.innerText && el.innerText.includes('NOTA DINAS USULAN PEKERJAAN'));
      if (h3) {
        h3.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    `);
    await new Promise(r => setTimeout(r, 500));
    await capture('preview_doc01_scrolled_notadinas.png');

    // Scroll to TTE signatures
    await evaluate(`
      const tte = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText && el.innerText.includes('Pengusul Pekerjaan (Lane 01-03)'));
      if (tte) {
        tte.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    `);
    await new Promise(r => setTimeout(r, 500));
    await capture('preview_doc01_scrolled_tte.png');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

main();

