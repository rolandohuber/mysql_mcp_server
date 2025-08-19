import { config } from 'dotenv';
import { DatabaseConfig } from '../types/index.js';

config();

export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '0'),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  };
}

export function getServerConfig() {
  return {
    mcpPort: parseInt(process.env.MCP_PORT || '0'),
    mcpHost: process.env.MCP_HOST,
    debug: process.env.DEBUG === 'true',
  };
}
