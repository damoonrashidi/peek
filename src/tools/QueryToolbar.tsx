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

    const result = JSON.parse(await invoke("get_results", { query })) as Record<
      string,
      unknown
    >[];

    const columnCount = Object.keys(result[0]).length;
    const resultShapeId = createShapeId(shape.id + "-result");

    editor.createShape({
      id: resultShapeId,
      type: "result",
      x: shape.x + 500,
      y: shape.y,
      props: {
        data: result,
        w: columnCount * 250,
        h: Math.min(result.length * 45, 1200),
      },
    });

    editor.select(resultShapeId);
    editor.zoomToSelection({ animation: { duration: 300 } });

    createArrowBetweenShapes(editor, shape.id, resultShapeId);
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
