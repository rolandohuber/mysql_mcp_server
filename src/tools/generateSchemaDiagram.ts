import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';
import { SchemaDiagram, SchemaDiagramNode, SchemaDiagramEdge } from '../types/index.js';

export const generateSchemaDiagramSchema: Tool = {
  name: 'mysql_generateSchemaDiagram',
  description: 'Generates a JSON structure representing the database schema for diagramming',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export async function generateSchemaDiagramHandler(
  mysqlService: MysqlService
): Promise<SchemaDiagram> {
  try {
    const tables = await mysqlService.listTables();
    const nodes: SchemaDiagramNode[] = [];
    const edges: SchemaDiagramEdge[] = [];
    
    // Create nodes for each table
    for (const table of tables) {
      const schema = await mysqlService.describeTable(table);
      const relations = await mysqlService.getTableRelations(table);
      
      const columns = schema.map(column => ({
        name: column.column_name,
        type: column.data_type,
        isPrimaryKey: column.column_key === 'PRI',
        isForeignKey: relations.outgoing.some(rel => rel.column_name === column.column_name),
      }));
      
      nodes.push({
        id: table,
        name: table,
        columns,
      });
      
      // Create edges for foreign key relationships
      for (const relation of relations.outgoing) {
        edges.push({
          from: table,
          to: relation.referenced_table_name,
          fromColumn: relation.column_name,
          toColumn: relation.referenced_column_name,
          label: relation.constraint_name,
        });
      }
    }
    
    return { nodes, edges };
  } catch (error) {
    throw new Error(`Failed to generate schema diagram: ${error}`);
  }
}
