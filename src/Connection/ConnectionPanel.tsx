import { Button, Modal } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { useAtom, useAtomValue } from "jotai";
import { schemaAtom } from "../state";
import { useEffect, useState } from "react";
import { WorkspacePanel } from "./WorkspacePanel";
import { activeConnectionAtom } from "./state";

export const ConnectionPanel = () => {
  const [, setSchema] = useAtom(schemaAtom);
  const [showModal, setShowModal] = useState(false);
  const [, setIsConnecting] = useState(false);
  const activeConnection = useAtomValue(activeConnectionAtom);

  const fetchSchema = async () => {
    const response = (await invoke("get_schema")) as string;
    return JSON.parse(response);
  };

  useEffect(() => {
    if (activeConnection) {
      setConnection(activeConnection.connection.url);
    }
    fetchSchema().then(setSchema);
  }, [activeConnection]);

  const setConnection = async (url: string) => {
    setIsConnecting(true);

    try {
      await invoke("set_connection", { connectionString: url });

      const response = (await invoke("get_schema")) as string;
      const schema = JSON.parse(response);

      setSchema(schema);
      setShowModal(false);
    } catch {
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      style={{
        pointerEvents: "all",
      }}
    >
      <Modal
        size="lg"
        w={900}
        opened={showModal}
        onClose={() => setShowModal(false)}
        title="Workspaces"
      >
        <WorkspacePanel />
      </Modal>
      {activeConnection ? (
        <Button variant="light" onClick={() => setShowModal(true)}>
          {activeConnection.workspaceName} - {activeConnection.connection.name}
        </Button>
      ) : (
        <Button onClick={() => setShowModal(true)}>Set connection</Button>
      )}
    </div>
  );
};
