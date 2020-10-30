import { Heading, themeColor } from '@amsterdam/asc-ui';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const SuperTitle = styled(Heading)`
  font-size: 1.6rem;
  margin: 0;
  color: ${themeColor('tint', 'level5')};
  font-weight: normal;
  margin-bottom: 1rem;
`;

const Title = styled(Heading)`
  font-size: 3rem;
  margin: 0;
  margin-bottom: 2rem;
`;

type GenericBaseProps = PropsWithChildren<{
  title?: string;
  supTitle?: string;
}>;

export default function GenericBase({
  title,
  supTitle,
  children,
}: GenericBaseProps) {
  return (
    <>
      {!!supTitle && <SuperTitle as="h4">{supTitle}</SuperTitle>}
      {!!title && <Title as="h3">{title}</Title>}
      {children}
    </>
  );
}
