import { useEffect, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { useAtomValue } from "jotai";
import { schemaAtom, sqlLanguageAtom, sqlParserAtom } from "../state";
import { createSqlProvider } from "./languageProvider";
import { editor, IDisposable } from "monaco-editor";

export const MonacoManager = () => {
  const schema = useAtomValue(schemaAtom);
  const parser = useAtomValue(sqlParserAtom);
  const language = useAtomValue(sqlLanguageAtom);

  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const providerRef = useRef<IDisposable | null>(null);
  const lastSchemaRef = useRef<string>("");

  const registerCompletionProvider = () => {
    if (!monacoRef.current || !schema || !parser || !language) {
      return;
    }

    // Check if schema has actually changed
    const currentSchemaString = JSON.stringify(schema);
    if (currentSchemaString === lastSchemaRef.current) {
      return;
    }

    // Dispose of the previous provider if it exists
    if (providerRef.current) {
      console.log("Disposing old SQL completion provider");
      providerRef.current.dispose();
      providerRef.current = null;
    }

    // Create and register the new provider
    console.log("Registering new SQL completion provider with schema:", schema);
    const provider = createSqlProvider({
      ...schema,
      parser,
      language,
    });

    providerRef.current =
      monacoRef.current.languages.registerCompletionItemProvider(
        "sql",
        provider,
      );

    lastSchemaRef.current = currentSchemaString;
  };

  useEffect(() => {
    registerCompletionProvider();
  }, [schema, parser, language]);

  return (
    <div
      style={{
        position: "absolute",
        left: -9999,
        top: -9999,
        width: 1,
        height: 1,
      }}
    >
      <Editor
        height="1px"
        width="1px"
        defaultLanguage="sql"
        defaultValue=""
        theme="vs-dark"
        onMount={(editor, monaco) => {
          console.log("Monaco manager initialized");
          monacoRef.current = monaco;
          editorRef.current = editor;

          // Register the provider once Monaco is ready
          registerCompletionProvider();
        }}
        options={{
          // Minimal options since this editor is never visible
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: "off",
          folding: false,
          scrollBeyondLastLine: false,
          renderLineHighlight: "none",
          selectionHighlight: false,
          contextmenu: false,
        }}
      />
    </div>
  );
};
