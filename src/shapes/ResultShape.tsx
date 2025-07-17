import { Stack, Table } from "@mantine/core";

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
import { useAtomValue } from "jotai";
import { schemaAtom } from "../state";
import {
  getInboundReferences,
  getOutboundReferences,
} from "../ResultTable/findReferences";
import { Parser } from "node-sql-parser";
import { useVirtualizedTable } from "../tools/useVirtualizedTable";
import { useRef } from "react";

type ResultShape = TLBaseShape<
  "result",
  { data: [[string, unknown]][]; w: number; h: number; query: string }
>;

export class ResultShapeUtil extends ShapeUtil<ResultShape> {
  static override type = "result" as const;

  override canResize = () => true;
  override canEdit = () => true;
  override canScroll = () => true;

  component(shape: ResultShape) {
    const isEditing = this.editor.getEditingShapeId() === shape.id;
    const schema = useAtomValue(schemaAtom);

    const headers = (shape.props.data[0] ?? []).map(([key]) => key);
    const totalRows = shape.props.data.length;
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { visibleStartIndex, visibleEndIndex, rowHeight } =
      useVirtualizedTable({
        totalRows,
        scrollContainerRef,
        data: shape.props.data,
      });

    const visibleRows = shape.props.data.slice(
      visibleStartIndex,
      visibleEndIndex,
    );
    const totalContentHeight = totalRows * rowHeight;
    const paddingTop = visibleStartIndex * rowHeight;
    const paddingBottom = (totalRows - visibleEndIndex) * rowHeight;

    const astOptions = new Parser().astify(shape.props.query);
    const ast = Array.isArray(astOptions) ? astOptions[0] : astOptions;

    if (shape.props.data.length === 0) {
      return (
        <HTMLContainer>
          <div
            style={{
              width: shape.props.w,
              height: shape.props.h,
            }}
            className="no-results"
          >
            No results
          </div>
        </HTMLContainer>
      );
    }

    const outbound: Record<string, { table: string; column: string }[]> = {};
    headers.forEach((column) => {
      outbound[column] = getInboundReferences(ast, schema.references, column);
    });

    const inbound: Record<string, { table: string; column: string }[]> = {};
    headers.forEach((column) => {
      inbound[column] = getOutboundReferences(ast, schema.references, column);
    });

    return (
      <HTMLContainer id={shape.id}>
        <div
          style={{
            width: shape.props.w,
            height: shape.props.h,
            pointerEvents: isEditing ? "all" : undefined,
            overflow: "auto",
            position: "relative",
          }}
          ref={scrollContainerRef}
        >
          <Stack
            gap="md"
            style={{ height: totalContentHeight, position: "relative" }}
          >
            <Table
              stickyHeader
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              borderColor="var(--border-base)"
              style={{
                position: "absolute",
                top: paddingTop,
                width: "100%",
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  {headers.map((header, i) => {
                    const hasInbound = inbound[header]?.length > 0;
                    const hasOutbound = outbound[header]?.length > 0;
                    const headerClasses = ["header"];

                    if (hasInbound) {
                      headerClasses.push("inbound");
                    } else if (hasOutbound) {
                      headerClasses.push("outbound");
                    }

                    return (
                      <Table.Th key={i} className={headerClasses.join(" ")}>
                        {header}
                        {hasInbound && hasOutbound && " ↕"}
                        {hasInbound && !hasOutbound && " ↑"}
                        {hasOutbound && !hasInbound && " ↓"}
                      </Table.Th>
                    );
                  })}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visibleRows.map((row, i) => {
                  const originalIndex = visibleStartIndex + i;
                  return (
                    <Table.Tr key={originalIndex}>
                      {row.map(([column, value], o) => {
                        const hasInbound = inbound[column]?.length > 0;
                        const hasOutbound = outbound[column]?.length > 0;

                        const cellClasses = ["cell"];

                        if (hasInbound) {
                          cellClasses.push("inbound");
                        } else if (hasOutbound) {
                          cellClasses.push("outbound");
                        }

                        if (i % 2 === 0) {
                          cellClasses.push("even");
                        }

                        return (
                          <Table.Td key={o} className={cellClasses.join(" ")}>
                            <DataCell
                              value={value}
                              outbound={outbound[column]}
                              inbound={inbound[column]}
                            />
                          </Table.Td>
                        );
                      })}
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
            <div style={{ height: paddingBottom }}></div>
          </Stack>
        </div>
      </HTMLContainer>
    );
  }

  getDefaultProps(): {
    data: [[string, unknown]][];
    w: number;
    h: number;
    query: string;
  } {
    return {
      data: [],
      w: 300,
      h: 500,
      query: "",
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
