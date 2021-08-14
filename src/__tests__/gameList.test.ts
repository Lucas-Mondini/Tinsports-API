const requestGameList = require("supertest");

const gameListMock = {
  _id: "",
  user_ID: "60f0983c4702182a5ca92c30",
  game_ID: "60f098b74702182a5ca92c32",
  confirmed: null
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGYwOTgzYzQ3MDIxODJhNWNhOTJjMzAiLCJpYXQiOjE2Mjg5NjUxNjF9.STM3F7g0pNVcQqsL0IxOm7MD71NrFscWSdqpGGE6Zf0";

describe("Test all user routes", () => {
  const gameList = requestGameList.agent('http://localhost:3000');

  test('Should create a new game list', async () => {
    let response = await gameList.post('/game-list').send(gameListMock)
      .set('auth_token', token);

    gameListMock._id = response.body.gameList._id;
    gameListMock.confirmed = response.body.gameList.confirmed;

    expect(response.status).toBe(200);
    expect(response.body.gameList).toHaveProperty('_id');
    expect(response.body.gameList).toHaveProperty('confirmed');
  });

  test('Should confirm invitation', async () => {
    const response = await gameList.post('/game-list/invite-confirmation')
      .send({
        _id: gameListMock._id,
        user_ID: gameListMock.user_ID
      })
      .set('auth_token', token);

    expect(response.status).toBe(200);
    expect(response.body.gameList.confirmed).toBe(true);
  });

  test('Should be able to find user invitations', async () => {
    const response = await gameList.get('/game-list/invite')
      .set('auth_token', token);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should delete game list', async () => {
    let response = await gameList.delete('/game-list/'+gameListMock._id)
      .set('auth_token', token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    response = await gameList.get('/game-list/invite').set('auth_token', token);
  });

});