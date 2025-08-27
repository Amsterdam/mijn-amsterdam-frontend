import { PowerBrowserZaakTransformer } from '../powerbrowser/powerbrowser-types';

export const caseTypeVaren = {
  VarenRederRegistratie: 'Varen registratie reder',
  VarenVergunningExploitatie: 'Varen vergunning exploitatie',
  VarenVergunningExploitatieWijzigingVergunningshouder:
    'Varen vergunning exploitatie Wijziging vergunninghouder',
  VarenVergunningExploitatieWijzigingVervanging:
    'Varen vergunning exploitatie Wijziging vervanging',
  VarenVergunningExploitatieWijzigingVerbouwing:
    'Varen vergunning exploitatie Wijziging verbouwing',
  VarenVergunningExploitatieWijzigingVaartuignaam:
    'Varen vergunning exploitatie Wijziging vaartuignaam',
} as const;

type ToeristischeVerhuur = {
  caseType: typeof toeristischeVerhuur.caseType;
};

export const toeristischeVerhuur: PowerBrowserZaakTransformer<ToeristischeVerhuur> =
  {
    caseType: 'test' as const,
  };
