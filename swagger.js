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
  basePath: "/",
  schemes: [
    "http", "https"
  ],
  servers: [{
    url: 'http://localhost:3000',
    description: 'Development server',
  }, ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
  './src/routes/FriendRoutes.ts',
  './src/routes/GameListRoutes.ts',
  './src/routes/GameRoutes.ts',
  './src/routes/UserRoutes.ts',
];

swaggerAutogen(outputFile, endpointsFiles, doc);
