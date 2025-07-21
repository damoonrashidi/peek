import { useEffect, useRef } from "react";
import { Editor, Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import "@mantine/core/styles.css";
import "./App.css";
import { customComponents, customUiOverrides } from "./TldrawUi";
import { QueryShapeUtil } from "./shapes/QueryShape";
import { QueryTool } from "./tools/QueryTool";
import { ResultShapeUtil } from "./shapes/ResultShape";
import { invoke } from "@tauri-apps/api/core";
import {
  persistanceAtom,
  schemaAtom,
  sqlLanguageAtom,
  sqlParserAtom,
} from "./state";
import { useAtom, useAtomValue } from "jotai";
import { BarChartShapeUtil } from "./shapes/BarChartShape";
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryErrorShapeUtil } from "./shapes/ErrorShape";

import { Parser, Language } from "web-tree-sitter";
import { MonacoManager } from "./Editor/MonacoManager";

const customShapes = [
  QueryShapeUtil,
  ResultShapeUtil,
  BarChartShapeUtil,
  QueryErrorShapeUtil,
];
const theme = createTheme({});

const fetchSchema = async () => {
  const response = (await invoke("get_schema")) as string;
  return JSON.parse(response);
};

function App() {
  const ref = useRef<Editor>();
  const [, setSchema] = useAtom(schemaAtom);
  const [, setSqlParser] = useAtom(sqlParserAtom);
  const [, sqlSqlLanguage] = useAtom(sqlLanguageAtom);
  const persistanceKey = useAtomValue(persistanceAtom);

  const initTreeSitter = async () => {
    await Parser.init();

    const wasmPath = new URL("/tree-sitter-sql.wasm", window.location.origin)
      .href;
    const SQL = await Language.load(wasmPath);

    const parser = new Parser();
    parser.setLanguage(SQL);
    setSqlParser(parser);
    sqlSqlLanguage(SQL);
  };

  useEffect(() => {
    fetchSchema().then(setSchema);
    initTreeSitter().then(() => {});
  }, []);

  return (
    <MantineProvider theme={theme}>
      <div style={{ position: "fixed", inset: 0 }}>
        <MonacoManager />
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
