export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Last Race API',
    version: '1.0.0',
    description:
      'Debug-only API documentation. Use POST /api/sessions first to create the session cookie for protected endpoints.',
  },
  servers: [
    {
      url: '/',
      description: 'Current debug server',
    },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Sessions' },
    { name: 'Network' },
    { name: 'Games' },
    { name: 'Ranking' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
        description:
          'Session cookie created by POST /api/sessions. In Swagger UI, call the login endpoint first; the browser keeps the cookie for protected requests.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'user1' },
          password: { type: 'string', example: 'password' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'user1' },
          name: { type: 'string', example: 'Alice' },
        },
      },
      SegmentIdList: {
        type: 'object',
        required: ['segmentIds'],
        properties: {
          segmentIds: {
            type: 'array',
            items: { type: 'integer' },
            uniqueItems: true,
            description:
              'Ordered physical segment IDs selected by the player. Repeated segment IDs produce an invalid route result with score 0.',
            example: [1, 2, 3],
          },
        },
      },
      GameResult: {
        type: 'object',
        additionalProperties: true,
        properties: {
          gameId: { type: 'integer' },
          validRoute: { type: 'boolean' },
          score: { type: 'integer' },
          status: { type: 'string', example: 'executed' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'The request needs a logged-in session.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Forbidden: {
        description: 'The logged-in user cannot access the resource.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFound: {
        description: 'The resource was not found.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      Conflict: {
        description: 'The resource is not in the required state.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Check server health',
        responses: {
          200: {
            description: 'Server is running.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/sessions': {
      post: {
        tags: ['Sessions'],
        summary: 'Log in and create a session cookie',
        description:
          'Use seeded credentials such as user1/password. The Set-Cookie response authenticates later protected requests from this Swagger page.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Logged in user.',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string' },
                description: 'Session cookie used by protected endpoints.',
              },
            },
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: {
            description: 'Missing username or password.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/sessions/current': {
      get: {
        tags: ['Sessions'],
        summary: 'Get the current session user',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Current logged-in user.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Sessions'],
        summary: 'Log out and destroy the current session',
        security: [{ cookieAuth: [] }],
        responses: {
          204: { description: 'Logged out.' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/network/setup': {
      get: {
        tags: ['Network'],
        summary: 'Load the full setup network',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Stations, lines, and connections for setup.',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/games': {
      post: {
        tags: ['Games'],
        summary: 'Create a new planning game',
        security: [{ cookieAuth: [] }],
        responses: {
          201: {
            description: 'Created game assignment.',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/games/{gameId}/planning': {
      get: {
        tags: ['Games'],
        summary: 'Load planning data for an owned game',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'gameId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Planning board data.',
            content: {
              'application/json': {
                schema: { type: 'object', additionalProperties: true },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/api/games/{gameId}/route': {
      post: {
        tags: ['Games'],
        summary: 'Submit the selected route',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'gameId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SegmentIdList' },
            },
          },
        },
        responses: {
          200: {
            description: 'Valid, invalid, or expired route result.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GameResult' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
          422: {
            description: 'Malformed route payload.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/games/{gameId}/result': {
      get: {
        tags: ['Games'],
        summary: 'Load a finished game result',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'gameId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Stored game result.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GameResult' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/api/ranking': {
      get: {
        tags: ['Ranking'],
        summary: 'Load protected player ranking',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Ranking rows.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object', additionalProperties: true },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
};
