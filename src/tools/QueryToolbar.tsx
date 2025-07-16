import {
  Box,
  TldrawUiButton,
  TldrawUiContextualToolbar,
  track,
  useEditor,
} from "tldraw";
import { QueryShapeUtil } from "../shapes/QueryShape";
import { useExecuteQuery } from "./useExecuteQuery";

export const QueryContextualToolbarComponent = track(() => {
  const editor = useEditor();

  const shape = editor
    .getSelectedShapes()
    .find((shape) => shape.type === "query")!;

  const executeQuery = useExecuteQuery(shape);

  const getSelectionBounds = () => {
    const fullBounds = editor.getSelectionRotatedScreenBounds();
    if (!fullBounds) {
      return undefined;
    }
    return new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0);
  };

  const runExecuteQuery = async () => {
    const query = (shape.props as ReturnType<QueryShapeUtil["getDefaultProps"]>)
      .query;

    executeQuery([query]);
  };

  return (
    <TldrawUiContextualToolbar
      getSelectionBounds={getSelectionBounds}
      label="Sizes"
    >
      <TldrawUiButton
        title="Execute query"
        type="normal"
        onClick={runExecuteQuery}
      >
        Execute
      </TldrawUiButton>
    </TldrawUiContextualToolbar>
  );
});
