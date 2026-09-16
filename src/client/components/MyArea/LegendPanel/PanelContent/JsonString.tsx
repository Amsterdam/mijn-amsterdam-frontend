import type { JSONValue } from '../../../../../universal/types/App.types.ts';

interface JsonStringProps {
  data: JSONValue;
}

export function JsonString({ data }: JsonStringProps) {
  return <pre>{JSON.stringify(data, null, '  ')}</pre>;
}
