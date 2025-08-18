import * as tools from '../../tools/index.js';
import { testMysqlService } from '../setup.js';

describe('MySQL Tools', () => {
  beforeEach(async () => {
    // Clean up tables before each test
    await testMysqlService.query('DELETE FROM comments');
    await testMysqlService.query('DELETE FROM posts');
    await testMysqlService.query('DELETE FROM users');
  });

  describe('listTables', () => {
    test('should list all tables', async () => {
      const tables = await tools.listTablesHandler(testMysqlService);
      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toContain('users');
      expect(tables).toContain('posts');
      expect(tables).toContain('comments');
    });
  });

  describe('describeTable', () => {
    test('should describe table schema', async () => {
      const schema = await tools.describeTableHandler(testMysqlService, { table: 'users' });
      expect(Array.isArray(schema)).toBe(true);
      expect(schema.length).toBeGreaterThan(0);
      
      const columns = schema.map(col => col.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('name');
      expect(columns).toContain('email');
    });

    test('should throw error for non-existent table', async () => {
      await expect(
        tools.describeTableHandler(testMysqlService, { table: 'non_existent' })
      ).rejects.toThrow();
    });
  });

  describe('query', () => {
    test('should execute SELECT query', async () => {
      await testMysqlService.insert('users', [
        { name: 'Test User', email: 'test@example.com' }
      ]);

      const result = await tools.queryHandler(testMysqlService, {
        query: 'SELECT * FROM users WHERE name = "Test User"'
      });

      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe('Test User');
    });

    test('should execute INSERT query', async () => {
      const result = await tools.queryHandler(testMysqlService, {
        query: 'INSERT INTO users (name, email) VALUES ("Query User", "query@example.com")'
      });

      expect(result.affectedRows).toBe(1);
      expect(result.insertId).toBeGreaterThan(0);
    });
  });

  describe('tableRelations', () => {
    test('should get table relations', async () => {
      const relations = await tools.tableRelationsHandler(testMysqlService, { table: 'posts' });
      
      expect(relations).toHaveProperty('outgoing');
      expect(relations).toHaveProperty('incoming');
      expect(Array.isArray(relations.outgoing)).toBe(true);
      expect(Array.isArray(relations.incoming)).toBe(true);
      
      // Posts should reference users
      expect(relations.outgoing.length).toBeGreaterThan(0);
      expect(relations.outgoing[0].referenced_table_name).toBe('users');
    });
  });

  describe('listDatabases', () => {
    test('should list databases', async () => {
      const databases = await tools.listDatabasesHandler(testMysqlService);
      expect(Array.isArray(databases)).toBe(true);
      expect(databases.length).toBeGreaterThan(0);
    });
  });

  describe('listIndexes', () => {
    test('should list table indexes', async () => {
      const indexes = await tools.listIndexesHandler(testMysqlService, { table: 'users' });
      expect(Array.isArray(indexes)).toBe(true);
      expect(indexes.length).toBeGreaterThan(0);
      
      // Should have primary key index
      const primaryIndex = indexes.find(idx => idx.Key_name === 'PRIMARY');
      expect(primaryIndex).toBeDefined();
    });
  });

  describe('insert', () => {
    test('should insert single row', async () => {
      const result = await tools.insertHandler(testMysqlService, {
        table: 'users',
        rows: [{ name: 'Insert Test', email: 'insert@example.com' }]
      });

      expect(result.affectedRows).toBe(1);
      expect(result.insertId).toBeGreaterThan(0);
    });

    test('should insert multiple rows', async () => {
      const result = await tools.insertHandler(testMysqlService, {
        table: 'users',
        rows: [
          { name: 'User 1', email: 'user1@example.com' },
          { name: 'User 2', email: 'user2@example.com' }
        ]
      });

      expect(result.affectedRows).toBe(2);
    });
  });

  describe('update', () => {
    test('should update records', async () => {
      // Insert test data
      await testMysqlService.insert('users', [
        { name: 'Update Test', email: 'update@example.com' }
      ]);

      const result = await tools.updateHandler(testMysqlService, {
        table: 'users',
        data: { name: 'Updated Name' },
        where: 'email = "update@example.com"'
      });

      expect(result.affectedRows).toBe(1);

      // Verify update
      const updated = await testMysqlService.query('SELECT name FROM users WHERE email = "update@example.com"');
      expect(updated.rows[0].name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    test('should delete records', async () => {
      // Insert test data
      await testMysqlService.insert('users', [
        { name: 'Delete Test', email: 'delete@example.com' }
      ]);

      const result = await tools.deleteHandler(testMysqlService, {
        table: 'users',
        where: 'email = "delete@example.com"'
      });

      expect(result.affectedRows).toBe(1);

      // Verify deletion
      const remaining = await testMysqlService.query('SELECT COUNT(*) as count FROM users WHERE email = "delete@example.com"');
      expect(remaining.rows[0].count).toBe(0);
    });
  });

  describe('ping', () => {
    test('should ping database successfully', async () => {
      const result = await tools.pingHandler(testMysqlService);
      expect(result.success).toBe(true);
    });
  });

  describe('version', () => {
    test('should get MySQL version', async () => {
      const result = await tools.versionHandler(testMysqlService);
      expect(result.version).toBeDefined();
      expect(typeof result.version).toBe('string');
      expect(result.version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe('explain', () => {
    test('should explain query execution plan', async () => {
      const result = await tools.explainHandler(testMysqlService, {
        query: 'SELECT * FROM users WHERE email = "test@example.com"'
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('table');
    });
  });

  describe('sampleData', () => {
    test('should return sample data', async () => {
      // Insert test data
      const users = Array.from({ length: 10 }, (_, i) => ({
        name: `Sample User ${i}`,
        email: `sample${i}@example.com`
      }));
      await testMysqlService.insert('users', users);

      const result = await tools.sampleDataHandler(testMysqlService, {
        table: 'users',
        count: 5
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('email');
    });
  });

  describe('summarizeTable', () => {
    test('should summarize table data', async () => {
      // Insert test data
      await testMysqlService.insert('users', [
        { name: 'Summary User 1', email: 'summary1@example.com' },
        { name: 'Summary User 2', email: 'summary2@example.com' }
      ]);

      const result = await tools.summarizeTableHandler(testMysqlService, {
        table: 'users'
      });

      expect(result).toHaveProperty('table');
      expect(result).toHaveProperty('rowCount');
      expect(result).toHaveProperty('columns');
      expect(result.table).toBe('users');
      expect(result.rowCount).toBe(2);
      expect(Array.isArray(result.columns)).toBe(true);
    });
  });

  describe('generateSchemaDiagram', () => {
    test('should generate schema diagram', async () => {
      const result = await tools.generateSchemaDiagramHandler(testMysqlService);

      expect(result).toHaveProperty('nodes');
      expect(result).toHaveProperty('edges');
      expect(Array.isArray(result.nodes)).toBe(true);
      expect(Array.isArray(result.edges)).toBe(true);

      // Should have nodes for our test tables
      const tableNames = result.nodes.map(node => node.name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('posts');
      expect(tableNames).toContain('comments');

      // Should have edges for foreign key relationships
      expect(result.edges.length).toBeGreaterThan(0);
    });
  });

  describe('generateTestData', () => {
    test('should generate test data for table without foreign keys', async () => {
      const result = await tools.generateTestDataHandler(testMysqlService, {
        table: 'users',
        count: 5
      });

      expect(result).toHaveProperty('inserted');
      expect(result).toHaveProperty('rows');
      expect(result.inserted).toBe(5);
      expect(Array.isArray(result.rows)).toBe(true);
      expect(result.rows.length).toBe(5);

      // Verify data was actually inserted
      const count = await testMysqlService.query('SELECT COUNT(*) as count FROM users');
      expect(count.rows[0].count).toBe(5);
    });

    test('should generate test data respecting foreign key constraints', async () => {
      // First generate users
      await tools.generateTestDataHandler(testMysqlService, {
        table: 'users',
        count: 3
      });

      // Then generate posts (should reference existing users)
      const result = await tools.generateTestDataHandler(testMysqlService, {
        table: 'posts',
        count: 5
      });

      expect(result.inserted).toBe(5);

      // Verify posts reference valid users
      const posts = await testMysqlService.query('SELECT user_id FROM posts');
      const users = await testMysqlService.query('SELECT id FROM users');
      const userIds = users.rows.map(u => u.id);

      posts.rows.forEach(post => {
        expect(userIds).toContain(post.user_id);
      });
    });
  });
});
