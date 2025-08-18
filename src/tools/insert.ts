import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const insertSchema: Tool = {
  name: 'mysql_insert',
  description: 'Inserts data into a table',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to insert data into',
      },
      rows: {
        type: 'array',
        description: 'Array of objects representing rows to insert',
        items: {
          type: 'object',
        },
      },
    },
    required: ['table', 'rows'],
  },
};

export async function insertHandler(
  mysqlService: MysqlService,
  args: { table: string; rows: any[] }
): Promise<{ affectedRows: number; insertId: number }> {
  try {
    const result = await mysqlService.insert(args.table, args.rows);
    return result;
  } catch (error) {
    throw new Error(`Failed to insert data into ${args.table}: ${error}`);
  }
}
