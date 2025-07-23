import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";

export const SqlEditor = ({
  query,
  onQueryChange,
  onMount,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
}) => {
  return (
    <div style={{ height: "100%" }}>
      <Editor
        height="100%"
        defaultLanguage="sql"
        defaultValue={query}
        theme="vs-dark"
        onMount={onMount}
        options={{
          lineNumbers: "off",
          wordWrap: "on",
          minimap: { enabled: false },
          padding: { top: 8, bottom: 0 },
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          glyphMargin: false,
          renderLineHighlight: "none",
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          autoClosingBrackets: "always",
          autoClosingOvertype: "always",
          autoClosingQuotes: "always",
          scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: "on",
          accessibilitySupport: "off",
          automaticLayout: true,
        }}
        onChange={(value) => onQueryChange(value ?? "")}
      />
    </div>
  );
};
