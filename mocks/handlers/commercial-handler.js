const jose = require('jose');

class CommercialHandler {
  static get id() {
    return 'commercial-user-check';
  }

  static get validationSchema() {
    return {
      type: 'object',
      properties: {
        code: {
          type: 'number',
        },
        body: {
          type: 'object',
        },
      },
      required: ['code', 'body'],
      additionalProperties: false,
    };
  }

  constructor(options, core) {
    this._code = options.code;
    this._core = core;
    this._body = options.body;
  }

  middleware(req, res, next) {
    if (isCommercialUser(req)) {
      this._core.logger.info('Commercial user');
      res.status(500);
      res.send('no-content');
    } else {
      this._core.logger.info('Non-commercial user');
      res.status(200);
      res.send(this._body);
    }
  }

  get preview() {
    return this._body;
  }
}

function isCommercialUser(req) {
  if (req.headers.authorization === undefined) {
    return false;
  }
  const jwtDecoded = jose.decodeJwt(req.headers.authorization.split(' ')[1]);
  if (jwtDecoded === undefined || jwtDecoded.aud === undefined) {
    return false;
  }
  return jwtDecoded.aud === 'amsterdam1';
}

module.exports = CommercialHandler;
