const formidable = require('formidable');

const KLACHTEN_RESPONSE = require('../fixtures/klachten.json');
const AVG_RESPONSE = require('../fixtures/avg.json');
const AVG_THEMAS_RESPONSE = require('../fixtures/avg-themas.json');

// RP TODO: AVG duurt lang om te laden? lijkt geblokt te worden door get-kvk
module.exports = [
  {
    id: 'get-enableu2smile-klachten',
    url: '/remote/smile',
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, _next, core) => {
            const form = new formidable.IncomingForm();

            form.parse(req, async (err, fields, _files) => {
              if (err) {
                core.logger.error(err);
              }

              let identifier;
              try {
                identifier = fields.function[0];
              } catch (e) {
                res.status(404);
                core.logger.error(
                  "Not found: No identifier found in 'fields.function[0]'"
                );
                return;
              }

              if (identifier === 'readKlacht') {
                res.status(200);
                res.send(KLACHTEN_RESPONSE);
              } else if (identifier === 'readAVGverzoek') {
                res.status(200);
                res.send(AVG_RESPONSE);
              } else if (identifier === 'readthemaperavgverzoek') {
                res.status(200);
                res.send(AVG_THEMAS_RESPONSE);
              } else {
                res.status(404);
                core.logger.error(
                  `unknown identifier '${identifier}' type response`
                );
              }

              core.logger.debug(`identifier: '${identifier}'`);
            });
          },
        },
      },
    ],
  },
];
