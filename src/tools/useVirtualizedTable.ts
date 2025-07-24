import {
  useState,
  useLayoutEffect,
  useCallback,
  RefObject,
  useRef,
} from "react";

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
  const [visibleRange, setVisibleRange] = useState(() => ({
    start: 0,
    end: 0,
  }));

  const [rowHeight, setRowHeight] = useState(ESTIMATED_ROW_HEIGHT);
  const rowHeightRef = useRef(ESTIMATED_ROW_HEIGHT);

  const updateVisibleRange = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, clientHeight } = container;

    const currentRowHeight = rowHeightRef.current;
    const newStart = Math.max(
      0,
      Math.floor(scrollTop / currentRowHeight) - VISIBLE_ROWS_BUFFER,
    );
    const numVisibleRows =
      Math.ceil(clientHeight / currentRowHeight) + 2 * VISIBLE_ROWS_BUFFER;
    const newEnd = Math.min(totalRows, newStart + numVisibleRows);

    setVisibleRange((prev) => {
      if (prev.start === newStart && prev.end === newEnd) return prev;
      return { start: newStart, end: newEnd };
    });
  }, [scrollContainerRef, totalRows]);

  // Use layout effect to ensure DOM is measured before paint
  useLayoutEffect(() => {
    if (scrollContainerRef.current && data.length > 0) {
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

      const measured = tempRow.offsetHeight;
      document.body.removeChild(tempTable);

      if (measured > 0 && measured !== rowHeightRef.current) {
        rowHeightRef.current = measured;
        setRowHeight(measured);
      }
    }
  }, [data]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateVisibleRange();
    container.addEventListener("scroll", updateVisibleRange);
    return () => container.removeEventListener("scroll", updateVisibleRange);
  }, [scrollContainerRef, updateVisibleRange]);

  return {
    visibleStartIndex: visibleRange.start,
    visibleEndIndex: visibleRange.end,
    rowHeight,
  };
};
