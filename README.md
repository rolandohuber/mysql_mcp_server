# MySQL MCP Server

A comprehensive Model Context Protocol (MCP) server for MySQL database operations, compatible with Claude, Windsurf, WebStorm, and other MCP clients.

## Features

- **16 MySQL Tools**: Complete set of database operations from basic queries to schema analysis
- **Multiple Adapters**: Support for stdio, WebSocket, and HTTP transports
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Foreign Key Awareness**: Smart test data generation that respects relationships
- **Schema Analysis**: Generate database diagrams and relationship mappings
- **Production Ready**: Comprehensive error handling, logging, and connection management

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mysql-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Copy the example environment file and configure your database connection:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL database credentials:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database

# MCP Server Configuration
MCP_PORT=3001
MCP_HOST=localhost

# Enable debug logging
DEBUG=false
```

## Usage

### Running the Server

#### Stdio Mode (for Claude)
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

### Development Mode
```bash
npm run dev
```

## Available Tools

### 1. mysql.listTables
Lists all tables in the current database.

**Input**: None
**Output**: Array of table names

#### Examples:
1. **Basic table listing**
   ```
   List all tables in my e-commerce database
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

#### Examples:
1. **Basic table schema**
   ```
   Describe the structure of the users table
   ```

2. **Column type analysis**
   ```
   Show me the schema for the products table, I need to understand the data types for each column
   ```

3. **Primary key identification**
   ```
   Describe the orders table and highlight which columns are primary keys
   ```

4. **Nullable fields check**
   ```
   Show me the customer table schema and tell me which fields allow NULL values
   ```

5. **Auto-increment analysis**
   ```
   Describe the posts table and identify any auto-incrementing columns
   ```

### 3. mysql.query
Executes any SQL query on the MySQL database.

**Input**: `{ query: string }`
**Output**: Query results with rows, affected rows, and insert ID

#### Examples:
1. **Complex JOIN query**
   ```
   Execute this query: SELECT u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id ORDER BY order_count DESC LIMIT 10
   ```

2. **Data analysis query**
   ```
   Run a query to find the average order value by month for the last 6 months
   ```

3. **Performance analysis**
   ```
   Execute: SELECT table_name, table_rows, data_length, index_length FROM information_schema.tables WHERE table_schema = DATABASE()
   ```

4. **Custom aggregation**
   ```
   Query the sales data to find the top 5 products by revenue in the last quarter
   ```

5. **Data validation query**
   ```
   Run a query to find any users with duplicate email addresses
   ```

### 4. mysql.generateTestData
Generates fake test data for a table, respecting foreign key relationships.

**Input**: `{ table: string, count: number }`
**Output**: Number of rows inserted and generated data

#### Examples:
1. **Basic test data generation**
   ```
   Generate 50 fake users for testing my application
   ```

2. **Relationship-aware data**
   ```
   Create 100 test orders with valid customer references and realistic data
   ```

3. **Development environment setup**
   ```
   Generate test data for my entire e-commerce schema: 200 users, 500 products, and 1000 orders
   ```

4. **Performance testing data**
   ```
   Create 10,000 fake records in the transactions table for load testing
   ```

5. **Demo data preparation**
   ```
   Generate realistic sample data for my blog: 20 authors, 100 posts, and 500 comments
   ```

### 5. mysql.tableRelations
Gets foreign key relationships for a table (both outgoing and incoming).

**Input**: `{ table: string }`
**Output**: Object with outgoing and incoming relationships

#### Examples:
1. **Relationship mapping**
   ```
   Show me all the foreign key relationships for the orders table
   ```

2. **Data model understanding**
   ```
   What tables does the users table connect to? Show me both directions of relationships
   ```

3. **Cascade analysis**
   ```
   Before I delete records from the products table, show me what other tables reference it
   ```

4. **Schema documentation**
   ```
   Map out all the relationships for the inventory table for our documentation
   ```

5. **Migration planning**
   ```
   I need to modify the customers table. Show me all its relationships so I can plan the migration safely
   ```

### 6. mysql.listDatabases
Lists all databases accessible to the current MySQL user.

**Input**: None
**Output**: Array of database names

#### Examples:
1. **Server overview**
   ```
   Show me all databases on this MySQL server
   ```

2. **Access verification**
   ```
   List all databases I have access to with my current credentials
   ```

3. **Environment check**
   ```
   Display all databases to verify I'm connected to the right MySQL server
   ```

4. **Database selection**
   ```
   What databases are available? I need to choose the right one for my application
   ```

5. **Audit trail**
   ```
   List all databases for our security audit documentation
   ```

### 7. mysql.listIndexes
Lists all indexes for a specific table.

**Input**: `{ table: string }`
**Output**: Array of index information

#### Examples:
1. **Performance optimization**
   ```
   Show me all indexes on the users table to optimize my queries
   ```

2. **Query analysis**
   ```
   List indexes for the orders table to understand why my queries are slow
   ```

3. **Index audit**
   ```
   Display all indexes on the products table to identify redundant or missing indexes
   ```

4. **Database tuning**
   ```
   Show me the index structure for the transactions table for performance tuning
   ```

5. **Migration planning**
   ```
   List all indexes on the customers table before I modify its structure
   ```

### 8. mysql.insert
Inserts data into a table.

**Input**: `{ table: string, rows: object[] }`
**Output**: Number of affected rows and insert ID

#### Examples:
1. **Single record insertion**
   ```
   Insert a new user: {"name": "John Doe", "email": "john@example.com", "role": "admin"}
   ```

2. **Batch data insertion**
   ```
   Insert multiple products from this CSV data into the products table
   ```

3. **Migration data**
   ```
   Insert these 50 customer records from our old system into the new customers table
   ```

4. **Configuration data**
   ```
   Add these application settings to the config table
   ```

5. **Initial data setup**
   ```
   Insert the default categories and user roles for a new installation
   ```

### 9. mysql.update
Updates records in a table based on a WHERE clause.

**Input**: `{ table: string, data: object, where: string }`
**Output**: Number of affected rows

#### Examples:
1. **User profile update**
   ```
   Update user profile: set name to "Jane Smith" and email to "jane.smith@example.com" where id = 123
   ```

2. **Bulk status change**
   ```
   Update all pending orders to "processing" status for orders placed before yesterday
   ```

3. **Price adjustment**
   ```
   Increase all product prices by 10% for products in the "electronics" category
   ```

4. **Data correction**
   ```
   Fix the timezone data: update all timestamps to UTC for records created this month
   ```

5. **Feature flag update**
   ```
   Enable the new feature for all premium users by updating their feature_flags column
   ```

### 10. mysql.delete
Deletes records from a table based on a WHERE clause.

**Input**: `{ table: string, where: string }`
**Output**: Number of affected rows

#### Examples:
1. **Cleanup old data**
   ```
   Delete all log entries older than 30 days from the system_logs table
   ```

2. **Remove test data**
   ```
   Delete all users with email addresses ending in "@test.com"
   ```

3. **Data archival**
   ```
   Remove completed orders older than 2 years from the orders table
   ```

4. **User account deletion**
   ```
   Delete the user account and all associated data for user ID 456
   ```

5. **Maintenance cleanup**
   ```
   Remove all temporary session data from the sessions table where last_activity is older than 24 hours
   ```

### 11. mysql.ping
Tests the connection to the MySQL server.

**Input**: None
**Output**: Connection status boolean

#### Examples:
1. **Health check**
   ```
   Check if the database connection is working
   ```

2. **Monitoring**
   ```
   Ping the database to verify it's responsive for our monitoring system
   ```

3. **Troubleshooting**
   ```
   Test the MySQL connection to diagnose connectivity issues
   ```

4. **Startup verification**
   ```
   Verify database connectivity before starting the application
   ```

5. **Load balancer check**
   ```
   Ping the database to ensure it's ready to receive traffic
   ```

### 12. mysql.version
Gets the version of the MySQL server.

**Input**: None
**Output**: MySQL version string

#### Examples:
1. **Compatibility check**
   ```
   What version of MySQL am I connected to?
   ```

2. **Feature verification**
   ```
   Check the MySQL version to see if it supports JSON columns
   ```

3. **Upgrade planning**
   ```
   Show me the current MySQL version for our upgrade planning
   ```

4. **Documentation**
   ```
   Get the MySQL version for our system documentation
   ```

5. **Support ticket**
   ```
   What MySQL version are we running? I need this for the support ticket
   ```

### 13. mysql.explain
Returns the execution plan for a SQL query.

**Input**: `{ query: string }`
**Output**: Query execution plan

#### Examples:
1. **Query optimization**
   ```
   Explain this slow query: SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.city = 'New York'
   ```

2. **Index usage analysis**
   ```
   Show me the execution plan for this query to see if it's using the right indexes
   ```

3. **Performance debugging**
   ```
   Explain why this query is taking 30 seconds: SELECT COUNT(*) FROM transactions WHERE date BETWEEN '2023-01-01' AND '2023-12-31'
   ```

4. **Join optimization**
   ```
   Analyze the execution plan for this complex multi-table join query
   ```

5. **Query tuning**
   ```
   Explain this aggregation query to help me optimize it for better performance
   ```

### 14. mysql.summarizeTable
Generates a summary of a table including row count and column statistics.

**Input**: `{ table: string }`
**Output**: Table summary with row count and column analysis

#### Examples:
1. **Data overview**
   ```
   Give me a complete summary of the users table including row count and column statistics
   ```

2. **Data quality assessment**
   ```
   Summarize the products table to understand data distribution and quality
   ```

3. **Migration analysis**
   ```
   Provide a summary of the legacy_customers table before we migrate the data
   ```

4. **Business intelligence**
   ```
   Summarize the sales_transactions table for our monthly business review
   ```

5. **Data profiling**
   ```
   Create a statistical summary of the user_behavior table for our analytics team
   ```

### 15. mysql.sampleData
Returns a sample of rows from a table.

**Input**: `{ table: string, count: number }`
**Output**: Array of sample rows

#### Examples:
1. **Data inspection**
   ```
   Show me 10 sample records from the orders table to understand the data structure
   ```

2. **Quality check**
   ```
   Get 50 random samples from the imported_data table to verify the import was successful
   ```

3. **Development reference**
   ```
   Give me 20 sample users to understand the data format for my API development
   ```

4. **Data analysis**
   ```
   Sample 100 transactions from last month for manual analysis
   ```

5. **Testing data**
   ```
   Get 5 sample products to use as test data in my unit tests
   ```

### 16. mysql.generateSchemaDiagram
Generates a JSON structure representing the database schema for diagramming.

**Input**: None
**Output**: Schema diagram with nodes (tables) and edges (relationships)

#### Examples:
1. **Database documentation**
   ```
   Generate a complete schema diagram for our database documentation
   ```

2. **Visual database map**
   ```
   Create a schema diagram showing all tables and their relationships for the development team
   ```

3. **Architecture review**
   ```
   Generate a database schema diagram for our architecture review meeting
   ```

4. **New developer onboarding**
   ```
   Create a visual representation of our database schema to help new developers understand the data model
   ```

5. **Migration planning**
   ```
   Generate the current schema diagram before we start the database refactoring project
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

## Development

### Project Structure

```
src/
├── adapters/           # Transport adapters (stdio, websocket, http)
├── config/            # Configuration management
├── services/          # Core services (MysqlService)
├── tools/             # Individual MCP tools
├── types/             # TypeScript type definitions
├── tests/             # Test suites
└── main.ts           # Application entry point
```

### Adding New Tools

1. Create a new file in `src/tools/`
2. Define the tool schema and handler
3. Export from `src/tools/index.ts`
4. Add to the main server in `src/main.ts`
5. Write tests in `src/tests/unit/`

### Code Style

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

Required environment variables:

- `DB_HOST`: MySQL host
- `DB_PORT`: MySQL port (default: 3306)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `MCP_MODE`: Server mode (stdio, websocket, http)
- `MCP_PORT`: Server port (for websocket/http modes)

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify database credentials in `.env`
   - Check MySQL server is running
   - Ensure database exists

2. **Permission Denied**
   - Verify user has required MySQL privileges
   - Check database access permissions

3. **Port Already in Use**
   - Change `MCP_PORT` in `.env`
   - Kill existing processes on the port

4. **Foreign Key Errors**
   - Ensure parent tables have data before generating test data
   - Check foreign key constraints are properly defined

### Debug Mode

Enable debug logging:

```bash
DEBUG=true npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

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
