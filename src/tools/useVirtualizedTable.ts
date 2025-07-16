import { useState, useEffect, useCallback, RefObject } from "react";

const ESTIMATED_ROW_HEIGHT = 40;
const VISIBLE_ROWS_BUFFER = 5;

interface UseVirtualizedTableProps {
  totalRows: number;
  scrollContainerRef: RefObject<HTMLDivElement>;
  data: [[string, unknown]][];
}

export const useVirtualizedTable = ({
  totalRows,
  scrollContainerRef,
  data,
}: UseVirtualizedTableProps) => {
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(0);
  const [rowHeight, setRowHeight] = useState(ESTIMATED_ROW_HEIGHT);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, clientHeight } = scrollContainerRef.current;

      const newStartIndex = Math.max(
        0,
        Math.floor(scrollTop / rowHeight) - VISIBLE_ROWS_BUFFER,
      );
      const numVisibleRows =
        Math.ceil(clientHeight / rowHeight) + 2 * VISIBLE_ROWS_BUFFER;
      const newEndIndex = Math.min(totalRows, newStartIndex + numVisibleRows);

      if (
        newStartIndex !== visibleStartIndex ||
        newEndIndex !== visibleEndIndex
      ) {
        setVisibleStartIndex(newStartIndex);
        setVisibleEndIndex(newEndIndex);
      }
    }
  }, [
    rowHeight,
    totalRows,
    visibleStartIndex,
    visibleEndIndex,
    scrollContainerRef,
  ]);

  useEffect(() => {
    if (scrollContainerRef.current && totalRows > 0 && data.length > 0) {
      const tempRow = document.createElement("tr");
      tempRow.innerHTML = data[0]
        .map(([, value]) => `<td>${value}</td>`)
        .join("");
      const tempTable = document.createElement("table");
      const tempTbody = document.createElement("tbody");
      tempTbody.appendChild(tempRow);
      tempTable.appendChild(tempTbody);
      tempTable.style.position = "absolute";
      tempTable.style.visibility = "hidden";
      document.body.appendChild(tempTable);

      const measuredHeight = tempRow.offsetHeight;
      if (measuredHeight > 0 && measuredHeight !== rowHeight) {
        setRowHeight(measuredHeight);
      }
      document.body.removeChild(tempTable);
    }
  }, [data, rowHeight, totalRows, scrollContainerRef]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      handleScroll();
      scrollContainerRef.current.addEventListener("scroll", handleScroll);
      return () => {
        scrollContainerRef.current?.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll, scrollContainerRef]);

  return { visibleStartIndex, visibleEndIndex, rowHeight };
};
