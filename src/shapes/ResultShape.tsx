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

    const astOptions = new Parser().astify(shape.props.query);
    console.log(astOptions);
    const ast = Array.isArray(astOptions) ? astOptions[0] : astOptions;

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
          }}
          className="ag-theme-quartz"
        >
          <Stack gap="md">
            <Table
              stickyHeader
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              borderColor="var(--border-base)"
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
                {shape.props.data.map((row, i) => (
                  <Table.Tr key={i}>
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
                        <Table.Td
                          key={o}
                          onDoubleClick={() => copyToClipboard(value)}
                          className={cellClasses.join(" ")}
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
