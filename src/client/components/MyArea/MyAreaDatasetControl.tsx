import { Checkbox, Label, themeSpacing } from '@datapunt/asc-ui';
import React, { useCallback } from 'react';
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

export function useDatasetControlItems(): DatasetControlItem[] {
  return useRecoilValue(datasetControlItemsAtom);
}

export function useUpdateDatasetControlItems() {
  const updateDatasetControlItems = useSetRecoilState(datasetControlItemsAtom);
  const items = useDatasetControlItems();

  return useCallback(
    (ids: string[], isActive: boolean) => {
      const updatedItems = items.map((item) => {
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
      updateDatasetControlItems(updatedItems);
    },
    [items, updateDatasetControlItems]
  );
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
  const updateDatasetControlItems = useUpdateDatasetControlItems();
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
              [datasetControl.id],
              !datasetControl.isActive
            )
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
