const http = require('http');

function testServer() {
  console.log('🧪 Testing server connectivity...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server responded with status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📡 Response:', data);
    });
  });

  req.on('error', (error) => {
    console.log('❌ Server connection failed:', error.message);
    console.log('💡 Make sure the server is running with: npm start');
  });

  req.end();
}

testServer();
