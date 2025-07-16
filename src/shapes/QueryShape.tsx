import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  TLBaseShape,
  resizeBox,
  stopEventPropagation,
} from "tldraw";
import "./Query.css";
import { SqlEditor } from "../Editor/SqlEditor";
import { editor } from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { createSqlProvider } from "../Editor/languageProvider";
import { useAtomValue } from "jotai";
import { providerRegistrationAtom, schemaAtom } from "../state";
import { useAtom } from "jotai";
import { format } from "sql-formatter";
import { useExecuteQuery } from "../tools/useExecuteQuery";

type QueryShape = TLBaseShape<"query", { query: string; w: number; h: number }>;

export class QueryShapeUtil extends ShapeUtil<QueryShape> {
  static override type = "query" as const;

  private editorInstances = new Map<string, editor.IStandaloneCodeEditor>();
  private monacoInstances = new Map<string, Monaco>();

  override canEdit = () => true;
  override canResize = () => true;

  getDefaultProps(): QueryShape["props"] {
    return { query: "", w: 350, h: 240 };
  }

  component(shape: QueryShape) {
    const schema = useAtomValue(schemaAtom);
    const executeQuery = useExecuteQuery(shape);
    const [hasRegisteredProvider, setHasRegisteredProvider] = useAtom(
      providerRegistrationAtom,
    );

    const isEditing = this.editor.getEditingShapeId() === shape.id;

    return (
      <HTMLContainer
        id={shape.id}
        onPointerDown={isEditing ? stopEventPropagation : undefined}
      >
        <SqlEditor
          query={shape.props.query}
          onMount={(editor, monaco) => {
            this.editorInstances.set(shape.id, editor);
            this.monacoInstances.set(shape.id, monaco);

            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              () => {
                const editingShapeId = this.editor.getEditingShapeId();
                if (!editingShapeId) {
                  return;
                }
                const editorInstance = this.editorInstances.get(editingShapeId);
                if (!editorInstance) {
                  return;
                }

                executeQuery(editorInstance.getValue());
              },
            );

            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI,
              () => {
                const editingShapeId = this.editor.getEditingShapeId();
                if (!editingShapeId) {
                  return;
                }
                const editorInstance = this.editorInstances.get(editingShapeId);
                if (!editorInstance) {
                  return;
                }

                const formatted = format(editorInstance.getValue(), {
                  keywordCase: "upper",
                  functionCase: "upper",
                });

                editorInstance?.setValue(formatted);
              },
            );

            if (!hasRegisteredProvider) {
              const provider = createSqlProvider(schema);
              monaco.languages.registerCompletionItemProvider("sql", provider);
              setHasRegisteredProvider(true);
            }
          }}
          onQueryChange={(query) =>
            this.editor.updateShape<QueryShape>({
              id: shape.id,
              type: "query",
              props: { query },
            })
          }
        />
      </HTMLContainer>
    );
  }

  override onEditStart(): void {
    const editingShapeId = this.editor.getEditingShapeId();
    if (editingShapeId) {
      const editorInstance = this.editorInstances.get(editingShapeId);
      editorInstance?.focus();
    }
  }

  override onDoubleClick(): void {
    const editingShapeId = this.editor.getEditingShapeId();
    if (editingShapeId) {
      const editorInstance = this.editorInstances.get(editingShapeId);
      editorInstance?.focus();
    }
  }

  getGeometry(shape: QueryShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  indicator(shape: QueryShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize(shape: QueryShape, info: any) {
    return resizeBox(shape, info);
  }
}
