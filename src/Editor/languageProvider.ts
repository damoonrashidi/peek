import { languages } from "monaco-editor";

export const createSqlProvider = ({
  tables,
  references,
}: {
  tables: Record<string, string[]>;
  references: Record<string, string[]>;
}): languages.CompletionItemProvider => {
  const tableNames = Object.keys(tables);
  const allReferences = Object.values(references).flat();
  const inboundReferences = Object.keys(references);
  const columns = Array.from(
    new Set(
      Object.entries(tables)
        .flatMap(([, entry]) => entry)
        .flat(),
    ),
  );

  return {
    triggerCharacters: [" ", ".", ","],
    provideCompletionItems(model, position) {
      const value = model.getValue();
      const at = model.getWordAtPosition(position)?.word ?? "";
      const before =
        (() => {
          const textBeforeCursor = value.substring(
            0,
            model.getOffsetAt(position),
          );
          const words = textBeforeCursor.trim().split(/\s+/);
          return words.length >= 1 ? words[words.length - 1] : null;
        })() ?? "";

      const word = model.getWordUntilPosition(position);

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      if (["FROM", "JOIN"].includes(before.toUpperCase()) && at === "") {
        return {
          suggestions: tableNames.map((table) => ({
            label: table,
            kind: languages.CompletionItemKind.Folder,
            insertText: table,
            range,
          })),
        };
      }

      const suggestions = [
        ...allReferences,
        ...inboundReferences,
        ...columns,
      ].map((column) => ({
        label: column,
        kind: languages.CompletionItemKind.Field,
        insertText: column,
        range,
      }));

      return { suggestions };
    },
  };
};
