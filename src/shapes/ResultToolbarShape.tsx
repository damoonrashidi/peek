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
import { ResultToolbar } from "../ResultTable/ResultToolbar";

type ResultToolbarShape = TLBaseShape<
  "result-toolbar",
  { query: string; count: number; w: number; h: number }
>;

export class ResultToolbarShapeUtil extends ShapeUtil<ResultToolbarShape> {
  static override type = "result-toolbar" as const;

  override canEdit = () => true;
  override canResize = () => true;

  getDefaultProps(): ResultToolbarShape["props"] {
    return { query: "", count: 0, w: 350, h: 240 };
  }

  component(shape: ResultToolbarShape) {
    const isEditing = this.editor.getEditingShapeId() === shape.id;

    return (
      <HTMLContainer
        id={shape.id}
        onPointerDown={isEditing ? stopEventPropagation : undefined}
      >
        <ResultToolbar count={shape.props.count} query={shape.props.query} />
      </HTMLContainer>
    );
  }

  getGeometry(shape: ResultToolbarShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  indicator(shape: ResultToolbarShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize(shape: ResultToolbarShape, info: any) {
    return resizeBox(shape, info);
  }
}
