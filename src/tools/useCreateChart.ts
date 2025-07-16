import { createShapeId, TLShape, useEditor } from "tldraw";
import { ResultShapeUtil } from "../shapes/ResultShape";
import { createArrowBetweenShapes } from "./createArrowBetweenShapes";

export const useCreateChart = (shape: TLShape) => {
  const editor = useEditor();

  return () => {
    if (shape.type !== "result") {
      return;
    }

    const props = shape.props as ReturnType<ResultShapeUtil["getDefaultProps"]>;

    if (props.data.length === 0) {
      return;
    }

    const x = editor.getSelectionPageBounds()?.right;

    const fields = [];

    for (const row of props.data) {
      let has_label = false;

      const chart_data: Record<string, string | number> = {};

      for (const [key, value] of row) {
        if (typeof value === "number") {
          chart_data[key] = value;
        } else if (typeof value === "string" && !has_label) {
          chart_data[key] = value;
          has_label = true;
        }
      }

      fields.push(chart_data);
    }

    const chartShapeId = createShapeId(shape.id + "-chart");

    editor.createShape({
      type: "barchart",
      id: chartShapeId,
      x,
      y: shape.y,
      props: {
        data: fields,
        w: 500,
        h: 500,
      },
    });

    editor.select(chartShapeId);
    editor.zoomToSelection({ animation: { duration: 300 } });

    createArrowBetweenShapes(editor, shape.id, chartShapeId);
  };
};
