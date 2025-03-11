import { useParams } from 'react-router-dom';

import {
  exploitatieVergunningWijzigenLink,
  ligplaatsVergunningLink,
} from './Varen-thema-config';
import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ButtonLinkProps } from '../../../universal/types';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useVarenDetailPage() {
  const { VAREN } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const hasRegistratieReder = !!VAREN.content?.find(
    (item) => item.caseType === 'Varen registratie reder'
  );

  const vergunning =
    VAREN.content
      ?.filter((item) => item.caseType !== 'Varen registratie reder')
      .find((item) => item.id === id) ?? null;

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

  const themaLink = useThemaMenuItemByThemaID(Themas.VAREN);

  return {
    vergunning,
    buttonItems,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    themaPaginaBreadcrumb: themaLink,
  };
}
