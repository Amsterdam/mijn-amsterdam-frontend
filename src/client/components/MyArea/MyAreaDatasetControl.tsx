import React from 'react';
import {
  MapDataset,
  DATASET_CONTROL_ITEMS,
  DatasetControlItem,
} from './datasets';
import styled from 'styled-components';
import { Checkbox, Label } from '@datapunt/asc-ui';
import { atom, selector, useSetRecoilState, useRecoilValue } from 'recoil';

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
    if (item.datasets.some((dataset) => ids.includes(dataset.id))) {
      return {
        ...item,
        datasets: item.datasets.map((item) => {
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

export const datasetControlItemsSelector = selector({
  key: 'datasetControlItemsSelector',
  get: ({ get }) => get(datasetControlItemsAtom),
  set: ({ set, get }, newValue: any) => {
    const { ids, isActive } = newValue;
    const items = get(datasetControlItemsAtom);
    set(
      datasetControlItemsAtom,
      updateDatasetControlItem({
        items,
        ids,
        isActive,
      })
    );
  },
});

export function useDatasetControlItems(): DatasetControlItem[] {
  return useRecoilValue(datasetControlItemsSelector);
}

export type datasetItemChangeEventHandler = (
  event: React.FormEvent<HTMLInputElement>,
  payload: { ids: string[]; isActive: boolean }
) => void;

export interface MyAreaDatasetControlItemProps {
  item: MapDataset;
}

function MyAreaDatasetControlItem({ item }: MyAreaDatasetControlItemProps) {
  const updateDatasetControlItems = useSetRecoilState(
    datasetControlItemsSelector
  );
  return (
    <li>
      <Label htmlFor={item.id} label={item.title}>
        <Checkbox
          id={item.id}
          checked={item.isActive}
          onChange={(event) =>
            updateDatasetControlItems({
              ids: [item.id],
              isActive: !item.isActive,
            })
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
  items: MapDataset[];
}

export default function MyAreaDatasetControl({
  items,
}: MyAreaDatasetControlProps) {
  return (
    <UnstyledOrderedList>
      {items.map((item) => (
        <MyAreaDatasetControlItem key={item.id} item={item} />
      ))}
    </UnstyledOrderedList>
  );
}
