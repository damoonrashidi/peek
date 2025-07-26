export const toCsv = (result: [string, unknown][][]): string => {
  const rows = [];

  const headers = result[0].map(([key]) => key);

  for (const row of result) {
    rows.push(row.map(([, value]) => `"${value}"`));
  }

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
};
