const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZWRld2Vya2VyIjoyMzYsImFjY291bnQiOiJhYmhzZXJ2aWNlcyIsImNsaWVudF90eXBlIjoib3BlbmFwaSIsImNsaWVudC5uYW1lIjoib3BlbmFwaSIsImV4cCI6MjA4MTc2MTMxMywiaXNzIjoie1wibmFtZVwiOlwiYmFja2VuZFwiLFwidmVyc2lvblwiOlwiNC44MDguMC44XCJ9IiwiaWF0IjoxNzY2MjI4NTEzfQ.ayJQWTSZUfnD1nmvW0LCt0lrX1_FQaGQixaNTciA7og';
const BASE = 'https://api.rentman.net';

exports.handler = async (event) => {
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
    const opts = {
      method: event.httpMethod,
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      }
    };
    if (event.body && ['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
      opts.body = event.body;
    }

    const response = await fetch(url, opts);
    const text = await response.text();

    return {
      statusCode: response.status,
      headers,
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
