import type {
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from './config-and-types.ts';

// MIJN - 12951: Filter non-passagiersvaart until there is more clarity about what is intended with non-passagiersvaart zaken and vergunningen
// Zaken and vergunningen linked to at least one passagiersvaart of the other type (or to none of the other type) are kept, even if they are also linked to a non-passagiersvaart.
export function filterNonPassagiersvaart(
  vergunningen: VarenVergunningFrontend[],
  zaken: VarenZakenFrontend[]
): [VarenVergunningFrontend[], VarenZakenFrontend[]] {
  const zakenTransport = new Set(
    zaken
      .filter((zaak) => zaak.segment === 'Transport')
      .flatMap((zaak) =>
        zaak.vergunning?.identifier ? [zaak.vergunning.identifier] : []
      )
  );

  const zakenNonTransport = new Set(
    zaken
      .filter((zaak) => zaak.segment !== 'Transport')
      .flatMap((zaak) =>
        zaak.vergunning?.identifier ? [zaak.vergunning.identifier] : []
      )
  );

  const vergunningenPassagiersvaart = vergunningen
    .filter(
      (vergunning) =>
        vergunning.soortVergunning === 'Passagiersvaart' ||
        vergunning.soortVergunning == null
    )
    .filter(
      (vergunning) =>
        !zakenTransport.has(vergunning.identifier) ||
        zakenNonTransport.has(vergunning.identifier)
    );

  const vergunningenPassagiersvaartIds = new Set(
    vergunningenPassagiersvaart.map((v) => v.identifier)
  );
  const zakenPassagiersvaart = zaken.filter(
    (zaak) =>
      zaak.segment !== 'Transport' &&
      (!zaak.vergunning ||
        vergunningenPassagiersvaartIds.has(zaak.vergunning.identifier))
  );

  return [vergunningenPassagiersvaart, zakenPassagiersvaart];
}
