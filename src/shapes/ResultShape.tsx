import { Stack, Table } from "@mantine/core";
import { AST, Parser } from "node-sql-parser";

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
import { ResultToolar } from "../ResultTable/ResultToolbar";

type ResultShape = TLBaseShape<
  "result",
  { data: [[string, unknown]][]; w: number; h: number; ast: AST | AST[] }
>;

export class ResultShapeUtil extends ShapeUtil<ResultShape> {
  static override type = "result" as const;

  override canResize = () => true;
  override canEdit = () => true;
  override canScroll = () => true;

  component(shape: ResultShape) {
    const isEditing = this.editor.getEditingShapeId() === shape.id;
    const schema = useAtomValue(schemaAtom);

    const ast = Array.isArray(shape.props.ast)
      ? shape.props.ast[0]
      : shape.props.ast;

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

    const inbound: Record<string, { table: string; column: string }[]> = {};
    headers.forEach((column) => {
      inbound[column] = getInboundReferences(ast, schema.references, column);
    });

    const outbound: Record<string, { table: string; column: string }[]> = {};
    headers.forEach((column) => {
      outbound[column] = getOutboundReferences(ast, schema.references, column);
    });

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
            borderRadius: 8,
          }}
          className="ag-theme-quartz"
        >
          <ResultToolar ast={ast} count={shape.props.data.length} />
          <Stack gap="md">
            <Table
              stickyHeader
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
            >
              <Table.Thead>
                <Table.Tr>
                  {headers.map((header, i) => {
                    const hasInbound = inbound[header]?.length > 0;
                    const hasOutbound = outbound[header]?.length > 0;

                    let headerStyle = {};
                    if (hasInbound && hasOutbound) {
                      headerStyle = {
                        background:
                          "linear-gradient(45deg, #fff3cd 50%, #cce5ff 50%)",
                        fontWeight: "bold",
                      };
                    } else if (hasInbound) {
                      headerStyle = {
                        backgroundColor: "#fff3cd",
                        fontWeight: "bold",
                      };
                    } else if (hasOutbound) {
                      headerStyle = {
                        backgroundColor: "#cce5ff",
                        fontWeight: "bold",
                      };
                    }

                    return (
                      <Table.Th key={i} style={headerStyle}>
                        {header}
                        {hasInbound && hasOutbound && " ↕"}
                        {hasInbound && !hasOutbound && " ↓"}
                        {hasOutbound && !hasInbound && " ↑"}
                      </Table.Th>
                    );
                  })}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {shape.props.data.map((row, i) => (
                  <Table.Tr key={i}>
                    {row.map(([column, value], o) => {
                      const hasInbound = inbound[column]?.length > 0;
                      const hasOutbound = outbound[column]?.length > 0;

                      let cellStyle = {};
                      if (hasInbound && hasOutbound) {
                        cellStyle = {
                          background:
                            "linear-gradient(45deg, #fff3cd 50%, #cce5ff 50%)",
                          cursor: "pointer",
                        };
                      } else if (hasInbound) {
                        cellStyle = {
                          backgroundColor: "#fff3cd",
                          cursor: "pointer",
                        };
                      } else if (hasOutbound) {
                        cellStyle = {
                          backgroundColor: "#cce5ff",
                          cursor: "pointer",
                        };
                      }

                      return (
                        <Table.Td
                          key={o}
                          onDoubleClick={() => copyToClipboard(value)}
                          style={cellStyle}
                        >
                          <DataCell
                            value={value}
                            outbound={outbound[column]}
                            inbound={inbound[column]}
                          />
                        </Table.Td>
                      );
                    })}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </div>
      </HTMLContainer>
    );
  }

  getDefaultProps(): {
    data: [[string, unknown]][];
    w: number;
    h: number;
    ast: AST | AST[];
  } {
    return {
      data: [],
      w: 300,
      h: 500,
      ast: new Parser().parse("").ast,
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
