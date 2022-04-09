import User from "../model/userModel";
import Game from "../model/gameModel";
import moment from "moment-timezone";

export default class Equalizer {
  async equalize()
  {
    await this.equalizeUsers();
    await this.equalizeGames();
  }

  async equalizeUsers()
  {
    const users = await User.find();

    for (const user of users) {
      if (!user.premium) {
        user.premium = false;
      }

      if (!user.confirmed) {
        user.confirmed = false;
      }

      if (!user.code) {
        user.code = null;
      }

      if (!user.deletedAt) {
        user.deletedAt = null;
      }
      if (!user.premiumTill) {
        user.premiumTill = moment().tz("America/Sao_paulo");
      }

      user.save();
    }
  }

  async equalizeGames()
  {
    const games = await Game.find();

    for (const game of games) {
      if(!game.recurrence) {
        game.recurrence = false;
      }

      if (!game.deletedAt) {
        game.deletedAt = null;
      }

      game.save();
    }
  }
}