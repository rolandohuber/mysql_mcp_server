#!/usr/bin/env node

/**
 * Example MCP client for testing the MySQL MCP Server
 * This demonstrates how to interact with the server programmatically
 */

const WebSocket = require('ws');

class MCPClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.on('open', () => {
        console.log('Connected to MCP server');
        resolve();
      });
      
      this.ws.on('error', reject);
      
      this.ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.id && this.pendingRequests.has(message.id)) {
          const { resolve, reject } = this.pendingRequests.get(message.id);
          this.pendingRequests.delete(message.id);
          
          if (message.error) {
            reject(new Error(message.error.message));
          } else {
            resolve(message.result);
          }
        }
      });
    });
  }

  async callTool(name, args = {}) {
    const id = ++this.requestId;
    const message = {
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: {
        name,
        arguments: args
      }
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(message));
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  async listTools() {
    const id = ++this.requestId;
    const message = {
      jsonrpc: '2.0',
      id,
      method: 'tools/list',
      params: {}
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(message));
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Example usage
async function main() {
  const client = new MCPClient('ws://localhost:3001');
  
  try {
    await client.connect();
    
    // List available tools
    console.log('Available tools:');
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
    
    // Example tool calls
    console.log('\n--- Testing mysql.ping ---');
    const pingResult = await client.callTool('mysql.ping');
    console.log('Ping result:', pingResult);
    
    console.log('\n--- Testing mysql.version ---');
    const versionResult = await client.callTool('mysql.version');
    console.log('Version result:', versionResult);
    
    console.log('\n--- Testing mysql.listTables ---');
    const tablesResult = await client.callTool('mysql.listTables');
    console.log('Tables:', tablesResult);
    
    if (tablesResult.length > 0) {
      console.log(`\n--- Testing mysql.describeTable for ${tablesResult[0]} ---`);
      const schemaResult = await client.callTool('mysql.describeTable', {
        table: tablesResult[0]
      });
      console.log('Schema:', JSON.stringify(schemaResult, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCPClient;
