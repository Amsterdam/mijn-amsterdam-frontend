import z from 'zod';

import { ZodValidators } from '../../../helpers/validation.ts';

const bsnInput = ZodValidators.BSN.nonoptional();
const clientInput = z.enum(['WMO', 'LLV', 'HLI']).optional();

const requestInputBase_ = {
  bsn: bsnInput,
  client: clientInput,
};

export const requestInputBase = z.object(requestInputBase_);

const voorzieningenRequestInput = z.object({
  maActies: z
    .array(
      z.enum([
        'reparatieverzoek',
        'stopzetten',
        'stopzetten-tijdelijk',
        'stopzetten-niet-via-formulier',
      ])
    )
    .optional(),
  maProductgroep: z
    .array(
      z.enum([
        'WRA',
        'hulpmiddelen',
        'diensten',
        'PGB',
        'vergoeding',
        'AOV',
        'Alle afgewezen',
      ])
    )
    .optional(),
});

export type VoorzieningenRequestInputFilters = z.infer<
  typeof voorzieningenRequestInput
>;

export const requestInputByClient = {
  WMO: voorzieningenRequestInput,
  LLV: z.object({}),
  HLI: z.object({}),
} as const;

export const voorzieningDetailRequestInput = z.object({
  bsn: bsnInput,
  id: z.string().nonoptional(),
});
