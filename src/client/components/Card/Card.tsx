import { Heading, Icon } from '@amsterdam/design-system-react';
import type { ReactNode, SVGProps } from 'react';

type CardProps = {
  title: string;
  icon?: (props: SVGProps<SVGSVGElement>) => ReactNode;
  children: ReactNode;
};

export function Card({ title, icon, children }: CardProps) {
  return (
    <div>
      {icon && <Icon svg={icon}></Icon>}
      <Heading level={3}>{title}</Heading>
      {children}
    </div>
  );
}
