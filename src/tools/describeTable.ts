import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const describeTableSchema: Tool = {
  name: 'mysql_describeTable',
  description: 'Gets the schema of a specific table including columns, types, and constraints',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to describe',
      },
    },
    required: ['table'],
  },
};

export async function describeTableHandler(mysqlService: MysqlService, args: { table: string }): Promise<any[]> {
  try {
    const schema = await mysqlService.describeTable(args.table);
    return schema;
  } catch (error) {
    throw new Error(`Failed to describe table ${args.table}: ${error}`);
  }
}
