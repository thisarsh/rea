const http = require('http');

http.get('http://127.0.0.1:4199/', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Title found:', body.includes('<title>ReA — AI Resume Analyzer</title>'));
    console.log('Logo favicon found:', body.includes('href="/logo.png"'));
    console.log('Poppins font found:', body.includes('family=Poppins'));
  });
});
