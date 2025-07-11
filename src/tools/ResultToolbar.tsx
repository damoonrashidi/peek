import {
  Box,
  TldrawUiButton,
  TldrawUiContextualToolbar,
  useEditor,
} from "tldraw";

export const ResultContextualToolbarComponent = () => {
  const editor = useEditor();

  const getSelectionBounds = () => {
    const fullBounds = editor.getSelectionRotatedScreenBounds();
    if (!fullBounds) {
      return undefined;
    }
    return new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0);
  };

  return (
    <TldrawUiContextualToolbar
      getSelectionBounds={getSelectionBounds}
      label="Sizes"
    >
      <TldrawUiButton title="Graph" type="normal" onClick={() => {}}>
        Chart
      </TldrawUiButton>
    </TldrawUiContextualToolbar>
  );
};
