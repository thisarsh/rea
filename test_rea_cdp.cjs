const { spawn } = require('child_process');
const http = require('http');

async function testHeadless() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9333',
    '--disable-gpu',
    'http://127.0.0.1:4199/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  function getCdpUrl() {
    return new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9333/json', (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          const list = JSON.parse(d);
          resolve(list[0].webSocketDebuggerUrl);
        });
      }).on('error', reject);
    });
  }

  const wsUrl = await getCdpUrl();
  const WebSocket = require('ws');
  const ws = new WebSocket(wsUrl);

  await new Promise(r => ws.on('open', r));

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise(res => {
      const id = reqId++;
      const handler = (msg) => {
        const data = JSON.parse(msg);
        if (data.id === id) {
          ws.off('message', handler);
          res(data.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // 1. Check logo image on upload screen
  const logoEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const img = document.querySelector('header img');
        return img ? { src: img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight } : null;
      })()
    `,
    returnByValue: true
  });
  console.log('Header Logo Check:', JSON.stringify(logoEval.result?.value));

  // 2. Click the Aarav Sharma demo preset
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('h4'));
        const aaravCard = cards.find(h => h.textContent.includes('Aarav Sharma'));
        if (aaravCard) {
          aaravCard.closest('div[class*="cursor-pointer"]').click();
          return true;
        }
        return false;
      })()
    `
  });

  console.log('Clicked Aarav Sharma preset, waiting for ATS Scorecard...');
  await new Promise(r => setTimeout(r, 4500));

  // 3. Check Scorecard contents & radial gauge
  const scoreEval = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const gaugeText = document.querySelector('svg circle[stroke*="caramelGaugeGrad"]');
        const scoreNumber = document.querySelector('.text-4xl')?.textContent;
        const verdict = document.querySelector('span[class*="tracking-tight"]')?.textContent;
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const headerLogo = document.querySelector('header img')?.src;
        return {
          scoreNumber,
          hasGaugeStroke: Boolean(gaugeText),
          bodyBg,
          headerLogo
        };
      })()
    `,
    returnByValue: true
  });

  console.log('DOM Evaluation Result:', JSON.stringify(scoreEval.result?.value, null, 2));

  // Clean up
  chrome.kill();
  process.exit(0);
}

testHeadless().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
