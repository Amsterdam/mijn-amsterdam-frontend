import { HLIRegelingSpecificatieFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import {
  StadspasFrontend,
  StadspasOwner,
} from '../../../../server/services/hli/stadspas-types';
import { bffApiHost } from '../../../../testing/setup';
import { AppState } from '../../../../universal/types/App.types';

export function createHLIState(withData: {
  status?: string;
  stadspas?: StadspasFrontend[];
  regelingen?: object[];
  specificaties?: HLIRegelingSpecificatieFrontend[];
}): AppState {
  const state = {
    HLI: {
      status: withData.status || 'OK',
      content: {
        regelingen: withData.regelingen || [],
        stadspas: {
          stadspassen: withData.stadspas || [],
          dateExpiryFormatted: '31 juli 2025',
        },
        specificaties: withData.specificaties || [],
      },
    },
  } as unknown as AppState;
  return state;
}

/** Create a createStadspas function that returns stadspassen with incrementing ID's */
export function stadspasCreator() {
  let id = 0;

  function create(
    fieldsToOverwrite: Partial<StadspasFrontend> = {},
    ownerFieldsToOverwrite: Partial<StadspasOwner> = {}
  ): StadspasFrontend {
    id++;

    const passNumber = 123123123;

    const passNumberComplete = 'volledig.' + passNumber;

    return {
      urlTransactions: `${bffApiHost}/url-transactions`,
      transactionsKeyEncrypted: '123-xxx-000',
      id: `stadspas-id-${id}`,
      passNumber,
      passNumberComplete,
      owner: {
        firstname: 'Kerub',
        lastname: 'Crepin',
        initials: 'KC',
        ...ownerFieldsToOverwrite,
      },
      dateEnd: '31-07-2025',
      dateEndFormatted: '31 juli 2025',
      budgets: [],
      balanceFormatted: '€0,00',
      balance: 0,
      blockPassURL: 'http://example.com/stadspas/block',
      unblockPassURL: 'http://example.com/stadspas/unblock',
      actief: true,
      securityCode: '123-securitycode-123',
      ...fieldsToOverwrite,
    };
  }

  return create;
}
