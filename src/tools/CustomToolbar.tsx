import { track, useEditor } from "tldraw";
import { QueryContextualToolbarComponent } from "./QueryToolbar";
import { ResultContextualToolbarComponent } from "./ResultToolbar";

export const CustomContextualToolbarComponent = track(() => {
  const editor = useEditor();
  const shapeType = editor.getOnlySelectedShape()?.type;
  const showContextualToolbar = editor.isIn("select.idle");

  if (!showContextualToolbar) {
    return null;
  }

  if (shapeType === "query") {
    return <QueryContextualToolbarComponent />;
  }

  if (shapeType === "result") {
    return <ResultContextualToolbarComponent />;
  }

  return null;
});
