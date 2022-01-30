const requestRecurrence = require("supertest");
const moment = require("moment-timezone");

const recurrenceMock = {
  _id: "Game" + Math.random() * 100,
  name: "Test game " + Math.random() * 100,
  type: "Football" + Math.random() * 100,
  location: "Condo park" + Math.random() * 100,
  description: "Enjoy "+ Math.random() * 100,
  value: "15,50",
  date: moment().format("DD/MM/YYYY"),
  hour: moment().tz("America/Sao_Paulo").add(1, 'minute').format("HH:mm"),
  recurrence: true
}

const recurrence_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGYxZTNkNGY0YjIzMzBjMzQ1NzBkNDYiLCJpYXQiOjE2NDI4NzAxNDZ9.5k8UmjmIpPbYwXx1haS_FYUYWdo6NLYZBsgtdXLJWD8";

describe("Test all user routes", () => {
  const game = requestRecurrence.agent('http://localhost:3000');

  test('Should create a new game', async () => {
    let response = await game.post('/games').send(recurrenceMock)
      .set('auth_token', recurrence_token);

    expect(response.status).toBe(200);
    expect(response.body.game).toHaveProperty('_id');
  });
});