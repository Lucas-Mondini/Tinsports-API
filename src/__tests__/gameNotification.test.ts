const requestNotification = require("supertest");
const moment = require("moment-timezone");

const notificationMock = {
  name: "Treta do véio zé ",
  type: "Treta",
  location: "Casa do véio zé" + Math.random() * 100,
  description: "Cume uns cu e pah",
  value: "15,50",
  date: moment().format("DD/MM/YYYY"),
  hour: moment().tz("America/Sao_Paulo").add(1.016, 'hour').format("HH:mm"),
  recurrence: false
}

const friendInviteMock = {
  game_ID: "",
  user_ID: "62238c37477f1940d402b0bf"
}

const notification_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGYxZTNkNGY0YjIzMzBjMzQ1NzBkNDYiLCJpYXQiOjE2NDI4NzAxNDZ9.5k8UmjmIpPbYwXx1haS_FYUYWdo6NLYZBsgtdXLJWD8";

describe("Test all user routes", () => {
  const game = requestNotification.agent('http://localhost:3000');

  test('Should create a new game', async () => {
    let response = await game.post('/games').send(notificationMock)
      .set('auth_token', notification_token);

    friendInviteMock.game_ID = response.body.game._id;
    expect(response.status).toBe(200);
    expect(response.body.game).toHaveProperty('_id');
  });

  test("Should invite friend to game", async () => {
    let response = await game.post('/game-list').send(friendInviteMock)
      .set('auth_token', notification_token);

    expect(response.status).toBe(200);
  });
});