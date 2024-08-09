const formidable = require('formidable');

/** A middleware type handler to inspect a multipart form to determine what json body to send.
 *
 * To options you can pass an object with endpoints which er also objects.
 *
 * Where an endpoint consists of:
 *  endpointname: {
 *   identifier: identifier string to look for in next property defined form field,
 *   getFieldWithIdentifier: function that retrieves a value in the form fields,
 *   body: json type body response
 *  }
 *
 *  # Example
 *  ```javascript
 *  options: {
 *    klachten: {
 *      identifier: 'readKlacht',
 *      getFieldWithIdentifier: getSmileIdentifyingField,
 *      body: KLACHTEN_RESPONSE,
 *    },
 *    avg: {
 *      identifier: 'readAVGverzoek',
 *      getFieldWithIdentifier: getSmileIdentifyingField,
 *      body: AVG_RESPONSE,
 *    },
 *   }
 *  ```
 **/
class IntermediateAPIHandler {
  static get id() {
    return 'intermediate-api-handler';
  }

  // Left empty on purpose, because options are too complex to define here.
  static get validationSchema() {
    return {
      required: [],
      additionalProperties: true,
    };
  }

  constructor(options, core) {
    this._core = core;
    this._options = options;
  }

  middleware(req, res, next) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, _files) => {
      if (err) {
        this._core.logger.error(err);
        return;
      }

      for (let endpoint of Object.values(this._options)) {
        if (
          endpoint.identifier ===
          endpoint.getFieldWithIdentifier(fields, this._core)
        ) {
          res.status(200);
          res.send(endpoint.body);
          this._core.logger.debug(
            `Endpoint with ${endpoint.identifier} found and body sent`
          );
          return;
        }
      }

      this._core.logger.error('No matching identifier found');
      res.status(404);
      next();
    });
  }

  get preview() {
    return null;
  }
}

module.exports = IntermediateAPIHandler;
