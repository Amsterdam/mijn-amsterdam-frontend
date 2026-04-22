import type { ReactNode, SVGProps } from 'react';

import { Column, Heading, Icon, Row } from '@amsterdam/design-system-react';
import { useSmallScreen } from '../../hooks/media.hook.ts';

type CardProps = {
  title: string;
  icon?: (props: SVGProps<SVGSVGElement>) => ReactNode;
  children: ReactNode;
  actionRightside: ReactNode;
};

export function Card({ title, icon, children, actionRightside }: CardProps) {
  const isSmallScreen = useSmallScreen();
  const icon_ = icon && <Icon svg={icon} size={'heading-2'}></Icon>;
  return (
    <div
      className={'ams-mb-m'}
      style={{ paddingTop: '16px', borderTop: '2px solid #EEEEEE' }}
    >
      <Row gap={'large'}>
        {isSmallScreen || icon_}
        <Column style={{ width: isSmallScreen ? '' : '800px' }}>
          <Heading level={3}>{title}</Heading>
          {children}
          {isSmallScreen && actionRightside}
        </Column>
        {isSmallScreen || actionRightside}
      </Row>
    </div>
  );
}
