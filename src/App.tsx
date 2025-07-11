import { useEffect, useRef } from "react";
import { Editor, Tldraw } from "tldraw";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "tldraw/tldraw.css";
import "./App.css";
import { customComponents, customUiOverrides } from "./TldrawUi";
import { QueryShapeUtil } from "./shapes/QueryShape";
import { QueryTool } from "./tools/QueryTool";
import { ResultShapeUtil } from "./shapes/ResultShape";
import { invoke } from "@tauri-apps/api/core";
import { schemaAtom } from "./state";
import { useAtom } from "jotai";

const customShapes = [QueryShapeUtil, ResultShapeUtil];

const fetchSchema = async () => {
  const response = (await invoke("get_schema")) as string;
  return JSON.parse(response);
};

function App() {
  const ref = useRef<Editor>();
  const [, setSchema] = useAtom(schemaAtom);

  ModuleRegistry.registerModules([AllCommunityModule]);

  useEffect(() => {
    fetchSchema().then((schema) => {
      setSchema(schema);
    });
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        onMount={(editor) => {
          ref.current = editor;
        }}
        shapeUtils={customShapes}
        overrides={customUiOverrides}
        components={customComponents}
        tools={[QueryTool]}
      />
    </div>
  );
}

export default App;
