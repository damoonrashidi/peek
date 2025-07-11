import {
  DefaultKeyboardShortcutsDialog,
  DefaultKeyboardShortcutsDialogContent,
  DefaultToolbar,
  TLComponents,
  TLUiOverrides,
  TldrawUiMenuItem,
  useTools,
} from "tldraw";
import { CustomContextualToolbarComponent } from "./tools/CustomToolbar";

export const customUiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools["query"] = {
      id: "query",
      label: "Query editor",
      icon: "code",
      kbd: "q",
      onSelect: () => {
        editor.setCurrentTool("query");
      },
    };
    return tools;
  },
  actions(editor, actions) {
    actions["query"] = {
      id: "query-actions",
      label: "Create a new Query",
      readonlyOk: true,
      kbd: "q",
      onSelect() {
        editor.setCurrentTool("query");
      },
    };
    return actions;
  },
};

export const customComponents: TLComponents = {
  Toolbar: (props) => {
    const tools = useTools();

    delete tools["rectangle"];
    delete tools["text"];
    delete tools["arrow"];
    delete tools["line"];

    return (
      <DefaultToolbar {...props}>
        <TldrawUiMenuItem {...tools["select"]} />
        <TldrawUiMenuItem {...tools["query"]} />
        <TldrawUiMenuItem {...tools["hand"]} />
      </DefaultToolbar>
    );
  },
  ActionsMenu: null,
  HelpMenu: null,
  StylePanel: null,
  QuickActions: null,
  InFrontOfTheCanvas: CustomContextualToolbarComponent,
  KeyboardShortcutsDialog: (props) => {
    return (
      <DefaultKeyboardShortcutsDialog {...props}>
        <DefaultKeyboardShortcutsDialogContent />
        <div
          style={{
            display: "flex",
            gridColumn: "1 / -1",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ fontWeight: "bold" }}>Query editor</div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <kbd>Q</kbd>
            <span>Query editor</span>
          </div>
        </div>
      </DefaultKeyboardShortcutsDialog>
    );
  },
};
