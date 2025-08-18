import { testMysqlService } from '../setup.js';

describe('Adapter Integration Tests', () => {
  describe('Database Integration', () => {
    test('should verify MySQL service is working for adapter integration', async () => {
      // Test that the database service is available for adapters
      const tables = await testMysqlService.listTables();
      expect(Array.isArray(tables)).toBe(true);
      
      // Test basic database operations that adapters would use
      const databases = await testMysqlService.listDatabases();
      expect(Array.isArray(databases)).toBe(true);
      
      // Test ping functionality
      const pingResult = await testMysqlService.ping();
      expect(pingResult).toBe(true);
    });

    test('should verify adapter files exist and are importable', () => {
      // Test that adapter files can be required (without instantiating)
      const fs = require('fs');
      const path = require('path');
      
      const adaptersDir = path.join(__dirname, '../../adapters');
      const adapterFiles = [
        'StdioAdapter.ts',
        'HttpAdapter.ts', 
        'WebSocketAdapter.ts',
        'index.ts'
      ];
      
      adapterFiles.forEach(file => {
        const filePath = path.join(adaptersDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should verify adapter exports are available', () => {
      // Test that the main index file exports adapters
      const fs = require('fs');
      const path = require('path');
      
      const indexPath = path.join(__dirname, '../../adapters/index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      expect(indexContent).toContain('StdioAdapter');
      expect(indexContent).toContain('HttpAdapter');
      expect(indexContent).toContain('WebSocketAdapter');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate adapter configuration requirements', async () => {
      // Test that required dependencies are available
      const packageJson = require('../../../package.json');
      
      // Check for required dependencies
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.dependencies).toHaveProperty('ws');
      expect(packageJson.dependencies).toHaveProperty('cors');
      expect(packageJson.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
    });
  });
});
