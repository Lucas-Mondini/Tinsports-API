import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment-timezone";

import User, { UserType } from "../model/userModel";
import Game from "../model/gameModel";
import GameList from "../model/gameListModel";
import logger from "../utils/logger";
import Friends, { FriendsType } from "../model/friendsListModel";
import DefaultController from "./DefaultController";
import MailTemplateConfigurator from "../utils/MailTemplateConfigurator";
import Mailer from "../services/mailer";

export default class UserController extends DefaultController
{
  /**
   *  Method to get all users from database
   */
  async getAllUsers()
  {
    const users = await User.find();

    return users;
  }

  /**
   *  Get all users by name
   */
  async getUserByName(name: String, id: string)
  {
    try {
      const availableUsers = new Array();
      let users;

      const friends = await Friends.find().or([
        { user_ID: id },
        { friend_ID: id }
      ]);

      if (name === '*') {
        users = await User.find({deletedAt: null});
      } else {
        users = await User.find({name: { $regex: '.*' + name + '.*' }, deletedAt: null});
      }

      for (const user of users) {
        const [alreadyFriends] = friends.filter((friend: FriendsType) => friend.user_ID == user._id || friend.friend_ID == user._id);

        if (!alreadyFriends && user._id !== id) {
          availableUsers.push(user);
        }
      }

      return availableUsers;
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   *  Get user by id
   */
  async getUserById(_id: String)
  {
    try {
      const user = await User.findOne({_id, deletedAt: null});

      if (!user) return { status: 404, message: "User doesn't exist'" };

      return {
        name: user.name, _id: user._id, email: user.email, photo: user.photo,
        reputation: user.reputation, premium: user.premium, confirmed: user.confirmed
      }
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   * Save a new user
   */
  async createNewUser(newUser: UserType)
  {
    try {
      const { name, email, pass, confPass } = newUser;
      const cmpEmail = await User.findOne({email});
      let hash = null;

      if (cmpEmail)
        return { status: 400, message: "Email already in use" };

      if (pass == confPass) {
        hash = await bcrypt.hash(pass, 10);
      } else return { status: 401, message: "Passwords don't match" };

      if (hash) {
        const user = new User({
          name, email, pass: hash, reputation: null, photo: "",
          premium: false, code: null, confirmed: false, deletedAt: null});

        let tokenSecret = String(process.env.TOKEN_SECRET);

        const token = jwt.sign({
          _id: user._id, confirmed: user.confirmed,
          email, premium: user.premium
        }, tokenSecret);

        await this.sendCode(user, "Confirme sua conta", 'confirmUser');

        return {
          name: user.name, _id: user._id, email: user.email, auth_token: token, photo: user.photo,
          reputation: user.reputation, premium: user.premium, confirmed: user.confirmed
        };
      }
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   *  Delete user, his games, game lists and friends
   */
  async deleteUser(_id: string)
  {
    try {
      const user = await User.findOne({_id, deletedAt: null});
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

      if (user.premium) {
        await this.softDeleteArray(games);

        await user.updateOne({deletedAt: moment().tz("America/Sao_Paulo").format("YYYY-MM-DD[T]HH:mm")});
        await user.save();
      } else {
        await this.destroyObjectArray(gameLists);
        await this.destroyObjectArray(games);
        await this.destroyObjectArray(friends);

        await user.delete();
      }

      return { message: "User deleted successfully" };
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  async updateReputation(paid: boolean, participated: boolean, user_ID: string)
  {
    try {
      const user = await this.updateReputationMethod(paid, participated, user_ID);

      if (!user) return { status: 404, message: "User not found" };

      return user;
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   *  Update user info
   */
  async updateUser(userInfo: UserType, userId: string)
  {
    try {

      let { pass, newName, newEmail, newPass } = userInfo;

      const user = await User.findOne({_id: userId, deletedAt: null});

      if (!user) return { status: 404, error: "User doesn't exist" };

      let passCompare = await bcrypt.compare(pass, user.pass);

      if (!passCompare) return { status: 401, error: "Email or password is incorrect" };

      let userUpdate = {
        name: (newName) ? newName : user.name,
        email: (newEmail) ? newEmail : user.email,
        pass: (newPass) ? await bcrypt.hash(newPass, 10) : user.pass,
        last_pass: (newPass) ? user.pass : null
      }

      await user.updateOne(userUpdate);
      await user.save();

      return { message: "User update successfully" };

    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }

  }

  /**
   * Update user photo
   * @param _id user id
   * @param photoUrl photo url
   */
  async updatePhoto(_id: string, photoUrl: string)
  {
    try {
      const user = await User.findOne({_id, deletedAt: null});
      if (!user) return { status: 404, message: "User not found" };

      user.photo = photoUrl;
      await user.save();

      return { message: "Photo update successfully" };
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   *  Update user password
   */
   async updatePass(email: string, pass: string)
   {
     try {
       const user = await User.findOne({email});

       if (!user) return { status: 404, error: "User doesn't exist" };

       const cripto = await bcrypt.hash(pass, 10);
       await user.updateOne({pass: cripto, last_pass: user.password});
       await user.save();

       let tokenSecret = String(process.env.TOKEN_SECRET);

        const token = jwt.sign({
          _id: user._id,
          email, premium: user.premium
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

     } catch (error) {
       logger.error(error);
       return { status: 500, message: "Ops! Something went wrong" };
     }
   }

  /**
   * Method that makes the login
   */
  async login(email: string, pass: string)
  {
    try {
      const user = await User.findOne({email});

      if (!user) return { status: 404, error: "User not found" };

      if (await bcrypt.compare(pass, user.pass)) {
        let tokenSecret = String(process.env.TOKEN_SECRET);

        const token = jwt.sign({
          _id: user._id,
          email, premium: user.premium
        }, tokenSecret);

        if (user.deletedAt) {
          await user.updateOne({deletedAt: null});
          await user.save();
        }

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
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   * Send recovery password email
   * @param email user e-mail
   */
  async forgotPassword(email: string)
  {
    try {
      const user = await User.findOne({email});

      if (!user) return { status: 404, error: "User not found" };

      this.sendCode(user, "Redefinir senha", 'forgotPass');

      return { message: "Code sent successfully"}
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" }
    }
  }

  /**
   * Send recovery password email
   * @param _id user id
   */
  async resendCode(_id: string)
  {
    try {
      const user = await User.findOne({_id});

      if (!user) return { status: 404, error: "User not found" };

      this.sendCode(user, "Confirme sua conta", 'confirmUser');

      return { message: "Code sent successfully"}
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" }
    }
  }

  /**
   * Send user confirmation code
   * @param user
   */
  async sendCode(user: UserType, subject: string, template: string)
  {
    const randomCode = Math.round((Math.random() * 100000)),
          mail = new MailTemplateConfigurator({name: user.name, code: randomCode}, template),
          data = await mail.renderTemplate(),
          criptoCode = await bcrypt.hash(String(randomCode), 10)

    await user.updateOne({code: criptoCode, confirmed: false});
    await user.save();

    new Mailer({
      to: user.email, subject, html: data
    }).sendMail();
  }

  /**
   * Verify user code
   * @param code
   * @param _id user id
   */
  async checkUserCode(code: number, _id: string, email?: string)
  {
    try {
      const identity = _id ? {_id} : {email}
      const user = await User.findOne(identity);

      if (!user) return { status: 404, error: "User not found" };
      if (!user.code) return { status: 401, error: "No code found"}
      if (await bcrypt.compare(code, user.code)) {
        if (!user.confirmed) {
          await user.updateOne({confirmed: true, code: null});
          await user.save();
        }

        let tokenSecret = String(process.env.TOKEN_SECRET);

        const token = jwt.sign({
          _id: user._id,
          email, premium: user.premium
        }, tokenSecret, {
          expiresIn: 60 * 4 * 1000
        });

        return token;
      }

      return {status: 401, error: "Code is incorrect"}
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong"}
    }
  }

  /**
   * Update user ro premium
   * @param _id user id
   */
  async updateUserToPremium(_id: string)
  {
    try {
      const user = await User.findOne({_id, deletedAt: null});

      if (!user) return {status: 404, message: "User not found"}

      if (user.premium) return {status: 403, message: "User is premium already"}

      await user.updateOne({premium: true});
      await user.save();

      return {message: "User is now premium"}
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"}
    }
  }

  /**
   * Update usar to not premium
   * @param _id user id
   * @return
   */
  async updateUserToNotPremium(_id: string)
  {
    try {
      const user = await User.findOne({_id, deletedAt: null});

      if (!user) return {status: 404, message: "User not found"}

      if (!user.premium) return {status: 403, message: "User is not premium already"}

      await user.updateOne({premium: false});
      await user.save();

      return {message: "User is now not premium"}
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"}
    }
  }

  /**
   * Update user reputation
   * @param paid if user has paid for the game
   * @param participated if user participated of the game
   * @param user_ID user id
   */
  async updateReputationMethod(paid: boolean, participated: boolean, user_ID: string)
  {
    const user = await User.findOne({_id: user_ID, deletedAt: null});

    if (!user) return false;

    let reputation = user.reputation || 50;

    (participated && !paid) ? reputation -= 5 : !participated ? reputation -= 3 : reputation += 5;

    if (reputation > 50) reputation = 50;
    if (reputation <= 0) reputation = 0;

    user.reputation = reputation;
    user.save();

    return user;
  }
}