const https = require('https');
const BASE_HOST = 'api.rentman.net';

exports.handler = async (event) => {
  const API_KEY = process.env.RENTMAN_API_KEY;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const rawPath = (event.queryStringParameters && event.queryStringParameters.path) || '/equipment';
  const method = event.httpMethod;
  const bodyData = (event.body && ['POST','PUT','PATCH'].includes(method)) ? event.body : null;

  // Debug: log token prefix and method
  console.log('Method:', method, '| Path:', rawPath, '| Token prefix:', API_KEY ? API_KEY.slice(0,20) : 'MISSING');

  return new Promise((resolve) => {
    const reqHeaders = {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'RentmanInventoryApp/1.0'
    };

    if (bodyData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const options = {
      hostname: BASE_HOST,
      path: rawPath,
      method: method,
      headers: reqHeaders
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log('Rentman response status:', res.statusCode);
        resolve({ statusCode: res.statusCode, headers, body: data });
      });
    });

    req.on('error', (e) => {
      console.log('Request error:', e.message);
      resolve({ statusCode: 500, headers, body: JSON.stringify({ error: e.message }) });
    });

    if (bodyData) req.write(bodyData);
    req.end();
  });
};
