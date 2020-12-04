import { Heading, themeColor } from '@amsterdam/asc-ui';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { DATASETS, getDatasetCategoryId } from '../../../../universal/config';
import JsonString from './JsonString';
import { usePhoneScreen } from '../../../hooks/media.hook';

const SuperTitle = styled(Heading)`
  font-size: 1.6rem;
  margin: 0;
  color: ${themeColor('tint', 'level5')};
  font-weight: normal;
  margin-bottom: 1rem;
`;

export const Title = styled(Heading)<{ isPhone?: boolean }>`
  font-size: ${(props) => (props.isPhone ? '2rem' : '3rem')};
  margin: 0;
  margin-bottom: 2rem;
`;

type GenericBaseProps = PropsWithChildren<{
  title?: string;
  supTitle?: string;
}>;

interface GenericContentProps {
  panelItem: any;
  datasetId: string;
}

export function GenericContent({ datasetId, panelItem }: GenericContentProps) {
  const datasetCategoryId = getDatasetCategoryId(datasetId);
  const category = datasetCategoryId ? DATASETS[datasetCategoryId] : undefined;
  const dataset = category ? category.datasets[datasetId] : undefined;
  return (
    <GenericBase
      title={dataset?.title || datasetId}
      supTitle={category?.title || datasetCategoryId || 'Unknown category'}
    >
      <JsonString data={panelItem} />
    </GenericBase>
  );
}

export default function GenericBase({
  title,
  supTitle,
  children,
}: GenericBaseProps) {
  const isPhone = usePhoneScreen();
  return (
    <>
      {!!supTitle && <SuperTitle as="h4">{supTitle}</SuperTitle>}
      {!!title && (
        <Title as="h3" isPhone={isPhone}>
          {title}
        </Title>
      )}
      {children}
    </>
  );
}
