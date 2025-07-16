import { Badge, Group } from "@mantine/core";
import { Parser } from "node-sql-parser";
import "./ResultToolbar.css";

interface ResultToolarProps {
  query: string;
  count: number;
}
export const ResultToolbar = ({ query, count }: ResultToolarProps) => {
  const parser = new Parser();
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
