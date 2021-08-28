import Friends, { FriendsType } from "../model/friendsListModel";
import User from "../model/userModel";
import GameList, { GameListType } from "../model/gameListModel";

export default class FriendListController {

  /**
   *  Get all friends relations
   */
  async getAllFriendsRelations() {
    try{
      let friend = await Friends.find();

      return friend;
    } catch(error){
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   * Save new friend relation
   */
  async sendFriendInvitation(user_ID: string, friend_ID: string){

    try{
      const hasFriendRelation = await Friends.find().or([
        {user_ID, friend_ID},
        {friend_ID: user_ID, user_ID: friend_ID}
      ]);

      if (hasFriendRelation.length > 0) return {status: 401, message: "Already friends"};

      let friends = new Friends({
        user_ID, friend_ID, confirmed: false
      });

      await friends.save();

      return friends;
    } catch(error){
      return {status: 500, message: "Ops! Something went wrong"};
    }

  }

  async friendListFormat(friends: FriendsType[], id: string, invitation: boolean = false) {
    const userInfoList = new Array();

    if (friends.length > 0) {
      for (let friend of friends) {
        if (!invitation && !friend.confirmed) break;
        if (invitation && friend.confirmed) break;

        let user;

        if (friend.user_ID === id) {
          user = await User.findOne({_id: friend.friend_ID});
        } else {
          user = await User.findOne({_id: friend.user_ID});
        }

        const responseUser  = {
          _id: friend._id,
          user_ID: user._id,
          name: user.name,
          email: user.email,
          reputation: user.reputation,
          confirmed: friend.confirmed
        };

        if (user) userInfoList.push(responseUser);
      }
    }

    return userInfoList;
  }

  /**
   *  Get friend and friend invitations by user id, or friend of friends
   */
  async getFriendById(id: string, friendFriends: boolean) {
    try{
      let friendInvites, friends;

      const friendsList = !friendFriends ? await Friends.find().or([
        {user_ID: id},
        {friend_ID: id}
      ]) : await Friends.find({friend_ID: id});

      if (!friendFriends) {
        friends = await this.friendListFormat(friendsList, id, false);
        friendInvites = await this.friendListFormat(friendsList, id, true);
      } else friends = await this.friendListFormat(friendsList, id, false);

      return {friends, friendInvites};
    } catch(error){
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
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Confirm friend invitation
   */
   async confirmFriendInvitation(_id: string) {
    try{
      const friendInvitation = await Friends.findOne({_id});

      if (!friendInvitation) return {status: 404, message: "Friend request doesn't exist"};

      friendInvitation.confirmed = true;
      friendInvitation.save();

      return friendInvitation;
    } catch(error){
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Delete friend relation
   */
  async deleteFriend(_id: string) {
    try{
        const friend = await Friends.findOne({_id});

        if(!friend)
            return {status: 500, message : "Friend doesn't exist"};

        await friend.delete();
        return {message:"Friends deleted successfully"};
        } catch (error) {
          return {status: 500, message: "Ops! Something went wrong"};
        }
    }
}