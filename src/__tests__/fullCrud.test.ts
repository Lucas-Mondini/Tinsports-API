const requestCrud = require("supertest");

const newUserMock = {
  name: "Pedro Cardoso",
  _id: "",
  email: "pedrocardoso@gmail.com",
  pass: "123456",
  confPass: "123456",
  auth_token: ""
}

const newUserGameMock = {
  _id: "",
  name: "Test game 3",
  type: "Football",
  location: "Condo park",
  description: "Enjoy a little game with some friends",
  value: "15,50",
  host_ID: "",
  date: "20/10/2021",
  hour: "18:00"
}

const friendMock2 = {
  _id: "",
  user_ID: "",
  friend_ID: "",
  confirmed: null
}

const gameListMock2 = {
  _id: "",
  user_ID: "",
  game_ID: "",
  confirmed: null
}

describe("Test all user routes", () => {
  const crud = requestCrud.agent('http://localhost:3000');

  test('Should create a new user', async () => {
    let response = await crud.post('/register/user').send(newUserMock);

    newUserMock._id = response.body._id;
    newUserMock.auth_token = response.body.auth_token;
    newUserGameMock.host_ID = response.body._id;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
  });

  test('Should able user to make login', async () => {
    const response = await crud.post('/login').send({
      email: newUserMock.email,
      pass: newUserMock.pass
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('auth_token');
  });

  test('Should be able to find user by name', async () => {
    const response = await crud.get('/register/user/Marc').set('auth_token', newUserMock.auth_token);

    friendMock2.friend_ID = response.body[0]._id;
    friendMock2.user_ID = newUserMock._id;

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should send a friend request', async () => {
    let response = await crud.post('/friend').send(friendMock2)
      .set('auth_token', newUserMock.auth_token);

    friendMock2._id = response.body._id;
    friendMock2.confirmed = response.body.confirmed;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('confirmed');
  });

  test('Should confirm a friend request', async () => {
    const response = await crud.post('/friend/confirm/'+friendMock2._id)
      .set('auth_token', newUserMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.confirmed).toBe(true);
  });

  test('Should be able to find friends', async () => {
    const response = await crud.get('/friend/'+newUserMock._id)
      .set('auth_token', newUserMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.friends.length > 0);
  });

  test('Should create a new game', async () => {
    let response = await crud.post('/games').send(newUserGameMock)
      .set('auth_token', newUserMock.auth_token);

      newUserGameMock._id = response.body._id;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
  });

  test('Should create a new game list', async () => {
    let response = await crud.post('/game-list/invite').send({
      user_ID: newUserMock._id,
      game_ID: "60f098b74702182a5ca92c32"
    })
      .set('auth_token', newUserMock.auth_token);

    gameListMock2._id = response.body.gameList._id;
    gameListMock2.confirmed = response.body.gameList.confirmed;
    gameListMock2.game_ID = response.body.gameList.game_ID;
    gameListMock2.user_ID = response.body.gameList.user_ID;

    expect(response.status).toBe(200);
    expect(response.body.gameList).toHaveProperty('_id');
    expect(response.body.gameList).toHaveProperty('confirmed');
  });

  test('Should confirm invitation', async () => {
    const response = await crud.post('/game-list/invite-confirmation')
      .send({
        _id: gameListMock2._id,
        user_ID: newUserMock._id
      })
      .set('auth_token', newUserMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.gameList.confirmed).toBe(true);
  });

  test('Should be able to find user invitations', async () => {
    const response = await crud.get('/game-list/invite/'+gameListMock2.user_ID)
      .set('auth_token', newUserMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.length > 0);
  });

  test('Should be able to get all users', async () => {
    const response = await crud.get('/register/user').set('auth_token', newUserMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });

  test('Should delete user', async () => {
    let response = await crud.delete('/register/user/'+newUserMock._id).set('auth_token', newUserMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');

    response = await crud.get('/register/user').set('auth_token', newUserMock.auth_token);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test("Should verify if all user info is deleted with him", async () =>{
    const games = await crud.get('/games').set('auth_token', newUserMock.auth_token);
    const gameList = await crud.get('/game-list').set('auth_token', newUserMock.auth_token);
    const friends = await crud.get('/friend').set('auth_token', newUserMock.auth_token);
    const user = await crud.get('/register/user').set('auth_token', newUserMock.auth_token);

    expect(games.body).toHaveLength(1);
    expect(gameList.body).toHaveLength(0);
    expect(friends.body).toHaveLength(0);
    expect(user.body).toHaveLength(2);
  });

});