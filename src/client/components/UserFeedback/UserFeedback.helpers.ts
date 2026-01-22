export function getFeedbackDetailsByTableConfig<
  Z,
  C extends Record<string, { filter?: (item: Z) => boolean; title: string }>,
>(zaken: Z[], tableConfig: C) {
  return Object.entries(tableConfig).reduce(
    (acc, [_kind, { filter, title }]) => {
      acc[title] = `${filter ? zaken.filter(filter).length : zaken.length}`;
      return acc;
    },
    {} as Record<string, string>
  );
}
