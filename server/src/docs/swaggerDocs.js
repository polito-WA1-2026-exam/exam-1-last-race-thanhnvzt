import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openApiDocument.js';

const swaggerOptions = {
  customSiteTitle: 'Last Race API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    requestInterceptor: (request) => {
      request.credentials = 'include';
      return request;
    },
  },
};

export function mountSwaggerDocs(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, swaggerOptions));
}
