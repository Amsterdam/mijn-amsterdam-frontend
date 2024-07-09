const axios = require('axios').default;
const settings = require('./mocks/settings');

sendRequestToAllEndpoints();

async function sendRequestToAllEndpoints() {
  const response = await axios.get('http://localhost:3110/api/mock/routes');
  console.dir(response.data);

  for (let i = 0; i < response.data.length - 1; i++) {
    const entry = response.data[i];

    const requestUrl = `${settings.MOCK_ORIGIN}${replaceParametersWithConcreteData(entry.url)}`;

    if (entry.method === 'get') {
      axios.get(requestUrl);
    } else if (entry.method === 'post') {
      axios.post(requestUrl);
    }
  }
}

// prettier-ignore
function replaceParametersWithConcreteData(url) {
  url.replace(new RegExp(':.*/'), '1');
  return url.replace('*', 'wildcard');
}
