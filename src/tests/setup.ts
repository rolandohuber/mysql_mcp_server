import { MysqlService } from '../services/MysqlService.js';

// Test database configuration
const testConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export let testMysqlService: MysqlService;

beforeAll(async () => {
  try {
    console.log('-------------', testConfig)
    // First try to connect to MySQL server without specifying a database
    const adminService = new MysqlService({
      host: testConfig.host || '',
      port: parseInt(testConfig.port || '0') || 0,
      user: testConfig.user || '',
      password: testConfig.password || '',
      database: testConfig.database || ''
    });
    
    await adminService.connect();
    
    // Drop and recreate test database
    await adminService.query(`DROP DATABASE IF EXISTS \`${testConfig.database}\``);
    await adminService.query(`CREATE DATABASE IF NOT EXISTS \`${testConfig.database}\``);
    await adminService.disconnect();
    
    // Now connect to the test database
    testMysqlService = new MysqlService({
      host: testConfig.host || '',
      port: parseInt(testConfig.port || '0') || 0,
      user: testConfig.user || '',
      password: testConfig.password || '',
      database: testConfig.database || ''
    });
    await testMysqlService.connect();
    
    // Create test tables
    await createTestTables();
    
    console.log(`✓ Test database '${testConfig.database}' created successfully`);
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    console.log('Please ensure MySQL is running and credentials are correct');
    console.log('Test configuration:', {
      host: testConfig.host,
      port: testConfig.port,
      user: testConfig.user,
      database: testConfig.database
    });
    // Don't throw error, allow tests to continue with existing database
    console.warn('Continuing with existing database setup...');
    
    // Try to connect to existing database
    try {
      testMysqlService = new MysqlService({
        host: testConfig.host || '',
        port: parseInt(testConfig.port || '0') || 0,
        user: testConfig.user || '',
        password: testConfig.password || '',
        database: testConfig.database || ''
      });
      await testMysqlService.connect();
      console.log(`✓ Connected to existing database '${testConfig.database}'`);
    } catch (connectionError) {
      console.error('❌ Failed to connect to existing database:', connectionError);
      throw connectionError;
    }
  }
}, 30000);

afterAll(async () => {
  if (testMysqlService) {
    try {
      // Don't drop the database, just clean up tables
      await testMysqlService.query('SET FOREIGN_KEY_CHECKS = 0');
      await testMysqlService.query('DELETE FROM comments');
      await testMysqlService.query('DELETE FROM posts');
      await testMysqlService.query('DELETE FROM users');
      await testMysqlService.query('SET FOREIGN_KEY_CHECKS = 1');
      
      // Properly disconnect
      await testMysqlService.disconnect();
    } catch (error) {
      console.warn('Test cleanup failed:', error);
    }
  }
}, 10000);

async function createTestTables(): Promise<void> {
  // Users table
  await testMysqlService.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Posts table
  await testMysqlService.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Comments table
  await testMysqlService.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Add some indexes (ignore if they already exist)
  try {
    await testMysqlService.query(`CREATE INDEX idx_posts_user_id ON posts(user_id)`);
  } catch (error) {
    // Index already exists, ignore
  }
  try {
    await testMysqlService.query(`CREATE INDEX idx_comments_post_id ON comments(post_id)`);
  } catch (error) {
    // Index already exists, ignore
  }
}
