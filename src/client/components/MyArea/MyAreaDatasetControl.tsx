import { Checkbox, Label, themeSpacing } from '@amsterdam/asc-ui';
import React from 'react';
import styled from 'styled-components';
import { DatasetControl } from './datasets';
import { useActiveDatasetIds } from './MyArea.hooks';

export type datasetItemChangeEventHandler = (
  event: React.FormEvent<HTMLInputElement>,
  payload: { ids: string[]; isActive: boolean }
) => void;

export interface MyAreaDatasetControlItemProps {
  datasetControl: DatasetControl;
}

const LabelInner = styled.span`
  display: flex;
  align-items: center;
`;

function MyAreaDatasetControlItem({
  datasetControl,
}: MyAreaDatasetControlItemProps) {
  const [activeDatasetIds, setActiveDatasetIds] = useActiveDatasetIds();
  const label = (
    <LabelInner>
      {datasetControl.icon}
      {datasetControl.title}
    </LabelInner>
  ) as any;
  const isActive = activeDatasetIds.includes(datasetControl.id);
  return (
    <li>
      <Label htmlFor={datasetControl.id} label={label}>
        <Checkbox
          id={datasetControl.id}
          checked={isActive}
          onChange={() =>
            setActiveDatasetIds((datasetIds) => {
              if (isActive) {
                return datasetIds.filter((id) => id !== datasetControl.id);
              }
              return [...datasetIds, datasetControl.id];
            })
          }
        />
      </Label>
    </li>
  );
}

const DatasetControlItemList = styled('ol')`
  margin: 0;
  padding: 0 0 0 ${themeSpacing(1)};
  list-style-type: none;
`;

interface MyAreaDatasetControlProps {
  collection: DatasetControl[];
}

export default function MyAreaDatasetControl({
  collection,
}: MyAreaDatasetControlProps) {
  return (
    <DatasetControlItemList>
      {collection.map((datasetControl) => (
        <MyAreaDatasetControlItem
          key={datasetControl.id}
          datasetControl={datasetControl}
        />
      ))}
    </DatasetControlItemList>
  );
}
