import { createShapeId, TLShape, useEditor } from "tldraw";
import { createArrowBetweenShapes } from "./createArrowBetweenShapes";
import { invoke } from "@tauri-apps/api/core";

export const useExecuteQuery = () => {
  const editor = useEditor();

  return async (shape: TLShape, queries: string[]) => {
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      try {
        const response = (await invoke("get_results", { query })) as string;
        const result = JSON.parse(response) as [string, unknown][][];

        const x = (editor.getSelectionPageBounds()?.right ?? shape.x) + 50;

        if (queries.length > 1 && result.length === 0) {
          continue;
        }

        const columnCount = result[0]?.length ?? 0;
        const resultShapeId = createShapeId(shape.id + "-result-" + i);

        const resultShape = editor.getShape(resultShapeId);

        if (resultShape) {
          editor.updateShape({
            id: resultShapeId,
            type: "result",
            props: {
              data: result,
              query,
            },
          });
        } else {
          editor.createShape({
            id: resultShapeId,
            type: "result",
            x: x + 50,
            y: shape.y,
            props: {
              data: result,
              query,
              w: Math.max(columnCount * 250, 200),
              h: Math.min(result.length * 45 + 40, 1500),
            },
          });
          createArrowBetweenShapes(editor, shape.id, resultShapeId);
        }

        editor.select(resultShapeId);
        editor.zoomToSelection({ animation: { duration: 300 } });
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
    }
  };
};
