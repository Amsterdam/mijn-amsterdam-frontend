import nock from 'nock';
import { describe, it, expect, vi, Mock } from 'vitest';

import type { BAGAdreseerbaarObject } from './bag.types';
import { fetchMyLocations, forTesting } from './my-locations';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import { fetchBrp } from '../brp/brp';
import { fetchKVK } from '../hr-kvk/hr-kvk';

vi.mock('../brp/brp', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchBrp: vi.fn(),
}));

vi.mock('../hr-kvk/hr-kvk', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchKVK: vi.fn(),
}));

export function setupBagApiNockResponse(
  reply: number,
  adresseerbareobjecten: Partial<BAGAdreseerbaarObject>[]
) {
  nock('https://api.data.amsterdam.nl')
    .get(/benkagg\/adresseerbareobjecten/)
    .reply(reply, {
      _embedded: {
        adresseerbareobjecten,
      },
    });
}

describe('fetchPrivate', () => {
  const authProfileAndToken = getAuthProfileAndToken();

  it('should return private addresses if fetching BRP data is successful', async () => {
    (fetchBrp as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        mokum: true,
        adres: {
          adresseerbaarObjectIdentificatie: 'a',
          straatnaam: 'NewStreet',
          huisnummer: 10,
        },
      })
    );

    setupBagApiNockResponse(200, [
      {
        identificatie: 'x1',
        adresseerbaarObjectPuntGeometrieWgs84: {
          type: 'Point',
          coordinates: [1, 1],
        },
      },
    ]);

    const result = await forTesting.fetchPrivate(authProfileAndToken);

    expect(result.status).toBe('OK');
    expect(result.content).toHaveLength(1);
    expect(result.content).toStrictEqual([
      {
        address: {
          adresseerbaarObjectIdentificatie: 'a',
          huisnummer: 10,
          straatnaam: 'NewStreet',
        },
        bagAddress: {
          adresseerbaarObjectPuntGeometrieWgs84: {
            coordinates: [1, 1],
            type: 'Point',
          },
          identificatie: 'x1',
        },
        bagNummeraanduidingId: 'x1',
        latlng: {
          lat: 1,
          lng: 1,
        },
        mokum: false,
        profileType: 'private',
        title: 'Thuis',
      },
    ]);
  });

  it('should return default location if no BAG location is found', async () => {
    (fetchBrp as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        mokum: true,
        adres: {
          adresseerbaarObjectIdentificatie: 'a',
          straatnaam: 'NewStreet',
          huisnummer: 10,
        },
      })
    );
    setupBagApiNockResponse(200, []);
    const result = await forTesting.fetchPrivate(authProfileAndToken);

    expect(result).toStrictEqual({
      content: [
        {
          address: null,
          bagAddress: null,
          latlng: {
            lat: 52.3676842478192,
            lng: 4.90022569871861,
          },
          mokum: true,
          profileType: 'private',
          title: 'Amsterdam centrum',
        },
      ],
      status: 'OK',
    });
  });

  it('should return a bare response if BRP data is not a Mokum address', async () => {
    (fetchBrp as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        mokum: false,
      })
    );

    const result = await forTesting.fetchPrivate(authProfileAndToken);

    expect(result.status).toBe('OK');
    expect(result.content).toHaveLength(1);
    expect(result.content).toEqual([
      {
        address: null,
        bagAddress: null,
        latlng: null,
        mokum: false,
        profileType: 'private',
        title: 'Nergens',
      },
    ]);
  });

  it('should return an error if fetching BRP data fails', async () => {
    (fetchBrp as Mock).mockResolvedValueOnce(
      apiErrorResult('Error fetching BRP data', null)
    );

    const result = await forTesting.fetchPrivate(authProfileAndToken);
    expect(result.status === 'DEPENDENCY_ERROR' && result.message).toBe(
      '[BRP] Error fetching BRP data'
    );
  });
});

describe('fetchCommercial', () => {
  const authProfileAndToken = getAuthProfileAndToken('commercial');

  it('should return commercial addresses if fetching KVK data is successful', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        vestigingen: [
          {
            naam: 'Hoofdkantoor',
            bezoekadres: 'Amstel 1 Amsterdam',
            bezoekHeeftBagNummeraanduidingId: 'x',
          },
          {
            naam: 'Vestiging',
            bezoekadres: 'Oudezijds voorburgwal 300 Amsterdam',
            bezoekHeeftBagNummeraanduidingId: 'y',
          },
        ],
      })
    );

    setupBagApiNockResponse(200, [
      {
        identificatie: 'x1',
        adresseerbaarObjectPuntGeometrieWgs84: {
          type: 'Point',
          coordinates: [1, 1],
        },
      },
    ]);
    setupBagApiNockResponse(200, [
      {
        identificatie: 'y',
        adresseerbaarObjectPuntGeometrieWgs84: {
          type: 'Point',
          coordinates: [2, 2],
        },
      },
    ]);

    const result = await forTesting.fetchCommercial(authProfileAndToken);

    expect(result).toStrictEqual({
      content: [
        {
          address: null,
          bagAddress: {
            adresseerbaarObjectPuntGeometrieWgs84: {
              coordinates: [1, 1],
              type: 'Point',
            },
            identificatie: 'x1',
          },
          bagNummeraanduidingId: 'x1',
          latlng: {
            lat: 1,
            lng: 1,
          },
          mokum: false,
          profileType: 'commercial',
          title: 'Hoofdkantoor',
        },
        {
          address: null,
          bagAddress: {
            adresseerbaarObjectPuntGeometrieWgs84: {
              coordinates: [2, 2],
              type: 'Point',
            },
            identificatie: 'y',
          },
          bagNummeraanduidingId: 'y',
          latlng: {
            lat: 2,
            lng: 2,
          },
          mokum: false,
          profileType: 'commercial',
          title: 'Vestiging',
        },
      ],
      status: 'OK',
    });
  });

  it('should return only locations for which BAG requests succeed', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        vestigingen: [
          {
            naam: 'Hoofdkantoor',
            bezoekadres: 'Amstel 1 Amsterdam',
            bezoekHeeftBagNummeraanduidingId: 'x',
          },
          {
            naam: 'Vestiging',
            bezoekadres: 'Oudezijds voorburgwal 300 Amsterdam',
            bezoekHeeftBagNummeraanduidingId: 'y',
          },
        ],
      })
    );

    setupBagApiNockResponse(500, []);
    setupBagApiNockResponse(200, [
      {
        identificatie: 'y',
        adresseerbaarObjectPuntGeometrieWgs84: {
          type: 'Point',
          coordinates: [2, 2],
        },
      },
    ]);

    const result = await forTesting.fetchCommercial(authProfileAndToken);
    expect(result).toStrictEqual({
      content: [
        {
          address: null,
          bagAddress: {
            adresseerbaarObjectPuntGeometrieWgs84: {
              coordinates: [2, 2],
              type: 'Point',
            },
            identificatie: 'y',
          },
          bagNummeraanduidingId: 'y',
          latlng: {
            lat: 2,
            lng: 2,
          },
          mokum: false,
          profileType: 'commercial',
          title: 'Vestiging',
        },
      ],
      status: 'OK',
    });
  });

  it('should return an error if fetching KVK data fails', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiErrorResult('Error fetching KVK data', null)
    );

    const result = await forTesting.fetchCommercial(authProfileAndToken);
    expect(result.status).toBe('DEPENDENCY_ERROR');
  });
});

describe('fetchMyLocation', () => {
  const authProfileAndTokenPrivate = getAuthProfileAndToken();
  const authProfileAndTokenCommercial = getAuthProfileAndToken('commercial');

  it('should return locations if fetching commercial and private data is successful', async () => {
    (fetchBrp as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        mokum: true,
        adres: {
          adresseerbaarObjectIdentificatie: 'a',
          straatnaam: 'NewStreet',
          huisnummer: 10,
        },
      })
    );

    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        vestigingen: [
          {
            naam: 'Werk',
            bezoekadres: 'Dam 1 Amsterdam',
            bezoekHeeftBagNummeraanduidingId: 'x',
          },
        ],
      })
    );

    setupBagApiNockResponse(200, [
      {
        identificatie: 'x1',
        adresseerbaarObjectPuntGeometrieWgs84: {
          type: 'Point',
          coordinates: [1, 1],
        },
      },
    ]);
    setupBagApiNockResponse(200, [
      {
        identificatie: 'x2',
        adresseerbaarObjectPuntGeometrieWgs84: {
          type: 'Point',
          coordinates: [2, 2],
        },
      },
    ]);

    const result = await fetchMyLocations(authProfileAndTokenPrivate);
    expect(result).toStrictEqual({
      content: [
        {
          address: {
            adresseerbaarObjectIdentificatie: 'a',
            huisnummer: 10,
            straatnaam: 'NewStreet',
          },
          bagAddress: {
            adresseerbaarObjectPuntGeometrieWgs84: {
              coordinates: [2, 2],
              type: 'Point',
            },
            identificatie: 'x2',
          },
          bagNummeraanduidingId: 'x2',
          latlng: {
            lat: 2,
            lng: 2,
          },
          mokum: false,
          profileType: 'private',
          title: 'Thuis',
        },
        {
          address: null,
          bagAddress: {
            adresseerbaarObjectPuntGeometrieWgs84: {
              coordinates: [1, 1],
              type: 'Point',
            },
            identificatie: 'x1',
          },
          bagNummeraanduidingId: 'x1',
          latlng: {
            lat: 1,
            lng: 1,
          },
          mokum: false,
          profileType: 'commercial',
          title: 'Werk',
        },
      ],
      status: 'OK',
    });
  });

  it('should return commercial locations if profile type is commercial', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        vestigingen: [
          {
            naam: 'Werk',
            bezoekadres: 'Dam 1 Amsterdam',
            bezoekHeeftBagNummeraanduidingId: 'x',
          },
        ],
      })
    );

    setupBagApiNockResponse(200, [
      {
        identificatie: 'x1',

        adresseerbaarObjectPuntGeometrieWgs84: {
          type: 'Point',
          coordinates: [1, 1],
        },
      },
    ]);

    const result = await fetchMyLocations(authProfileAndTokenCommercial);
    expect(result.status).toBe('OK');
    expect(result.content).toHaveLength(1);
  });

  it('should return an error if fetching commercial data fails', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiErrorResult('Oh Oh Server down', null)
    );

    const result = await fetchMyLocations(authProfileAndTokenCommercial);
    expect(result.status).toBe('DEPENDENCY_ERROR');
  });

  it('should return a success response with empty content if ERROR or EMPTY', async () => {
    (fetchKVK as Mock).mockResolvedValueOnce(
      apiSuccessResult({ vestigingen: [] })
    );

    (fetchBrp as Mock).mockResolvedValueOnce(
      apiErrorResult('Server down!', null)
    );

    const result = await fetchMyLocations(authProfileAndTokenPrivate);
    expect(result).toEqual({
      content: [],
      status: 'OK',
    });
  });
});
