const formidable = require('formidable');

class IntermediateAPIHandler {
  static get id() {
    return 'intermediate-api-handler';
  }

  // Validate the options that are passed to the constructor
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

  middleware(req, res, _next) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, _files) => {
      if (err) {
        this._core.logger.error(err);
      }

      let identifier;
      try {
        identifier = fields.function[0];
      } catch (e) {
        res.status(404);
        this._core.logger.error(
          "Not found: No identifier found in 'fields.function[0]'"
        );
        return;
      }

      for (let endpoint of Object.values(this._options)) {
        if (identifier === endpoint.identifier) {
          res.status(200);
          res.send(endpoint.body);
          this._core.logger.debug(
            `identifier: '${identifier}' found and body send`
          );
          return;
        }
      }

      res.status(404);
      this._core.logger.error(
        `unknown identifier '${identifier}' type response`
      );
    });
  }

  get preview() {
    return null;
  }
}

module.exports = IntermediateAPIHandler;
