const axios = require('axios');
const dataset = require('../json/afvalcontainers.json');
const afvalApiUrl =
  'https://map.data.amsterdam.nl/maps/afval?REQUEST=GetFeature&SERVICE=wfs&version=2.0.0&outputformat=application/json;%20subtype=geojson;%20charset=utf-8&TYPENAMES=';

function getMapServerCollectionId(id) {
  return 'ms:' + (id || 'container') + '_coordinaten';
}

async function getData(types, params = {}) {
  const queryParams = {};
  if (params.bbox) {
    queryParams.bbox = params.bbox;
  }

  const containersByType = dataset.features.reduce((acc, feature) => {
    const type = feature.properties.waste_name.toLowerCase();
    if (!acc[type]) {
      acc[type] = { data: { features: [] } };
    }
    acc[type].data.features.push(feature);
    return acc;
  }, {});

  return Promise.all(
    types.map(
      type => Promise.resolve(containersByType[type])
      // type =>
      //   axios({
      //     url: afvalApiUrl + getMapServerCollectionId(type),
      //     params: queryParams,
      //   })
    )
  ).then(responses => {
    return responses
      .filter(resp => !!resp)
      .map((response, index) => {
        console.log('resp::', response);
        return {
          id: types[index],
          items: response.data.features.map(item => {
            const [lng, lat] = item.geometry.coordinates;
            return {
              id: item.properties.id_number,
              latLng: [lat, lng],
              title: item.properties.text,
              type: item.properties.waste_name,
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
