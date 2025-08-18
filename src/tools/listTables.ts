import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const listTablesSchema: Tool = {
  name: 'mysql_listTables',
  description: 'Lists all tables in the current MySQL database',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export async function listTablesHandler(mysqlService: MysqlService): Promise<string[]> {
  try {
    const tables = await mysqlService.listTables();
    return tables;
  } catch (error) {
    throw new Error(`Failed to list tables: ${error}`);
  }
}
