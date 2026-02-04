import { useState } from 'react';

import { Button, OrderedList } from '@amsterdam/design-system-react';

import type {
  ErfpachtCanonAfgekocht,
  ErfpachtCanonNietAfgekocht,
} from '../../../../../server/services/erfpacht/erfpacht-types';

const MAX_CANONS_VISIBLE_INITIALLY = 2;

type DatalistCanonsNietAfgekochtProps = {
  canons?: ErfpachtCanonNietAfgekocht[];
};

export function DatalistCanonsNietAfgekocht({
  canons,
}: DatalistCanonsNietAfgekochtProps) {
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

type DatalistCanonsAfgekochtProps = {
  canons?: ErfpachtCanonAfgekocht[];
};

export function DatalistCanonsAfgekocht({
  canons,
}: DatalistCanonsAfgekochtProps) {
  return (
    <>
      <OrderedList markers={false}>
        {canons?.map((canon) => {
          return (
            <OrderedList.Item key={canon.formattedCanonBedragBijAfkoop}>
              {canon.formattedCanonBedragBijAfkoop}
            </OrderedList.Item>
          );
        })}
      </OrderedList>
    </>
  );
}
