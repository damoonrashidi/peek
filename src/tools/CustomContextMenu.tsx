import {
  DefaultContextMenu,
  TldrawUiMenuGroup,
  TldrawUiMenuItem,
  TldrawUiMenuSubmenu,
  TLUiContextMenuProps,
  useEditor,
} from "tldraw";
import { writeTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import { ResultShapeUtil } from "../shapes/Result/ResultShape";
import { toJson } from "./export/json";
import { toCsv } from "./export/csv";

export const CustomContextMenu = (props: TLUiContextMenuProps) => {
  const editor = useEditor();

  const copyTo = async (format: "json" | "csv") => {
    try {
      const shape = editor.getOnlySelectedShape();
      if (!shape) {
        return;
      }

      if (shape.type !== "result") {
        return;
      }

      const data = (
        shape.props as ReturnType<ResultShapeUtil["getDefaultProps"]>
      ).data;

      let output = "";
      if (format === "json") {
        output = JSON.stringify(toJson(data));
      } else if (format === "csv") {
        output = toCsv(data);
      }

      const path = await save({
        filters: [
          {
            name: "export",
            extensions: [format],
          },
        ],
      });

      if (!path) {
        return;
      }

      await writeTextFile(path, output, {
        baseDir: BaseDirectory.AppConfig,
      });
    } catch (e) {
      console.error(e);
    }
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
