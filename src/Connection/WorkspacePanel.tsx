import { useAtomValue } from "jotai";
import { workspacesAtom } from "./state";
import { Divider, Stack } from "@mantine/core";
import "./WorkspacePanel.css";
import { Workspace } from "./Workspace";
import { Fragment } from "react/jsx-runtime";

export const WorkspacePanel = () => {
  const workspaces = useAtomValue(workspacesAtom);

  return (
    <Stack gap="lg" mah={800}>
      {workspaces.map((workspace, i) => (
        <Fragment key={workspace.name}>
          <Workspace
            connections={workspace.connections}
            name={workspace.name}
          />
          {i !== workspaces.length - 1 && <Divider />}
        </Fragment>
      ))}
    </Stack>
  );
};
