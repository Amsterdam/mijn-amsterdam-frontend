import Mockdate from 'mockdate';
import nock from 'nock';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as emandates from './afis-e-mandates';
import { EMandateAcceptantenGemeenteAmsterdam } from './afis-e-mandates-config';
import type {
  AfisEMandateAcceptant,
  AfisEMandateFrontend,
  AfisEMandateSource,
} from './afis-types';
import { remoteApi } from '../../../testing/utils';
import type { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { decryptPayloadAndValidateSessionID } from '../shared/decrypt-route-param';

const authProfile: AuthProfile = {
  sid: 'sid',
  authMethod: 'digid', // Corrected to match the expected literal type
  profileType: 'private',
  id: 'mockId',
};

const acceptant = EMandateAcceptantenGemeenteAmsterdam[0];
const validSenderIBAN = 'NL35BOOG9343513650';
const validAcceptantIBAN = acceptant.iban;
const businessPartnerId = '123';

const validPayload = {
  acceptantIBAN: acceptant?.iban || 'not-valid',
  businessPartnerId,
  senderIBAN: validSenderIBAN,
  senderBIC: 'BANKNL2A',
  senderName: 'John Doe',
  eMandateSignDate: new Date().toISOString(),
};

const validEMandateFrontend: AfisEMandateFrontend = {
  id: 'mockId',
  acceptant: 'Test Acceptant',
  acceptantIBAN: validAcceptantIBAN,
  status: '1',
  displayStatus: 'Active',
  senderIBAN: validSenderIBAN,
  senderName: 'John Doe',
  dateValidFrom: '2024-01-01T00:00:00',
  dateValidFromFormatted: '01-01-2024',
  dateValidTo: '9999-12-31T00:00:00',
  dateValidToFormatted: 'Ongoing',
  link: {
    to: '/mock-link',
    title: 'Mock Link',
  },
};

// Update test data for AfisEMandateAcceptant
const validAcceptant: AfisEMandateAcceptant = {
  refId: '123',
  iban: validAcceptantIBAN,
  name: 'Test',
  subId: 'sub123',
};

// Update test data for AfisEMandateSource
const validSourceMandate: AfisEMandateSource = {
  IMandateId: '1',
  LifetimeFrom: '2024-01-01T00:00:00',
  LifetimeTo: '9999-12-31T00:00:00',
  SndIban: validSenderIBAN,
  SndName1: 'John',
  SndName2: 'Doe',
  PayType: 'type1',
  SndType: 'type2',
  RefType: 'type3',
  RecType: 'type4',
  RecId: 'rec123',
  Status: '1',
  RecName1: 'Receiver Name',
  RecPostal: '1234AB',
  RecStreet: 'Main Street',
  RecHouse: '1A',
  RecCountry: 'NL',
  RecCity: 'Amsterdam',
  // Added missing sender properties
  SndId: 'snd123',
  SndPostal: '5678CD',
  SndCountry: 'NL',
  SndBic: 'BANKNL2A',
  SndHouse: '2B',
  SndCity: 'Rotterdam',
  SndStreet: 'Sender Street',
  SndDebtorId: '123', // Added required property
  SignDate: '2024-01-01T00:00:00', // Added required property
  SignCity: 'Amsterdam', // Added required property
};

describe('afis-e-mandates service (with nock)', () => {
  beforeAll(() => {
    Mockdate.set('2025-07-10T12:38:39.542Z');
  });
  afterAll(() => {
    Mockdate.reset();
  });
  beforeEach(() => {
    nock.cleanAll();
  });
  afterEach(() => {
    nock.cleanAll();
  });

  describe('createAfisEMandate - Happy scenario', () => {
    it('creates a mandate if all checks pass', async () => {
      remoteApi.get(/A_BusinessPartner/).reply(200, {
        status: 'OK',
        content: {
          address: {},
          firstName: 'A',
          lastName: 'B',
          fullName: 'A B',
        },
      });
      remoteApi.get(/A_BusinessPartnerAddress/).reply(200);
      remoteApi.get(/A_BusinessPartnerBank/).reply(200, {
        feed: {
          entry: [
            {
              content: {
                '@type': 'application/xml',
                properties: {
                  foo: 'bar',
                },
              },
            },
          ],
        },
      });

      remoteApi.post(/CreateMandate/).reply(200);

      const result = await emandates.createAfisEMandate(validPayload);
      expect(result.status).toBe('OK');
    });
  });

  describe('createAfisEMandate - Error Scenarios', () => {
    it('throws an error if acceptant IBAN is invalid', async () => {
      await expect(
        emandates.createAfisEMandate({
          ...validPayload,
          acceptantIBAN: 'invalid',
        })
      ).rejects.toThrow(/Invalid acceptant IBAN/);
    });

    it('throws an error if fetching business partner details fails', async () => {
      remoteApi.get(/A_BusinessPartnerAddress/).reply(500);
      remoteApi.get(/A_BusinessPartner/).reply(500);

      await expect(emandates.createAfisEMandate(validPayload)).rejects.toThrow(
        /Error fetching business partner details/
      );
    });

    it('throws an error if checking bank account existence fails', async () => {
      remoteApi.get(/A_BusinessPartner/).reply(200, {
        status: 'OK',
        content: {
          address: {},
          firstName: 'A',
          lastName: 'B',
          fullName: 'A B',
        },
      });

      remoteApi.get(/A_BusinessPartnerAddress/).reply(200);

      remoteApi
        .get(/A_BusinessPartnerBank/)
        .reply(500, { status: 'ERROR', message: 'fail' });

      await expect(emandates.createAfisEMandate(validPayload)).rejects.toThrow(
        /Error checking if bank account exists/
      );
    });

    it('throws an error if creating bank account fails', async () => {
      remoteApi.get(/A_BusinessPartner/).reply(200, {
        status: 'OK',
        content: {
          address: {},
          firstName: 'A',
          lastName: 'B',
          fullName: 'A B',
        },
      });

      remoteApi.get(/A_BusinessPartnerAddress/).reply(200);

      remoteApi
        .get(/A_BusinessPartnerBank/)
        .reply(200, { status: 'OK', content: false });

      remoteApi.post(/CreateBankAccount/).reply(500);

      await expect(emandates.createAfisEMandate(validPayload)).rejects.toThrow(
        /Error creating bank account/
      );
    });

    it('throws an error if creating e-mandate fails', async () => {
      remoteApi.get(/A_BusinessPartner/).reply(200, {
        status: 'OK',
        content: {
          address: {},
          firstName: 'A',
          lastName: 'B',
          fullName: 'A B',
        },
      });

      remoteApi.get(/A_BusinessPartnerAddress/).reply(200);

      remoteApi.get(/A_BusinessPartnerBank/).reply(200, {
        feed: {
          entry: [
            {
              content: {
                '@type': 'application/xml',
                properties: {
                  foo: 'bar',
                },
              },
            },
          ],
        },
      });

      remoteApi
        .post(/CreateMandate/)
        .reply(500, { status: 'ERROR', message: 'fail' });

      await expect(emandates.createAfisEMandate(validPayload)).rejects.toThrow(
        /Error creating e-mandate/
      );
    });
  });

  describe('fetchAfisEMandates', () => {
    it('fetches mandates successfully', async () => {
      remoteApi.get(/Mandate_readSet/).reply(200, {
        feed: {
          entry: [
            {
              content: {
                properties: {
                  IMandateId: '1',
                  SndDebtorId: acceptant.refId,
                  LifetimeFrom: '2024-01-01T00:00:00',
                  LifetimeTo: '9999-12-31T00:00:00',
                  SndIban: validSenderIBAN,
                  SndName1: 'A',
                  SndName2: 'B',
                },
              },
            },
          ],
        },
      });

      const result = await emandates.fetchAfisEMandates(
        { businessPartnerId: '123' },
        authProfile
      );
      expect(result.status).toBe('OK');
      expect(result.content?.length).toBe(
        EMandateAcceptantenGemeenteAmsterdam.length
      );

      expect(result.content?.[0].status).toBe('1');
      expect(result.content?.[0].senderIBAN).toBe(validSenderIBAN);
      expect(result.content?.[0].senderName).toBe('A B');

      expect(result.content?.[1].status).toBe('0');
      expect(result.content?.[1].senderIBAN).toBe(null);
      expect(result.content?.[1].senderName).toBe(null);
    });
  });

  describe('fetchEmandateRedirectUrlFromProvider', () => {
    it('returns error if acceptant not found', async () => {
      const result = await emandates.fetchEmandateRedirectUrlFromProvider({
        ...validPayload,
        acceptantIBAN: 'notfound',
      });
      expect(result.status).toBe('ERROR');
    });

    it('returns error if fetching business partner details fails', async () => {
      // Acceptant exists, but business partner fetch fails
      remoteApi.get(/A_BusinessPartner/).reply(500);

      const result = await emandates.fetchEmandateRedirectUrlFromProvider({
        ...validPayload,
        acceptantIBAN: validAcceptantIBAN,
      });
      expect(result.status).toBe('ERROR');
      expect(result.status === 'ERROR' && result.message).toBe(
        'Could not get full name or address for business partner 123'
      );
    });

    it('returns error if provider API returns error', async () => {
      remoteApi.get(/A_BusinessPartner/).reply(200);
      remoteApi.get(/A_BusinessPartnerAddress/).reply(200);
      remoteApi.post(/paylinks/).reply(500);

      const result = await emandates.fetchEmandateRedirectUrlFromProvider({
        ...validPayload,
        acceptantIBAN: validAcceptantIBAN,
      });
      expect(result.status).toBe('ERROR');
      expect(result.status === 'ERROR' && result.message).toBe(
        'Request failed with status code 500'
      );
    });

    it('returns null content if provider returns no mpid', async () => {
      remoteApi.get(/A_BusinessPartner/).reply(200);
      remoteApi.get(/A_BusinessPartnerAddress/).reply(200);
      remoteApi.post(/paylinks/).reply(200);

      const result = await emandates.fetchEmandateRedirectUrlFromProvider({
        ...validPayload,
        acceptantIBAN: validAcceptantIBAN,
      });
      expect(result.status).toBe('OK');
      expect(result.content).toBeNull();
    });

    it('returns redirectUrl and statusCheckUrl if provider returns mpid and paylink', async () => {
      remoteApi.get(/A_BusinessPartner/).reply(200);
      remoteApi.get(/A_BusinessPartnerAddress/).reply(200);

      remoteApi
        .post(/paylinks/)
        .reply(200, { mpid: 'mpid123', paylink: 'https://pay.example.com' });

      const result = await emandates.fetchEmandateRedirectUrlFromProvider({
        ...validPayload,
        acceptantIBAN: validAcceptantIBAN,
      });
      expect(result.status).toBe('OK');
      expect(result.content).toHaveProperty(
        'redirectUrl',
        'https://pay.example.com'
      );
    });
  });

  describe('forTesting helpers', () => {
    it('addEmandateApiUrls adds URLs', () => {
      const eMandate: AfisEMandateFrontend = { ...validEMandateFrontend };
      expect(eMandate).not.toHaveProperty('signRequestUrl');

      emandates.forTesting.addEmandateApiUrls(
        authProfile.sid,
        '123',
        eMandate,
        {
          iban: validSenderIBAN,
          name: 'Test',
          refId: 'ref',
          subId: '',
        }
      );
      expect(eMandate).toHaveProperty('signRequestUrl');
    });

    it('changeEMandateStatus updates status', async () => {
      remoteApi.put(/ChangeMandate/).reply(200);

      const result = await emandates.forTesting.changeEMandateStatus({
        IMandateId: '1',
        Status: '1',
        LifetimeTo: '9999-12-31T00:00:00',
      });

      expect(result.content).toStrictEqual({
        dateValidTo: '9999-12-31T00:00:00',
        dateValidToFormatted: 'Doorlopend',
        displayStatus: 'Actief sinds null',
        status: '1',
      });
    });

    it('createEMandateProviderPayload generates payload', () => {
      const payload = emandates.forTesting.createEMandateProviderPayload(
        { firstName: 'John', lastName: 'Doe', businessPartnerId: '123' },
        {
          iban: validSenderIBAN,
          name: 'Test',
          refId: 'ref',
          subId: 'sub123',
        },
        validPayload
      );

      expect(payload).toStrictEqual({
        batch_name: 'batch-ref-123',
        cid: null,
        company_name: 'Gemeente Amsterdam',
        concerning: 'Automatische incasso Test',
        debtor_number: '123',
        due_date: '2025-07-11',
        first_name: 'John',
        invoices: [
          {
            invoice_amount: 0,
            invoice_date: '2025-07-10',
            invoice_description: 'Automatische incasso Test',
            invoice_due_date: '2025-07-11',
            invoice_number: 'EMandaat-ref-2025-07-10',
          },
        ],
        last_name: 'Doe',
        payment_modules: ['emandate_recurring'],
        payment_reference: 'ref-123',
        request_id: 'ref-123-2025-07-10T12:38:39.542Z',
        return_url:
          'http://frontend-host/facturen-en-betalen/betaalvoorkeuren/emandate/test?iban=NL35BOOG9343513650',
        variable1: 'NL21RABO0110055004',
      });
    });

    it('getEMandateSourceByAcceptant finds the correct source', () => {
      const sourceMandates = [validSourceMandate];
      const result = emandates.forTesting.getEMandateSourceByAcceptant(
        sourceMandates,
        validAcceptant
      );
      expect(result).toBe(validSourceMandate);
    });

    it('getEMandateSourceByAcceptant does not find the correct source', () => {
      const sourceMandates = [validSourceMandate];
      const result = emandates.forTesting.getEMandateSourceByAcceptant(
        sourceMandates,
        { ...validAcceptant, refId: 'x' }
      );
      expect(result).toBe(undefined);
    });

    it('getSignRequestApiUrl generates URL', () => {
      const url = emandates.forTesting.getSignRequestApiUrl(
        authProfile.sid,
        '123',
        validAcceptant
      );
      expect(
        url.startsWith(
          'http://bff-api-host/api/v1/services/afis/e-mandates/sign-request-url?payload='
        )
      ).toBe(true);

      expect(
        decryptPayloadAndValidateSessionID(
          new URL(url).searchParams.get('payload')!,
          { profile: authProfile } as AuthProfileAndToken
        )
      ).toStrictEqual({
        content: {
          payload: {
            acceptantIBAN: 'NL21RABO0110055004',
            businessPartnerId: '123',
            eMandateSignDate: '2025-07-10T12:38:39.542Z',
          },
          sessionID: 'sid',
        },
        status: 'OK',
      });
    });

    it('getSndDebtorId returns refId', () => {
      const refId = emandates.forTesting.getSndDebtorId(validAcceptant);
      expect(refId).toBe('123');
    });

    it('getStatusChangeApiUrl generates URL', () => {
      const url = emandates.forTesting.getStatusChangeApiUrl(
        authProfile.sid,
        validSourceMandate
      );
      expect(
        url.startsWith(
          'http://bff-api-host/api/v1/services/afis/e-mandates/change-status?payload='
        )
      ).toBe(true);

      expect(
        decryptPayloadAndValidateSessionID(
          new URL(url).searchParams.get('payload')!,
          { profile: authProfile } as AuthProfileAndToken
        )
      ).toStrictEqual({
        content: {
          payload: {
            IMandateId: '1',
            LifetimeTo: '2025-07-10T12:38:39.542Z',
            Status: '0',
          },
          sessionID: 'sid',
        },
        status: 'OK',
      });
    });

    it('getUpdateApiUrl generates URL', () => {
      const url = emandates.forTesting.getUpdateApiUrl(
        authProfile.sid,
        validSourceMandate
      );
      expect(
        url.startsWith(
          'http://bff-api-host/api/v1/services/afis/e-mandates/update?payload='
        )
      ).toBe(true);

      expect(
        decryptPayloadAndValidateSessionID(
          new URL(url).searchParams.get('payload')!,
          { profile: authProfile } as AuthProfileAndToken
        )
      ).toStrictEqual({
        content: {
          payload: {
            IMandateId: '1',
          },
          sessionID: 'sid',
        },
        status: 'OK',
      });
    });

    it('transformEmandateSignRequestStatus transforms status', () => {
      const result = emandates.forTesting.transformEmandateSignRequestStatus({
        status_code: 101,
        mpid: 0,
        status_date: '',
      });
      expect(result.status).toBe('NoResponse');
    });

    it('transformEMandateSource transforms source', () => {
      const result = emandates.forTesting.transformEMandateSource(
        authProfile.sid,
        '123',
        {
          refId: '123',
          iban: validSenderIBAN,
          name: 'Test',
          subId: '',
        },
        {
          LifetimeFrom: '2024-01-01T00:00:00',
          LifetimeTo: '9999-12-31T00:00:00',
          SndIban: validSenderIBAN,
          SndName1: 'John',
          SndName2: 'Doe',
        } as AfisEMandateSource
      );
      expect(result).toStrictEqual({
        acceptant: 'Test',
        acceptantDescription: undefined,
        acceptantIBAN: 'NL35BOOG9343513650',
        dateValidFrom: '2024-01-01T00:00:00',
        dateValidFromFormatted: '01 januari 2024',
        dateValidTo: '9999-12-31T00:00:00',
        dateValidToFormatted: 'Doorlopend',
        displayStatus: 'Actief sinds 01 januari 2024',
        id: 'test',
        link: {
          title: 'Test',
          to: '/facturen-en-betalen/betaalvoorkeuren/emandate/test',
        },
        senderIBAN: 'NL35BOOG9343513650',
        senderName: 'John Doe',
        signRequestUrl: expect.stringContaining(
          'http://bff-api-host/api/v1/services/afis/e-mandates/sign-request-url?payload='
        ),
        status: '1',
      });
    });

    it('transformEMandatesRedirectUrlResponse transforms response', () => {
      const result = emandates.forTesting.transformEMandatesRedirectUrlResponse(
        { mpid: '123', paylink: 'https://example.com' }
      );
      expect(result).toHaveProperty('redirectUrl', 'https://example.com');
    });
  });
});
