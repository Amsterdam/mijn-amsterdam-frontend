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

  const vergunning =
    VAREN.content?.zaken?.find((item) => item.id === id) ?? null;

  const hasVergunningChangeInProgress = !!VAREN.content?.zaken?.find(
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
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
  };
}
