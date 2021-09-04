import User, { UserType } from "../model/userModel";
import Game from "../model/gameModel";
import GameList from "../model/gameListModel";
import Friends, { FriendsType } from "../model/friendsListModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DefaultController from "./DefaultController";

export default class UserController extends DefaultController {
  /**
   *  Method to get all users from database
   */
  async getAllUsers() {
    const users = await User.find();

    return users;
  }

  /**
   *  Get all users by name
   */
  async getUserByName(name: String, id: string) {
    try {
      const availableUsers = new Array();
      let users;

      const friends = await Friends.find().or([
        { user_ID: id },
        { friend_ID: id }
      ]);

      if (name === '*') {
        users = await User.find();
      } else {
        users = await User.find({ name: { $regex: '.*' + name + '.*' } });
      }

      for (const user of users) {
        const [alreadyFriends] = friends.filter((friend: FriendsType) => friend.user_ID == user._id || friend.friend_ID == user._id);

        if (!alreadyFriends && user._id !== id) {
          availableUsers.push(user);
        }
      }

      return availableUsers;
    } catch (e) {
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   *  Get all users by id
   */
  async getUserById(_id: String) {
    try {
      const user = await User.findOne({ _id });

      return user;
    } catch (e) {
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   * Save a new user
   */
  async createNewUser(newUser: UserType) {
    try {
      let { name, email, pass, confPass } = newUser;
      let hash = null;

      const cmpEmail = await User.findOne({ email });
      if (cmpEmail)
        return { status: 400, message: "Email already in use" };

      if (pass == confPass) {
        hash = await bcrypt.hash(pass, 10);
      } else return { status: 401, message: "Passwords don't match" };

      if (hash) {
        const user = new User({ name, email, pass: hash, reputation: null, photo: "", premium: false });

        let tokenSecret = String(process.env.TOKEN_SECRET);

        const token = jwt.sign({
          _id: user._id
        }, tokenSecret);

        await user.save();

        return {
          name: user.name, _id: user._id, email: user.email, auth_token: token, reputation: user.reputation
        };
      }
    } catch (e) {
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   *  Delete user, his games, game lists and friends
   */
  async deleteUser(_id: string) {
    try {
      const user = await User.findOne({ _id });
      const games = await Game.find({ host_ID: _id });
      const invitations = await GameList.find({ user_ID: _id });
      const friends = await Friends.find().or([
        { user_ID: _id },
        { friend_ID: _id }
      ]);
      const gameLists = [...invitations];

      if (!user)
        return { status: 404, message: "User doesn't exist" };

      for (const game of games) {
        const lists = await GameList.find({ game_ID: game._id });
        gameLists.push(...lists);
      }

      await this.destroyObjectArray(gameLists);
      await this.destroyObjectArray(games);
      await this.destroyObjectArray(friends);

      await user.delete();
      return { message: "User deleted successfully" };
    } catch (e) {
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  async updateReputation(paid: boolean, participated: boolean, user_ID: string) {
    try {
      const user = await this.updateReputationMethod(paid, participated, user_ID);

      if (!user) return { status: 404, message: "User not found" };

      return user;
    } catch (error) {
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   *  Update user info
   */
  async updateUser(userInfo: UserType, userId: string) {
    try {

      let { pass, newName, newEmail, newPass } = userInfo;

      const user = await User.findOne({ _id: userId });

      if (!user)
        return { status: 404, error: "User doesn't exist" };

      let passCompare = await bcrypt.compare(pass, user.pass);

      if (!passCompare)
        return { status: 401, error: "Email or password is incorrect" };

      let userUpdate = {
        name: (newName) ? newName : user.name,
        email: (newEmail) ? newEmail : user.email,
        pass: (newPass) ? await bcrypt.hash(newPass, 10) : user.pass,
        last_pass: (newPass) ? user.pass : null
      }

      await user.updateOne(userUpdate);
      await user.save();

      return { message: "User update successfully" };

    } catch (e) {
      return { status: 500, message: "Ops! Something went wrong" };
    }

  }

  /**
   * Method that makes the login
   */
  async login(email: string, pass: string) {
    try {
      const user = await User.findOne({ email });

      if (!user)
        return { status: 404, error: "User not found" };

      if (await bcrypt.compare(pass, user.pass)) {
        let tokenSecret = String(process.env.TOKEN_SECRET);

        const token = jwt.sign({
          _id: user._id
        }, tokenSecret);

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          auth_token: token,
          reputation: user.reputation,
          photo: user.photo,
          premium: user.premium
        };
      }

      return { status: 401, message: "Email or password is incorrect" };
    } catch (e) {
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  async updateReputationMethod(paid: boolean, participated: boolean, user_ID: string) {
    const user = await User.findOne({ _id: user_ID });

    if (!user) return { status: 404, message: "User doesn't exist'" };

    let reputation = user.reputation || 50;

    (participated && !paid) ? reputation -= 5 : !participated ? reputation -= 3 : reputation += 5;

    if (reputation > 50) reputation = 50;
    if (reputation <= 0) reputation = 0;

    user.reputation = reputation;
    user.save();

    return user;
  }
}