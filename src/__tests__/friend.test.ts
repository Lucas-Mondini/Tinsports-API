const friendRequest = require("supertest");

const friendMock = {
  _id: "",
  user_ID: "60ecc1bb78768812c80a8f53",
  friend_ID: "60edff4d9044564470dd593f",
  confirmed: null
}

const tokenAuth = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVjYzFiYjc4NzY4ODEyYzgwYThmNTMiLCJpYXQiOjE2MjYyMDQ4Nzl9.TdU4n68CAw-S2Hdm1qRGkpp-Q8NvLLgqnAm8Q1z1FA0";

describe("Test all user routes", () => {
  const friend = friendRequest.agent('http://localhost:3000');

  test('Should send a friend request', async () => {
    let response = await friend.post('/friend').send(friendMock)
      .set('auth_token', tokenAuth);

    friendMock._id = response.body._id;
    friendMock.confirmed = response.body.confirmed;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('confirmed');
  });

  test('Should confirm a friend request', async () => {
    const response = await friend.post('/friend/confirm/'+friendMock._id)
      .set('auth_token', tokenAuth);

    expect(response.status).toBe(200);
    expect(response.body.confirmed).toBe(true);
  });

  test('Should be able to find friends', async () => {
    const response = await friend.get('/friend/'+friendMock.user_ID)
      .set('auth_token', tokenAuth);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should delete game list', async () => {
    let response = await friend.delete('/friend/'+friendMock._id)
      .set('auth_token', tokenAuth);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    response = await friend.get('/friend/'+friendMock.user_ID).set('auth_token', tokenAuth);

    expect(response.status).toBe(200);
    expect(response.body.friends).toHaveLength(0);
  });

});