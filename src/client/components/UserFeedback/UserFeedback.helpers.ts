export function getFeedbackDetailsByTableConfig(
  zaken: any[],
  tableConfig: any
) {
  return Object.entries(tableConfig).reduce(
    (acc, [kind, { filter, title }]) => {
      acc[title] = `${filter ? zaken.filter(filter).length : zaken.length}`;
      return acc;
    },
    {} as Record<string, string>
  );
}
