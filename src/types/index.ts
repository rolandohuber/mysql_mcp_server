export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

export interface TableSchema {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_key: string;
  column_default: string | null;
  extra: string;
}

export interface TableRelation {
  column_name: string;
  referenced_table_name: string;
  referenced_column_name: string;
  constraint_name: string;
}

export interface TableRelations {
  outgoing: TableRelation[];
  incoming: TableRelation[];
}

export interface IndexInfo {
  table: string;
  non_unique: number;
  key_name: string;
  seq_in_index: number;
  column_name: string;
  collation: string;
  cardinality: number;
  sub_part: number | null;
  packed: string | null;
  null: string;
  index_type: string;
  comment: string;
}

export interface SchemaDiagramNode {
  id: string;
  name: string;
  columns: {
    name: string;
    type: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
  }[];
}

export interface SchemaDiagramEdge {
  from: string;
  to: string;
  fromColumn: string;
  toColumn: string;
  label: string;
}

export interface SchemaDiagram {
  nodes: SchemaDiagramNode[];
  edges: SchemaDiagramEdge[];
}

export interface QueryResult {
  rows: any[];
  fields: any[];
  affectedRows?: number;
  insertId?: number;
}

export interface TableSummary {
  table: string;
  rowCount: number;
  columns: {
    name: string;
    type: string;
    sampleValues: any[];
    nullCount: number;
    uniqueCount: number;
  }[];
}
