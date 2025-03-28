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

  const showButtons =
    vergunning?.processed && vergunning.decision === 'Verleend';
  const buttonItemsToShow: ButtonLinkProps[] = showButtons
    ? [
        exploitatieVergunningWijzigenLink(vergunning.key, 'Wijzigen'),
        ligplaatsVergunningLink,
      ]
    : [];

  const buttonItems = buttonItemsToShow.map((button) => ({
    ...button,
    isDisabled: !hasRegistratieReder,
  }));

  return {
    vergunning,
    buttonItems,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
  };
}
