import { OrderedList } from '@amsterdam/design-system-react';
import { ErfpachtCanon } from '../../../../server/services/simple-connect/erfpacht';

interface DataListCanonsProps {
  canons?: ErfpachtCanon[];
}

export function DataListCanons({ canons }: DataListCanonsProps) {
  if (!!canons?.length) {
    return (
      <OrderedList markers={false}>
        {canons?.map((canon) => {
          return (
            <OrderedList.Item key={canon.samengesteld}>
              {canon.samengesteld}
            </OrderedList.Item>
          );
        })}
      </OrderedList>
    );
  }
  return null;
}
