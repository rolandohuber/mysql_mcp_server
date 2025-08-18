import mysql from 'mysql2/promise';
import { DatabaseConfig, QueryResult } from '../types';

export class MysqlService {
  private connection: mysql.Connection | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    try {
      const connectionConfig: any = {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        charset: 'utf8mb4',
        timezone: '+00:00',
      };
      
      if (this.config.database) {
        connectionConfig.database = this.config.database;
      }
      
      this.connection = await mysql.createConnection(connectionConfig);
    } catch (error) {
      throw new Error(`Failed to connect to MySQL: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    await this.connect();
    
    if (!this.connection) {
      throw new Error('No database connection available');
    }

    try {
      const [rows, fields] = await this.connection.execute(sql, params);
      
      if (Array.isArray(rows)) {
        return {
          rows: rows as any[],
          fields: fields as any[],
        };
      } else {
        const result = rows as mysql.ResultSetHeader;
        return {
          rows: [],
          fields: [],
          affectedRows: result.affectedRows,
          insertId: result.insertId,
        };
      }
    } catch (error) {
      throw new Error(`Query execution failed: ${error}`);
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.connect();
      if (!this.connection) return false;
      
      await this.connection.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getVersion(): Promise<string> {
    const result = await this.query('SELECT VERSION() as version');
    return result.rows[0]?.version || 'Unknown';
  }

  async listDatabases(): Promise<string[]> {
    const result = await this.query('SHOW DATABASES');
    return result.rows.map((row: any) => row.Database);
  }

  async listTables(): Promise<string[]> {
    const result = await this.query('SHOW TABLES');
    const key = Object.keys(result.rows[0] || {})[0];
    return result.rows.map((row: any) => row[key]);
  }

  async describeTable(tableName: string): Promise<any[]> {
    // First check if table exists
    const tableExists = await this.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [this.config.database, tableName]);
    
    if (tableExists.rows[0].count === 0) {
      throw new Error(`Table '${tableName}' does not exist`);
    }
    
    const result = await this.query(`
      SELECT 
        COLUMN_NAME as column_name,
        DATA_TYPE as data_type,
        IS_NULLABLE as is_nullable,
        COLUMN_KEY as column_key,
        COLUMN_DEFAULT as column_default,
        EXTRA as extra,
        CHARACTER_MAXIMUM_LENGTH as character_maximum_length,
        NUMERIC_PRECISION as numeric_precision,
        NUMERIC_SCALE as numeric_scale
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [this.config.database, tableName]);
    
    return result.rows;
  }

  async getTableRelations(tableName: string): Promise<{ outgoing: any[], incoming: any[] }> {
    // Outgoing relations (this table's foreign keys)
    const outgoingResult = await this.query(`
      SELECT 
        COLUMN_NAME as column_name,
        REFERENCED_TABLE_NAME as referenced_table_name,
        REFERENCED_COLUMN_NAME as referenced_column_name,
        CONSTRAINT_NAME as constraint_name
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [this.config.database, tableName]);

    // Incoming relations (other tables referencing this table)
    const incomingResult = await this.query(`
      SELECT 
        TABLE_NAME as table_name,
        COLUMN_NAME as column_name,
        REFERENCED_COLUMN_NAME as referenced_column_name,
        CONSTRAINT_NAME as constraint_name
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ?
    `, [this.config.database, tableName]);

    return {
      outgoing: outgoingResult.rows,
      incoming: incomingResult.rows,
    };
  }

  async getTableIndexes(tableName: string): Promise<any[]> {
    const result = await this.query(`SHOW INDEX FROM \`${tableName}\``);
    return result.rows;
  }

  async insert(tableName: string, rows: any[]): Promise<{ affectedRows: number; insertId: number }> {
    if (rows.length === 0) {
      return { affectedRows: 0, insertId: 0 };
    }

    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const values = rows.flatMap(row => columns.map(col => row[col]));

    const sql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES ${
      rows.map(() => `(${placeholders})`).join(', ')
    }`;

    const result = await this.query(sql, values);
    return {
      affectedRows: result.affectedRows || 0,
      insertId: result.insertId || 0,
    };
  }

  async update(tableName: string, data: any, whereClause: string): Promise<{ affectedRows: number }> {
    const columns = Object.keys(data);
    const setClause = columns.map(col => `\`${col}\` = ?`).join(', ');
    const values = columns.map(col => data[col]);

    const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${whereClause}`;
    const result = await this.query(sql, values);
    
    return { affectedRows: result.affectedRows || 0 };
  }

  async delete(tableName: string, whereClause: string): Promise<{ affectedRows: number }> {
    const sql = `DELETE FROM \`${tableName}\` WHERE ${whereClause}`;
    const result = await this.query(sql);
    
    return { affectedRows: result.affectedRows || 0 };
  }

  async explain(query: string): Promise<any[]> {
    const result = await this.query(`EXPLAIN ${query}`);
    return result.rows;
  }

  async sampleData(tableName: string, count: number): Promise<any[]> {
    const result = await this.query(`SELECT * FROM \`${tableName}\` LIMIT ${count}`);
    return result.rows;
  }
}
