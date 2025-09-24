#!/usr/bin/env node

// Simple API test without starting the full dev server
const https = require('https');
const http = require('http');

async function testTableAvailabilityAPI() {
  console.log('🔍 Testing Table Availability API...\n');

  const testData = {
    date: "2024-10-01",
    time: "19:00",
    partySize: 4
  };

  const postData = JSON.stringify(testData);

  // Try different possible URLs
  const urls = [
    'http://localhost:3000/api/tables/availability',
    'https://supabase.enigmaconalma.com/api/tables/availability'
  ];

  for (const url of urls) {
    console.log(`\n🌐 Testing: ${url}`);

    try {
      const response = await makeRequest(url, postData);
      console.log('✅ API Response:', JSON.stringify(response, null, 2));
      return; // Exit on first successful response
    } catch (error) {
      console.log('❌ API Error:', error.message);
    }
  }

  console.log('\n🚨 All API endpoints failed to respond');
}

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHTTPS = urlObj.protocol === 'https:';
    const client = isHTTPS ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHTTPS ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve(jsonResponse);
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            rawResponse: responseData.substring(0, 200) + '...'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout after 5 seconds'));
    });

    req.write(data);
    req.end();
  });
}

// Also test the environment setup
function checkEnvironmentSetup() {
  console.log('🔧 Checking Environment Setup...\n');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  let missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: PRESENT (${process.env[varName].substring(0, 20)}...)`);
    }
  });

  if (missingVars.length > 0) {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('💡 Make sure to create a .env.local file with these variables');
    return false;
  }

  return true;
}

async function main() {
  console.log('🚀 ENIGMA TABLE AVAILABILITY FLOW VERIFICATION\n');
  console.log('='.repeat(50));

  // Check environment first
  const envOK = checkEnvironmentSetup();
  console.log('\n' + '='.repeat(50));

  // Test API
  await testTableAvailabilityAPI();

  console.log('\n' + '='.repeat(50));
  console.log('🎯 Test completed');
}

main().catch(console.error);