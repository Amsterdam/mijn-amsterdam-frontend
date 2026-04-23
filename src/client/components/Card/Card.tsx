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

  const titleIcon = icon && <Icon svg={icon} size={'heading-2'}></Icon>;
  const titleHeading = (
    // Make the heading text always take full space so the icon is always aligned with other items -
    // on small screens.
    <Heading level={3} style={{ width: '100%' }}>
      {title}
    </Heading>
  );

  return (
    <div
      className={'ams-mb-m'}
      style={{ paddingTop: '16px', borderTop: '2px solid #EEEEEE' }}
    >
      <Row gap={'large'}>
        {isLargeScreen && titleIcon}
        <Column
          style={{
            width: isSmallScreen
              ? ''
              : '800px' /* Make sure `actionRightside` is always aligned */,
          }}
        >
          {isLargeScreen && titleHeading}
          {isSmallScreen && (
            <Row>
              {titleHeading}
              {titleIcon}
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
