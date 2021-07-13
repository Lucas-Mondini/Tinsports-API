const requestGame = require("supertest");

const gameMock = {
  _id: "",
  name: "Test game 1",
  type: "Football",
  location: "Condo park",
  description: "Enjoy a little game with some friends",
  value: "15,50",
  host_ID: "60ecc1bb78768812c80a8f53",
  date: "20/10/2021",
  hour: "18:00"
}

const gameMock2 = {
  _id: "60edec4383ca092bfc142a71",
  name: "Test game 2",
  type: "Football",
  location: "Condo park",
  description: "Enjoy a little game with some friends",
  value: "15,50",
  host_ID: "60ecc1bb78768812c80a8f53",
  date: "20/10/2021",
  hour: "18:00"
}

const auth_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVjYzFiYjc4NzY4ODEyYzgwYThmNTMiLCJpYXQiOjE2MjYyMDQ4Nzl9.TdU4n68CAw-S2Hdm1qRGkpp-Q8NvLLgqnAm8Q1z1FA0";

describe("Test all user routes", () => {
  const game = requestGame.agent('http://localhost:3000');

  test('Should create a new game', async () => {
    let response = await game.post('/games').send(gameMock)
      .set('auth_token', auth_token);

    gameMock._id = response.body._id;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
  });

  test('Should able to get games related to user', async () => {
    const response = await game.get('/games/home/'+gameMock.host_ID).set('auth_token', auth_token);

    expect(response.status).toBe(200);
    expect(response.body.invitedGames).toHaveLength(0);
    expect(response.body.friendsGames).toHaveLength(0);
    expect(response.body.userGames).toHaveLength(2);
  });

  test('Should be able to find game by id', async () => {
    const response = await game.get('/games/'+gameMock._id).send({id: gameMock.host_ID}).set('auth_token', auth_token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
  });

  test('Should delete game', async () => {
    let response = await game.post('/games/'+gameMock._id+'/delete')
      .send({host_ID: gameMock.host_ID})
      .set('auth_token', auth_token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    response = await game.get('/games/home/'+gameMock.host_ID).set('auth_token', auth_token);

    expect(response.status).toBe(200);
    expect(response.body.userGames).toHaveLength(1);
  });

});