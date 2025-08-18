import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const versionSchema: Tool = {
  name: 'mysql_version',
  description: 'Gets the version of the MySQL server',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export async function versionHandler(mysqlService: MysqlService): Promise<{ version: string }> {
  try {
    const version = await mysqlService.getVersion();
    return { version };
  } catch (error) {
    throw new Error(`Failed to get MySQL version: ${error}`);
  }
}
