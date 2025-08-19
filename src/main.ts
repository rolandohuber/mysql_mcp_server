#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { MysqlService } from './services/MysqlService.js';
import { getDatabaseConfig, getServerConfig } from './config/database.js';
import { StdioAdapter, WebSocketAdapter, HttpAdapter } from './adapters/index.js';
import * as tools from './tools/index.js';

class MySQLMCPServer {
  private server: Server;
  private mysqlService: MysqlService;
  private static instance: MySQLMCPServer;

  constructor() {
    this.server = new Server(
      {
        name: 'mysql-mcp-server',
        version: '1.0.0',
      }
    );

    this.mysqlService = new MysqlService(getDatabaseConfig());
    MySQLMCPServer.instance = this;
    this.setupToolHandlers();
  }

  static getInstance(): MySQLMCPServer {
    return MySQLMCPServer.instance;
  }

  getMysqlService(): MysqlService {
    return this.mysqlService;
  }

  private setupToolHandlers(): void {
    // Register all tool schemas
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          tools.listTablesSchema,
          tools.describeTableSchema,
          tools.querySchema,
          tools.generateTestDataSchema,
          tools.tableRelationsSchema,
          tools.listDatabasesSchema,
          tools.listIndexesSchema,
          tools.insertSchema,
          tools.updateSchema,
          tools.deleteSchema,
          tools.pingSchema,
          tools.versionSchema,
          tools.explainSchema,
          tools.summarizeTableSchema,
          tools.sampleDataSchema,
          tools.generateSchemaDiagramSchema,
        ],
      };
    });

    // Register tool call handlers
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'mysql_listTables':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.listTablesHandler(this.mysqlService), null, 2),
                },
              ],
            };

          case 'mysql_describeTable':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.describeTableHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_query':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.queryHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_generateTestData':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.generateTestDataHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_tableRelations':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.tableRelationsHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_listDatabases':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.listDatabasesHandler(this.mysqlService), null, 2),
                },
              ],
            };

          case 'mysql_listIndexes':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.listIndexesHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_insert':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.insertHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_update':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.updateHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_delete':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.deleteHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_ping':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.pingHandler(this.mysqlService), null, 2),
                },
              ],
            };

          case 'mysql_version':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.versionHandler(this.mysqlService), null, 2),
                },
              ],
            };

          case 'mysql_explain':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.explainHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_summarizeTable':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.summarizeTableHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_sampleData':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.sampleDataHandler(this.mysqlService, args as any), null, 2),
                },
              ],
            };

          case 'mysql_generateSchemaDiagram':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await tools.generateSchemaDiagramHandler(this.mysqlService), null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start(): Promise<void> {
    const config = getServerConfig();
    const mode = process.env.MCP_MODE || 'stdio';

    try {
      // Test database connection
      await this.mysqlService.ping();
      console.error('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }

    switch (mode.toLowerCase()) {
      case 'stdio':
        const stdioAdapter = new StdioAdapter(this.server);
        await stdioAdapter.start();
        break;

      case 'websocket':
        const wsAdapter = new WebSocketAdapter(this.server, config.mcpPort);
        await wsAdapter.start();
        break;

      case 'http':
        const httpAdapter = new HttpAdapter(config.mcpPort);
        
        // Set up request handlers for HTTP adapter
        const handlers = new Map<string, Function>();
        handlers.set('tools/list', async (_request: any) => {
          return {
            tools: [
              tools.listTablesSchema,
              tools.describeTableSchema,
              tools.querySchema,
              tools.generateTestDataSchema,
              tools.tableRelationsSchema,
              tools.listDatabasesSchema,
              tools.listIndexesSchema,
              tools.insertSchema,
              tools.updateSchema,
              tools.deleteSchema,
              tools.pingSchema,
              tools.versionSchema,
              tools.explainSchema,
              tools.summarizeTableSchema,
              tools.sampleDataSchema,
              tools.generateSchemaDiagramSchema,
            ],
          };
        });
        
        handlers.set('tools/call', async (request: any) => {
          const { name, arguments: args } = request.params;
          
          switch (name) {
            case 'mysql_listTables':
              return await tools.listTablesHandler(this.mysqlService);
            case 'mysql_describeTable':
              return await tools.describeTableHandler(this.mysqlService, args);
            case 'mysql_query':
              return await tools.queryHandler(this.mysqlService, args);
            case 'mysql_generateTestData':
              return await tools.generateTestDataHandler(this.mysqlService, args);
            case 'mysql_tableRelations':
              return await tools.tableRelationsHandler(this.mysqlService, args);
            case 'mysql_listDatabases':
              return await tools.listDatabasesHandler(this.mysqlService);
            case 'mysql_listIndexes':
              return await tools.listIndexesHandler(this.mysqlService, args);
            case 'mysql_insert':
              return await tools.insertHandler(this.mysqlService, args);
            case 'mysql_update':
              return await tools.updateHandler(this.mysqlService, args);
            case 'mysql_delete':
              return await tools.deleteHandler(this.mysqlService, args);
            case 'mysql_ping':
              return await tools.pingHandler(this.mysqlService);
            case 'mysql_version':
              return await tools.versionHandler(this.mysqlService);
            case 'mysql_explain':
              return await tools.explainHandler(this.mysqlService, args);
            case 'mysql_summarizeTable':
              return await tools.summarizeTableHandler(this.mysqlService, args);
            case 'mysql_sampleData':
              return await tools.sampleDataHandler(this.mysqlService, args);
            case 'mysql_generateSchemaDiagram':
              return await tools.generateSchemaDiagramHandler(this.mysqlService);
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        });
        
        httpAdapter.setRequestHandlers(handlers);
        await httpAdapter.start();
        break;

      default:
        console.error(`Unknown mode: ${mode}. Use 'stdio', 'websocket', or 'http'`);
        process.exit(1);
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('Shutting down...');
      await this.mysqlService.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Shutting down...');
      await this.mysqlService.disconnect();
      process.exit(0);
    });
  }
}

// Start the server
const server = new MySQLMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
