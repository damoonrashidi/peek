import {
  Box,
  createShapeId,
  TldrawUiButton,
  TldrawUiContextualToolbar,
  useEditor,
} from "tldraw";
import { ResultShapeUtil } from "../shapes/ResultShape";
import { createArrowBetweenShapes } from "./createArrowBetweenShapes";

export const ResultContextualToolbarComponent = () => {
  const editor = useEditor();

  const getSelectionBounds = () => {
    const fullBounds = editor.getSelectionRotatedScreenBounds();
    if (!fullBounds) {
      return undefined;
    }
    return new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0);
  };

  const createChart = () => {
    const shape = editor
      .getSelectedShapes()
      .find((shape) => shape.type === "result");
    if (!shape) {
      return;
    }

    const data = (shape.props as ReturnType<ResultShapeUtil["getDefaultProps"]>)
      .data;

    if (data.length === 0) {
      return;
    }

    const fields = [];

    for (const row of data) {
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

    const bounds = getSelectionBounds();

    editor.createShape({
      type: "barchart",
      id: chartShapeId,
      x: shape.x + (bounds?.w ?? 0) + 50,
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

  return (
    <TldrawUiContextualToolbar
      getSelectionBounds={getSelectionBounds}
      label="Actions"
    >
      <TldrawUiButton title="Graph" type="normal" onClick={createChart}>
        Chart
      </TldrawUiButton>
    </TldrawUiContextualToolbar>
  );
};
