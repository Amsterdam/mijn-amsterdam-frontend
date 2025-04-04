import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook';
import {
  exploitatieVergunningWijzigenLink,
  ligplaatsVergunningLink,
} from './Varen-thema-config';
import { ButtonLinkProps } from '../../../universal/types';

export function useVarenDetailPage() {
  const { varenRederRegistratie, varenZaken, breadcrumbs, isLoading, isError } =
    useVarenThemaData();

  const { id } = useParams<{ id: string }>();

  const hasRegistratieReder = !!varenRederRegistratie;

  const zaak = varenZaken.find((item) => item.id === id) ?? null;

  const hasLinkedVergunningChangeInProgress = !!varenZaken.find(
    (otherZaak) =>
      otherZaak.id !== zaak?.id &&
      otherZaak.vergunning?.identifier === zaak?.vergunning?.identifier &&
      otherZaak.processed === false
  );

  const buttonItems: ButtonLinkProps[] = [];
  const showButtons = zaak?.processed && zaak.decision === 'Verleend';
  if (showButtons) {
    const EVWijzigenBtnText = hasLinkedVergunningChangeInProgress
      ? 'Wijziging in behandeling'
      : 'Wijzigen';

    const buttons = [
      exploitatieVergunningWijzigenLink(zaak.key, EVWijzigenBtnText),
      ligplaatsVergunningLink,
    ].map((button) => ({
      ...button,
      isDisabled: !hasRegistratieReder || hasLinkedVergunningChangeInProgress,
    }));

    buttonItems.push(...buttons);
  }

  return {
    zaak,
    buttonItems,
    isLoading,
    isError,
    breadcrumbs,
  };
}
