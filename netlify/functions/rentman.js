const https = require('https');

exports.handler = async (event) => {
  // Get token ONLY from environment - never from request headers
  const API_KEY = process.env.RENTMAN_API_KEY;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const rawPath = (event.queryStringParameters && event.queryStringParameters.path) || '/equipment';
  const method = event.httpMethod;
  const bodyData = (event.body && ['POST', 'PUT', 'PATCH'].includes(method)) ? event.body : null;

  console.log('CALL:', method, rawPath, '| KEY_LEN:', API_KEY ? API_KEY.length : 0);

  return new Promise((resolve) => {
    const outHeaders = {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (bodyData) {
      const len = Buffer.byteLength(bodyData, 'utf8');
      outHeaders['Content-Length'] = len;
      console.log('BODY:', bodyData.slice(0, 100), '| LEN:', len);
    }

    const options = {
      hostname: 'api.rentman.net',
      path: rawPath,
      method: method,
      headers: outHeaders
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        console.log('RENTMAN:', res.statusCode, data.slice(0, 200));
        resolve({ statusCode: res.statusCode, headers: corsHeaders, body: data });
      });
    });

    req.on('error', (e) => {
      console.log('ERROR:', e.message);
      resolve({ statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message }) });
    });

    if (bodyData) req.write(bodyData, 'utf8');
    req.end();
  });
};
