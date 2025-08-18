# MySQL MCP Server - Configuración para el Equipo

## 🚀 Instalación y Configuración

### 1. Clonar y configurar el proyecto
```bash
git clone <repository-url>
cd windsurf-project
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
MCP_MODE=
```

### 3. Compilar el proyecto
```bash
npm run build
```

### 4. Configurar en Windsurf/Claude Desktop

#### Para Windsurf:
Agregar al archivo de configuración MCP:
```json
{
  "mcpServers": {
    "{name}-mysql-server": {
      "command": "node",
      "args": ["/ruta/completa/al/proyecto/dist/main.js"],
      "env": {
        "DB_HOST": "",
        "DB_PORT": "",
        "DB_USER": "",
        "DB_PASSWORD": "",
        "DB_NAME": "",
        "MCP_MODE": "stdio"
      }
    }
  }
}
```

#### Para Claude Desktop:
Agregar a `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "{name}-mysql-server": {
      "command": "node",
      "args": ["/ruta/completa/al/proyecto/dist/main.js"],
      "env": {
        "DB_HOST": "",
        "DB_PORT": "", 
        "DB_USER": "",
        "DB_PASSWORD": "",
        "DB_NAME": ""
      }
    }
  }
}
```

## 🛠️ Herramientas Disponibles

### Consulta de Datos
- `mysql_listTables` - Lista todas las tablas
- `mysql_describeTable` - Describe estructura de una tabla
- `mysql_query` - Ejecuta consultas SQL personalizadas
- `mysql_sampleData` - Obtiene datos de muestra de una tabla

### Análisis de Base de Datos
- `mysql_listDatabases` - Lista todas las bases de datos
- `mysql_tableRelations` - Muestra relaciones de claves foráneas
- `mysql_listIndexes` - Lista índices de una tabla
- `mysql_summarizeTable` - Resumen estadístico de una tabla
- `mysql_generateSchemaDiagram` - Genera diagrama del esquema

### Manipulación de Datos
- `mysql_insert` - Inserta registros
- `mysql_update` - Actualiza registros
- `mysql_delete` - Elimina registros
- `mysql_generateTestData` - Genera datos de prueba inteligentes

### Utilidades
- `mysql_ping` - Verifica conexión
- `mysql_version` - Obtiene versión de MySQL
- `mysql_explain` - Analiza plan de ejecución de consultas

## 🔧 Resolución de Problemas

### Error de conexión
1. Verificar que MySQL esté corriendo: `brew services list | grep mysql`
2. Verificar credenciales en `.env`
3. Verificar que la base de datos existe: `mysql -u root -p -e "SHOW DATABASES;"`

### Error de permisos
1. Verificar permisos del usuario MySQL
2. Crear la base de datos si no existe: `CREATE DATABASE test;`

### Herramientas no aparecen
1. Recompilar: `npm run build`
2. Reiniciar Windsurf/Claude Desktop
3. Verificar ruta absoluta en configuración

## 🚀 Uso Básico

```bash
# Listar tablas
mysql_listTables

# Ver estructura de tabla
mysql_describeTable --table users

# Consulta personalizada
mysql_query --query "SELECT COUNT(*) FROM users"

# Generar datos de prueba
mysql_generateTestData --table users --count 10
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📝 Notas

- El servidor soporta múltiples modos: stdio, websocket, http
- Los datos de prueba respetan relaciones de claves foráneas
- Todas las herramientas incluyen manejo de errores robusto
- Compatible con MySQL 5.7+ y 8.0+
