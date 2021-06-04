const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Tinsposrt API documentation',
    version: '0.0.1',
    description: '',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://spdx.org/licenses/MIT.html',
    },
  },
  basePath: "/login",
  schemes: [
    "http", "https"
  ],
  servers: [{
    url: 'http://localhost:3000',
    description: 'Development server',
  }, ],
  parameters: [
    {
     name: "auth_token",
     in: "header"
    },
 ],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/routes.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);
