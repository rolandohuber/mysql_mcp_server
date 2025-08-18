#!/usr/bin/env node

/**
 * Script para probar el servidor MCP independientemente
 * Útil para diagnosticar problemas de conexión
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuración
const config = {
  DB_HOST: '',
  DB_PORT: '',
  DB_USER: '',
  DB_PASSWORD: '',
  DB_NAME: '',
  MCP_MODE: 'stdio'
};

console.log('🚀 Iniciando servidor MCP de prueba...');
console.log('📊 Configuración:', config);

// Ejecutar el servidor
const serverPath = path.join(__dirname, '..', 'dist', 'main.js');
const server = spawn('node', [serverPath], {
  env: { ...process.env, ...config },
  stdio: ['pipe', 'pipe', 'inherit']
});

// Simular una petición MCP
const mcpRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
};

server.stdout.on('data', (data) => {
  console.log('📤 Servidor dice:', data.toString());
});

server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
});

server.on('close', (code) => {
  console.log(`🔚 Servidor terminó con código: ${code}`);
});

// Enviar petición después de un momento
setTimeout(() => {
  console.log('📨 Enviando petición MCP...');
  server.stdin.write(JSON.stringify(mcpRequest) + '\n');
}, 2000);

// Cerrar después de 10 segundos
setTimeout(() => {
  console.log('⏰ Cerrando servidor de prueba...');
  server.kill();
}, 10000);
