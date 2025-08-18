import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const tableRelationsSchema: Tool = {
  name: 'mysql_tableRelations',
  description: 'Gets foreign key relationships for a table (both outgoing and incoming)',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to get relations for',
      },
    },
    required: ['table'],
  },
};

export async function tableRelationsHandler(
  mysqlService: MysqlService,
  args: { table: string }
): Promise<{ outgoing: any[]; incoming: any[] }> {
  try {
    const relations = await mysqlService.getTableRelations(args.table);
    return relations;
  } catch (error) {
    throw new Error(`Failed to get table relations for ${args.table}: ${error}`);
  }
}
