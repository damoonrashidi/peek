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
import { MutableRefObject, useRef } from "react";
import { SqlEditor } from "../Editor/SqlEditor";
import { editor } from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { createSqlProvider } from "../Editor/languageProvider";
import { useAtomValue } from "jotai";
import { providerRegistrationAtom, schemaAtom } from "../state";
import { useAtom } from "jotai";

type QueryShape = TLBaseShape<"query", { query: string; w: number; h: number }>;

export class QueryShapeUtil extends ShapeUtil<QueryShape> {
  static override type = "query" as const;

  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null> | null =
    null;
  monacoRef: MutableRefObject<Monaco | null> | null = null;

  override canEdit = () => true;
  override canResize = () => true;

  getDefaultProps(): QueryShape["props"] {
    return { query: "", w: 350, h: 240 };
  }

  component(shape: QueryShape) {
    const schema = useAtomValue(schemaAtom);
    const [hasRegisteredProvider, setHasRegisteredProvider] = useAtom(
      providerRegistrationAtom,
    );

    const isEditing = this.editor.getEditingShapeId() === shape.id;
    this.editorRef = useRef(null);
    this.monacoRef = useRef(null);

    return (
      <HTMLContainer
        id={shape.id}
        onPointerDown={isEditing ? stopEventPropagation : undefined}
      >
        <SqlEditor
          query={shape.props.query}
          onMount={(editor, monaco) => {
            this.editorRef!.current = editor;
            this.monacoRef!.current = monaco;

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
    this.editorRef?.current?.focus();
  }

  override onDoubleClick() {
    this.editorRef?.current?.focus();
  }

  getGeometry(shape: QueryShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override onResize(shape: QueryShape, info: any) {
    return resizeBox(shape, info);
  }

  indicator(shape: QueryShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
