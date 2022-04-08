import Game, { GameType }     from "../model/gameModel";
import GameList from "../model/gameListModel";
import Friends from "../model/friendsListModel";
import User from "../model/userModel";
import FormatDate from "../utils/formatDate";
import logger from "../utils/logger";
import FormatStrings from "../utils/formatStrings";
import DefaultController from "./DefaultController";
import GameRecurrence from "../services/gameRecurrence";
import GameNotification from "../services/gameNotification";

import moment from "moment-timezone";

export default class GameController extends DefaultController {

  /**
   * Debug - Get all games
   */
  async getAllGames()
  {
    try {
      const games = await Game.find();
      const gameLists = await GameList.find();

      /* for (const game of games) {
        await this.finishedGameLogic(game);
      }

      await this.destroyObjectArray(games);
      await this.destroyObjectArray(gameLists); */

      return games;
    } catch (error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Get all games involving the user
   */
  async getAllGamesOfUser(id: string, friendGames: boolean)
  {
     try{
      let friendsGames, invitedGames, userGames;

      if (!friendGames) {
        friendsGames = await this.getFriendsGames(id);
        invitedGames = await this.getInvitedGames(id);
        userGames    = await this.getUserGames(id);
      } else {
        userGames = await this.getUserGames(id, false);
      };

      const response = !friendGames ? {invitedGames, friendsGames, userGames} : {userGames};

      return response;
    } catch(error: any) {
      logger.error(error);
      return {status: 500, message: error.message};
    }
  }

  /**
   *  Format games
   */
  private async formatGames(games: Array<GameType>, userGame: boolean = false)
  {
    const gamesInfo = [];

    for (let game of games) {
      const {_id, name, location, host_ID, date, inviteId} = game;

      if (await this.finishedGameLogic(game)) continue;

      if (!userGame && game.finished) continue;

      gamesInfo.push({
        _id, name, location, host_ID, hour: moment(date).format("HH:mm"),
        finished: game.finished, inviteId: inviteId ? inviteId : null
      });
    }

    return gamesInfo;
  }

  /**
   *  Get friends games
   */
  async getFriendsGames(id: string)
  {
    const friends = await Friends.find({user_ID: id, confirmed: true});
    const friends2 = await Friends.find({friend_ID: id, confirmed: true});
    const friendsGames = new Array();

    if (friends.length > 0) {
      for (const friend of friends) {
        const games = await Game.find({host_ID: friend.friend_ID, deletedAt: null});

        friendsGames.push(...games);
      }
    }

    if (friends2.length > 0) {
      for (const friend2 of friends2) {
        const games2 = await Game.find({host_ID: friend2.user_ID, deletedAt: null});

        friendsGames.push(...games2);
      }
    }

    return await this.formatGames(friendsGames);
  }

  /**
   * Get user games
   */
  async getUserGames(id: string, showFinished: boolean = true)
  {
    const userGames = await Game.find({host_ID: id, deletedAt: null});

    return await this.formatGames(userGames, showFinished);
  }

  /**
   * Get invited Games
   */
  async getInvitedGames(id: string)
  {
    const gameLists = await GameList.find({user_ID: id, confirmed: false});
    const invitedGames = new Array();

    for (const gameList of gameLists) {
      const game = await Game.findOne({_id: gameList.game_ID, deletedAt: null});

      if (!game) continue;

      invitedGames.push({...game._doc, inviteId: gameList._id});
    }

    return await this.formatGames(invitedGames);
  }

  /**
   * Save new game
   */
  async insertNewGame(gameInfo: GameType, userId: string)
  {
    try {
      const user = await User.findOne({_id: userId, deletedAt: null});
      const userGames = await Game.find({host_ID: userId, deletedAt: null});
      const {name, type, location, description, value, date, hour, recurrence} = gameInfo;

      if (!user) return {status: 404, message: "User not found"}

      if (!user.premium && userGames.length >= 5) {
        return {status: 403, message: "Only premium users can insert more than 5 games"}
      }

      const game = new Game({
        name, type, location, description,
        value: value ? FormatStrings.formatMoneyToDatabase(String(value)) : null,
        date: FormatDate.dateToDatabase(date, hour),
        host_ID: userId, hour, finished: false,
        recurrence: recurrence ? recurrence : false,
        deletedAt: null
      });

      const nowDateString = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD[T]HH:mm");
      const gameDateString = moment(game.date).format("YYYY-MM-DD[T]HH:mm");
      const now = Number(new Date(nowDateString));
      const gameDate = Number(new Date(gameDateString));

      if (gameDate <= now) {
        return {status: 401, error: "The event date cannot be less than the current date"};
      }

      await game.save();
      //if it's a recurrence, call the service to the recurrence
      if (recurrence) {
        await new GameRecurrence().createNewGameRecurrence(game);
      }

      await new GameNotification().createNewGameNotification(game);

      return {game};
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }

  }

  /**
   * Update Game info
   */
  async updateGame(game: GameType, host_ID: string)
  {
    try {

      const { _id, name, type, location, date, hour, value, recurrence, description } = game;

      const gameEdit = await Game.findOne({_id, deletedAt: null});

      if (!gameEdit || gameEdit.host_ID !== host_ID) {
        return {status: 404, message: "Game doesn't exist, was finished, or you are not the host"};
      }

      await this.finishedGameLogic(gameEdit)

      if (gameEdit.finished) {
        return {status: 405, message: "You can't edit a finished game"};
      }

      let gameUpdate = {
        name: (name) ? name : gameEdit.name,
        type: (type) ? type : gameEdit.type,
        location: (location) ? location : gameEdit.location,
        value: value ? FormatStrings.formatMoneyToDatabase(String(value)) : null,
        date: (date && hour) ? FormatDate.dateToDatabase(date, hour) : gameEdit.date,
        recurrence: recurrence,
        description: (description) ? description : null
      }

      const nowDateString = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD[T]HH:mm");
      const gameDateString = moment(gameUpdate.date).format("YYYY-MM-DD[T]HH:mm");
      const now = Number(new Date(nowDateString));
      const gameDate = Number(new Date(gameDateString));

      if (gameDate <= now) {
        return {status: 401, error: "The event date cannot be less than the current date"};
      }

      await gameEdit.updateOne(gameUpdate);
      await gameEdit.save();

      await new GameNotification().createNewGameNotification(gameEdit);

      return { message: "Game updated successfully" };
    } catch (error) {
      logger.error(error);
      return { status: 500, message: "Ops! Something went wrong" };
    }
  }

  /**
   * Get game by id
   */
  async getGameById(id: string)
  {
    try {
      let game = await Game.findOne({_id: id, deletedAt: null});

      if (!game || await this.finishedGameLogic(game)) {
        return {status: 404, message: "Game doesn't exist"};
      }

      const gameLists = await GameList.find({game_ID: game._id});

      const host = await User.findOne({_id: game.host_ID, deletedAt: null});

      if (!host) return {status: 404, message: "User not found"}

      const users = new Array();

      for (const gameList of gameLists) {
        if (!gameList.confirmed && game.finished) continue;

        const user = await User.findOne({_id: gameList.user_ID, deletedAt: null});

        if (!user) continue;

        users.push({
          _id: gameList._id,
          user_ID: user._id,
          name: user.name,
          email: user.email,
          confirmed: gameList.confirmed,
          reputation: user.reputation,
          photo: user.photo
        });
      }

      const {_id, name, type, location, description, value, host_ID, date, finished} = game;

      const gameInfo = {
        hostName: host.name,
        hostEmail: host.email,
        _id, host_ID, finished,
        name, type, location, description,
        value: FormatStrings.formatMoneyToUser(value),
        date: moment(date).format("DD/MM/YYYY"),
        hour: moment(date).format("HH:mm"),
        gameList: users,
      }

      return gameInfo;
    } catch(error: any) {
      logger.error(error);
      return {status: 500, message: error.message};
    }
  }

  /**
   * Create a copy of the game
   * @param game game to be copied
   */
  async copyGame(game: GameType) {
    const new_date: Date = new Date();
    new_date.setDate(new_date.getDate() + 7);
    game.date = moment(new_date).format("YYYY-MM-DD[T]HH:mm");

    const {name, type, location, description, value, date, host_ID, recurrence} = game;
    game = new Game({
      name, type, description, location, value, date,
      host_ID, finished: false, recurrence, deletedAt: null
    });

    await game.save();

    await new GameNotification().createNewGameNotification(game);

    return game;
  }

  /**
   *  Delete game
   */
  async finishedGameLogic(game: GameType)
  {
    try{
      const nowDateString = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD[T]HH:mm"),
            now = Number(new Date(nowDateString)),
            gameDateTime = moment(game.date),
            gameDate = Number(new Date(gameDateTime.format("YYYY-MM-DD[T]HH:mm"))),
            gameDatePlusFiveDays = Number(new Date(gameDateTime.add(5, 'days').format("YYYY-MM-DD[T]HH:mm"))),
            host = await User.findOne({_id: game.host_ID});

      if (gameDate <= now) {
        const confirmedGameLists = await GameList.find({game_ID: game._id, confirmed: true});
        game.finished = true;
        await game.save();

        if ((confirmedGameLists.length === 0) || (gameDatePlusFiveDays <= now)) {
          const gameLists = await GameList.find({game_ID: game._id});

          if (host.premium) {
            await game.updateOne({deletedAt: moment().format("YYYY-MM-DD[T]HH:mm")});
            await game.save();
          } else {
            await this.destroyObjectArray(gameLists);
            await game.delete();
          }

          return true;
        }
      }

      return false;
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Delete game
   */
  async deleteGame(_id: string, host_ID: string)
  {
    try {
      const host = await User.findOne({_id: host_ID, deletedAt: null});
      const game = await Game.findOne({_id, deletedAt: null});
      const gameLists = await GameList.find({game_ID: _id});

      if (!host) return {status: 404, message: "User not found"}

      if (!game || game.host_ID !== host_ID) {
        return {status: 401, message: "Game doesn't exist or you are not the host"};
      }

      if (host.premium) {
        await game.updateOne({deletedAt: moment().format("YYYY-MM-DD[T]HH:mm")});

        await game.save();
      } else {
        await game.delete();
        await this.destroyObjectArray(gameLists);
      }

      return {message: "Game deleted successfully"};
    } catch(error) {
      logger.error(error);
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }
}