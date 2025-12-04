import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook';
import {
  exploitatieVergunningWijzigenLink,
  routeConfig,
} from './Varen-thema-config';
import { ButtonLinkProps } from '../../../../universal/types/App.types';

export function useVarenVergunningDetailPage() {
  const {
    varenRederRegistratie,
    varenVergunningen,
    id: themaId,
    breadcrumbs,
    isLoading,
    isError,
  } = useVarenThemaData();
  const { id } = useParams<{ id: string }>();

  const vergunning = varenVergunningen.find((item) => item.id === id) ?? null;
  const buttonItems: ButtonLinkProps[] = vergunning?.identifier
    ? [exploitatieVergunningWijzigenLink(vergunning.identifier)]
    : [];

  return {
    vergunning,
    themaId,
    hasRegistratieReder: !!varenRederRegistratie,
    buttonItems,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  };
}

export function useVarenZaakDetailPage() {
  const {
    varenRederRegistratie,
    varenZaken,
    id: themaId,
    breadcrumbs,
    isLoading,
    isError,
  } = useVarenThemaData();
  const { id } = useParams<{ id: string }>();

  const hasRegistratieReder = !!varenRederRegistratie;

  const zaak = varenZaken.find((item) => item.id === id) ?? null;
  const buttonItems: ButtonLinkProps[] = zaak?.vergunning?.id
    ? [exploitatieVergunningWijzigenLink(zaak.vergunning.id)]
    : [];

  return {
    zaak,
    themaId,
    hasRegistratieReder,
    buttonItems,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  };
}
