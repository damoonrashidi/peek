import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  resizeBox,
  ShapeUtil,
  TLBaseShape,
} from "tldraw";
import "./ErrorShape.css";

type QueryErrorShape = TLBaseShape<
  "query-error",
  { message: string; w: number; h: number }
>;

export class QueryErrorShapeUtil extends ShapeUtil<QueryErrorShape> {
  static override type = "query-error" as const;

  override canResize = () => true;
  override canEdit = () => true;
  override canScroll = () => true;

  component(shape: QueryErrorShape) {
    return (
      <HTMLContainer id={shape.id}>
        <div className="error-shape">{shape.props.message}</div>
      </HTMLContainer>
    );
  }

  getDefaultProps(): {
    message: string;
    w: number;
    h: number;
  } {
    return { message: "", w: 300, h: 80 };
  }

  getGeometry(shape: QueryErrorShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  indicator(shape: QueryErrorShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize(shape: QueryErrorShape, info: any) {
    return resizeBox(shape, info);
  }
}
