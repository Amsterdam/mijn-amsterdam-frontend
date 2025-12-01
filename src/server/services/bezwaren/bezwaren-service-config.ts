import z from 'zod';

export const featureToggle = {
  router: {
    protected: {
      isEnabled: true,
    },
  },
};

export const routes = {
  protected: {
    // Bezwaren
    BEZWAREN_DOCUMENT_DOWNLOAD: '/services/bezwaren/document',
    BEZWAREN_DETAIL: '/services/bezwaren/bezwaar',
    BEZWAREN_DETAIL_RAW: '/services/raw/bezwaren/bezwaar',
    BEZWAREN_RAW: '/services/raw/bezwaren',
  },
};

export const fieldSortOptions = [
  'startdatum',
  '-startdatum',
  'einddatum',
  '-einddatum',
  'publicatiedatum',
  '-publicatiedatum',
  'archiefactiedatum',
  '-archiefactiedatum',
] as const;

export const zaakFilter = z.object({
  ordering: z.enum(fieldSortOptions).optional(),
  sortering: z.enum(fieldSortOptions).optional(),
});

export type ZaakFilter = z.infer<typeof zaakFilter>;

export const MAX_PAGE_COUNT = 10; // Should amount to 10 * 20 (per page) = 200 bezwaren
