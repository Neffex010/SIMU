const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Solo permitir método POST
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
        body: JSON.stringify({ error: 'El texto es requerido' })
      };
    }

    // Validar voz permitida
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voice)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Voz no válida' })
      };
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: text,
        voice
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error en la API de OpenAI');
    }

    const audioBuffer = await response.buffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store' // Para evitar caching
      },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error en openaiSpeech:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error al generar el audio',
        details: error.message 
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
