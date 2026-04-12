const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZWRld2Vya2VyIjoyMzYsImFjY291bnQiOiJhYmhzZXJ2aWNlcyIsImNsaWVudF90eXBlIjoib3BlbmFwaSIsImNsaWVudC5uYW1lIjoib3BlbmFwaSIsImV4cCI6MjA4MTc2MTMxMywiaXNzIjoie1wibmFtZVwiOlwiYmFja2VuZFwiLFwidmVyc2lvblwiOlwiNC44MDguMC44XCJ9IiwiaWF0IjoxNzY2MjI4NTEzfQ.ayJQWTSZUfnD1nmvW0LCt0lrX1_FQaGQixaNTciA7og';
const RENTMAN_BASE = 'https://api.rentman.net';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = (event.queryStringParameters && event.queryStringParameters.path) || '/equipment';
  const method = event.httpMethod;
  const url = RENTMAN_BASE + path;

  try {
    const fetchOptions = {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      }
    };

    if (event.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = event.body;
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
