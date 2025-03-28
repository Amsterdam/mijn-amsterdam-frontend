import { Varen } from './config-and-types';
import {
  defaultDateFormat,
  isDateInPast,
} from '../../../universal/helpers/date';
import { StatusLineItem } from '../../../universal/types';

export function getStatusSteps<T extends Varen>(
  decosZaak: T
): StatusLineItem<T['status']>[] {
  const isAfgehandeld = decosZaak.processed;

  const hasTermijnen = decosZaak.termijnDates.length > 0;

  const steps = [
    {
      status: 'Ontvangen' as const,
      datePublished: decosZaak.dateRequest,
      description: '',
      isChecked: true,
    },
    {
      status: 'In behandeling' as const,
      // Varen zaken are immediateley in behandeling
      datePublished: decosZaak.dateRequest,
      description: '',
      isChecked: hasTermijnen,
    },
    ...decosZaak.termijnDates.flatMap((termijn, index, termijnen) => {
      const isLastTermijn = index === termijnen.length - 1;
      const isTermijnActive =
        !isAfgehandeld &&
        isLastTermijn &&
        isDateInPast(termijn.dateStart) &&
        !isDateInPast(termijn.dateEnd);

      const meerInformatieNodig = {
        status: 'Meer informatie nodig' as const,
        datePublished: termijn.dateStart || '',
        description: isTermijnActive
          ? `Er is meer informatie nodig om uw aanvraag verder te kunnen verwerken. Lever deze informatie aan voor ${defaultDateFormat(termijn.dateEnd)}`
          : '',
        actionButtonItems:
          isTermijnActive && decosZaak.linkDataRequest
            ? [
                {
                  to: decosZaak.linkDataRequest,
                  title: 'Documenten nasturen',
                },
              ]
            : [],
        isChecked: !isLastTermijn || isDateInPast(termijn.dateEnd),
      };

      if (isTermijnActive) {
        return [meerInformatieNodig];
      }

      const nextTermijnDateStart =
        termijnen.at(index + 1)?.dateStart ?? termijn.dateEnd;
      const inBehandeling = {
        status: 'In behandeling' as const,
        datePublished: isDateInPast(termijn.dateEnd, nextTermijnDateStart)
          ? termijn.dateEnd
          : nextTermijnDateStart, // Technically termijn dateRanges can overlap. To minimize confusion the earlier date is taken
        description: '',
        isChecked: !isLastTermijn,
      };

      return [meerInformatieNodig, inBehandeling];
    }),
    {
      status: 'Afgehandeld' as const,
      datePublished: decosZaak.dateDecision || '',
      isChecked: isAfgehandeld,
    },
  ] satisfies Partial<StatusLineItem>[];

  const lastIndexOfCheckedStep = steps.findLastIndex((step) => step.isChecked);
  return steps.map((step, stepIndex) => {
    const isStepLastAndChecked =
      step.isChecked && stepIndex === steps.length - 1;
    return {
      ...step,
      id: `step-${stepIndex}`,
      isChecked: stepIndex <= lastIndexOfCheckedStep,
      isActive:
        stepIndex === lastIndexOfCheckedStep + 1 || isStepLastAndChecked,
    };
  });
}
