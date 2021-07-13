const requestUser = require("supertest");

const userMock = {
  name: "Jean Carlos Gomes",
  _id: "",
  email: "jeancandonga@gmail.com",
  pass: "123456",
  confPass: "123456",
  auth_token: ""
}

const userMock2 = {
  name: "Marcelão",
  _id: "60ecc1bb78768812c80a8f53",
  email: "marcelao123@gmail.com",
  pass: "123456",
  confPass: "123456",
  auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVjYzFiYjc4NzY4ODEyYzgwYThmNTMiLCJpYXQiOjE2MjYxMjkyODJ9.PK8LaArJP69TN3sOaSOITKMEBnIK7LEbMzAlZ8n3Zqo"
}

describe("Test all user routes", () => {
  const user = requestUser.agent('http://localhost:3000');

  test('Should create a new user', async () => {
    let response = await user.post('/register/user').send({
      name: userMock.name,
      email: userMock.email,
      pass: userMock.pass,
      confPass: userMock.confPass
    });

    userMock._id = response.body._id;
    userMock.auth_token = response.body.auth_token;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
  });

  test('Should able user to make login', async () => {
    const response = await user.post('/login').send({
      email: userMock.email,
      pass: userMock.pass
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('auth_token');
  });

  test('Should be able to find user by name', async () => {
    const response = await user.get('/register/user/Jean').set('auth_token', userMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should be able to get all users', async () => {
    const response = await user.get('/register/user').set('auth_token', userMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should be able to get user by name', async () => {
    const response = await user.get('/register/user/Marc').set('auth_token', userMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should be able to update user', async () => {
    const response = await user.put('/register/user/'+userMock2._id)
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
    let response = await user.delete('/register/user/'+userMock._id).set('auth_token', userMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    response = await user.get('/register/user').set('auth_token', userMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

});