const https = require('https');

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
    const reqHeaders = {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (bodyBuf) reqHeaders['Content-Length'] = bodyBuf.length;

    console.log(method, rawPath, '| KEY:', API_KEY ? API_KEY.slice(0,20) + '...' : 'MISSING');

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
        console.log('STATUS:', res.statusCode, body.slice(0, 150));
        resolve({ statusCode: res.statusCode, headers: cors, body });
      });
    });

    req.on('error', e => resolve({ statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) }));
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
};
