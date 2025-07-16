import { Text } from "@mantine/core";
import { CellReference } from "./findReferences";
import { invoke } from "@tauri-apps/api/core";
import { createShapeId, useEditor } from "tldraw";
import { createArrowBetweenShapes } from "../tools/createArrowBetweenShapes";
import { Parser } from "node-sql-parser";
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

    for (const query of queries) {
      executeQuery(query);
    }
  };

  const openInboundReferences = async () => {
    const queries = inbound.map(
      (ref) => `SELECT * FROM ${ref.table} WHERE ${ref.column} = '${value}'`,
    );

    if (!shape) {
      return;
    }

    const x = editor.getSelectionPageBounds()?.right ?? shape.x + 500;

    let i = 0;
    for (const query of queries) {
      const response = (await invoke("get_results", { query })) as string;
      const result = JSON.parse(response) as [string, unknown][][];

      if (result.length === 0) {
        continue;
      }

      const ast = new Parser().astify(query);

      const columnCount = result[0]?.length ?? 0;
      const resultShapeId = createShapeId(query + "-result-" + i);

      editor.createShape({
        id: resultShapeId,
        type: "result",
        x: x + 50,
        y: shape.y + i * 500,
        props: {
          data: result,
          ast,
          w: Math.max(columnCount * 250, 200),
          h: Math.max(Math.min(result.length * 45, 1200), 200),
        },
      });

      editor.select(resultShapeId);
      editor.zoomToSelection({ animation: { duration: 300 } });

      createArrowBetweenShapes(editor, shape.id, resultShapeId);

      i += 1;
    }
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
