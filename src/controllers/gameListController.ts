import GameList from "../model/gameListModel";
import Game from "../model/gameModel";
import User from "../model/userModel";
import DefaultController from "./DefaultController";
import logger from "../utils/logger";

import moment from "moment-timezone";

export default class GameListController extends DefaultController
{
  /**
   * Get all game lists
   */
  async getAllGameLists()
  {
    try {
      const list = await GameList.find();

      return list;
    } catch(error){
      logger.error(error);
      return {status: 500, message: 'Ops! Something went wrong!'}
    }
  }

  /**
   * @param GameID
   * @returns list of id from users on the game
   */
  async getGameUserListByGameId(ID: String)
  {
    const userList = new Array();
    const gameLists = await GameList.find({game_ID: ID});

    for (const i of gameLists)
      userList.push(i.user_ID);

    return userList;
  }

  /**
   *  Send a game invitation
   */
  async inviteUser(user_ID: string, game_ID: string)
  {
    try {
      const checkInvite = await GameList.find({game_ID, user_ID});

      if (checkInvite.length > 0) return {status: 403, message: "User already invited"};

      const gameList = new GameList({
        game_ID,
        user_ID,
        confirmed: false
      });

      gameList.save();

      return gameList;
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Confirms a game invitation
   */
  async confirmInvitation(_id: string, user_ID: string)
  {
    try{
      const gameList = await GameList.findOne({_id, user_ID});

      if (!gameList) return {status: 404, message: "Game List Not Found"};

      gameList.confirmed = true;
      gameList.save();

      return {gameList};
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Get all invitations of the user
   */
  async getInvitations(userId: string)
  {
    try{
      const inviteInfo = new Array();
      const gameLists = await GameList.find({user_ID: userId});

      for (const gameList of gameLists) {
        const game = await Game.findOne({_id: gameList.game_ID});

        if (!game) {
          gameList.delete();
          continue;
        }

        const host = await User.findOne({_id: game.host_ID, deletedAt: null});

        if (!host) continue;

        if (!gameList.confirmed && game && !game.finished && host) {
          inviteInfo.push({
            _id: gameList._id,
            host_ID: host._id,
            game_ID: game._id,
            gameName: game.name,
            location: game.location,
            hostName: host.name,
            date: moment(game.date).format("DD/MM/YYYY"),
            hour: moment(game.date).format("HH:mm")
          });
        };
      }

      return inviteInfo;
    } catch(error: any) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Delete game list
   */
  async deleteGameInvitation(_id: string)
  {
    try{
      const gameList = await GameList.findOne({_id});

      if(!gameList) return {status: 404, message: "Game doesn't exist"};

      await gameList.delete();

      return {message: "GameList deleted successfully"};
    } catch (error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   * create a clone of a gamelist with new game ID and without confirmation
   * @param NewGame_ID
   */
  async cloneGameListToNewGame(OldGame_ID: String, NewGame_ID: String)
  {
    const newList = Array();
    let userList = await this.getGameUserListByGameId(OldGame_ID);

    for (const user_ID of userList) {
      const list = new GameList({
        game_ID: NewGame_ID,
        user_ID: user_ID,
        confirmed: false
      })
      await list.save();
      newList.push(list)
    }

    return newList;
  }
}