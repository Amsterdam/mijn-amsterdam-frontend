import type { KvkResponseFrontend, Vestiging } from './hr-kvk.types';
import { isAmsterdamAddress } from '../buurt/helpers';

export type KvkBagIds = Pick<
  Vestiging,
  | 'postHeeftBagNummeraanduidingId'
  | 'postHeeftBagLigplaatsId'
  | 'postHeeftBagStandplaatsId'
  | 'bezoekHeeftBagNummeraanduidingId'
  | 'bezoekHeeftBagLigplaatsId'
  | 'bezoekHeeftBagStandplaatsId'
>;

const vestigingBagKeys = [
  'postHeeftBagNummeraanduidingId',
  'postHeeftBagLigplaatsId',
  'postHeeftBagStandplaatsId',
  'bezoekHeeftBagNummeraanduidingId',
  'bezoekHeeftBagLigplaatsId',
  'bezoekHeeftBagStandplaatsId',
] as (keyof KvkBagIds)[];

type VestigingWithBagIds = Vestiging & { bagIds: string[] };

export function getVestigingBagIds(
  kvkData: KvkResponseFrontend | null
): VestigingWithBagIds[] {
  let vestigingen: Vestiging[] = [];

  if (!kvkData?.vestigingen?.length) {
    return [];
  }

  vestigingen = kvkData.vestigingen.filter(
    (vestiging) =>
      !!vestiging.bezoekadres && isAmsterdamAddress(vestiging.bezoekadres)
  );

  if (!vestigingen.length) {
    vestigingen = kvkData.vestigingen.filter(
      (vestiging) =>
        !!vestiging.postadres && isAmsterdamAddress(vestiging.postadres)
    );
  }

  const vestigingenWithBagIds = vestigingen
    .filter((vestiging) => vestiging.bezoekadres || vestiging.postadres)
    .map((vestiging) => {
      const bagIds = vestigingBagKeys
        .map((key) => vestiging[key] ?? null)
        .filter((x) => x !== null);
      return { ...vestiging, bagIds };
    })
    .flat();

  return vestigingenWithBagIds;
}
