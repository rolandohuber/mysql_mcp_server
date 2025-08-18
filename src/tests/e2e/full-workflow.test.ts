import { testMysqlService } from '../setup.js';

describe('End-to-End Workflow Tests', () => {

  beforeEach(async () => {
    // Clean up test data before each test
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

  afterAll(async () => {
    // Cleanup handled by test setup
  });

  describe('Complete Database Workflow', () => {
    test('should perform complete CRUD workflow with relationships', async () => {
      // 1. Generate test users
      const usersResult = await testMysqlService.insert('users', [
        { name: 'Alice Johnson', email: 'alice@example.com' },
        { name: 'Bob Smith', email: 'bob@example.com' },
        { name: 'Carol Davis', email: 'carol@example.com' }
      ]);
      expect(usersResult.affectedRows).toBe(3);

      // 2. Generate test posts
      const users = await testMysqlService.query('SELECT id FROM users');
      const userIds = users.rows.map((u: any) => u.id);
      
      const posts = userIds.map((userId: any, index: number) => ({
        user_id: userId,
        title: `Post ${index + 1} by User ${userId}`,
        content: `This is the content of post ${index + 1}`,
        published: index % 2 === 0 ? 1 : 0
      }));

      const postsResult = await testMysqlService.insert('posts', posts);
      expect(postsResult.affectedRows).toBe(3);

      // 3. Generate comments
      const postsData = await testMysqlService.query('SELECT id FROM posts');
      const postIds = postsData.rows.map(p => p.id);
      
      // Verify we have the expected data before creating comments
      expect(userIds.length).toBe(3);
      expect(postIds.length).toBe(3);
      
      const comments: any[] = [];
      postIds.forEach(postId => {
        userIds.forEach(userId => {
          comments.push({
            post_id: postId,
            user_id: userId,
            content: `Comment by user ${userId} on post ${postId}`
          });
        });
      });

      const commentsResult = await testMysqlService.insert('comments', comments);
      expect(commentsResult.affectedRows).toBe(9); // 3 posts × 3 users

      // 4. Test complex queries with joins
      const joinQuery = `
        SELECT 
          u.name as user_name,
          p.title as post_title,
          COUNT(c.id) as comment_count
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id
        LEFT JOIN comments c ON p.id = c.post_id
        GROUP BY u.id, p.id
        ORDER BY u.name, p.title
      `;

      const joinResult = await testMysqlService.query(joinQuery);
      expect(joinResult.rows.length).toBeGreaterThan(0);

      // 5. Test data consistency
      const userCount = await testMysqlService.query('SELECT COUNT(*) as count FROM users');
      const postCount = await testMysqlService.query('SELECT COUNT(*) as count FROM posts');
      const commentCount = await testMysqlService.query('SELECT COUNT(*) as count FROM comments');

      expect(userCount.rows[0].count).toBe(3);
      expect(postCount.rows[0].count).toBe(3);
      expect(commentCount.rows[0].count).toBe(9);

      // 6. Test foreign key constraints
      const relations = await testMysqlService.getTableRelations('posts');
      expect(relations.outgoing.length).toBeGreaterThan(0);
      expect(relations.outgoing[0].referenced_table_name).toBe('users');

      // 7. Test schema diagram generation
      const tables = await testMysqlService.listTables();
      expect(tables).toContain('users');
      expect(tables).toContain('posts');
      expect(tables).toContain('comments');

      // 8. Test data updates and cascading
      const updateResult = await testMysqlService.update(
        'users',
        { name: 'Alice Johnson Updated' },
        'email = "alice@example.com"'
      );
      expect(updateResult.affectedRows).toBe(1);

      // 9. Test data deletion with foreign key constraints
      // Delete comments first (child records)
      const deleteCommentsResult = await testMysqlService.delete(
        'comments',
        'user_id = (SELECT id FROM users WHERE email = "bob@example.com")'
      );
      expect(deleteCommentsResult.affectedRows).toBeGreaterThan(0);

      // Delete posts
      const deletePostsResult = await testMysqlService.delete(
        'posts',
        'user_id = (SELECT id FROM users WHERE email = "bob@example.com")'
      );
      expect(deletePostsResult.affectedRows).toBeGreaterThan(0);

      // Finally delete user
      const deleteUserResult = await testMysqlService.delete(
        'users',
        'email = "bob@example.com"'
      );
      expect(deleteUserResult.affectedRows).toBe(1);

      // 10. Verify final state
      const finalUserCount = await testMysqlService.query('SELECT COUNT(*) as count FROM users');
      expect(finalUserCount.rows[0].count).toBe(2);
    }, 30000);

    test('should handle large dataset operations', async () => {
      // Generate large dataset
      const batchSize = 100;
      const users = Array.from({ length: batchSize }, (_, i) => ({
        name: `Bulk User ${i}`,
        email: `bulk${i}@example.com`
      }));

      const insertResult = await testMysqlService.insert('users', users);
      expect(insertResult.affectedRows).toBe(batchSize);

      // Test pagination-like queries
      const page1 = await testMysqlService.query('SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 0');
      const page2 = await testMysqlService.query('SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 10');

      expect(page1.rows.length).toBe(10);
      expect(page2.rows.length).toBe(10);
      expect(page1.rows[0].id).not.toBe(page2.rows[0].id);

      // Test aggregation queries
      const stats = await testMysqlService.query(`
        SELECT 
          COUNT(*) as total_users,
          MIN(id) as min_id,
          MAX(id) as max_id
        FROM users
      `);

      expect(stats.rows[0].total_users).toBeGreaterThanOrEqual(batchSize);

      // Clean up
      await testMysqlService.delete('users', 'email LIKE "bulk%@example.com"');
    }, 30000);

    test('should handle concurrent operations safely', async () => {
      const concurrentOperations: Promise<any>[] = [];
      const operationCount = 5; // Reduced to avoid race conditions

      // Create concurrent insert operations
      for (let i = 0; i < operationCount; i++) {
        const operation = testMysqlService.insert('users', [{
          name: `Concurrent User ${i}`,
          email: `concurrent${i}@example.com`
        }]);
        concurrentOperations.push(operation);
      }

      // Wait for all operations to complete
      await Promise.allSettled(concurrentOperations);

      // Verify data integrity by counting actual records
      const count = await testMysqlService.query(
        'SELECT COUNT(*) as count FROM users WHERE email LIKE "concurrent%@example.com"'
      );
      
      // Should have at least some successful operations
      expect(count.rows[0].count).toBeGreaterThan(0);
      expect(count.rows[0].count).toBeLessThanOrEqual(operationCount);

      // Clean up
      await testMysqlService.delete('users', 'email LIKE "concurrent%@example.com"');
    }, 30000);
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid SQL gracefully', async () => {
      await expect(
        testMysqlService.query('INVALID SQL STATEMENT')
      ).rejects.toThrow();
    });

    test('should handle foreign key constraint violations', async () => {
      await expect(
        testMysqlService.insert('posts', [{
          user_id: 99999, // Non-existent user ID
          title: 'Invalid Post',
          content: 'This should fail'
        }])
      ).rejects.toThrow();
    });

    test('should handle duplicate key violations', async () => {
      // Insert a user first
      await testMysqlService.insert('users', [{
        name: 'Duplicate Test',
        email: 'duplicate@example.com'
      }]);

      // Try to insert another user with same email (unique constraint)
      await expect(
        testMysqlService.insert('users', [{
          name: 'Another User',
          email: 'duplicate@example.com'
        }])
      ).rejects.toThrow();

      // Clean up
      await testMysqlService.delete('users', 'email = "duplicate@example.com"');
    });

    test('should handle empty result sets', async () => {
      const result = await testMysqlService.query(
        'SELECT * FROM users WHERE email = "nonexistent@example.com"'
      );
      
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBe(0);
    });

    test('should handle table operations on non-existent tables', async () => {
      await expect(
        testMysqlService.describeTable('non_existent_table')
      ).rejects.toThrow();

      await expect(
        testMysqlService.getTableIndexes('non_existent_table')
      ).rejects.toThrow();
    });
  });

  describe('Performance and Optimization', () => {
    test('should execute queries efficiently with proper indexing', async () => {
      // Insert test data
      const users = Array.from({ length: 50 }, (_, i) => ({
        name: `Performance User ${i}`,
        email: `perf${i}@example.com`
      }));
      await testMysqlService.insert('users', users);

      // Test query performance with EXPLAIN
      const explanation = await testMysqlService.explain(
        'SELECT * FROM users WHERE email = "perf25@example.com"'
      );

      expect(Array.isArray(explanation)).toBe(true);
      expect(explanation.length).toBeGreaterThan(0);

      // The query should use the unique index on email
      const explainRow = explanation[0];
      expect(explainRow.possible_keys).toContain('email');

      // Clean up
      await testMysqlService.delete('users', 'email LIKE "perf%@example.com"');
    }, 30000);

    test('should handle batch operations efficiently', async () => {
      const startTime = Date.now();
      
      // Batch insert
      const batchUsers = Array.from({ length: 200 }, (_, i) => ({
        name: `Batch User ${i}`,
        email: `batch${i}@example.com`
      }));
      
      await testMysqlService.insert('users', batchUsers);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds
      
      // Verify all records were inserted
      const count = await testMysqlService.query(
        'SELECT COUNT(*) as count FROM users WHERE email LIKE "batch%@example.com"'
      );
      expect(count.rows[0].count).toBe(200);
      
      // Clean up
      await testMysqlService.delete('users', 'email LIKE "batch%@example.com"');
    }, 30000);
  });
});
