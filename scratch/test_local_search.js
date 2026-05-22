async function testLocalSearch() {
  const url = 'http://127.0.0.1:3001/ai/search';
  const payload = { query: 'need a verified worker near jalukbari area' };

  try {
    console.log('Sending query to local server:', payload.query);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error calling local search endpoint:', err);
  }
}

testLocalSearch();
