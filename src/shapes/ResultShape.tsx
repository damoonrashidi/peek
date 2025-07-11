import { AgGridReact } from "ag-grid-react";
import { useMemo, useCallback } from "react";

import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  resizeBox,
  ShapeUtil,
  TLBaseShape,
  useDelaySvgExport,
} from "tldraw";

type ResultShape<T> = TLBaseShape<
  "result",
  { data: T[]; w: number; h: number }
>;

export class ResultShapeUtil<
  T extends Record<string, unknown>,
> extends ShapeUtil<ResultShape<T>> {
  static override type = "result" as const;

  override canResize = () => true;
  override canEdit = () => true;
  override canScroll = () => true;

  component(shape: ResultShape<T>) {
    const isEditing = this.editor.getEditingShapeId() === shape.id;
    const isReady = useDelaySvgExport();

    if (shape.props.data.length === 0) {
      return <HTMLContainer>No results</HTMLContainer>;
    }

    const columnDefs = Object.keys(shape.props.data[0]).map(
      (field: keyof T) => ({
        headerName: field.toString(),
        field: field.toString().toLowerCase(),
      }),
    );

    const rowStyle = useMemo(() => {
      return { background: "#faf4ed", fontFamily: "Monaspace Krypton" };
    }, []);

    const getRowStyle = useCallback((params: any) => {
      if (params.node.rowIndex % 2 === 0) {
        return { background: "#fffaf3" };
      }
    }, []);

    return (
      <HTMLContainer id={shape.id}>
        <div
          style={{
            width: shape.props.w,
            height: shape.props.h,
            pointerEvents: isEditing ? "all" : undefined,
          }}
          className="ag-theme-quartz"
        >
          <AgGridReact
            onGridReady={isReady}
            rowData={shape.props.data}
            columnDefs={columnDefs as any}
            rowStyle={rowStyle}
            getRowStyle={getRowStyle}
            gridOptions={{
              cellSelection: true,
            }}
            autoSizeStrategy={{ type: "fitCellContents" }}
          />
        </div>
      </HTMLContainer>
    );
  }

  getDefaultProps(): { data: T[]; w: number; h: number } {
    return {
      data: [],
      w: 300,
      h: 500,
    };
  }

  getGeometry(shape: ResultShape<T>): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  indicator(shape: ResultShape<T>) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize(shape: ResultShape<T>, info: any) {
    return resizeBox(shape, info);
  }
}
