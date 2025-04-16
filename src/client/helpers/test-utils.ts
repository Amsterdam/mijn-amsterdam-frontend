import { RenderResult, within } from '@testing-library/react';

export function getTable(
  screen: RenderResult,
  tableHeaderName: string
): HTMLElement {
  const tableHeaders = screen.getByRole('heading', {
    name: tableHeaderName,
  });
  const table = within(tableHeaders.parentElement!).getByRole('table');
  return table;
}

export function expectHeaders(table: HTMLElement, matchHeaders: string[]) {
  const columnHeaders = within(table).getAllByRole('columnheader');
  expect(columnHeaders.map((header) => header.textContent)).toMatchObject(
    matchHeaders
  );
}

export function expectTableHeaders(
  screen: RenderResult,
  tableHeaderName: string,
  matchHeaders: string[]
) {
  const table = getTable(screen, tableHeaderName);
  expectHeaders(table, matchHeaders);
}
