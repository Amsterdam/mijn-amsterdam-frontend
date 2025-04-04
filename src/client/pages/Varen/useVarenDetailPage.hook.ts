import { useParams } from 'react-router-dom';

import {
  exploitatieVergunningWijzigenLink,
  ligplaatsVergunningLink,
} from './Varen-thema-config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ButtonLinkProps } from '../../../universal/types';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useVarenDetailPage() {
  const { VAREN } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const hasRegistratieReder = !!VAREN.content?.reder;

  const zaak = VAREN.content?.zaken?.find((item) => item.id === id) ?? null;

  const hasVergunningChangeInProgress = !!VAREN.content?.zaken?.find(
    (otherZaak) =>
      zaak?.vergunning?.identifier === otherZaak.vergunning?.identifier &&
      otherZaak?.processed === false
  );

  const buttonItems: ButtonLinkProps[] = [];

  const showButtons = zaak?.processed && zaak.decision === 'Verleend';
  if (showButtons) {
    const EVWijzigenBtnText = hasVergunningChangeInProgress
      ? 'Wijziging in behandeling'
      : 'Wijzigen';

    const buttons = [
      exploitatieVergunningWijzigenLink(zaak.key, EVWijzigenBtnText),
      ligplaatsVergunningLink,
    ].map((button) => ({
      ...button,
      isDisabled: !hasRegistratieReder || hasVergunningChangeInProgress,
    }));

    buttonItems.push(...buttons);
  }

  return {
    vergunning: zaak,
    buttonItems,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
  };
}
