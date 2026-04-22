import type { ReactNode, SVGProps } from 'react';

import { Column, Heading, Icon, Row } from '@amsterdam/design-system-react';

type CardProps = {
  title: string;
  icon?: (props: SVGProps<SVGSVGElement>) => ReactNode;
  children: ReactNode;
  actionRightside: ReactNode;
};

export function Card({ title, icon, children, actionRightside }: CardProps) {
  return (
    <Row>
      {icon && <Icon svg={icon} size={'heading-2'}></Icon>}
      <Column>
        <Heading level={3}>{title}</Heading>
        {children}
      </Column>
      {actionRightside}
    </Row>
  );
}
