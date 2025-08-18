import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const deleteSchema: Tool = {
  name: 'mysql_delete',
  description: 'Deletes records from a table based on a WHERE clause',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to delete from',
      },
      where: {
        type: 'string',
        description: 'WHERE clause condition (without the WHERE keyword)',
      },
    },
    required: ['table', 'where'],
  },
};

export async function deleteHandler(
  mysqlService: MysqlService,
  args: { table: string; where: string }
): Promise<{ affectedRows: number }> {
  try {
    const result = await mysqlService.delete(args.table, args.where);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete records from ${args.table}: ${error}`);
  }
}
