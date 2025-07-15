import { languages } from "monaco-editor";

export const createSqlProvider = ({
  tables,
}: {
  tables: Record<string, string[]>;
  references: Record<string, string[]>;
}) => {
  const tableNames = Object.keys(tables);
  const columns = Array.from(
    new Set(
      Object.entries(tables)
        .flatMap(([, entry]) => entry)
        .flat(),
    ),
  );

  return {
    // Define characters that should trigger completion suggestions
    triggerCharacters: [" ", ".", "\n", ","],

    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const suggestions: {
        label: string;
        kind: languages.CompletionItemKind;
        insertText: string;
        range: typeof range;
      }[] = [];

      const tableKeywordsRegex =
        /(FROM|JOIN|INTO|UPDATE|DELETE\s+FROM)\s+([\w\s]*)$/i;
      const tableMatch = textUntilPosition.match(tableKeywordsRegex);

      if (tableMatch) {
        tableNames.forEach((tableName) => {
          suggestions.push({
            label: tableName,
            kind: languages.CompletionItemKind.Folder, // Icon for folders often used for tables
            insertText: tableName,
            range,
          });
        });
      } else {
        const generalColumnKeywordsRegex =
          /(SELECT|WHERE|GROUP BY|ORDER BY|SET|\.)\s+([\w\s,]*)$/i;
        const generalColumnMatch = textUntilPosition.match(
          generalColumnKeywordsRegex,
        );

        if (generalColumnMatch) {
          Array.from(columns).forEach((columnName) => {
            suggestions.push({
              label: columnName,
              kind: languages.CompletionItemKind.Field,
              insertText: columnName,
              range,
            });
          });
        }
      }

      const sqlKeywords = [
        "SELECT",
        "FROM",
        "WHERE",
        "JOIN",
        "INSERT INTO",
        "VALUES",
        "UPDATE",
        "SET",
        "DELETE FROM",
        "AND",
        "OR",
        "NOT",
        "GROUP BY",
        "ORDER BY",
        "LIMIT",
        "OFFSET",
        "AS",
        "ON",
        "DISTINCT",
        "COUNT",
        "SUM",
        "AVG",
        "LIKE",
        "ILIKE",
        "MIN",
        "MAX",
        "LEFT JOIN",
        "RIGHT JOIN",
        "INNER JOIN",
        "OUTER JOIN",
        "ASC",
        "DESC",
      ];

      sqlKeywords.forEach((keyword) => {
        suggestions.push({
          label: keyword,
          kind: languages.CompletionItemKind.Keyword,
          insertText: keyword + (keyword.includes(" ") ? "" : " "),
          range: range,
        });
      });
      // }

      return { suggestions };
    },
  };
};
