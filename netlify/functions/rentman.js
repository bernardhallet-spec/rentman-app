const BASE = 'https://api.rentman.net';

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
  const url = BASE + rawPath;

  try {
    const reqHeaders = {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json'
    };

    const opts = { method: event.httpMethod, headers: reqHeaders };
    if (event.body && ['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
      opts.body = event.body;
    }

    const response = await fetch(url, opts);
    const text = await response.text();
    return { statusCode: response.status, headers, body: text };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
