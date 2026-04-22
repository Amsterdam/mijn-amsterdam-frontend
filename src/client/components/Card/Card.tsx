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
  const isLargeScreen = !isSmallScreen;

  const icon_ = icon && <Icon svg={icon} size={'heading-2'}></Icon>;
  const heading = <Heading level={3}>{title}</Heading>;
  return (
    <div
      className={'ams-mb-m'}
      style={{ paddingTop: '16px', borderTop: '2px solid #EEEEEE' }}
    >
      <Row gap={'large'}>
        {isLargeScreen && icon_}
        <Column style={{ width: isSmallScreen ? '' : '800px' }}>
          {isLargeScreen && heading}
          {isSmallScreen && (
            <Row>
              {icon_}
              {heading}
            </Row>
          )}
          {children}
          {isSmallScreen && actionRightside}
        </Column>
        {isLargeScreen && actionRightside}
      </Row>
    </div>
  );
}
