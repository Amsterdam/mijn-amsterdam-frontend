import {
  BBVergunningFrontend,
  documentNamesMA,
} from './bed-and-breakfast-types';
import { StatusLineItem } from '../../../../universal/types/App.types';

export function getStatusSteps<T extends BBVergunningFrontend>(
  zaak: T
): StatusLineItem[] {
  const getStatusDate = (status: string) =>
    zaak.statusDates?.find((sd) => sd.status === status)?.datePublished ?? null;

  const datumInBehandeling = getStatusDate('In behandeling') ?? '';
  const dateDecision: string =
    getStatusDate('Afgehandeld') ??
    getStatusDate('Gereed') ??
    zaak.dateDecision ??
    '';

  const datumMeerInformatieDocument = zaak.documents.find((document) => {
    return document.title === documentNamesMA.MEER_INFORMATIE;
  });
  const datumMeerInformatie = datumMeerInformatieDocument?.datePublished ?? '';

  // Ontvangen step is added in the transformZaak function to ensure we always have a status step.
  const statusOntvangen: StatusLineItem = {
    id: 'step-1',
    status: 'Ontvangen',
    datePublished: zaak.dateRequest ?? '',
    isActive: true,
    isChecked: true,
  };

  const isVerlopen = zaak.isExpired;
  const hasInBehandeling = !!datumInBehandeling;
  const hasDecision = !!zaak.decision && !!dateDecision;
  const hasMeerInformatieNodig = !!datumMeerInformatie;
  const isMeerInformatieStepActive =
    hasMeerInformatieNodig && !hasDecision && !hasInBehandeling;

  const statussen = [
    {
      ...statusOntvangen,
      isActive: !datumInBehandeling && !hasDecision && !datumMeerInformatie,
    },
  ];

  if (datumMeerInformatie) {
    const statusMeerInformatie: StatusLineItem = {
      id: 'step-meer-info',
      status: 'Meer informatie nodig',
      datePublished: datumMeerInformatie,
      isActive: isMeerInformatieStepActive,
      isChecked: hasDecision || hasMeerInformatieNodig,
      description: `<p>Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.</p><p>Bekijk de <a href="${datumMeerInformatieDocument?.url}">brief</a> voor meer details.</p>`,
    };
    statussen.push(statusMeerInformatie);
  }

  const statusInBehandeling: StatusLineItem = {
    id: 'step-2',
    status: 'In behandeling',
    datePublished: datumInBehandeling,
    isActive: !hasDecision && hasInBehandeling,
    isChecked: hasDecision || hasInBehandeling,
  };

  const statusAfgehandeld: StatusLineItem = {
    id: 'step-3',
    status: 'Afgehandeld',
    datePublished: dateDecision,
    isActive: !isVerlopen && hasDecision,
    isChecked: hasDecision,
  };

  statussen.push(statusInBehandeling, statusAfgehandeld);

  if (isVerlopen) {
    const statusVerlopen: StatusLineItem = {
      id: 'step-5',
      status: 'Verlopen',
      datePublished: zaak.dateEnd ?? '',
      isActive: true,
      isChecked: true,
    };
    statussen.push(statusVerlopen);
  }

  return statussen;
}
