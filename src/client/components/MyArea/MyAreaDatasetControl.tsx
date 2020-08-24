import { Checkbox, Label } from '@datapunt/asc-ui';
import React from 'react';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import {
  DatasetControlItem,
  DATASET_CONTROL_ITEMS,
  DatasetControl,
} from './datasets';

export const datasetControlItemsAtom = atom({
  key: 'datasetControlItems',
  default: DATASET_CONTROL_ITEMS,
});

interface updateDatasetControlItemProps {
  items: DatasetControlItem[];
  ids: string[];
  isActive: boolean;
}

function updateDatasetControlItem({
  items,
  ids,
  isActive,
}: updateDatasetControlItemProps) {
  return items.map((item) => {
    if (item.collection.some((dataset) => ids.includes(dataset.id))) {
      return {
        ...item,
        collection: item.collection.map((item) => {
          if (ids.includes(item.id)) {
            return {
              ...item,
              isActive,
            };
          }
          return item;
        }),
      };
    }
    return item;
  });
}

export function useDatasetControlItems(): DatasetControlItem[] {
  return useRecoilValue(datasetControlItemsAtom);
}

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
  const updateDatasetControlItems = useSetRecoilState(datasetControlItemsAtom);
  const items = useDatasetControlItems();

  const label = (
    <LabelInner>
      {datasetControl.icon}
      {datasetControl.title}
    </LabelInner>
  ) as any;
  return (
    <li>
      <Label htmlFor={datasetControl.id} label={label}>
        <Checkbox
          id={datasetControl.id}
          checked={datasetControl.isActive}
          onChange={(event) =>
            updateDatasetControlItems(
              updateDatasetControlItem({
                items,
                ids: [datasetControl.id],
                isActive: !datasetControl.isActive,
              })
            )
          }
        />
      </Label>
    </li>
  );
}

const UnstyledOrderedList = styled('ol')`
  margin: 0;
  padding: 0;
  list-style-type: none;
`;

interface MyAreaDatasetControlProps {
  collection: DatasetControl[];
}

export default function MyAreaDatasetControl({
  collection,
}: MyAreaDatasetControlProps) {
  return (
    <UnstyledOrderedList>
      {collection.map((datasetControl) => (
        <MyAreaDatasetControlItem
          key={datasetControl.id}
          datasetControl={datasetControl}
        />
      ))}
    </UnstyledOrderedList>
  );
}
