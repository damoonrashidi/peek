import { editor, languages, Position } from "monaco-editor";
import { Parser, Language, Query, Node } from "web-tree-sitter";

export const createSqlProvider = ({
  tables,
  references,
  parser,
  language,
}: {
  tables: Record<string, string[]>;
  references: Record<string, string[]>;
  parser: Parser;
  language: Language;
}): languages.CompletionItemProvider => {
  const tableNames = Object.keys(tables);
  const allColumns = Array.from(
    new Set(
      Object.entries(tables)
        .flatMap(([, entry]) => entry)
        .flat(),
    ),
  );

  // Helper function to find node at cursor position
  const findNodeAtPosition = (
    node: Node,
    line: number,
    column: number,
  ): Node | null => {
    // Convert to 0-based indexing (Tree Sitter uses 0-based, Monaco uses 1-based)
    const targetLine = line - 1;
    const targetColumn = column - 1;

    // Check if position is within this node
    if (
      targetLine < node.startPosition.row ||
      targetLine > node.endPosition.row ||
      (targetLine === node.startPosition.row &&
        targetColumn < node.startPosition.column) ||
      (targetLine === node.endPosition.row &&
        targetColumn > node.endPosition.column)
    ) {
      return null;
    }

    // Check children first (most specific match)
    for (const child of node.children) {
      if (!child) {
        continue;
      }
      const childResult = findNodeAtPosition(child, line, column);
      if (childResult) {
        return childResult;
      }
    }

    // If no child contains the position, this node is the most specific
    return node;
  };

  // Helper function to get table aliases from the query
  const getTableAliases = (rootNode: Node): Map<string, string> => {
    const aliases = new Map<string, string>();

    const aliasQuery = new Query(
      language,
      `
      (relation
        (object_reference name: (identifier) @table_name)
        alias: (identifier) @table_alias)
      `,
    );

    const captures = aliasQuery.captures(rootNode);
    for (let i = 0; i < captures.length; i += 2) {
      const tableName = captures[i]?.node.text;
      const aliasName = captures[i + 1]?.node.text;
      if (tableName && aliasName) {
        aliases.set(aliasName, tableName);
      }
    }

    return aliases;
  };

  // Helper function to get columns for a specific table
  const getColumnsForTable = (tableName: string): string[] => {
    return tables[tableName] || [];
  };

  // Helper function to determine completion context
  const getCompletionContext = (
    node: Node | null,
    rootNode: Node,
    model: editor.ITextModel,
    position: Position,
  ): {
    type: "table" | "column" | "table_for_join" | "general";
    tableContext?: string;
  } => {
    if (!node) return { type: "general" };

    // Get the text before the cursor to understand immediate context
    const lineText = model.getLineContent(position.lineNumber);
    const textBeforeCursor = lineText.substring(0, position.column - 1);
    const textBeforeCursorTrimmed = textBeforeCursor.trim();

    // Check if we're immediately after a dot (for field completion)
    const dotMatch = textBeforeCursor.match(/(\w+)\.$/);
    if (dotMatch) {
      const tableAlias = dotMatch[1];
      const aliases = getTableAliases(rootNode);
      const actualTable = aliases.get(tableAlias) || tableAlias;
      return { type: "column", tableContext: actualTable };
    }

    // Check if we're after specific keywords
    const afterFromMatch = textBeforeCursorTrimmed.match(/\bFROM\s*$/i);
    if (afterFromMatch) {
      return { type: "table" };
    }

    const afterJoinMatch = textBeforeCursorTrimmed.match(
      /\b(INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|JOIN)\s*$/i,
    );
    if (afterJoinMatch) {
      return { type: "table_for_join" };
    }

    // If the immediate context doesn't give us enough info, look at the AST structure
    let currentNode: Node | null = node;

    // Walk up the tree to find context, but also check siblings
    while (currentNode) {
      const nodeType = currentNode.type;

      // If we're in a field context (after a dot)
      if (nodeType === "field" || currentNode.parent?.type === "field") {
        const fieldNode =
          nodeType === "field" ? currentNode : currentNode.parent!;
        const objectRef = fieldNode.childForFieldName("object");
        if (objectRef) {
          const tableAlias = objectRef.text;
          const aliases = getTableAliases(rootNode);
          const actualTable = aliases.get(tableAlias) || tableAlias;
          return { type: "column", tableContext: actualTable };
        }
      }

      // Check if we're in a FROM clause context
      if (nodeType === "from" || currentNode.parent?.type === "from") {
        // Look at siblings to see if we're after the FROM keyword
        if (currentNode.parent?.type === "from") {
          const fromNode = currentNode.parent;
          const fromKeyword = fromNode.children.find(
            (child) => child?.type === "keyword_from",
          );
          if (fromKeyword) {
            // Check if cursor is after the FROM keyword
            const fromEndPos = fromKeyword.endPosition;
            const cursorPos = {
              row: position.lineNumber - 1,
              column: position.column - 1,
            };
            if (
              cursorPos.row > fromEndPos.row ||
              (cursorPos.row === fromEndPos.row &&
                cursorPos.column >= fromEndPos.column)
            ) {
              return { type: "table" };
            }
          }
        }
        return { type: "table" };
      }

      // Check if we're in a JOIN clause context
      if (nodeType === "join" || currentNode.parent?.type === "join") {
        if (currentNode.parent?.type === "join") {
          const joinNode = currentNode.parent;
          // Look for JOIN keywords
          const joinKeywords = joinNode.children.filter(
            (child) =>
              child?.type === "keyword_join" ||
              child?.type === "keyword_inner" ||
              child?.type === "keyword_left" ||
              child?.type === "keyword_right" ||
              child?.type === "keyword_full",
          );

          if (joinKeywords.length > 0) {
            const lastJoinKeyword = joinKeywords[joinKeywords.length - 1];

            if (!lastJoinKeyword) {
              continue;
            }
            const joinEndPos = lastJoinKeyword.endPosition;
            const cursorPos = {
              row: position.lineNumber - 1,
              column: position.column - 1,
            };
            if (
              cursorPos.row > joinEndPos.row ||
              (cursorPos.row === joinEndPos.row &&
                cursorPos.column >= joinEndPos.column)
            ) {
              return { type: "table_for_join" };
            }
          }
        }
        return { type: "table_for_join" };
      }

      // If we're in a select expression context
      if (
        nodeType === "select_expression" ||
        currentNode.parent?.type === "select_expression"
      ) {
        // Check if we're after SELECT keyword
        if (currentNode.parent?.type === "select_expression") {
          const selectNode = currentNode.parent.parent; // get the select node
          if (selectNode) {
            const selectKeyword = selectNode.children.find(
              (child) => child?.type === "keyword_select",
            );
            if (selectKeyword) {
              const selectEndPos = selectKeyword.endPosition;
              const cursorPos = {
                row: position.lineNumber - 1,
                column: position.column - 1,
              };
              if (
                cursorPos.row > selectEndPos.row ||
                (cursorPos.row === selectEndPos.row &&
                  cursorPos.column >= selectEndPos.column)
              ) {
                return { type: "column" };
              }
            }
          }
        }
        return { type: "column" };
      }

      // Check if we're in a relation context that's not yet complete
      if (nodeType === "relation" || currentNode.parent?.type === "relation") {
        // Check if this relation is in a JOIN context
        let joinNode: Node | null = currentNode;
        while (joinNode && joinNode.type !== "join") {
          joinNode = joinNode.parent;
        }

        if (joinNode && joinNode.type === "join") {
          return { type: "table_for_join" };
        }

        return { type: "table" };
      }

      currentNode = currentNode.parent;
    }

    // Final fallback: check the broader context using text patterns
    const fullText = model.getValue();
    const textBeforePosition = fullText.substring(
      0,
      model.getOffsetAt(position),
    );

    // Check if we're in a SELECT clause
    const selectMatch = textBeforePosition.match(/\bSELECT\b(?!.*\bFROM\b)/is);
    if (selectMatch) {
      return { type: "column" };
    }

    // Check if we're in a FROM clause
    const fromMatch = textBeforePosition.match(
      /\bFROM\b(?!.*\bWHERE\b)(?!.*\bORDER\b)(?!.*\bGROUP\b)/is,
    );
    if (fromMatch) {
      return { type: "table" };
    }

    return { type: "general" };
  };

  return {
    triggerCharacters: [" ", ".", ",", "\n", "\t"],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const query = model.getValue();

      try {
        const tree = parser.parse(query);
        if (!tree) {
          console.log("no tree");
          return { suggestions: [] };
        }

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Find the node at cursor position
        const nodeAtCursor = findNodeAtPosition(
          tree.rootNode,
          position.lineNumber,
          position.column,
        );
        console.log("Node at cursor:", nodeAtCursor?.type, nodeAtCursor?.text);

        // Get completion context
        const context = getCompletionContext(
          nodeAtCursor,
          tree.rootNode,
          model,
          position,
        );
        console.log("Completion context:", context);

        let suggestions: languages.CompletionItem[] = [];

        switch (context.type) {
          case "table":
            // Suggest table names
            suggestions = tableNames.map((tableName) => ({
              label: tableName,
              kind: languages.CompletionItemKind.Class,
              insertText: tableName,
              range,
              documentation: `Table: ${tableName}`,
            }));
            break;

          case "column":
            if (context.tableContext) {
              // Suggest columns from specific table
              const columns = getColumnsForTable(context.tableContext);
              suggestions = columns.map((column) => ({
                label: column,
                kind: languages.CompletionItemKind.Field,
                insertText: column,
                range,
                documentation: `Column from ${context.tableContext}: ${column}`,
              }));
            } else {
              // Suggest all available columns and table aliases
              const aliases = getTableAliases(tree.rootNode);
              const aliasCompletions = Array.from(aliases.keys()).map(
                (alias) => ({
                  label: alias,
                  kind: languages.CompletionItemKind.Variable,
                  insertText: alias,
                  range,
                  documentation: `Table alias: ${alias} (${aliases.get(alias)})`,
                }),
              );

              const columnCompletions = allColumns.map((column) => ({
                label: column,
                kind: languages.CompletionItemKind.Field,
                insertText: column,
                range,
                documentation: `Column: ${column}`,
              }));

              suggestions = [...aliasCompletions, ...columnCompletions];
            }
            break;

          case "table_for_join":
            // Suggest tables that can be joined (have references)
            const joinableTables = tableNames.filter(
              (table) =>
                references[table] ||
                Object.values(references).some((refs) => refs.includes(table)),
            );

            suggestions = joinableTables.map((tableName) => ({
              label: tableName,
              kind: languages.CompletionItemKind.Class,
              insertText: tableName,
              range,
              documentation: `Joinable table: ${tableName}`,
            }));
            break;

          case "general":
          default:
            // Fallback to all available completions
            suggestions = [
              ...tableNames.map((name) => ({
                label: name,
                kind: languages.CompletionItemKind.Class,
                insertText: name,
                range,
                documentation: `Table: ${name}`,
              })),
              ...allColumns.map((column) => ({
                label: column,
                kind: languages.CompletionItemKind.Field,
                insertText: column,
                range,
                documentation: `Column: ${column}`,
              })),
            ];
            break;
        }

        return { suggestions };
      } catch (e) {
        console.error("Error in completion provider:", e);
        return { suggestions: [] };
      }
    },
  };
};
