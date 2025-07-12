import { Text } from "@mantine/core";

export const DataCell = ({ value }: { value: unknown }) => {
  try {
    const deserialised = JSON.parse(value as string);
    return <pre>{JSON.stringify(deserialised, null, 2)}</pre>;
  } catch {}

  if (typeof value === "string") {
    try {
      const url = new URL(value);
      return (
        <a href={url.href} target="_blank" rel="noopener noreferrer">
          {url.toString()}
        </a>
      );
    } catch {
      return value;
    }
  }

  if (typeof value === "number") {
    return value;
  }

  if (value === null) {
    return (
      <Text fs="italic" c="gray">
        NULL
      </Text>
    );
  }

  return "unknown shape";
};
