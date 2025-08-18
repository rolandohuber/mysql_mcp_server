#!/usr/bin/env node

const http = require('http');

// Simple HTTP test for MCP server
async function testMCPConnection() {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/mcp/call',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Parse error: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test individual tools
async function testTool(toolName, args = {}) {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/mcp/call',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Parse error: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔗 Testing MCP MySQL Server Connection...\n');

  try {
    // Test tools list
    console.log('📋 Listing available tools...');
    const toolsList = await testMCPConnection();
    
    if (toolsList.error) {
      console.error('❌ Error listing tools:', toolsList.error.message);
      return;
    }
    
    console.log('✅ Available tools:');
    if (toolsList.result && toolsList.result.tools) {
      toolsList.result.tools.forEach(tool => {
        console.log(`   • ${tool.name}: ${tool.description}`);
      });
    }

    console.log('\n🧪 Testing individual tools...\n');

    // Test ping
    console.log('📡 Testing mysql.ping...');
    const pingResult = await testTool('mysql.ping');
    console.log('Result:', pingResult.result ? '✅ Connected' : '❌ Failed');

    // Test version
    console.log('\n🔢 Testing mysql.version...');
    const versionResult = await testTool('mysql.version');
    if (versionResult.result) {
      console.log('MySQL Version:', versionResult.result);
    }

    // Test list tables
    console.log('\n📊 Testing mysql.listTables...');
    const tablesResult = await testTool('mysql.listTables');
    if (tablesResult.result) {
      console.log('Tables found:', tablesResult.result.length);
      tablesResult.result.slice(0, 3).forEach(table => {
        console.log(`   • ${table}`);
      });
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Make sure the MCP server is running:');
    console.log('   npm run dev');
  }
}

if (require.main === module) {
  main();
}
