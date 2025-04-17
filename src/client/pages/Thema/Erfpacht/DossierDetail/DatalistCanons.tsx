import { useState } from 'react';

import { Button, OrderedList } from '@amsterdam/design-system-react';

import { ErfpachtCanon } from '../../../../../server/services/erfpacht/erfpacht';

const MAX_CANONS_VISIBLE_INITIALLY = 2;

interface DatalistCanonsProps {
  canons?: ErfpachtCanon[];
}

export function DatalistCanons({ canons }: DatalistCanonsProps) {
  const canonLength = canons?.length ?? 0;
  const shouldCollapse = canonLength > MAX_CANONS_VISIBLE_INITIALLY;
  const [isCollapsed, setIsCollapsed] = useState(shouldCollapse);
  const displayCanons =
    (shouldCollapse && isCollapsed
      ? canons?.slice(0, MAX_CANONS_VISIBLE_INITIALLY)
      : canons) ?? [];

  if (displayCanons.length) {
    return (
      <>
        <OrderedList markers={false}>
          {displayCanons.map((canon) => {
            return (
              <OrderedList.Item key={canon.samengesteld}>
                {canon.samengesteld}
              </OrderedList.Item>
            );
          })}
        </OrderedList>
        {shouldCollapse && (
          <Button
            variant="tertiary"
            aria-expanded={!isCollapsed}
            style={{ transform: 'translateX(-1.4rem)' }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={`${isCollapsed ? 'Toon meer' : 'Verberg'} erfpachtcanons`}
          >
            {isCollapsed ? 'Toon meer' : 'Verberg'}
          </Button>
        )}
      </>
    );
  }
  return '-';
}
