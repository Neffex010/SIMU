const { OPENAI_API_KEY } = process.env;

exports.handler = async (event) => {
  try {
    const { text, voice = 'alloy', model = 'tts-1' } = JSON.parse(event.body);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    // Devolver el audio binario directamente
    const audioBuffer = await response.arrayBuffer();
    
    return {
      statusCode: 200,
      body: Buffer.from(audioBuffer).toString("base64"),
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
