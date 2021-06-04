const swaggerData = require('./swagger-output.json');
const fs = require('fs');

for (path in swaggerData.paths) {

  for (method in swaggerData.paths[path]) {
    if(path == "/register/user" && method == "post" || path == "/login") continue;
    const params = swaggerData.paths[path][method]['parameters'].push({
      name: "auth_token",
      in: "header"
    });
  }
}

fs.writeFile("swagger-output.txt", JSON.stringify(swaggerData), () => console.log('Data formatted!'));
