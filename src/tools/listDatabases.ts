import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const listDatabasesSchema: Tool = {
  name: 'mysql_listDatabases',
  description: 'Lists all databases accessible to the current MySQL user',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export async function listDatabasesHandler(mysqlService: MysqlService): Promise<string[]> {
  try {
    const databases = await mysqlService.listDatabases();
    return databases;
  } catch (error) {
    throw new Error(`Failed to list databases: ${error}`);
  }
}
