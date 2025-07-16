import { createShapeId, TLShape, useEditor } from "tldraw";
import { createArrowBetweenShapes } from "./createArrowBetweenShapes";
import { invoke } from "@tauri-apps/api/core";

export const useExecuteQuery = (shape: TLShape) => {
  const editor = useEditor();

  return async (query: string) => {
    try {
      const response = (await invoke("get_results", { query })) as string;
      const result = JSON.parse(response) as [string, unknown][][];

      const x = editor.getSelectionPageBounds()?.right ?? shape.x + 500;

      if (result.length === 0) {
        return;
      }

      const columnCount = result[0]?.length ?? 0;
      const resultShapeId = createShapeId(shape.id + "-result");

      editor.createShape({
        id: resultShapeId,
        type: "result",
        x: x + 50,
        y: shape.y,
        props: {
          data: result,
          query,
          w: Math.max(columnCount * 250, 200),
          h: Math.max(Math.min(result.length * 45, 1200), 200),
        },
      });

      editor.select(resultShapeId);
      editor.zoomToSelection({ animation: { duration: 300 } });

      // const group = [
      //   editor.getShape(resultShapeId),
      //   editor.getShape(toolbarShapeId),
      // ] as TLShape[];

      // editor.groupShapes(group);

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
};
