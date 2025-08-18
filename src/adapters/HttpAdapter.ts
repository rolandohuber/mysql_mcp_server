import { JSONRPCRequest } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

export class HttpAdapter {
  private app: express.Application;
  private httpServer: any;
  private port: number;

  constructor(port: number = 3002) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private requestHandlers: Map<string, Function> = new Map();

  setRequestHandlers(handlers: Map<string, Function>): void {
    this.requestHandlers = handlers;
  }

  private async handleMCPRequest(request: JSONRPCRequest): Promise<any> {
    try {
      const handler = this.requestHandlers.get(request.method);
      if (handler) {
        const result = await handler(request);
        return {
          jsonrpc: '2.0',
          id: request.id,
          result
        };
      }
      
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Method not found: ${request.method}`
        }
      };
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

    // MCP endpoint for tool calls
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
    return new Promise((resolve) => {
      this.httpServer = createServer(this.app);
      this.httpServer.listen(this.port, () => {
        console.error(`MCP MySQL Server running on HTTP port ${this.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.httpServer) {
      return new Promise((resolve) => {
        this.httpServer.close(() => {
          resolve();
        });
      });
    }
  }
}
