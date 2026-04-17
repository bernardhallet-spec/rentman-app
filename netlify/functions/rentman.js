const https = require('https');
const crypto = require('crypto');

exports.handler = async (event) => {
  const API_KEY = process.env.RENTMAN_API_KEY;
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };

  const rawPath = (event.queryStringParameters && event.queryStringParameters.path) || '/equipment';
  const method = event.httpMethod;
  const bodyData = (event.body && ['POST','PUT','PATCH'].includes(method)) ? event.body : null;

  return new Promise((resolve) => {
    const bodyBuf = bodyData ? Buffer.from(bodyData, 'utf8') : null;

    // Format standard Bearer
    const authHeader = 'Bearer ' + API_KEY;

    const reqHeaders = {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (bodyBuf) {
      reqHeaders['Content-Length'] = bodyBuf.length;
      // Ajouter le hash HMAC du body comme Digest header
      const hmac = crypto.createHmac('sha256', API_KEY);
      hmac.update(bodyBuf);
      const digest = hmac.digest('base64');
      reqHeaders['X-Digest'] = digest;
      console.log('Sending X-Digest:', digest.slice(0,20) + '...');
    }

    console.log(method, rawPath);

    const req = https.request({
      hostname: 'api.rentman.net',
      port: 443,
      path: rawPath,
      method: method,
      headers: reqHeaders,
      agent: new https.Agent({ keepAlive: false })
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        console.log('STATUS:', res.statusCode, body.slice(0, 200));
        resolve({ statusCode: res.statusCode, headers: cors, body });
      });
    });

    req.on('error', e => resolve({ statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) }));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
};
