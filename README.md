# MySQL MCP Server

A comprehensive Model Context Protocol (MCP) server for MySQL database operations, compatible with Claude, Windsurf, WebStorm, and other MCP clients.

## Features

- **16 MySQL Tools**: Complete set of database operations from basic queries to schema analysis
- **Multiple Adapters**: Support for stdio, WebSocket, and HTTP transports
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Foreign Key Awareness**: Smart test data generation that respects relationships
- **Schema Analysis**: Generate database diagrams and relationship mappings
- **Production Ready**: Comprehensive error handling, logging, and connection management

---

## Table of Contents

### 👥 [For End Users](#end-users)
- [Quick Installation](#quick-installation)
- [MCP Configuration](#mcp-configuration)
- [Verification](#verification)
- [Available Tools](#available-tools-overview)
- [Troubleshooting](#troubleshooting)

### 👨‍💻 [For Developers](#developers)
- [Local Development Setup](#local-development-setup)
- [Project Structure](#project-structure)
- [Adding New Tools](#adding-new-tools)
- [Testing](#testing)
- [Contributing](#contributing)

---

# End Users

This section is for users who want to use the MySQL MCP Server with their MCP clients (Claude, Windsurf, etc.).

## Quick Installation

The MySQL MCP Server can be used directly with `npx` without any installation:

```bash
# Option 1: Direct usage (no installation required)
npx @rolandohuber/mysql-mcp-server --help
```

**Optional:** Install globally for faster execution:

```bash
# Option 2: Install globally (optional, for better performance)
npm install -g @rolandohuber/mysql-mcp-server

# Then verify the installation
npx @rolandohuber/mysql-mcp-server --help
```

## MCP Configuration

### Locate your MCP configuration file:

**macOS:**
```bash
~/.codeium/windsurf/mcp_config.json
```

**Windows:**
```bash
%APPDATA%\Codeium\Windsurf\mcp_config.json
```

**Linux:**
```bash
~/.config/codeium/windsurf/mcp_config.json
```

### Add the server configuration:

```json
{
"mcpServers": {
"mysql-server": {
"command": "npx",
"args": ["@rolandohuber/mysql-mcp-server"],
"env": {
"DB_HOST": "localhost",
"DB_PORT": "3306",
"DB_USER": "testuser",
"DB_PASSWORD": "testpass123",
"DB_NAME": "test_database",
"MCP_MODE": "stdio"
}
}
}
}
```

### Multiple Environment Configuration:

```json
{
"mcpServers": {
"mysql-production": {
"command": "npx",
"args": ["@rolandohuber/mysql-mcp-server"],
"env": {
"DB_HOST": "prod-server.example.com",
"DB_PORT": "3306",
"DB_USER": "prod_user",
"DB_PASSWORD": "secure_prod_pass",
"DB_NAME": "production_db",
"MCP_MODE": "stdio"
}
},
"mysql-development": {
"command": "npx",
"args": ["@rolandohuber/mysql-mcp-server"],
"env": {
"DB_HOST": "localhost",
"DB_PORT": "3306",
"DB_USER": "dev_user",
"DB_PASSWORD": "dev_pass123",
"DB_NAME": "development_db",
"MCP_MODE": "stdio"
}
}
}
}
```

## Verification

1. **Restart your MCP client** (Windsurf, Claude Desktop, etc.)
2. **Test the connection** by asking your AI assistant:
```
Can you connect to my MySQL database?
```
3. **Try basic commands**:
```
- List all tables in my database
- Show me the structure of the users table
- Execute: SELECT COUNT(*) FROM users
```

## Available Tools Overview

Once configured, you'll have access to 16 MySQL tools:

- **Data Query**: `query`, `sampleData`, `explain`
- **Schema Info**: `listTables`, `describeTable`, `listIndexes`, `tableRelations`
- **Data Operations**: `insert`, `update`, `delete`, `generateTestData`
- **Database Admin**: `ping`, `version`, `listDatabases`, `summarizeTable`
- **Analysis**: `generateSchemaDiagram`

## Troubleshooting

### "Server name not found"
- Verify the server name in `mcp_config.json` matches your usage
- Restart your MCP client completely

### "Access denied"
- Check username and password in environment variables
- Ensure the MySQL user has proper database permissions

### "Cannot find module"
- Reinstall: `npm install -g @rolandohuber/mysql-mcp-server`
- Verify `npx` is available in your PATH

### "Connection refused"
- Verify MySQL server is running
- Check host and port configuration
- Review firewall settings

---

# Developers

This section is for developers who want to modify, extend, or contribute to the MySQL MCP Server.

## Local Development Setup

### Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd mysql-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your development database credentials:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=testuser
DB_PASSWORD=testpass123
DB_NAME=test_database

# MCP Server Configuration
MCP_PORT=3001
MCP_HOST=localhost

# Enable debug logging
DEBUG=true
```

### Running in Development Mode

#### Stdio Mode (for MCP clients)
```bash
npm start
# or
MCP_MODE=stdio npm start
```

#### WebSocket Mode
```bash
MCP_MODE=websocket npm start
```

#### HTTP Mode
```bash
MCP_MODE=http npm start
```

#### Development with auto-reload
```bash
npm run dev
```

## Project Structure

```
src/
├── adapters/ # Transport adapters (stdio, websocket, http)
├── config/ # Configuration management
├── services/ # Core services (MysqlService)
├── tools/ # Individual MCP tools
├── types/ # TypeScript type definitions
├── tests/ # Test suites
└── main.ts # Application entry point
```

## Adding New Tools

1. Create a new file in `src/tools/`
2. Define the tool schema and handler
3. Export from `src/tools/index.ts`
4. Add to the main server in `src/main.ts`
5. Write tests in `src/tests/unit/`

Example tool structure:

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const myNewTool: Tool = {
name: 'mysql.myNewTool',
description: 'Description of what this tool does',
inputSchema: {
type: 'object',
properties: {
param1: { type: 'string', description: 'Parameter description' }
},
required: ['param1']
}
};

export async function handleMyNewTool(args: any): Promise<any> {
// Implementation here
}
```

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Categories

- **Unit Tests**: Test individual tools and services
- **Integration Tests**: Test adapter functionality and database operations
- **E2E Tests**: Test complete workflows and real-world scenarios

## Code Style

The project uses TypeScript with strict type checking. Run the linter:

```bash
npm run lint
```

## Deployment

### Docker Support

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env.example ./.env

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

### Environment Variables

Required environment variables for development:

- `DB_HOST`: MySQL host
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `MCP_MODE`: Server mode (stdio, websocket, http)
- `MCP_PORT`: Server port (for websocket/http modes)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## Available Tools Reference

### 1. mysql.listTables
Lists all tables in the current database.

**Input**: None
**Output**: Array of table names

#### Examples:
1. **Basic table listing**
```
List all tables in my test database
```

2. **Check if specific tables exist**
```
Show me all tables and tell me if I have tables for users, products, and orders
```

3. **Database structure overview**
```
What tables do I have in my database? I want to understand the overall structure
```

4. **Migration verification**
```
List all tables to verify my database migration completed successfully
```

5. **Schema exploration**
```
I'm new to this database. Can you show me what tables exist so I can understand the data model?
```

### 2. mysql.describeTable
Gets the schema of a specific table including columns, types, and constraints.

**Input**: `{ table: string }`
**Output**: Array of column definitions

### 3. mysql.query
Executes any SQL query on the MySQL database.

**Input**: `{ query: string }`
**Output**: Query results with rows, affected rows, and insert ID

### 4. mysql.generateTestData
Generates fake test data for a table, respecting foreign key relationships.

**Input**: `{ table: string, count: number }`
**Output**: Number of rows inserted and generated data

### 5. mysql.tableRelations
Gets foreign key relationships for a table (both outgoing and incoming).

**Input**: `{ table: string }`
**Output**: Object with outgoing and incoming relationships

### 6. mysql.listDatabases
Lists all databases accessible to the current MySQL user.

**Input**: None
**Output**: Array of database names

### 7. mysql.listIndexes
Lists all indexes for a specific table.

**Input**: `{ table: string }`
**Output**: Array of index information

### 8. mysql.insert
Inserts data into a table.

**Input**: `{ table: string, rows: object[] }`
**Output**: Number of affected rows and insert ID

### 9. mysql.update
Updates records in a table based on a WHERE clause.

**Input**: `{ table: string, data: object, where: string }`
**Output**: Number of affected rows

### 10. mysql.delete
Deletes records from a table based on a WHERE clause.

**Input**: `{ table: string, where: string }`
**Output**: Number of affected rows

### 11. mysql.ping
Tests the connection to the MySQL server.

**Input**: None
**Output**: Connection status boolean

### 12. mysql.version
Gets the version of the MySQL server.

**Input**: None
**Output**: MySQL version string

### 13. mysql.explain
Returns the execution plan for a SQL query.

**Input**: `{ query: string }`
**Output**: Query execution plan

### 14. mysql.summarizeTable
Generates a summary of a table including row count and column statistics.

**Input**: `{ table: string }`
**Output**: Table summary with row count and column analysis

### 15. mysql.sampleData
Returns a sample of rows from a table.

**Input**: `{ table: string, count: number }`
**Output**: Array of sample rows

### 16. mysql.generateSchemaDiagram
Generates a JSON structure representing the database schema for diagramming.

**Input**: None
**Output**: Schema diagram with nodes (tables) and edges (relationships)

---

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the test files for usage examples
3. Open an issue on GitHub
4. Check MySQL server logs for connection issues

## Changelog

### v1.0.0
- Initial release
- 16 MySQL tools implemented
- Support for stdio, WebSocket, and HTTP transports
- Comprehensive test suite
- TypeScript implementation
- Foreign key aware test data generation