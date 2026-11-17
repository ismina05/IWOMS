const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\d7926f2d-6758-4121-a4ee-4917db8bebae';

async function capturePdf(pdfUrl, outName) {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9998',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,900',
    pdfUrl
  ]);

  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch('http://127.0.0.1:9998/json/list');
    const tabs = await listRes.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

    let id = 1;
    function send(m, p={}) {
      return new Promise(res => {
        const myId = id++;
        const handler = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === myId) {
            ws.removeEventListener('message', handler);
            res(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: myId, method: m, params: p }));
      });
    }

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await new Promise(r => setTimeout(r, 1500));
    const snap = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1200, height: 600, scale: 1 }
    });
    if (snap && snap.data) {
      fs.writeFileSync(path.join(artifactDir, outName), Buffer.from(snap.data, 'base64'));
      console.log('Saved:', outName);
    }
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

async function run() {
  await capturePdf('http://localhost:3000/assets/DOC-02_SOP_01_Survey_Lokasi.pdf', 'raw_kop_doc02_survey.png');
  await capturePdf('http://localhost:3000/assets/DOC-04_SOP_04_1_SP2B.pdf', 'raw_kop_doc04_sp2b.png');
}
run();

