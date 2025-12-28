// Quick test script to verify server is running
fetch('http://localhost:3001/api/health')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Server is running!', data);
  })
  .catch(err => {
    console.error('❌ Server is not running:', err.message);
    console.log('\nPlease start the server with: npm run server');
  });

