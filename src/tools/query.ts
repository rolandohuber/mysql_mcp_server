import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const querySchema: Tool = {
  name: 'mysql_query',
  description: 'Executes any SQL query on the MySQL database',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'SQL query to execute',
      },
    },
    required: ['query'],
  },
};

export async function queryHandler(mysqlService: MysqlService, args: { query: string }): Promise<any> {
  try {
    const result = await mysqlService.query(args.query);
    return {
      rows: result.rows,
      affectedRows: result.affectedRows,
      insertId: result.insertId,
    };
  } catch (error) {
    throw new Error(`Query execution failed: ${error}`);
  }
}
