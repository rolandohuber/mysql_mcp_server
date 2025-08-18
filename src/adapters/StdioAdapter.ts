import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export class StdioAdapter {
  private server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('MCP MySQL Server running on stdio');
  }
}
