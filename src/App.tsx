import { useEffect, useRef } from "react";
import { Editor, Tldraw } from "tldraw";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "tldraw/tldraw.css";
import "@mantine/core/styles.css";
import "./App.css";
import { customComponents, customUiOverrides } from "./TldrawUi";
import { QueryShapeUtil } from "./shapes/QueryShape";
import { QueryTool } from "./tools/QueryTool";
import { ResultShapeUtil } from "./shapes/ResultShape";
import { invoke } from "@tauri-apps/api/core";
import { persistanceAtom, schemaAtom } from "./state";
import { useAtom, useAtomValue } from "jotai";
import { BarChartShapeUtil } from "./shapes/BarChartShape";
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryErrorShapeUtil } from "./shapes/ErrorShape";
import { ResultToolbarShapeUtil } from "./shapes/ResultToolbarShape";

const customShapes = [
  QueryShapeUtil,
  ResultShapeUtil,
  BarChartShapeUtil,
  QueryErrorShapeUtil,
  ResultToolbarShapeUtil,
];
const theme = createTheme({});

const fetchSchema = async () => {
  const response = (await invoke("get_schema")) as string;
  return JSON.parse(response);
};

function App() {
  const ref = useRef<Editor>();
  const [, setSchema] = useAtom(schemaAtom);
  const persistanceKey = useAtomValue(persistanceAtom);

  ModuleRegistry.registerModules([AllCommunityModule]);

  useEffect(() => {
    fetchSchema().then((schema) => {
      setSchema(schema);
    });
  }, []);

  return (
    <MantineProvider theme={theme}>
      <div style={{ position: "fixed", inset: 0 }}>
        <Tldraw
          onMount={(editor) => {
            ref.current = editor;
          }}
          persistenceKey={persistanceKey}
          shapeUtils={customShapes}
          overrides={customUiOverrides}
          components={customComponents}
          tools={[QueryTool]}
        />
      </div>
    </MantineProvider>
  );
}

export default App;
