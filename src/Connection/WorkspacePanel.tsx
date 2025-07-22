import { useAtom } from "jotai";
import { activeConnectionAtom, workspacesAtom } from "./state";
import { ActionIcon, Button, Group, Stack, Text } from "@mantine/core";
import { IconCheck, IconFolder, IconTrash } from "@tabler/icons-react";
import "./WorkspacePanel.css";
import { Connection } from "./types";

export const WorkspacePanel = () => {
  const [workspaces, setWorkspaces] = useAtom(workspacesAtom);
  const [activeConnection, setActiveConnection] = useAtom(activeConnectionAtom);

  const addConnection = (workspaceName: string, connection: Connection) => {
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.name === workspaceName
          ? {
              ...workspace,
              connections: [...workspace.connections, connection],
            }
          : workspace,
      ),
    );
  };

  const removeConnection = (workspaceName: string, url: string) => {
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.name === workspaceName
          ? {
              ...workspace,
              connections: workspace.connections.filter(
                (connection) => connection.url !== url,
              ),
            }
          : workspace,
      ),
    );
  };

  const addWorkspace = (workspaceName: string) => {
    setWorkspaces((prevWorkspaces) => [
      ...prevWorkspaces,
      { name: workspaceName, connections: [] },
    ]);
  };

  const removeWorkspace = (workspaceName: string) => {
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.filter((workspace) => workspace.name !== workspaceName),
    );
  };

  return (
    <div>
      {workspaces.map((workspace) => (
        <div key={workspace.name} className="workspace">
          <Stack w="100%">
            <Group
              justify="space-between"
              align="center"
              w="100%"
              flex="1 auto"
            >
              <Group align="center" justify="stretch">
                <IconFolder />
                <Text fw="bold" size="s">
                  {workspace.name}
                </Text>
                <ActionIcon variant="subtle">
                  <IconTrash size={20} color="#f00" />
                </ActionIcon>
              </Group>
            </Group>
            <div>
              {workspace.connections.map((connection) => (
                <div
                  className={`connection ${connection.url === activeConnection?.connection.url ? "active" : ""}`}
                  key={connection.url}
                  onClick={() =>
                    setActiveConnection({
                      connection,
                      workspaceName: workspace.name,
                    })
                  }
                >
                  <Group align="start">
                    {activeConnection?.connection.url === connection.url ? (
                      <IconCheck />
                    ) : (
                      <div style={{ width: 24 }} />
                    )}
                    <Stack>
                      <Text size="xs" fw="bold">
                        {connection.name}
                      </Text>
                      <Text size="xs">{connection.url}</Text>
                    </Stack>
                  </Group>
                </div>
              ))}
              <Button
                variant="subtle"
                onClick={() => {
                  addConnection(workspace.name, {
                    name: "Test connection",
                    url: "postgres://dbuser:dbpassword@localhost:5431/nesso",
                  });
                }}
              >
                Add Connection
              </Button>
            </div>
          </Stack>
        </div>
      ))}
    </div>
  );
};
