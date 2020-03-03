const axios = require('axios');

const afvalApiUrl =
  'https://map.data.amsterdam.nl/maps/afval?REQUEST=GetFeature&SERVICE=wfs&version=2.0.0&outputformat=application/json;%20subtype=geojson;%20charset=utf-8&TYPENAMES=';

async function getData(types, params = {}) {
  const typeNames = types.map(
    id => 'ms:' + (id || 'container') + '_coordinaten'
  );
  const queryParams = {};
  if (params.bbox) {
    queryParams.bbox = params.bbox;
  }

  return Promise.all(
    typeNames.map(type =>
      axios({
        url: afvalApiUrl + type,
        params: queryParams,
      })
    )
  ).then(responses => {
    return responses.map((response, index) => {
      return {
        id: types[index],
        items: response.data.features.map(item => {
          const [lng, lat] = item.geometry.coordinates;
          return {
            id: item.properties.id_number,
            latLng: [lat, lng],
            title: item.properties.text,
          };
        }),
      };
    });
  });
}

module.exports = {
  path: '/api/afvalcontainers',
  async status(req, res, next) {
    const datasets = await getData(req.query.types, req.query);
    return res.json(datasets);
  },
};
