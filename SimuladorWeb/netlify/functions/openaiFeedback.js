const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { text } = JSON.parse(event.body);

  const systemMsg = `
    Eres un coach experto en entrevistas laborales en áreas técnicas y blandas. Cuando evalúes la respuesta, devuelve exactamente un JSON con esta forma:
    {
      "fortalezas": ["…","…"],
      "mejoras": ["…","…"],
      "tip": "…"
    }
  `;

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: `Evalúa esta respuesta: "${text}"` }
    ],
    temperature: 0.5
  };

  const openAIKey = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return { statusCode: response.status, body: 'OpenAI request failed.' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    return {
      statusCode: 200,
      body: content
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al procesar el feedback' })
    };
  }
};
