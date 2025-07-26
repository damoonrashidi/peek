export const toJson = (
  result: [string, unknown][][],
): Record<string, unknown>[] => {
  const output = [];

  for (const row of result) {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of row) {
      obj[key] = value;
    }
    output.push(obj);
  }

  return output;
};
