import { Text } from "@mantine/core";
import { CellReference } from "./findReferences";
import { useEditor } from "tldraw";
import { useExecuteQuery } from "../tools/useExecuteQuery";

export const DataCell = ({
  value,
  inbound,
  outbound,
}: {
  value: unknown;
  inbound: CellReference[];
  outbound: CellReference[];
}) => {
  const editor = useEditor();
  const shape = editor.getOnlySelectedShape()!;
  const executeQuery = useExecuteQuery(shape);

  const openOutboundReferences = async () => {
    const queries = outbound.map(
      (ref) => `SELECT * FROM ${ref.table} WHERE ${ref.column} = '${value}'`,
    );

    if (!shape) {
      return;
    }

    executeQuery(queries);
  };

  const openInboundReferences = async () => {
    const queries = inbound.map(
      (ref) => `SELECT * FROM ${ref.table} WHERE ${ref.column} = '${value}'`,
    );

    if (!shape) {
      return;
    }

    executeQuery(queries);
  };

  if (typeof value === "object" && value !== null) {
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }

  if (typeof value === "string" || typeof value === "number") {
    if (inbound.length > 0) {
      return <div onClick={openInboundReferences}>{value}</div>;
    }
    if (outbound.length > 0) {
      return <div onClick={openOutboundReferences}>{value}</div>;
    }
    return value;
  }

  if (typeof value === "boolean") {
    return value ? (
      <Text fs="italic" c="blue">
        TRUE
      </Text>
    ) : (
      <Text fs="italic" c="red">
        FALSE
      </Text>
    );
  }

  if (value === null) {
    return (
      <Text fs="italic" c="gray">
        NULL
      </Text>
    );
  }

  return "unknown shape";
};
