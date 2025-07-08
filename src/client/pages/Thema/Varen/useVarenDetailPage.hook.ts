import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook.ts';
import { exploitatieVergunningWijzigenLink, routeConfig, } from './Varen-thema-config.ts';
import { ButtonLinkProps } from '../../../../universal/types/App.types.ts';

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

  const buttonItems: ButtonLinkProps[] = zaak
    ? [exploitatieVergunningWijzigenLink(zaak.key)]
    : [];

  return {
    zaak,
    linkedWijzigingZaak,
    hasRegistratieReder,
    buttonItems,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  };
}
