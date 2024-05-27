const formidable = require('formidable');

const KLACHTEN_RESPONSE = require('../fixtures/klachten.json');
const AVG_RESPONSE = require('../fixtures/avg.json');
const AVG_THEMAS_RESPONSE = require('../fixtures/avg-themas.json');

// RP TODO: AVG duurt lang om te laden?
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
          middleware: (req, res, core) => {
            const form = new formidable.IncomingForm();
            form.parse(req, function (err, fields) {
              if (err) {
                core.logger.error(err);
              } else if (fields.function.length !== 1) {
                core.logger.error(
                  `Unexpected length of ${fields.function.length} from 'fields.function.length.\nIs 'readKlacht' or 'readAVGverzoeken present as data?\nfields.function: ${fields.function.toString()}`
                );
              } else if (fields.function[0] === 'readKlacht') {
                res.status(200);
                res.send(KLACHTEN_RESPONSE);
              } else if (fields.function[0] === 'readAVGverzoek') {
                res.status(200);
                res.send(AVG_RESPONSE);
              } else if (fields.function[0] === 'readthemaperavgverzoek') {
                res.status(200);
                res.send(AVG_THEMAS_RESPONSE);
              }
            });
          },
        },
      },
    ],
  },
];
