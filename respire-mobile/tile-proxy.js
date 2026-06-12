const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const TILE_URL = 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png';
const LEAFLET_JS = fs.readFileSync(path.join(__dirname, 'leaflet.min.js'), 'utf8');
const LEAFLET_CSS = fs.readFileSync(path.join(__dirname, 'leaflet.min.css'), 'utf8');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/leaflet.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    return res.end(LEAFLET_JS);
  }
  if (req.url === '/leaflet.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(LEAFLET_CSS);
  }

  const { z, x, y } = url.parse(req.url, true).query;
  if (!z || !x || !y) {
    res.writeHead(400);
    return res.end('Missing z/x/y');
  }

  const tileUrl = TILE_URL
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);

  https.get(tileUrl, { headers: { 'User-Agent': 'Respire/1.0' } }, (tileRes) => {
    res.writeHead(tileRes.statusCode, {
      'Content-Type': tileRes.headers['content-type'] || 'image/png',
      'Cache-Control': 'max-age=86400',
    });
    tileRes.pipe(res);
  }).on('error', (err) => {
    console.error('Tile fetch error:', err.message);
    res.writeHead(500);
    res.end('Tile fetch error');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy running on http://0.0.0.0:${PORT}`);
});
