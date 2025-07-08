import { decodeJwt } from 'jose';

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
            status: {
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
            status: {
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

  middleware(req, res, _next) {
    let resStatus = this._privateUser.status;
    let resBody = this._privateUser.body;

    if (isCommercialUser(req)) {
      this._core.logger.debug('Request from a commercial user');
      resStatus = this._commercialUser.status;
      resBody = this._commercialUser.body;
    } else {
      this._core.logger.debug('Request from a non-commercial user');
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

  if (!auth?.startsWith('Bearer ')) {
    return false;
  }

  const jwtToken = auth.split(' ')[1];
  const jwtDecoded = jwtToken ? decodeJwt(jwtToken) : jwtToken;

  if (!jwtDecoded) {
    return false;
  }

  // Different requests can have different identifiers of being a commercial user.
  return (
    jwtDecoded.aud === 'mijnamsterdam1' ||
    jwtDecoded.role === 'niet_natuurlijk_persoon'
  );
}

export default ProfileTypeHandler;
