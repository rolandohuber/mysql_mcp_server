import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const updateSchema: Tool = {
  name: 'mysql_update',
  description: 'Updates records in a table based on a WHERE clause',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to update',
      },
      data: {
        type: 'object',
        description: 'Object containing column-value pairs to update',
      },
      where: {
        type: 'string',
        description: 'WHERE clause condition (without the WHERE keyword)',
      },
    },
    required: ['table', 'data', 'where'],
  },
};

export async function updateHandler(
  mysqlService: MysqlService,
  args: { table: string; data: any; where: string }
): Promise<{ affectedRows: number }> {
  try {
    const result = await mysqlService.update(args.table, args.data, args.where);
    return result;
  } catch (error) {
    throw new Error(`Failed to update records in ${args.table}: ${error}`);
  }
}
