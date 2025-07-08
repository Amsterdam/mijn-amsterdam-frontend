import axios from 'axios';

import { MOCK_ORIGIN, MOCK_API_BASE_URL } from './settings.js';

sendRequestToAllEndpoints();

async function sendRequestToAllEndpoints() {
  const routeResponse = await axios.get(
    'http://localhost:3110/api/mock/routes'
  );

  routeResponse.data.forEach((entry) => {
    if (entry.id in CUSTOM_REQUESTS) {
      CUSTOM_REQUESTS[entry.id]();
      return;
    }

    // Regex to replace all url parameters, like for example '/:something/' becomes '/1/'.
    const urlParameterPattern = new RegExp('(?<=\/):.+?(?=\/|$)', 'g'); // prettier-ignore
    // reason prettier-ignore: It will remove all escape sequences in the regular expression which is undesired.

    const requestUrl = `${MOCK_ORIGIN}${entry.url.replaceAll(urlParameterPattern, '1')}`;

    if (entry.method === 'get') {
      axios.get(requestUrl);
    } else if (entry.method === 'post') {
      axios.post(requestUrl);
    } else {
      throw Error(
        `Method: '${entry.method}' for request to '${entry.url}' with id '${entry.id}' is not implemented.`
      );
    }
  });
}

const ORIGIN = MOCK_API_BASE_URL;

/** Add handlers here that need custom behavior.
 * In the form of `[route-id]: [function]`.
 *
 * Some routes have custom logic depending on the header/body.
 * This requires manually crafted requests.
 */
const CUSTOM_REQUESTS = {
  'get-erfpacht': () => {
    const variations = ['user', 'company'];
    variations.forEach((variation) =>
      axios.get(
        `${ORIGIN}/erfpacht/api/v2/check/groundlease/${variation}/wildcard`
      )
    );
  },
  'get-erfpacht-notifications': () => {
    const variations = ['bsn', 'kvk'];
    variations.forEach((variation) =>
      axios.get(`${ORIGIN}/erfpacht/api/v2/notifications/${variation}/wildcard`)
    );
  },
  'get-subsidie': () => {
    const variations = ['citizen', 'company'];
    variations.forEach((variation) =>
      axios.get(`${ORIGIN}/subsidies/${variation}/12token34`)
    );
  },
  'post-enableu2smile-klachten': () => {
    const readKlachtForm = new FormData();
    readKlachtForm.append('function', 'readKlacht');
    axios.post(`${ORIGIN}/smile`, readKlachtForm);

    const readAVGForm = new FormData();
    readAVGForm.append('function', 'readAVGverzoek');
    axios.post(`${ORIGIN}/smile`, readAVGForm);

    const readThemaPerAVGVerzoekForm = new FormData();
    readThemaPerAVGVerzoekForm.append('function', 'readthemaperavgverzoek');
    axios.post(`${ORIGIN}/smile`, readThemaPerAVGVerzoekForm);
  },
  'post-zorgned-aanvragen': () => {
    const url = `${ORIGIN}/zorgned/aanvragen`;
    const data = undefined;

    axios.post(url, data, {
      headers: {
        'x-mams-api-user': 'FakerwhFASHFASFAKEEEEFAKEhfdashjashf',
      },
    });

    axios
      .post(url, data, {})
      .then(() => {
        console.error(
          `Succes response from ${url}, this should be an error response`
        );
      })
      .catch((e) => {
        console.info(
          `Expected error response code: ${e.code} from ${e.config.url}`
        );
      });
  },
};
