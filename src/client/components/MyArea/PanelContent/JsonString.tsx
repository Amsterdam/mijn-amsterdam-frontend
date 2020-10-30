import React from 'react';

interface JsonStringProps {
  data: any;
}

export default function JsonString({ data }: JsonStringProps) {
  return <pre>{JSON.stringify(data, null, '  ')}</pre>;
}
