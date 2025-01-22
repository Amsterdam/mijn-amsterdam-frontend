import {
  StadspasFrontend,
  StadspasOwner,
} from '../../../server/services/hli/stadspas-types';

/** Create a createStadspas function that returns stadspassen with incrementing ID's */
export function stadspasCreator() {
  let id = 0;

  function create(
    firstname: string,
    actief: boolean,
    // eslint-disable-next-line no-magic-numbers
    passNumber: number = 123123123
  ): StadspasFrontend {
    id++;

    const owner: StadspasOwner = {
      firstname,
      lastname: 'Crepin',
      initials: 'KC',
    };

    const passNumberComplete = 'volledig.' + passNumber;

    return {
      urlTransactions: 'http://example.com/url-transactions',
      transactionsKeyEncrypted: '123-xxx-000',
      id: `stadspas-id-${id}`,
      passNumber,
      passNumberComplete,
      owner,
      dateEnd: '31-07-2025',
      dateEndFormatted: '31 juli 2025',
      budgets: [],
      balanceFormatted: '€5,50',
      balance: 5.5,
      blockPassURL: 'http://example.com/stadspas/block',
      actief,
      securityCode: '123-securitycode-123',
    };
  }

  return create;
}
