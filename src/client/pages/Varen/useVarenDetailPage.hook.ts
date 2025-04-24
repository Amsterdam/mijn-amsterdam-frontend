import { useParams } from 'react-router';

import { isVergunning } from './helper';
import { useVarenThemaData } from './useVarenThemaData.hook';
import { exploitatieVergunningWijzigenLink } from './Varen-thema-config';
import { ButtonLinkProps } from '../../../universal/types';

export function useVarenDetailPage() {
  const { varenRederRegistratie, varenZaken, breadcrumbs, isLoading, isError } =
    useVarenThemaData();

  const { id } = useParams<{ id: string }>();

  const zaak = varenZaken.find((item) => item.id === id) ?? null;

  const hasRegistratieReder = !!varenRederRegistratie;
  const linkedWijzigingZaak =
    varenZaken.find(
      (otherZaak) =>
        otherZaak.id !== zaak?.id &&
        otherZaak.vergunning?.identifier === zaak?.vergunning?.identifier &&
        otherZaak.processed === false
    ) || null;

  const showButtons =
    zaak && isVergunning(zaak) && hasRegistratieReder && !linkedWijzigingZaak;

  const buttonItems: ButtonLinkProps[] = [];
  if (showButtons) {
    buttonItems.push(exploitatieVergunningWijzigenLink(zaak.key));
  }

  return {
    zaak,
    linkedWijzigingZaak,
    buttonItems,
    isLoading,
    isError,
    breadcrumbs,
  };
}
