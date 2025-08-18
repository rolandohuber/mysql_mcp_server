import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';

export const summarizeTableSchema: Tool = {
  name: 'mysql_summarizeTable',
  description: 'Generates a summary of a table including row count and column statistics',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to summarize',
      },
    },
    required: ['table'],
  },
};

export async function summarizeTableHandler(
  mysqlService: MysqlService,
  args: { table: string }
): Promise<any> {
  try {
    // Get row count
    const countResult = await mysqlService.query(`SELECT COUNT(*) as count FROM \`${args.table}\``);
    const rowCount = countResult.rows[0].count;

    // Get table schema
    const schema = await mysqlService.describeTable(args.table);
    
    const columns = [];
    
    for (const column of schema) {
      const columnName = column.column_name;
      const columnType = column.data_type;
      
      // Get sample values (top 5 most common)
      const sampleQuery = `
        SELECT \`${columnName}\`, COUNT(*) as freq 
        FROM \`${args.table}\` 
        WHERE \`${columnName}\` IS NOT NULL 
        GROUP BY \`${columnName}\` 
        ORDER BY freq DESC 
        LIMIT 5
      `;
      
      const sampleResult = await mysqlService.query(sampleQuery);
      const sampleValues = sampleResult.rows.map(row => row[columnName]);
      
      // Get null count
      const nullQuery = `SELECT COUNT(*) as null_count FROM \`${args.table}\` WHERE \`${columnName}\` IS NULL`;
      const nullResult = await mysqlService.query(nullQuery);
      const nullCount = nullResult.rows[0].null_count;
      
      // Get unique count
      const uniqueQuery = `SELECT COUNT(DISTINCT \`${columnName}\`) as unique_count FROM \`${args.table}\``;
      const uniqueResult = await mysqlService.query(uniqueQuery);
      const uniqueCount = uniqueResult.rows[0].unique_count;
      
      columns.push({
        name: columnName,
        type: columnType,
        sampleValues,
        nullCount,
        uniqueCount,
      });
    }
    
    return {
      table: args.table,
      rowCount,
      columns,
    };
  } catch (error) {
    throw new Error(`Failed to summarize table ${args.table}: ${error}`);
  }
}
