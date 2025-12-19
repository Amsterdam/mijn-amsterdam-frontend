import type {
  DateSource,
  KvkResponseFrontend,
  Vestiging,
} from './hr-kvk.types';
import { defaultDateFormat, dateFormat } from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
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
      vestiging.bezoekadres && isAmsterdamAddress(vestiging.bezoekadres)
  );

  // If in the unlikely event there are no bezoekadressen, we fall back to postadres.
  // It is better to have something than nothing!
  if (!vestigingen.length) {
    vestigingen = kvkData.vestigingen.filter(
      (vestiging) =>
        vestiging.postadres && isAmsterdamAddress(vestiging.postadres)
    );
  }

  const vestigingenWithBagIds = vestigingen
    .map((vestiging) => {
      const bagIds = vestigingBagKeys
        .map((key) => vestiging[key] ?? null)
        .filter((x) => x !== null);
      return { ...vestiging, bagIds };
    })
    .flat();

  return vestigingenWithBagIds;
}

export function normalizeDatePropertyNames(
  prefix: string,
  date: Record<string, number | string | null> | null
): DateSource {
  const defaultSource = {
    datum: null,
    jaar: null,
    maand: null,
    dag: null,
  };
  if (!date) {
    return defaultSource;
  }
  return Object.assign(
    defaultSource,
    Object.fromEntries(
      Object.entries(date).map(([key, value]) => {
        return [
          key.replace(prefix, '').toLowerCase(),
          value ? value.toString() : null,
        ];
      })
    )
  ) as DateSource;
}

export function getPartialDateFormatted(dateSource?: DateSource | null) {
  if (!dateSource) {
    return null;
  }

  const { dag, maand, jaar } = dateSource;

  if (!dag && !maand && !jaar) {
    return null;
  }

  if (dateSource.datum) {
    return defaultDateFormat(dateSource.datum);
  }

  if (dag && maand && jaar) {
    return defaultDateFormat(
      `${jaar}-${maand.padStart(2, '0')}-${dag.padStart(2, '0')}`
    );
  }

  if (maand && jaar) {
    return capitalizeFirstLetter(
      dateFormat(`${jaar}-${maand.toString().padStart(2, '0')}`, 'MMMM yyyy')
    );
  }

  if (jaar && !maand) {
    return `Anno ${jaar}`;
  }

  return null;
}

export function getFullDate(date: DateSource | null): string | null {
  if (!date) {
    return null;
  }

  const { jaar, maand, dag, datum } = date;

  if (datum) {
    return datum;
  }

  // We only return a date when all parts are present.
  if (!jaar || !maand || !dag) {
    return null;
  }

  const monthPadded = maand.padStart(2, '0');
  const dayPadded = dag.padStart(2, '0');

  return `${jaar}-${monthPadded}-${dayPadded}`;
}
