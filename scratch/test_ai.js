const fs = require('fs');
const path = require('path');

// Manually parse env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const query = "need a verified worker near jalukbari area";

function getSystemPrompt(query) {
  return `You are an AI assistant parsing service search requests for HireMe, a marketplace for local skilled labor.
Analyze the user's search query: "${query}"

Extract:
1. "skill": The specific service or profession requested (e.g. "Plumber", "Electrician", "Carpenter", "Mason", "Cleaning").
2. "location": The neighborhood or area name (e.g. "Hatigaon", "Jalukbari", "Beltola", "Zoo Road", etc.).

Return ONLY a valid JSON object. Do not include markdown code block formatting.
Example Output:
{"skill": "Plumber", "location": "Hatigaon"}`;
}

async function testGemini() {
  const apiKey = env.GEMINI_API_KEY;
  const model = env.GEMINI_MODEL || 'gemini-1.5-flash';
  console.log('Testing Gemini with model:', model, 'key prefix:', apiKey ? apiKey.substring(0, 8) : 'NONE');
  if (!apiKey) return;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = getSystemPrompt(query);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    console.log('Gemini Status:', response.status);
    const data = await response.json();
    console.log('Gemini raw response data:', JSON.stringify(data, null, 2));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini Extracted Text:', text);
  } catch (err) {
    console.error('Gemini error:', err);
  }
}

async function testGroq() {
  const apiKey = env.GROQ_API_KEY;
  const model = env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  console.log('Testing Groq with model:', model, 'key prefix:', apiKey ? apiKey.substring(0, 8) : 'NONE');
  if (!apiKey) return;

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const prompt = getSystemPrompt(query);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    console.log('Groq Status:', response.status);
    const data = await response.json();
    console.log('Groq raw response data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Groq error:', err);
  }
}

async function run() {
  await testGemini();
  console.log('\n----------------------------------------\n');
  await testGroq();
}

run();
