import GameList from "../model/gameListModel";
import Game from "../model/gameModel";
import User from "../model/userModel";
import DefaultController from "./DefaultController";

import moment from "moment-timezone";

export default class GameListController extends DefaultController{

  /**
   * Get all game lists
   */
  async getAllGameLists() {
    try{
      const list = await GameList.find();

      return list;
    } catch(error){
      return {status: 500, message: 'Ops! Something went wrong!'}
    }
  }

  /**
   *  Send a game invitation
   */
   async inviteUser(user_ID: string, game_ID: string){
    try{
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
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Confirma a game invitation
   */
  async confirmInvitation(_id: string, user_ID: string){
    try{
      const gameList = await GameList.findOne({_id, user_ID});

      if (!gameList) return {status: 404, message: "Game List Not Found"};

      gameList.confirmed = true;
      gameList.save();

      return {gameList};
    } catch(error) {
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Get all invitations of the user
   */
  async getInvitations(userId: string) {
    try{
      const inviteInfo = new Array();
      const gameLists = await GameList.find({user_ID: userId});

      for (const gameList of gameLists) {
        const game = await Game.findOne({_id: gameList.game_ID});

        if (!game) {
          gameList.delete();
          continue;
        }

        const host = await User.findOne({_id: game.host_ID});

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
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Delete game list
   */
  async deleteGameInvitation(_id: string) {
    try{
      const gameList = await GameList.findOne({_id});

      if(!gameList) return {status: 404, message: "Game doesn't exist"};

      await gameList.delete();

      return {message: "GameList deleted successfully"};
    } catch (error) {
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }
}