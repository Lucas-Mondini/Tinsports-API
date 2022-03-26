import GameList from "../model/gameListModel";
import Game, { GameType } from "../model/gameModel";
import User from "../model/userModel";
import DefaultController from "./DefaultController";
import logger from "../utils/logger";
import Mailer from "../services/mailer";
import MailTemplateConfigurator from "../utils/MailTemplateConfigurator";

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
   *  Send a game invitation
   */
  async inviteUser(user_ID: string, game_ID: string)
  {
    try {
      const checkInvite = await GameList.find({game_ID, user_ID});

      if (checkInvite.length > 0) return {status: 403, message: "User already invited"};

      const game = await Game.findOne({_id: game_ID});

      if (!game) return {status: 404, message: "Game doesn't exist!"};

      const host = await User.findOne({_id: game.host_ID});

      if (!host) return {status: 404, message: "Host doesn't exist!"};

      const user = await User.findOne({_id: user_ID});

      if (!user) return {status: 404, message: "User doesn't exist!"};

      const gameList = new GameList({
        game_ID,
        user_ID,
        confirmed: false
      });

      await gameList.save();

      const gameInfo = {
              host: host.name,
              event: game.name, eventLocation: game.location,
              eventDate: moment(game.date).format("DD/MM/YYYY"),
              eventHour: moment(game.date).format("HH:mm")
            },
            mail = new MailTemplateConfigurator({...gameInfo, name: user.name}, "inviteUser"),
            data = await mail.renderTemplate();

      new Mailer({
        to: user.email, subject: `${host.name} está convidando você para um jogo!`, html: data
      }).sendMail();

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
   * @param OldGame_ID - Original game Id
   * @param NewGame_ID - Game copy id
   */
  async cloneGameListToNewGame(OldGame_ID: String, NewGame_ID: String)
  {
    const newList = Array(),
          gameLists = await GameList.find({game_ID: OldGame_ID});

    for (const gameList of gameLists) {
      const list = new GameList({
        game_ID: NewGame_ID,
        user_ID: gameList.user_ID,
        confirmed: false
      });

      await list.save();
      newList.push(list)
    }

    return newList;
  }

  /**
   * Notify users that the game is about to start
   * @param gameId
   */
  async notifyInvitedUsers(gameId: string)
  {
    const game = await Game.findOne({_id: gameId});

    if (!game) return {status: 404, message: "Game doesn't exist'"};

    const gameLists = await GameList.find({game_ID: game._id, confirmed: true});
    const host = await User.findOne({_id: game.host_ID});
    const gameInfo = {
      host: host.name,
      event: game.name, eventLocation: game.location,
      eventDate: moment(game.date).format("DD/MM/YYYY"),
      eventHour: moment(game.date).format("HH:mm")
    }

    for (const gameList of gameLists) {
      const user = await User.findOne({_id: gameList.user_ID});

      if (!user) continue;

      const mail = new MailTemplateConfigurator({...gameInfo, name: user.name}, "notifyInvitedUser"),
            data = await mail.renderTemplate();

      new Mailer({
        to: user.email, subject: `O jogo de ${host.name} está prestes a começar!`, html: data
      }).sendMail();
    }
  }
}