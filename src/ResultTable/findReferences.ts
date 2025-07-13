import { AST } from "node-sql-parser";

export type CellReference = { table: string; column: string };

export function getOutboundReferences(
  ast: AST,
  schema: Record<string, string[]>,
  column: string,
): CellReference[] {
  if (ast.type !== "select") {
    return [];
  }

  if (!Array.isArray(ast.from) || !ast.from) {
    return [];
  }

  const tables = ast.from
    .filter((from) => "table" in from)
    .map((from) => from.table);

  return tables.flatMap((table) => {
    return (schema[`${table}.${column}`] ?? []).map((ref) => {
      const [to_table, to_col] = ref.split(".");
      return { table: to_table, column: to_col };
    });
  });
}

export function getInboundReferences(
  ast: AST,
  schema: Record<string, string[]>,
  column: string,
): CellReference[] {
  if (ast.type !== "select") {
    return [];
  }

  if (!Array.isArray(ast.from) || !ast.from) {
    return [];
  }

  const tables = ast.from
    .filter((from) => "table" in from)
    .map((from) => from.table);

  tables.forEach((table) => {
    const something = Object.entries(schema).filter(([t, references]) =>
      references.includes(`${t}.${column}`),
    );

    if (something.length > 0) {
      console.log(something, table);
    }
  });

  return [];
}
