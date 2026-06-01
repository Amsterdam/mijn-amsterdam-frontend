interface JsonStringProps {
  data: any;
}

export function JsonString({ data }: JsonStringProps) {
  return <pre>{JSON.stringify(data, null, '  ')}</pre>;
}
