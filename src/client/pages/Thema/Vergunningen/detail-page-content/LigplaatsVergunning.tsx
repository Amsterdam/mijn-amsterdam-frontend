import { commonTransformers, getRows } from './fields-config';
import type {
  Ligplaatsvergunning,
  LigplaatsvergunningDecos,
  ZaakFrontendCombined,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function LigplaatsVergunning({
  vergunning,
}: {
  vergunning: ZaakFrontendCombined<
    Ligplaatsvergunning | LigplaatsvergunningDecos
  >;
}) {
  const vesselKind = () =>
    vergunning.vesselKind
      ? {
          label: 'Soort vaartuig',
          content: vergunning.vesselKind,
        }
      : null;

  const vesselName = () =>
    vergunning.vesselName
      ? {
          label: 'Naam vaartuig',
          content: vergunning.vesselName,
        }
      : null;

  const requestKind = () =>
    vergunning.requestKind
      ? {
          label: 'Soort aanvraag',
          content: vergunning.requestKind,
        }
      : null;

  const reason = () =>
    vergunning.reason
      ? {
          label: 'Reden',
          content: vergunning.reason,
        }
      : null;

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    vesselKind,
    vesselName,
    requestKind,
    reason,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
