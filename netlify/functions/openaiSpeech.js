const axios = require('axios');

exports.handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text, voice = 'alloy', model = 'tts-1' } = JSON.parse(event.body);
    
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model,
        input: text,
        voice
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg'
      },
      body: response.data.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
