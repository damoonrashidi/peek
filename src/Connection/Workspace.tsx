import { useAtom } from "jotai";
import { activeConnectionAtom, workspacesAtom } from "./state";
import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { ConnectionItem } from "./ConnectionItem";
import { Connection } from "./types";
import "./WorkspacePanel.css";
import { ConnectionForm } from "./ConnectionForm";
import { IconMinus } from "@tabler/icons-react";

interface WorkspaceProps {
  name: string;
  connections: Connection[];
}
export const Workspace = ({ name, connections }: WorkspaceProps) => {
  const [activeConnection, setActiveConnection] = useAtom(activeConnectionAtom);
  const [, setWorkspaces] = useAtom(workspacesAtom);

  const removeWorkspace = () => {
    setWorkspaces((prevWorkspaces) => {
      return prevWorkspaces.filter((workspace) => workspace.name !== name);
    });
  };

  const removeConnection = (connection: Connection) => {
    setWorkspaces((prevWorkspaces) => {
      const updatedWorkspaces = prevWorkspaces.map((workspace) => {
        if (workspace.name === name) {
          return {
            ...workspace,
            connections: workspace.connections.filter(
              (conn) => conn.url !== connection.url,
            ),
          };
        }
        return workspace;
      });
      return updatedWorkspaces;
    });
  };

  return (
    <Stack gap="md">
      <Group align="center" justify="space-between">
        <Text size="md" fw="bold" h={4}>
          {name}
        </Text>
        <ActionIcon variant="transparent" onClick={removeWorkspace} c="dark">
          <IconMinus />
        </ActionIcon>
      </Group>
      <Stack gap={0}>
        {connections.map((connection) => (
          <ConnectionItem
            key={connection.url}
            connection={connection}
            isActive={connection.url === activeConnection?.connection.url}
            onActivate={() =>
              setActiveConnection({ workspaceName: name, connection })
            }
            onRemove={() => {
              removeConnection(connection);
            }}
          />
        ))}
        <ConnectionForm workspaceName={name} />
      </Stack>
    </Stack>
  );
};
