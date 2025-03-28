import { useParams } from 'react-router-dom';

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
  const vergunning = varenVergunningen.find((item) => item.id === id) ?? null;

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
    isLoading,
    isError,
    breadcrumbs,
  };
}
