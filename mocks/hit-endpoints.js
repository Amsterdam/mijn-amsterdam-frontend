const axios = require('axios').default;
const settings = require('./settings');

sendRequestToAllEndpoints();

async function sendRequestToAllEndpoints() {
  const routeResponse = await axios.get(
    'http://localhost:3110/api/mock/routes'
  );

  for (let i = 0; i < routeResponse.data.length - 1; i++) {
    const entry = routeResponse.data[i];

    const requestUrl = `${settings.MOCK_ORIGIN}${replaceParametersWithConcreteData(entry.url)}`;
    console.log(requestUrl);

    if (entry.method === 'get') {
      axios.get(requestUrl);
    } else if (entry.method === 'post') {
      axios.post(requestUrl);
    }
  }
}

// Ignore or it will remove all escape sequences in the regular expression.
// prettier-ignore
function replaceParametersWithConcreteData(url) {
  // Regex to replace all url parameters, like for example '/:something/' becomes '/1/'.
  url = url.replaceAll(new RegExp('(?<=\/):.+?(?=\/|$)', 'g'), '1');
  return url.replace('*', 'wildcard');
}
