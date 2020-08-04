import React, { PropsWithChildren } from 'react';

type MyAreaCollapisblePanelProps = PropsWithChildren<{
  title: string;
}>;

export default function MyAreaCollapisblePanel({
  children,
}: MyAreaCollapisblePanelProps) {
  return <div>{children}</div>;
}
