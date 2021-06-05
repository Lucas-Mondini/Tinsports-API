const swaggerData = require('./swagger-output.json');
const fs = require('fs');

for (path in swaggerData.paths) {

  for (method in swaggerData.paths[path]) {
    if(path == "/register/user" && method == "post" || path == "/login") continue;
    const params = swaggerData.paths[path][method]['parameters'].push({
      name: "auth_token",
      in: "header",
      required: true,
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGE5MjgxNDRkMWFmOTA1ZThkNTk0MjkiLCJpYXQiOjE2MjI4NDgyOTh9.GYtB6ed3XfrZDDXB8oGd7jQUxlUfgIIpA-uo1eIb9LQ"
    });
  }
}

fs.writeFile("swagger-output.json", JSON.stringify(swaggerData), () => console.log('Data formatted!'));