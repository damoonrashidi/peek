import { Button, Input, Modal } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { useAtom } from "jotai";
import { schemaAtom } from "../state";
import { useState } from "react";

export const ConnectionPanel = () => {
  const [, setSchema] = useAtom(schemaAtom);
  const [connectionString, setConnectionString] = useState(
    "postgres://dbuser:dbpassword@localhost/nesso",
  );
  const [showModal, setShowModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const setConnection = async () => {
    setIsConnecting(true);

    try {
      await invoke("set_connection", { connectionString });

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
        opened={showModal}
        onClose={() => setShowModal(false)}
        title="Database Connection"
      >
        <Input
          placeholder="Connection string"
          type="text"
          value={connectionString}
          onChange={(e) => setConnectionString(e.currentTarget.value)}
          disabled={isConnecting}
        />
        <Button
          onClick={setConnection}
          loading={isConnecting}
          fullWidth
          mt="md"
        >
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
      </Modal>
      <Button variant="light" onClick={() => setShowModal(true)}>
        Set connection
      </Button>
    </div>
  );
};
