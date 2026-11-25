const http = require('http');
const { spawn } = require('child_process');

async function runTest() {
  console.log('Starting preview server for ReA...');
  const preview = spawn('npx.cmd', ['vite', 'preview', '--port', '4199', '--host', '127.0.0.1'], {
    cwd: 'C:\\Users\\ASUS\\Desktop\\resume',
    stdio: 'pipe',
    shell: true
  });

  await new Promise((resolve) => {
    preview.stdout.on('data', (d) => {
      const str = d.toString();
      if (str.includes('4199')) resolve();
    });
    setTimeout(resolve, 3000);
  });

  // Verify HTTP 200 for index.html and logo.png
  function fetchUrl(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:4199${path}`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, length: data.length }));
      }).on('error', reject);
    });
  }

  try {
    const htmlRes = await fetchUrl('/');
    console.log('Index.html Status:', htmlRes.status, 'Bytes:', htmlRes.length);

    const logoRes = await fetchUrl('/logo.png');
    console.log('Logo.png Status:', logoRes.status, 'Bytes:', logoRes.length);

    if (htmlRes.status === 200 && logoRes.status === 200 && logoRes.length > 50000) {
      console.log('VERIFICATION SUCCESSFUL: ReA and logo assets served with HTTP 200 OK!');
    } else {
      console.error('VERIFICATION FAILED: Unexpected response status or length');
    }
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    preview.kill();
    process.exit(0);
  }
}

runTest();
