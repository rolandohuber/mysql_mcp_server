import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const sampleDataSchema: Tool = {
  name: 'mysql_sampleData',
  description: 'Returns a sample of rows from a table',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to sample from',
      },
      count: {
        type: 'number',
        description: 'Number of rows to return',
        minimum: 1,
        maximum: 1000,
      },
    },
    required: ['table', 'count'],
  },
};

export async function sampleDataHandler(
  mysqlService: MysqlService,
  args: { table: string; count: number }
): Promise<any[]> {
  try {
    const rows = await mysqlService.sampleData(args.table, args.count);
    return rows;
  } catch (error) {
    throw new Error(`Failed to get sample data from ${args.table}: ${error}`);
  }
}
