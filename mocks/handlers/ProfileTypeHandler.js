const jose = require('jose');

class ProfileTypeHandler {
  static get id() {
    return 'profile-type-handler';
  }

  // Validate the options that are passed to the constructor
  static get validationSchema() {
    return {
      type: 'object',
      properties: {
        privateUser: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
            },
            body: {
              type: ['object', 'array', 'string'],
            },
          },
        },
        commercialUser: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
            },
            body: {
              type: ['object', 'array', 'string'],
            },
          },
        },
      },
      required: ['privateUser', 'commercialUser'],
      additionalProperties: false,
    };
  }

  constructor(options, core) {
    this._core = core;

    this._privateUser = options.privateUser;
    this._commercialUser = options.commercialUser;
  }

  middleware(req, res, next) {
    let resStatus = undefined;
    let resBody = undefined;

    if (isCommercialUser(req)) {
      this._core.logger.debug('Request from a commercial user');
      resStatus = this._commercialUser.statusCode;
      resBody = this._commercialUser.body;
    } else {
      this._core.logger.debug('Request from a non-commercial user');
      resStatus = this._privateUser.statusCode;
      resBody = this._privateUser.body;
    }

    res.status(resStatus);
    res.send(resBody);
  }

  get preview() {
    return null;
  }
}

function isCommercialUser(req) {
  const auth = req.headers?.authorization;

  if (auth === undefined || auth === null || !auth.startsWith('Bearer ')) {
    return false;
  }

  const jwtDecoded = jose.decodeJwt(auth.split(' ')[1]);

  if (jwtDecoded === undefined) {
    return false;
  }

  // Different requests can have different identities of being a commercial user.
  return (
    jwtDecoded.aud === 'amsterdam1' ||
    jwtDecoded.role === 'niet_natuurlijk_persoon'
  );
}

module.exports = ProfileTypeHandler;
