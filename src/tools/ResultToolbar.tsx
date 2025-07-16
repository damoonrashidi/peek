import { IconChartBar } from "@tabler/icons-react";

import {
  Box,
  TldrawUiButton,
  TldrawUiContextualToolbar,
  useEditor,
} from "tldraw";
import { ResultShapeUtil } from "../shapes/ResultShape";
import { Divider, Group, Text } from "@mantine/core";
import { Parser } from "node-sql-parser";
import { useCreateChart } from "./useCreateChart";

export const ResultContextualToolbarComponent = () => {
  const editor = useEditor();
  const shape = editor.getOnlySelectedShape()!;
  const createChart = useCreateChart(shape);

  const props = shape.props as ReturnType<ResultShapeUtil["getDefaultProps"]>;

  const canChart =
    props.data.length > 0 &&
    props.data[0].find(([, value]) => typeof value === "number");

  const tables = new Parser()
    .tableList(props.query)
    .map((table) => table.split("::").pop());

  const getSelectionBounds = () => {
    const fullBounds = editor.getSelectionRotatedScreenBounds();
    if (!fullBounds) {
      return undefined;
    }
    return new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0);
  };

  const runCreateChart = () => {
    createChart();
  };

  return (
    <TldrawUiContextualToolbar
      getSelectionBounds={getSelectionBounds}
      label="Actions"
    >
      <Group>
        <Group pl="lg" py={0} h="100%">
          {tables.map((table) => (
            <Text key={table} size="xs">
              {table}
            </Text>
          ))}
        </Group>
        <Divider variant="solid" orientation="vertical" />
        <Group py={0} h="100%">
          <Text size="xs">{props.data.length} Rows</Text>
        </Group>
        <Divider variant="solid" orientation="vertical" />
        <TldrawUiButton
          title="Graph"
          type="normal"
          onClick={runCreateChart}
          disabled={!canChart}
        >
          <IconChartBar size={20} />
          Chart
        </TldrawUiButton>
      </Group>
    </TldrawUiContextualToolbar>
  );
};
