import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import slug from 'slugme';

import { describe, expect, it, test } from 'vitest';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import {
  RVVSloterweg,
  transformVergunningenData,
} from '../../../server/services/vergunningen/vergunningen';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import VergunningDetail from './VergunningDetail';
import { bffApi } from '../../../test-utils';
import { getRVVSloterwegLineItems } from './RvvSloterweg';

const content = transformVergunningenData(vergunningenData as any);

describe('RVV Sloterweg status line items', () => {
  const zaken: Array<{ title: string; identifier: string }> = [
    {
      identifier: 'Z/23/98798273423',
      title: 'RVV ontheffing Sloterweg (Nieuw/Verleend)',
    },
    {
      identifier: 'Z/23/98989234',
      title: 'RVV ontheffing van Vlaanderenlaan (Wijziging/Ontvangen)',
    },
    {
      identifier: 'Z/23/23423409',
      title: 'RVV ontheffing van Vlaanderenlaan (Wijziging/Ingetrokken)',
    },
    {
      identifier: 'Z/23/091823087',
      title: 'RVV ontheffing Sloterweg (Wijziging/Verleend)',
    },
    {
      identifier: 'Z/23/92222273423',
      title: 'RVV ontheffing Sloterweg (Wijziging/Verlopen)',
    },
    {
      identifier: 'Z/23/98744444423',
      title: 'RVV ontheffing Sloterweg (Nieuw/Verlopen)',
    },
    {
      identifier: 'Z/23/123123456',
      title: 'RVV ontheffing Laan van Vlaanderen (Nieuw/Ingetrokken)',
    },
    {
      identifier: 'Z/23/2003529',
      title: 'RVV ontheffing Sloterweg (Nieuw / In behandeling)',
    },
    {
      identifier: 'Z/23/2003533',
      title: 'RVV ontheffing Sloterweg West (Nieuw vervallen)',
    },
    {
      identifier: 'Z/23/2003534',
      title: 'RVV ontheffing Sloterweg West (Wijziging / ontvangen)',
    },
    {
      identifier: 'Z/23/2003388',
      title: 'RVV ontheffing Sloterweg West (Nieuw in behandeling)',
    },
    {
      identifier: 'Z/23/123123123',
      title: 'RVV ontheffing Sloterweg West (Wijziging ingetrokken)',
    },
    {
      identifier: 'Z/23/789076676',
      title: 'RVV ontheffing Sloterweg West (Wijziging Verleend / ingetrokken)',
    },
    {
      identifier: 'Z/23/2230346',
      title: 'RVV ontheffing Laan van Vlaanderen',
    },
    {
      identifier: 'Z/23/2230349',
      title: 'RVV ontheffing Sloterweg (Verleend)',
    },
    {
      identifier: 'Z/23/999999999',
      title: 'RVV ontheffing Laan van Vlaanderen (AAYYAA) (Verleend)',
    },
  ];

  for (const zaak of zaken) {
    test(`${zaak.title}`, () => {
      const vergunning = vergunningenData.content.find(
        (vergunning) => vergunning.identifier === zaak.identifier
      );
      expect(
        getRVVSloterwegLineItems(vergunning as unknown as RVVSloterweg)
      ).toMatchSnapshot();
    });
  }
});
