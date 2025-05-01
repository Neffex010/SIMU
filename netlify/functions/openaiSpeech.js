const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    const { text, voice = 'nova', model = 'tts-1' } = JSON.parse(event.body);
    
    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Texto es requerido' })
      };
    }

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
      headers: { 'Content-Type': 'audio/mpeg' },
      body: Buffer.from(response.data).toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error en openaiSpeech:', error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: 'Error al generar audio',
        details: error.message 
      })
    };
  }
};
