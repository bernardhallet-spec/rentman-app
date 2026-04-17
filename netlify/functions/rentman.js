const https = require('https');
const { URL } = require('url');

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

  // Build exact Authorization header value
  const authValue = 'Bearer ' + API_KEY;
  console.log('AUTH_HEADER:', authValue.slice(0,30) + '...');
  console.log('METHOD:', method, 'PATH:', rawPath);
  if (bodyData) console.log('BODY_PREVIEW:', bodyData.slice(0,100));

  return new Promise((resolve) => {
    const bodyBuf = bodyData ? Buffer.from(bodyData, 'utf8') : null;
    
    const options = {
      hostname: 'api.rentman.net',
      port: 443,
      path: rawPath,
      method: method,
      headers: {
        'Authorization': authValue,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'identity',
        'Connection': 'close'
      },
      // Disable any agent that might add headers
      agent: new https.Agent({ keepAlive: false })
    };
    
    if (bodyBuf) {
      options.headers['Content-Length'] = bodyBuf.length;
    }

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        console.log('RENTMAN_STATUS:', res.statusCode);
        console.log('RENTMAN_BODY:', body.slice(0, 200));
        resolve({ statusCode: res.statusCode, headers: cors, body });
      });
    });

    req.on('error', (e) => {
      console.log('REQ_ERROR:', e.message);
      resolve({ statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) });
    });

    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
};
