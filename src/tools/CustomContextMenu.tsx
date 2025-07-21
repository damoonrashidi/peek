import {
  DefaultContextMenu,
  DefaultContextMenuContent,
  TldrawUiMenuGroup,
  TldrawUiMenuItem,
  TldrawUiMenuSubmenu,
  TLUiContextMenuProps,
  useEditor,
} from "tldraw";
import { ResultShapeUtil } from "../shapes/ResultShape";

export const CustomContextMenu = (props: TLUiContextMenuProps) => {
  const editor = useEditor();

  const copyTo = (_format: "json" | "csv") => {
    const shape = editor.getOnlySelectedShape();
    if (!shape) {
      return;
    }

    if (shape.type !== "result") {
      return;
    }

    const data = (shape.props as ReturnType<ResultShapeUtil["getDefaultProps"]>)
      .data;

    console.log(data);
  };

  const items = [
    { id: "export-csv", label: "CSV", onSelect: () => copyTo("csv") },
    { id: "export-json", label: "JSON", onSelect: () => copyTo("json") },
  ];

  return (
    <DefaultContextMenu {...props}>
      <TldrawUiMenuGroup id="export">
        <div>
          <TldrawUiMenuSubmenu id="export" label="Export">
            {items.map((item) => (
              <TldrawUiMenuItem
                id={item.id}
                key={item.id}
                label={item.label}
                onSelect={item.onSelect}
              />
            ))}
          </TldrawUiMenuSubmenu>
        </div>
      </TldrawUiMenuGroup>
    </DefaultContextMenu>
  );
};
