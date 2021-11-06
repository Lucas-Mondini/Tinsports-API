import User from "../model/userModel";

export default class Equalizer {
  async equalize()
  {
    await this.equalizeUsers();
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
}