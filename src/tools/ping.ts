import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const pingSchema: Tool = {
  name: 'mysql_ping',
  description: 'Tests the connection to the MySQL server',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export async function pingHandler(mysqlService: MysqlService): Promise<{ success: boolean }> {
  try {
    const success = await mysqlService.ping();
    return { success };
  } catch (error) {
    return { success: false };
  }
}
