import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const explainSchema: Tool = {
  name: 'mysql_explain',
  description: 'Returns the execution plan for a SQL query',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'SQL query to explain',
      },
    },
    required: ['query'],
  },
};

export async function explainHandler(
  mysqlService: MysqlService,
  args: { query: string }
): Promise<any[]> {
  try {
    const plan = await mysqlService.explain(args.query);
    return plan;
  } catch (error) {
    throw new Error(`Failed to explain query: ${error}`);
  }
}
