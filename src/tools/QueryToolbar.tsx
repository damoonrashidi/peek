import {
  Box,
  createShapeId,
  TldrawUiButton,
  TldrawUiContextualToolbar,
  track,
  useEditor,
} from "tldraw";
import { createArrowBetweenShapes } from "./createArrowBetweenShapes";
import { QueryShapeUtil } from "../shapes/QueryShape";
import { invoke } from "@tauri-apps/api/core";
import { format } from "sql-formatter";
import { Parser } from "node-sql-parser";

export const QueryContextualToolbarComponent = track(() => {
  const editor = useEditor();

  const getSelectionBounds = () => {
    const fullBounds = editor.getSelectionRotatedScreenBounds();
    if (!fullBounds) {
      return undefined;
    }
    return new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0);
  };

  const formatQuery = () => {
    const shape = editor
      .getSelectedShapes()
      .find((shape) => shape.type === "query");
    if (!shape) {
      return;
    }

    const query = (shape.props as ReturnType<QueryShapeUtil["getDefaultProps"]>)
      .query;

    const formatted = format(query, {
      keywordCase: "upper",
    });

    editor.updateShape({
      id: shape.id,
      type: "query",
      props: {
        query: formatted,
      },
    });
  };

  const executeQuery = async () => {
    const shape = editor
      .getSelectedShapes()
      .find((shape) => shape.type === "query");
    if (!shape) {
      return;
    }

    const query = (shape.props as ReturnType<QueryShapeUtil["getDefaultProps"]>)
      .query;

    const ast = new Parser().astify(query);

    try {
      const response = (await invoke("get_results", { query })) as string;

      const result = JSON.parse(response) as [string, unknown][][];

      const columnCount = result[0]?.length ?? 0;
      const resultShapeId = createShapeId(shape.id + "-result");

      editor.createShape({
        id: resultShapeId,
        type: "result",
        x: shape.x + 500,
        y: shape.y,
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
    } catch (e) {
      const errorShapeId = createShapeId(shape.id + "-error");

      editor.createShape({
        id: errorShapeId,
        type: "query-error",
        x: shape.x,
        y: shape.y - 130,
        props: {
          message: e,
        },
      });

      editor.select(errorShapeId);
      editor.zoomToSelection({ animation: { duration: 300 } });
    }
  };

  return (
    <TldrawUiContextualToolbar
      getSelectionBounds={getSelectionBounds}
      label="Sizes"
    >
      <TldrawUiButton
        title="Execute query"
        type="normal"
        onClick={executeQuery}
      >
        Execute
      </TldrawUiButton>
      <TldrawUiButton title="Execute query" type="normal" onClick={formatQuery}>
        Format
      </TldrawUiButton>
    </TldrawUiContextualToolbar>
  );
});
