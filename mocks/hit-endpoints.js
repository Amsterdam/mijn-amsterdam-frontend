const axios = require('axios').default;

const settings = require('./settings');

sendRequestToAllEndpoints();

async function sendRequestToAllEndpoints() {
  const routeResponse = await axios.get(
    'http://localhost:3110/api/mock/routes'
  );

  for (let i = 0; i < routeResponse.data.length - 1; i++) {
    const entry = routeResponse.data[i];

    if (entry.id in CUSTOM_REQUESTS) {
      CUSTOM_REQUESTS[entry.id]();
      continue;
    }

    // Regex to replace all url parameters, like for example '/:something/' becomes '/1/'.
    const paramReplacingPattern = new RegExp('(?<=\/):.+?(?=\/|$)', 'g'); // prettier-ignore
    // reason: It will remove all escape sequences in the regular expression which is undesired.

    const requestUrl = `${settings.MOCK_ORIGIN}${entry.url.replaceAll(paramReplacingPattern, '1')}`;

    if (entry.method === 'get') {
      axios.get(requestUrl);
    } else if (entry.method === 'post') {
      axios.post(requestUrl);
    }
  }
}

const ORIGIN = settings.MOCK_API_BASE_URL;

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
};
