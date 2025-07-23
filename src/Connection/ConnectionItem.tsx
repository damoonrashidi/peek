import { ActionIcon, Group, Menu, Text } from "@mantine/core";
import { IconCheck, IconDotsVertical } from "@tabler/icons-react";
import { Connection } from "./types";
import "./WorkspacePanel";

interface ConnectionItemProps {
  isActive: boolean;
  connection: Connection;
  onActivate: () => void;
  onRemove: () => void;
}

export const ConnectionItem = ({
  isActive,
  connection,
  onActivate,
  onRemove,
}: ConnectionItemProps) => {
  const redactedUrl = connection.url.replace(
    /(postgres:\/\/[^:]+:)[^@]+(@)/,
    "$1*****$2",
  );

  const truncatedUrl =
    redactedUrl.length > 42 ? redactedUrl.slice(0, 40) + "..." : redactedUrl;

  return (
    <div onClick={onActivate} className="connection" data-is-active={isActive}>
      <Group align="center" justify="space-between" h={30}>
        <Group align="center">
          <div
            className="color"
            style={{ backgroundColor: connection.color }}
          ></div>
          <Text size="xs" fw="bold" c={isActive ? "#2B60DB" : "dark"}>
            {connection.name}
          </Text>
          <Text size="xs" c={isActive ? "#535353" : "#737373"}>
            {truncatedUrl}
          </Text>
        </Group>
        {isActive ? (
          <IconCheck color="#2B60DB" />
        ) : (
          <Menu>
            <Menu.Target>
              <ActionIcon
                variant="transparent"
                size="sm"
                c="dark"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <IconDotsVertical />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                Remove connection
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </div>
  );
};
