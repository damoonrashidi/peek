import { useAtomValue } from "jotai";
import { workspacesAtom } from "./state";
import { Divider, Stack } from "@mantine/core";
import "./WorkspacePanel.css";
import { Workspace } from "./Workspace";

export const WorkspacePanel = () => {
  const workspaces = useAtomValue(workspacesAtom);

  return (
    <Stack gap="lg">
      {workspaces.map((workspace, i) => (
        <>
          <Workspace
            key={workspace.name}
            connections={workspace.connections}
            name={workspace.name}
          />
          {i !== workspaces.length - 1 && <Divider />}
        </>
      ))}
    </Stack>
  );
};
