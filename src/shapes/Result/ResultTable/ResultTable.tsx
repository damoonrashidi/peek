import { Paper, Stack, Table, Text } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useRef, useMemo } from "react";
import { HTMLContainer, useEditor } from "tldraw";
import { schemaAtom } from "../../../state";
import { useVirtualizedTable } from "../../../tools/useVirtualizedTable";
import { ResultShape } from "../ResultShape";
import { DataCell } from "./Cell";
import { getInboundReferences, getOutboundReferences } from "./findReferences";
import { Parser } from "node-sql-parser";

export const ResultTable = ({ shape }: { shape: ResultShape }) => {
  const editor = useEditor();
  const isEditing = editor.getEditingShapeId() === shape.id;
  const schema = useAtomValue(schemaAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const headers = (shape.props.data[0] ?? []).map(([key]) => key);
  const totalRows = shape.props.data.length;

  const { visibleStartIndex, visibleEndIndex, rowHeight } = useVirtualizedTable(
    {
      totalRows,
      scrollContainerRef,
      data: shape.props.data,
    },
  );

  const visibleRows = shape.props.data.slice(
    visibleStartIndex,
    visibleEndIndex,
  );
  const totalContentHeight = totalRows * rowHeight;
  const paddingTop = visibleStartIndex * rowHeight;
  const paddingBottom = (totalRows - visibleEndIndex) * rowHeight;

  const ast = useMemo(() => {
    const astOptions = new Parser().astify(shape.props.query);
    return Array.isArray(astOptions) ? astOptions[0] : astOptions;
  }, [shape.props.query]);

  const { outbound, inbound } = useMemo(() => {
    const outbound: Record<string, { table: string; column: string }[]> = {};
    const inbound: Record<string, { table: string; column: string }[]> = {};
    headers.forEach((column) => {
      outbound[column] = getInboundReferences(ast, schema.references, column);
      inbound[column] = getOutboundReferences(ast, schema.references, column);
    });

    return { outbound, inbound };
  }, [headers, ast, schema.references]);

  if (shape.props.data.length === 0) {
    return (
      <HTMLContainer>
        <Paper shadow="md" color="blue" c="blue">
          <div
            style={{
              width: shape.props.w,
              height: shape.props.h,
            }}
            className="no-results"
          >
            No results
          </div>
        </Paper>
      </HTMLContainer>
    );
  }

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
            withColumnBorders
            borderColor="var(--border-base)"
            style={{
              position: "absolute",
              top: paddingTop,
              width: "100%",
            }}
          >
            <Table.Thead>
              <Table.Tr className="header-row">
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
                      <Text fw="bold" c="gray">
                        {header}
                        {hasInbound && hasOutbound && " ↕"}
                        {hasInbound && !hasOutbound && " ↑"}
                        {hasOutbound && !hasInbound && " ↓"}
                      </Text>
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
};
