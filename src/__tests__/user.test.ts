const request = require("supertest");

const userMock = {
  name: "Jean Carlos Gomes",
  _id: "",
  email: "jeancandonga@gmail.com",
  pass: "123456",
  confPass: "123456",
  auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVjYmJiOWNkODNkMDQ5ODA2OGM0MDEiLCJpYXQiOjE2MjYxMjc0MzV9.FwNH9NGJprPtsOSVqft1RG4gzU7qNJOetVQupFur1Js"
}

const userMock2 = {
  name: "Jean Carlos",
  _id: "60ecc1bb78768812c80a8f53",
  email: "jeancarlos@gmail.com",
  pass: "123456",
  confPass: "123456",
  auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVjYzFiYjc4NzY4ODEyYzgwYThmNTMiLCJpYXQiOjE2MjYxMjkyODJ9.PK8LaArJP69TN3sOaSOITKMEBnIK7LEbMzAlZ8n3Zqo"
}

let id = "";

describe("Test all user routes", () => {
  const agent = request.agent('http://localhost:3000');

  test('Should create a new user', async () => {
    let response = await agent.post('/register/user').send({
      name: userMock.name,
      email: userMock.email,
      pass: userMock.pass,
      confPass: userMock.confPass
    });

    userMock._id = response.body._id;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
  });

  test('Should able user to make login', async () => {
    const response = await agent.post('/login').send({
      email: userMock.email,
      pass: userMock.pass
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('auth_token');
  });

  test('Should be able to find user by name', async () => {
    const response = await agent.get('/register/user/Jean').set('auth_token', userMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should be able to find user by name', async () => {
    const response = await agent.get('/register/user').set('auth_token', userMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should be able to update user', async () => {
    const response = await agent.put('/register/user/'+userMock2._id)
      .set('auth_token', userMock2.auth_token)
      .send({
        pass: userMock2.pass,
        newName: userMock2.name,
        newEmail: userMock2.email
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });

  test('Should delete user', async () => {
    const response = await agent.delete('/register/user/'+userMock._id).set('auth_token', userMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });

});