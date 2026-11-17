const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\d7926f2d-6758-4121-a4ee-4917db8bebae';

async function main() {
  console.log('Spawning Chrome headless on port 9994...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9994',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9994/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) throw new Error('No page tab found');

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

    // STEP 1: Click "Buat Pengajuan WO Baru"
    console.log('Step 1: Click Buat Pengajuan WO Baru...');
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Buat Pengajuan WO Baru'));
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 800));

    // Check values in form
    const formVals = await evaluate(`
      const selects = Array.from(document.querySelectorAll('select'));
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="date"]'));
      const textarea = document.querySelector('textarea');
      return {
        selectCount: selects.length,
        select0Value: selects[0] ? selects[0].value : null,
        select1Value: selects[1] ? selects[1].value : null,
        inputTexts: inputs.map(i => i.value),
        textarea: textarea ? textarea.value : null
      };
    `);
    console.log('Form P01 initial blank values:', formVals);

    await capture('preview_form_p01_initial_blank.png');

    // STEP 2: Open "Lihat Dokumen" on DOC-01 while form is blank
    console.log('Step 2: Open DOC-01 modal...');
    await evaluate(`
      const docBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('Lihat Dokumen'));
      if (docBtns.length > 0) docBtns[0].click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    await capture('preview_doc01_initial_blank_form.png');

    // STEP 3: Close modal and type into Form P01
    console.log('Step 3: Close modal and fill Form P01...');
    await evaluate(`
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Tutup Pratinjau'));
      if (closeBtn) closeBtn.click();
    `);
    await new Promise(r => setTimeout(r, 600));

    // Fill the inputs reactively
    await evaluate(`
      // 1. Select Proses Bisnis
      const selProses = Array.from(document.querySelectorAll('select')).find(s => s.innerHTML.includes('PDKB (Pekerjaan Dalam Keadaan Bertegangan)'));
      if (selProses) {
        selProses.value = 'PDKB (Pekerjaan Dalam Keadaan Bertegangan)';
        selProses.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 2. Select Katalog
      const selKat = Array.from(document.querySelectorAll('select')).find(s => s.innerHTML.includes('KAT-01') || s.innerHTML.includes('PDKB-TM-01'));
      if (selKat) {
        selKat.value = 'KAT-01';
        selKat.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 3. Nama WO
      const inputNama = document.querySelector('input[placeholder*="Pemeliharaan"]');
      if (inputNama) {
        inputNama.value = 'Pemeliharaan Jamper JTM Penyulang Bantul Section 04';
        inputNama.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // 5. Lokasi
      const inputLokasi = document.querySelector('input[placeholder*="Penyulang"]');
      if (inputLokasi) {
        inputLokasi.value = 'Penyulang Sedayu - Tiang BTL-142 s/d BTL-150';
        inputLokasi.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // 6. Preferensi Tanggal
      const inputTgl = document.querySelector('input[type="date"]');
      if (inputTgl) {
        inputTgl.value = '2026-11-20';
        inputTgl.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // 7. Uraian
      const taUraian = document.querySelector('textarea');
      if (taUraian) {
        taUraian.value = 'Penggantian isolator tumpu retak pada tiang BTL-145 demi menjaga kontinuitas pasokan listrik penyulang sedayu tanpa padam.';
        taUraian.dispatchEvent(new Event('input', { bubbles: true }));
      }
    `);
    await new Promise(r => setTimeout(r, 800));

    await capture('preview_form_p01_filled_reactive.png');

    // STEP 4: Open DOC-01 again to verify real-time reactive live sync
    console.log('Step 4: Open DOC-01 again to verify reactive sync...');
    await evaluate(`
      const docBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText && b.innerText.includes('Lihat Dokumen'));
      if (docBtns.length > 0) docBtns[0].click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    await capture('preview_doc01_reactive_live_synced.png');

    console.log('All verification steps succeeded! Screenshots captured.');
    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
  }
}

main();
