import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  JSONRPCRequest
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import WebSocket from 'ws';

export class WebSocketAdapter {
  private server: Server;
  private port: number;
  private httpServer: any = null;
  private app: express.Application;
  private wss: WebSocket.Server | null = null;

  constructor(server: Server, port: number = 3001) {
    this.server = server;
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private async handleMCPRequest(request: JSONRPCRequest): Promise<any> {
    try {
      if (request.method === 'tools/list') {
        const result = await this.server.request(
          { method: 'tools/list', params: request.params },
          ListToolsRequestSchema
        );
        return {
          jsonrpc: '2.0',
          id: request.id,
          result
        };
      } else if (request.method === 'tools/call') {
        const result = await this.server.request(
          { method: 'tools/call', params: request.params },
          CallToolRequestSchema
        );
        return {
          jsonrpc: '2.0',
          id: request.id,
          result
        };
      } else {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          }
        };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal error'
        }
      };
    }
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // MCP endpoint for tool calls (HTTP fallback)
    this.app.post('/mcp/call', async (req, res) => {
      try {
        const request: JSONRPCRequest = {
          jsonrpc: '2.0',
          id: req.body.id || 1,
          method: req.body.method,
          params: req.body.params
        };

        const response = await this.handleMCPRequest(request);
        res.json(response);
      } catch (error) {
        console.error('HTTP MCP call error:', error);
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body.id || null,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal server error'
          }
        });
      }
    });
  }

  async start(): Promise<void> {
    this.httpServer = createServer(this.app);
    
    // Add WebSocket server for real-time communication
    this.wss = new WebSocket.Server({ server: this.httpServer });
    
    this.wss.on('connection', (ws) => {
      console.error('WebSocket client connected');
      
      ws.on('message', async (message) => {
        try {
          const request: JSONRPCRequest = JSON.parse(message.toString());
          const response = await this.handleMCPRequest(request);
          ws.send(JSON.stringify(response));
        } catch (error) {
          console.error('WebSocket message error:', error);
          const errorResponse = {
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32700,
              message: 'Parse error'
            }
          };
          ws.send(JSON.stringify(errorResponse));
        }
      });
      
      ws.on('close', () => {
        console.error('WebSocket client disconnected');
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
    
    return new Promise<void>((resolve) => {
      this.httpServer.listen(this.port, () => {
        console.error(`MCP MySQL Server running on WebSocket/HTTP port ${this.port}`);
        console.error(`WebSocket: ws://localhost:${this.port}`);
        console.error(`HTTP API: http://localhost:${this.port}/mcp/call`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    
    if (this.httpServer) {
      return new Promise<void>((resolve) => {
        this.httpServer.close(() => {
          this.httpServer = null;
          resolve();
        });
      });
    }
  }
}
