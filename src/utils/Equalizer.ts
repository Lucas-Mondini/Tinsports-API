import User from "../model/userModel";

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

      user.save();
    }
  }
  async equalizeGames() 
  {
    const games = await User.find();

    for (const game of games) {
      if(!game.recurrence) {
        game.recurrence = false;
      }
      game.save();
    }
  }
}