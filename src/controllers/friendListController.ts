import Friends, { FriendsType } from "../model/friendsListModel";
import User from "../model/userModel";
import GameList, { GameListType } from "../model/gameListModel";
import logger from "../utils/logger";
import Mailer from "../services/mailer";
import MailTemplateConfigurator from "../utils/MailTemplateConfigurator";

export default class FriendListController {

  /**
   *  Get all friends relations
   */
  async getAllFriendsRelations()
  {
    try {
      let friend = await Friends.find();

      return friend;
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   * Save new friend relation
   */
  async sendFriendInvitation(user_ID: string, friend_ID: string)
  {
    try {
      const hasFriendRelation = await Friends.find().or([
        {user_ID, friend_ID},
        {friend_ID: user_ID, user_ID: friend_ID}
      ]);

      if (hasFriendRelation.length > 0) return {status: 401, message: "Already friends"};

      const friend = await User.findOne({_id: friend_ID});
      const user = await User.findOne({_id: user_ID});

      if (!user || !friend) return {status: 404, message: "User doesn't exist!"};

      let friends = new Friends({
        user_ID, friend_ID, confirmed: false
      });

      await friends.save();

      const mail = new MailTemplateConfigurator({friend: user.name, name: friend.name}, "inviteUser"),
            data = await mail.renderTemplate();

      new Mailer({
        to: friend.email, subject: `${user.name} quer ser seu amigo!`, html: data
      }).sendMail();

      return friends;
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  async friendListFormat(friends: FriendsType[], id: string)
  {
    const userInfoList = new Array();

    if (friends.length > 0) {
      for (const friend of friends) {
        let user;

        if (friend.user_ID === id) {
          user = await User.findOne({_id: friend.friend_ID, deletedAt: null});
        } else {
          user = await User.findOne({_id: friend.user_ID, deletedAt: null});
        }

        if (!user) continue;

        const responseUser = {
          _id: friend._id,
          user_ID: user._id,
          name: user.name,
          email: user.email,
          reputation: user.reputation,
          confirmed: friend.confirmed,
          photo: user.photo
        };

        userInfoList.push(responseUser);
      }
    }

    return userInfoList;
  }

  /**
   *  Get friend and friend invitations by user id, or friend of friends
   */
  async getFriendById(id: string, friendFriends: boolean)
  {
    try {
      let friendInvites, friends;

      const friendsList = !friendFriends ? await Friends.find().or([
        {user_ID: id},
        {friend_ID: id}
      ]).and({confirmed: true}) : await Friends.find({friend_ID: id});

      const inviteList = !friendFriends ? await Friends.find({friend_ID: id, confirmed: false}) : null;

      if (!friendFriends) {
        friends = await this.friendListFormat(friendsList, id);
        friendInvites = await this.friendListFormat(inviteList, id);
      } else friends = await this.friendListFormat(friendsList, id);

      return {friends, friendInvites};
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  async getFriendsNotInGameList(id: string, gameId: string)
  {
    try {
      const inviteFriends = new Array();
      const friends = await Friends.find().or([
        {user_ID: id},
        {friend_ID: id}
      ]).and({confirmed: true});

      const gameLists = await GameList.find({game_ID: gameId});

      for (const friend of friends) {
        const [user] = gameLists.filter((gameList: GameListType) => friend.user_ID === gameList.user_ID);
        const [user2] = gameLists.filter((gameList: GameListType) => friend.friend_ID === gameList.user_ID);

        if (!user && !user2) {
          inviteFriends.push(friend);
        }
      }

      return this.friendListFormat(inviteFriends, id);
    } catch (error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Confirm friend invitation
   */
   async confirmFriendInvitation(_id: string)
   {
    try {
      const friendInvitation = await Friends.findOne({_id});

      if (!friendInvitation) return {status: 404, message: "Friend request doesn't exist"};

      friendInvitation.confirmed = true;
      friendInvitation.save();

      return friendInvitation;
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Delete friend relation
   */
  async deleteFriend(_id: string)
  {
    try {
        const friend = await Friends.findOne({_id});

        if (!friend) return {status: 500, message : "Friend doesn't exist"};

        await friend.delete();
        return {message:"Friends deleted successfully"};
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }
}