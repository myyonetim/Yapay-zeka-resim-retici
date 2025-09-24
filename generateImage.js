// netlify/functions/generateImage.js
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body || '{}');
    if (!prompt) return { statusCode: 400, body: 'Missing prompt' };

    const API_KEY = process.env.API_KEY; // Netlify env var
    if (!API_KEY) return { statusCode: 500, body: 'API key not configured' };

    // --- Burayı kendi AI servisinin endpoint'i ile değiştir ---
    const aiResponse = await fetch('https://api.example.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ prompt })
    });

    const data = await aiResponse.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
};
