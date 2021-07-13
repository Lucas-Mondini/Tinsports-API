const requestGameList = require("supertest");

const gameListMock = {
  _id: "",
  user_ID: "60ecc1bb78768812c80a8f53",
  game_ID: "60edec4383ca092bfc142a71",
  confirmed: null
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVjYzFiYjc4NzY4ODEyYzgwYThmNTMiLCJpYXQiOjE2MjYyMDQ4Nzl9.TdU4n68CAw-S2Hdm1qRGkpp-Q8NvLLgqnAm8Q1z1FA0";

describe("Test all user routes", () => {
  const gameList = requestGameList.agent('http://localhost:3000');

  test('Should create a new game list', async () => {
    let response = await gameList.post('/game-list/invite').send(gameListMock)
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
    const response = await gameList.get('/game-list/invite/'+gameListMock.user_ID)
      .set('auth_token', token);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should delete game list', async () => {
    let response = await gameList.delete('/game-list/'+gameListMock._id+'/delete')
      .set('auth_token', token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    response = await gameList.get('/game-list/invite/'+gameListMock.user_ID).set('auth_token', token);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

});