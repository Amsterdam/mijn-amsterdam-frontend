const jose = require('jose');

// options: {
//   private: {
//     code: 200,
//     data: BRP_DATA
//   },
//   commercial: {
//     code: 500,
//     data: 'no-content'
//   }
// }
//
// options: {
//   private: {
//     code: 200,
//     data: KVK_DATA_PRIVATE
//   },
//   commercial: {
//     code: 200,
//     data: KVK_DATA_COMMERCIAL
//   }
// }

class ProfileTypeHandler {
  static get id() {
    return 'profile-type-handler';
  }

  // Validate the options that are passed to the constructor
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
      this._core.logger.debug('Request from a commercial user');
      // TODO: status is ook 200 ook voor commercial user
      res.status(this._code);
      res.send('no-content');
    } else {
      this._core.logger.debug('Request from a non-commercial user');
      res.status(this._code);
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

module.exports = ProfileTypeHandler;
