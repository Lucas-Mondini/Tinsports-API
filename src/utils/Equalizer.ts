import User from "../model/userModel";
import Game from "../model/gameModel";
import ScheduleController from "../controllers/scheduleController";

export default class Equalizer {
  async equalize()
  {
    await this.equalizeUsers();
    await this.equalizeGames();
    await ScheduleController.loadAllSchedules();
  }

  async equalizeUsers()
  {
    const users = await User.find();

    for (const user of users) {
      if (!user.premium) {
        user.premium = false;
      }

      if (!user.deletedAt) {
        user.deletedAt = null;
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