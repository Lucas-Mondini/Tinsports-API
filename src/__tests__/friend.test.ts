const friendRequest = require("supertest");

const friendMock = {
  _id: "",
  user_ID: "60f0984a4702182a5ca92c31",
  friend_ID: "60f0983c4702182a5ca92c30",
  confirmed: null
}

const tokenAuth = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGYwOTg0YTQ3MDIxODJhNWNhOTJjMzEiLCJpYXQiOjE2MjYzODA0MjN9.paaXviCbw9TP5krJO3Pn4409X6MImH_-DbvUh2FuhpI";

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