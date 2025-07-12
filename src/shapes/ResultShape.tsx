import { Table } from "@mantine/core";

import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  resizeBox,
  ShapeUtil,
  TLBaseShape,
} from "tldraw";
import { DataCell } from "../ResultTable/Cell";
import "./ResultShape.css";

type ResultShape = TLBaseShape<
  "result",
  { data: [[string, unknown]][]; w: number; h: number }
>;

export class ResultShapeUtil extends ShapeUtil<ResultShape> {
  static override type = "result" as const;

  override canResize = () => true;
  override canEdit = () => true;
  override canScroll = () => true;

  component(shape: ResultShape) {
    const isEditing = this.editor.getEditingShapeId() === shape.id;

    if (shape.props.data.length === 0) {
      return (
        <HTMLContainer>
          <div
            className="no-results"
            style={{ width: shape.props.w, height: shape.props.h }}
          >
            No results
          </div>
        </HTMLContainer>
      );
    }

    const headers = shape.props.data[0].map(([key]) => key);

    const copyToClipboard = (value: unknown) => {
      navigator.clipboard.writeText((value as string).toString());
    };

    return (
      <HTMLContainer id={shape.id}>
        <div
          style={{
            width: shape.props.w,
            height: shape.props.h,
            pointerEvents: isEditing ? "all" : undefined,
            overflow: "auto",
          }}
          className="ag-theme-quartz"
        >
          <Table
            stickyHeader
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
          >
            <Table.Thead>
              <Table.Tr>
                {headers.map((header, i) => (
                  <Table.Th key={i}>{header}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {shape.props.data.map((row, i) => (
                <Table.Tr key={i}>
                  {row.map(([, value], o) => (
                    <Table.Td
                      key={o}
                      onDoubleClick={() => copyToClipboard(value)}
                    >
                      <DataCell value={value} />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </HTMLContainer>
    );
  }

  getDefaultProps(): { data: [[string, unknown]][]; w: number; h: number } {
    return {
      data: [],
      w: 300,
      h: 500,
    };
  }

  getGeometry(shape: ResultShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  indicator(shape: ResultShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize(shape: ResultShape, info: any) {
    return resizeBox(shape, info);
  }
}
