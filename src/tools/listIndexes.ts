import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const listIndexesSchema: Tool = {
  name: 'mysql_listIndexes',
  description: 'Lists all indexes for a specific table',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to list indexes for',
      },
    },
    required: ['table'],
  },
};

export async function listIndexesHandler(
  mysqlService: MysqlService,
  args: { table: string }
): Promise<any[]> {
  try {
    const indexes = await mysqlService.getTableIndexes(args.table);
    return indexes;
  } catch (error) {
    throw new Error(`Failed to list indexes for ${args.table}: ${error}`);
  }
}
