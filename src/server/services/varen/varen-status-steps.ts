import { Varen } from './config-and-types';
import {
  defaultDateFormat,
  isDateInPast,
} from '../../../universal/helpers/date';
import { StatusLineItem } from '../../../universal/types';

export function getStatusSteps(decosZaak: Varen) {
  const isAfgehandeld = decosZaak.processed;

  const dateInBehandeling = decosZaak.dateRequest;
  const hasDateInBehandeling = !!dateInBehandeling;

  const hasTermijnen = decosZaak.termijnDates.length > 0;

  const steps: StatusLineItem[] = [
    {
      status: 'Ontvangen',
      datePublished: decosZaak.dateRequest,
      description: '',
      isActive: !hasDateInBehandeling,
      isChecked: true,
    },
    {
      status: 'In behandeling',
      datePublished: dateInBehandeling || '',
      description: '',
      isActive: hasDateInBehandeling && !hasTermijnen,
      isChecked: hasDateInBehandeling || hasTermijnen,
    },
    ...decosZaak.termijnDates.flatMap((termijn, index, termijnen) => {
      const isLastTermijn = index === termijnen.length - 1;
      const isTermijnActive =
        !isAfgehandeld &&
        isLastTermijn &&
        isDateInPast(termijn.dateStart) &&
        !isDateInPast(termijn.dateEnd);

      const meerInformatieNodig = {
        status: 'Meer informatie nodig',
        datePublished: termijn.dateStart || '',
        description: isTermijnActive
          ? `Er is meer informatie nodig om uw aanvraag verder te kunnen verwerken. Lever deze informatie aan voor ${defaultDateFormat(termijn.dateEnd)}`
          : '',
        isActive: isTermijnActive,
        isChecked: !isLastTermijn || isDateInPast(termijn.dateEnd),
      };

      if (isTermijnActive) {
        return [meerInformatieNodig];
      }

      const nextTermijnDateStart =
        termijnen.at(index + 1)?.dateStart ?? termijn.dateEnd;
      const inBehandeling = {
        status: 'In behandeling',
        datePublished: isDateInPast(termijn.dateEnd, nextTermijnDateStart)
          ? termijn.dateEnd
          : nextTermijnDateStart, // Technically termijn dateRanges can overlap. To minimize confusion the earlier date is taken
        description: '',
        isActive: isDateInPast(termijn.dateEnd) && isLastTermijn,
        isChecked: !isLastTermijn,
      };

      return [meerInformatieNodig, inBehandeling];
    }),
    {
      status: 'Besluit',
      datePublished: decosZaak.dateDecision || '',
      isActive: false,
      isChecked: isAfgehandeld,
    },
  ].map((step, i) => ({
    ...step,
    id: `step-${i}`,
    isActive: step.isActive && !isAfgehandeld,
    isChecked: step.isChecked || isAfgehandeld,
  }));

  return steps;
}
