const requestNotification = require("supertest");
const moment = require("moment-timezone");

const notificationMock = {
  name: "Treta do véio zé ",
  type: "Treta",
  location: "Casa do véio zé",
  description: "Cume uns cu e pah",
  value: "15,50",
  date: moment().format("DD/MM/YYYY"),
  recurrence: true
}

const friendInviteMock = {
  game_ID: "",
  user_ID: "62238c37477f1940d402b0bf"
}

const notification_token  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGYxZTNkNGY0YjIzMzBjMzQ1NzBkNDYiLCJlbWFpbCI6ImplYW5nYW1lczE1QGdtYWlsLmNvbSIsInByZW1pdW0iOnRydWUsImlhdCI6MTY0ODMxMTgwNn0.XdkC2UjZIDSNKB-NwIPl0HES1C7dbkkSHdGOZR9k7O0";
const notification_token2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjIzOGMzNzQ3N2YxOTQwZDQwMmIwYmYiLCJlbWFpbCI6ImplYW5jYXJsb3Nnb21lc0B0dXRhbm90YS5jb20iLCJwcmVtaXVtIjpmYWxzZSwiaWF0IjoxNjQ4MzExNzgwfQ.IpuvYW5SBLHWl_uV_XeSWsw76c6VvNdCo1bypNjXMKk";
let inviteId;

describe("Test all user routes", () => {
  const game = requestNotification.agent('http://localhost:3000');

  test('Should create a new game', async () => {
    let time = 0.016;
    for (let i = 0; i < 2; i++) {

      const gameData = {...notificationMock, name: "Treta do véio zé " + i, hour: moment().tz("America/Sao_Paulo").add(time, 'hour').format("HH:mm")}
      let response = await game.post('/games').send(gameData)
        .set('auth_token', notification_token);

      friendInviteMock.game_ID = response.body.game._id;
      expect(response.status).toBe(200);
      expect(response.body.game).toHaveProperty('_id');

      response = await game.post('/game-list').send(friendInviteMock)
        .set('auth_token', notification_token);

      inviteId = response.body._id;
      expect(response.status).toBe(200);

      response = await game.post('/game-list/invite-confirmation').send({_id: inviteId})
        .set('auth_token', notification_token2);

      expect(response.status).toBe(200);

      time += 0.016;
    }
  });
});