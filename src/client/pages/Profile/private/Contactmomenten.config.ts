import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import { Themas, Thema } from '../../../../universal/config/thema';
import { ContactMoment } from '../../../../universal/types';
import { DisplayProps } from '../../../components/Table/TableV2';

export const contactmomentenDisplayProps: DisplayProps<ContactMoment> = {
  kanaal: 'Contactvorm',
  onderwerp: 'Onderwerp',
  plaatsgevondenOp: 'Datum',
  nummer: 'Referentienummer',
};

const erfpachtV1ORV2 = FeatureToggle.erfpachtV2Active
  ? Themas.ERFPACHTv2
  : Themas.ERFPACHT;

const SVWIv1ORv2 = FeatureToggle.svwiLinkActive ? Themas.SVWI : Themas.INKOMEN;

export const mapperContactmomentToMenuItem: Record<string, Thema> = {
  Erfpacht: erfpachtV1ORV2,
  Parkeren: Themas.PARKEREN,
  Zorg: Themas.ZORG,
  'Werk en Inkomen': SVWIv1ORv2,
  Belastingen: Themas.BELASTINGEN,
  Geldzaken: Themas.KREFIA,
  Financieen: Themas.AFIS,
};
