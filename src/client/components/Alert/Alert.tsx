import { Alert as DSAlert, Paragraph } from '@amsterdam/design-system-react';
import { ComponentChildren } from '../../../universal/types';

export interface ComponentProps {
  children?: ComponentChildren;
  title?: string;
}

export function ErrorAlert({
  children,
  title = 'Foutmelding',
}: ComponentProps) {
  return (
    <DSAlert title={title}>
      <Paragraph>{children}</Paragraph>
    </DSAlert>
  );
}
