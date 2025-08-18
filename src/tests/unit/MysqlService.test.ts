import { testMysqlService } from '../setup.js';

describe('MysqlService', () => {
  beforeEach(async () => {
    // Clean up tables before each test (disable foreign key checks temporarily)
    await testMysqlService.query('SET FOREIGN_KEY_CHECKS = 0');
    await testMysqlService.query('DELETE FROM comments');
    await testMysqlService.query('DELETE FROM posts');
    await testMysqlService.query('DELETE FROM users');
    await testMysqlService.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Reset auto increment
    await testMysqlService.query('ALTER TABLE users AUTO_INCREMENT = 1');
    await testMysqlService.query('ALTER TABLE posts AUTO_INCREMENT = 1');
    await testMysqlService.query('ALTER TABLE comments AUTO_INCREMENT = 1');
  });

  describe('Connection Management', () => {
    test('should connect and ping successfully', async () => {
      const result = await testMysqlService.ping();
      expect(result).toBe(true);
    });

    test('should get MySQL version', async () => {
      const version = await testMysqlService.getVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe('Database Operations', () => {
    test('should list databases', async () => {
      const databases = await testMysqlService.listDatabases();
      expect(Array.isArray(databases)).toBe(true);
      expect(databases.length).toBeGreaterThan(0);
    });

    test('should list tables', async () => {
      const tables = await testMysqlService.listTables();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toContain('users');
      expect(tables).toContain('posts');
      expect(tables).toContain('comments');
    });

    test('should describe table schema', async () => {
      const schema = await testMysqlService.describeTable('users');
      expect(Array.isArray(schema)).toBe(true);
      expect(schema.length).toBeGreaterThan(0);
      
      const idColumn = schema.find(col => col.column_name === 'id');
      expect(idColumn).toBeDefined();
      expect(idColumn?.data_type).toBe('int');
      expect(idColumn?.column_key).toBe('PRI');
    });

    test('should get table relations', async () => {
      const relations = await testMysqlService.getTableRelations('posts');
      expect(relations).toHaveProperty('outgoing');
      expect(relations).toHaveProperty('incoming');
      expect(Array.isArray(relations.outgoing)).toBe(true);
      expect(Array.isArray(relations.incoming)).toBe(true);
      
      // Posts should have outgoing relation to users
      expect(relations.outgoing.length).toBeGreaterThan(0);
      expect(relations.outgoing[0].referenced_table_name).toBe('users');
    });

    test('should get table indexes', async () => {
      const indexes = await testMysqlService.getTableIndexes('posts');
      expect(Array.isArray(indexes)).toBe(true);
      expect(indexes.length).toBeGreaterThan(0);
      
      // Should have primary key index
      const primaryIndex = indexes.find(idx => idx.Key_name === 'PRIMARY');
      expect(primaryIndex).toBeDefined();
    });
  });

  describe('CRUD Operations', () => {
    test('should insert data', async () => {
      const users = [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' }
      ];
      
      const result = await testMysqlService.insert('users', users);
      expect(result.affectedRows).toBe(2);
      expect(result.insertId).toBeGreaterThan(0);
    });

    test('should update data', async () => {
      // Insert test data first
      await testMysqlService.insert('users', [
        { name: 'John Doe', email: 'john@example.com' }
      ]);
      
      const result = await testMysqlService.update(
        'users',
        { name: 'John Updated' },
        'email = "john@example.com"'
      );
      
      expect(result.affectedRows).toBe(1);
      
      // Verify update
      const updated = await testMysqlService.query('SELECT name FROM users WHERE email = "john@example.com"');
      expect(updated.rows[0].name).toBe('John Updated');
    });

    test('should delete data', async () => {
      // Insert test data first
      await testMysqlService.insert('users', [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' }
      ]);
      
      const result = await testMysqlService.delete('users', 'email = "john@example.com"');
      expect(result.affectedRows).toBe(1);
      
      // Verify deletion
      const remaining = await testMysqlService.query('SELECT COUNT(*) as count FROM users');
      expect(remaining.rows[0].count).toBe(1);
    });

    test('should execute queries', async () => {
      // Insert test data
      await testMysqlService.insert('users', [
        { name: 'John Doe', email: 'john@example.com' }
      ]);
      
      const result = await testMysqlService.query('SELECT * FROM users WHERE name = ?', ['John Doe']);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe('John Doe');
      expect(result.rows[0].email).toBe('john@example.com');
    });

    test('should get sample data', async () => {
      // Insert test data
      const users = Array.from({ length: 10 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`
      }));
      
      await testMysqlService.insert('users', users);
      
      const sample = await testMysqlService.sampleData('users', 5);
      expect(sample.length).toBe(5);
      expect(sample[0]).toHaveProperty('name');
      expect(sample[0]).toHaveProperty('email');
    });

    test('should explain queries', async () => {
      const explanation = await testMysqlService.explain('SELECT * FROM users WHERE email = "test@example.com"');
      expect(Array.isArray(explanation)).toBe(true);
      expect(explanation.length).toBeGreaterThan(0);
      expect(explanation[0]).toHaveProperty('table');
    });
  });
});
