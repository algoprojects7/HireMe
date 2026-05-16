fetch('http://127.0.0.1:3001/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mobileNumber: '8888888881',
    password: 'worker123',
    name: 'Ramesh Plumber',
    role: 'WORKER',
    gender: 'MALE'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
