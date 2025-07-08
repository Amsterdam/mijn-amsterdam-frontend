import { constants as httpConstants } from 'node:http2';

import { IncomingForm } from 'formidable';

/** A middleware type handler to inspect a multipart form to determine what json body to send.
 *
 * To options you can pass an object with endpoints which er also objects.
 *
 * Where an endpoint consists of:
 *  endpointname: {
 *   identifier: identifier string to look for in next property defined form field,
 *   isMatch: function that retrieves a value in the form fields,
 *   body: json type body response
 *  }
 *
 *  # Example
 *  ```javascript
 *  options: {
 *    klachten: {
 *      isMatch: isIncomingFormFunction('readKlacht'),
 *      body: KLACHTEN_RESPONSE,
 *    },
 *    avg: {
 *      isMatch: isIncomingFormFunction('readAvg'),
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
    const form = new IncomingForm();

    form.parse(req, async (err, fields, _files) => {
      if (err) {
        this._core.logger.error(err);
        return;
      }

      for (let endpoint of Object.values(this._options)) {
        if (endpoint.isMatch(fields, this._core)) {
          const status = endpoint.statusCode || httpConstants.HTTP_STATUS_OK;
          res.status(status);
          if (status !== httpConstants.HTTP_STATUS_OK) {
            return res.end();
          }
          res.send(endpoint.body);
          this._core.logger.debug(
            `Endpoint with ${endpoint.identifier} found and body sent`
          );
          return;
        }
      }

      this._core.logger.error('No matching identifier found');
      res.status(httpConstants.HTTP_STATUS_NOT_FOUND);
      next();
    });
  }

  get preview() {
    return null;
  }
}

export default IntermediateAPIHandler;
