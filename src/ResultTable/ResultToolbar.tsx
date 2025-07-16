import { Badge, Group } from "@mantine/core";
import { AST, Parser } from "node-sql-parser";
import "./ResultToolbar.css";

interface ResultToolarProps {
  ast: AST;
  count: number;
}
export const ResultToolar = ({ ast, count }: ResultToolarProps) => {
  const parser = new Parser();
  const query = parser.sqlify(ast);
  const tables = parser
    .tableList(query)
    .map((table) => table.split("::").pop());

  return (
    <div className="toolbar">
      <Group>
        {tables.map((table) => (
          <Badge key={table} radius="xl" size="sm" variant="gradient">
            {table}
          </Badge>
        ))}
        <Badge size="sm">{count} rows</Badge>
      </Group>
    </div>
  );
};
