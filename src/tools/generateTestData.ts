import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from '../services/MysqlService.js';
import faker from 'faker';

export const generateTestDataSchema: Tool = {
  name: 'mysql_generateTestData',
  description: 'Generates fake test data for a table, respecting foreign key relationships',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'Name of the table to generate data for',
      },
      count: {
        type: 'number',
        description: 'Number of rows to generate',
        minimum: 1,
        maximum: 1000,
      },
    },
    required: ['table', 'count'],
  },
};

export async function generateTestDataHandler(
  mysqlService: MysqlService,
  args: { table: string; count: number }
): Promise<{ inserted: number; rows: any[] }> {
  try {
    const schema = await mysqlService.describeTable(args.table);
    const relations = await mysqlService.getTableRelations(args.table);
    
    // Check if parent tables have data for foreign keys
    for (const relation of relations.outgoing) {
      const parentData = await mysqlService.query(
        `SELECT COUNT(*) as count FROM \`${relation.referenced_table_name}\``
      );
      
      if (parentData.rows[0].count === 0) {
        // Generate data for parent table first
        await generateTestDataHandler(mysqlService, {
          table: relation.referenced_table_name,
          count: Math.min(args.count, 10),
        });
      }
    }

    const rows: any[] = [];
    
    for (let i = 0; i < args.count; i++) {
      const row: any = {};
      
      for (const column of schema) {
        if (column.extra === 'auto_increment') {
          continue; // Skip auto-increment columns
        }
        
        // Check if this is a foreign key
        const fkRelation = relations.outgoing.find(r => r.column_name === column.column_name);
        
        if (fkRelation) {
          // Get a random value from the referenced table
          const refData = await mysqlService.query(
            `SELECT \`${fkRelation.referenced_column_name}\` FROM \`${fkRelation.referenced_table_name}\` ORDER BY RAND() LIMIT 1`
          );
          
          if (refData.rows.length > 0) {
            row[column.column_name] = refData.rows[0][fkRelation.referenced_column_name];
          }
        } else {
          row[column.column_name] = generateFakeValue(column);
        }
      }
      
      rows.push(row);
    }
    
    const result = await mysqlService.insert(args.table, rows);
    
    return {
      inserted: result.affectedRows,
      rows: rows,
    };
  } catch (error) {
    throw new Error(`Failed to generate test data for ${args.table}: ${error}`);
  }
}

function generateFakeValue(column: any): any {
  const dataType = column.data_type.toLowerCase();
  const columnName = column.column_name.toLowerCase();
  
  if (column.is_nullable === 'YES' && Math.random() < 0.1) {
    return null;
  }
  
  // Generate based on column name patterns
  if (columnName.includes('email')) return faker.internet.email();
  if (columnName.includes('phone')) return faker.phone.phoneNumber();
  if (columnName.includes('name')) return faker.name.findName();
  if (columnName.includes('first_name')) return faker.name.firstName();
  if (columnName.includes('last_name')) return faker.name.lastName();
  if (columnName.includes('address')) return faker.address.streetAddress();
  if (columnName.includes('city')) return faker.address.city();
  if (columnName.includes('country')) return faker.address.country();
  if (columnName.includes('company')) return faker.company.companyName();
  if (columnName.includes('title')) return faker.name.jobTitle();
  if (columnName.includes('description')) return faker.lorem.paragraph();
  if (columnName.includes('url')) return faker.internet.url();
  
  // Generate based on data type
  switch (dataType) {
    case 'varchar':
    case 'char':
    case 'text':
    case 'longtext':
    case 'mediumtext':
    case 'tinytext':
      const maxLength = column.character_maximum_length || 255;
      return faker.lorem.words(Math.ceil(maxLength / 20)).substring(0, maxLength);
      
    case 'int':
    case 'integer':
    case 'bigint':
    case 'smallint':
      return faker.datatype.number({ min: 1, max: 1000000 });
    case 'tinyint':
      // Check if this is a boolean column (TINYINT(1))
      if (column.character_maximum_length === 1 || columnName.includes('published') || columnName.includes('active') || columnName.includes('enabled')) {
        return faker.datatype.boolean() ? 1 : 0;
      }
      return faker.datatype.number({ min: 0, max: 127 });
      
    case 'decimal':
    case 'numeric':
    case 'float':
    case 'double':
      return parseFloat(faker.datatype.number({ min: 0, max: 10000, precision: 0.01 }).toFixed(2));
      
    case 'date':
      return faker.date.past().toISOString().split('T')[0];
      
    case 'datetime':
    case 'timestamp':
      return faker.date.past().toISOString().replace('T', ' ').substring(0, 19);
      
    case 'time':
      return faker.date.recent().toTimeString().split(' ')[0];
      
    case 'boolean':
    case 'bool':
      return faker.datatype.boolean() ? 1 : 0;
      
    case 'json':
      return JSON.stringify({
        id: faker.datatype.uuid(),
        value: faker.lorem.word(),
        timestamp: faker.date.recent().toISOString(),
      });
      
    default:
      return faker.lorem.word();
  }
}
