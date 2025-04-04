import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook';
import {
  exploitatieVergunningWijzigenLink,
  ligplaatsVergunningLink,
} from './Varen-thema-config';
import { ButtonLinkProps } from '../../../universal/types';

export function useVarenDetailPage() {
  const {
    varenRederRegistratie,
    varenVergunningen,
    breadcrumbs,
    isLoading,
    isError,
  } = useVarenThemaData();

  const { id } = useParams<{ id: string }>();
  const hasRegistratieReder = !!varenRederRegistratie;
  const vergunning = varenVergunningen?.find((item) => item.id === id) ?? null;
  const hasVergunningChangeInProgress = !!varenVergunningen?.find(
    (zaak) =>
      zaak.vergunningKenmerk === vergunning?.vergunningKenmerk &&
      zaak.processed === false
  );
  const buttonItems: ButtonLinkProps[] = [];
  const showButtons =
    vergunning?.processed && vergunning.decision === 'Verleend';

  if (showButtons) {
    const EVWijzigenBtnText = hasVergunningChangeInProgress
      ? 'Wijziging in behandeling'
      : 'Wijzigen';

    const buttons = [
      exploitatieVergunningWijzigenLink(vergunning.key, EVWijzigenBtnText),
      ligplaatsVergunningLink,
    ].map((button) => ({
      ...button,
      isDisabled: !hasRegistratieReder || hasVergunningChangeInProgress,
    }));

    buttonItems.push(...buttons);
  }

  return {
    vergunning,
    buttonItems,
    isLoading,
    isError,
    breadcrumbs,
  };
}
