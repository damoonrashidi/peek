import { Button } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { useAtom } from "jotai";
import { schemaAtom } from "../state";

export const ConnectionPanel = () => {
  const [, setSchema] = useAtom(schemaAtom);

  const setConnection = async () => {
    await invoke("set_connection", {
      connectionString:
        "postgres://metered_user:metered_password@localhost/forge",
    });

    const response = (await invoke("get_schema")) as string;
    const schema = JSON.parse(response);
    setSchema(schema);
  };

  return (
    <div
      style={{
        pointerEvents: "all",
      }}
    >
      <Button variant="light" onClick={setConnection}>
        Set connection
      </Button>
    </div>
  );
};
