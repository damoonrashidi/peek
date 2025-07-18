import { Button, Input, Modal } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { useAtom } from "jotai";
import { providerRegistrationAtom, schemaAtom } from "../state";
import { useState } from "react";

export const ConnectionPanel = () => {
  const [, setSchema] = useAtom(schemaAtom);
  const [connectionString, setConnectionString] = useState(
    "postgres://dbuser:dbpassword@localhost/nesso",
  );
  const [showModal, setShowModal] = useState(false);
  const [, setHasRegisteredProvider] = useAtom(providerRegistrationAtom);
  const setConnection = async () => {
    await invoke("set_connection", { connectionString });

    const response = (await invoke("get_schema")) as string;
    const schema = JSON.parse(response);
    setHasRegisteredProvider(false);

    setSchema(schema);
  };

  return (
    <div
      style={{
        pointerEvents: "all",
      }}
    >
      <Modal opened={showModal} onClose={() => setShowModal(false)}>
        <Input
          placeholder="Connection string"
          type="text"
          value={connectionString}
          onChange={(e) => setConnectionString(e.currentTarget.value)}
        />
        <Button
          onClick={() => {
            setConnection();
            setShowModal(false);
          }}
        >
          Save
        </Button>
      </Modal>
      <Button variant="light" onClick={() => setShowModal(true)}>
        Set connection
      </Button>
    </div>
  );
};
