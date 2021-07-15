const requestGame = require("supertest");

const gameMock = {
  _id: "",
  name: "Test game 1",
  type: "Football",
  location: "Condo park",
  description: "Enjoy a little game with some friends",
  value: "15,50",
  host_ID: "60f0984a4702182a5ca92c31",
  date: "20/10/2021",
  hour: "18:00"
}

const auth_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGYwOTg0YTQ3MDIxODJhNWNhOTJjMzEiLCJpYXQiOjE2MjYzODA0MjN9.paaXviCbw9TP5krJO3Pn4409X6MImH_-DbvUh2FuhpI";

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