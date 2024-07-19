import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-config-and-types';
import { PCVERGOEDING } from './status-line-items/pcvergoeding';
import { REGELING } from './status-line-items/regeling';
import { REGELING_PERIODIEK } from './status-line-items/regeling-periodiek';

const AV_UPCC = 'AV-UPCC';
const AV_UPCZIL = 'AV-UPCZIL';
const AV_PCVC = 'AV-PCVC';
const AV_PCVZIL = 'AV-PCVZIL';

function maybeExcludePcvcUpcc(
  aanvraag: ZorgnedAanvraagTransformed,
  allAanvragen: ZorgnedAanvraagTransformed[]
) {
  const productIdentificatie = aanvraag.productIdentificatie;

  const hasUPCZIL = allAanvragen.some(
    (aanvraag) => aanvraag.productIdentificatie === AV_UPCZIL
  );
  const hasPCVZIL = allAanvragen.some(
    (aanvraag) => aanvraag.productIdentificatie === AV_PCVZIL
  );

  //
  switch (true) {
    case productIdentificatie === AV_UPCC && hasUPCZIL:
      return false;
    case productIdentificatie === AV_PCVC && hasPCVZIL:
      return false;
  }

  return true;
}

export const hliStatusLineItemsConfig: ZorgnedStatusLineItemsConfig[] = [
  {
    productIdentificatie: [AV_UPCC, AV_UPCZIL, AV_PCVC, AV_PCVZIL],
    lineItemTransformers: PCVERGOEDING,
    filter: maybeExcludePcvcUpcc,
  },
  {
    productIdentificatie: ['AV-GOV', 'AV-OVM'],
    lineItemTransformers: REGELING,
  },
  {
    productIdentificatie: ['AV-CZM', 'AV-IIT', 'AV-KVS', 'AV-SPM', 'AV-TAOV'],
    lineItemTransformers: REGELING_PERIODIEK,
  },
];
