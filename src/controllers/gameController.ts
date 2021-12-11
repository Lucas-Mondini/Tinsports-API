import Game, { GameType }     from "../model/gameModel";
import GameList from "../model/gameListModel";
import Friends from "../model/friendsListModel";
import User from "../model/userModel";
import FormatDate from "../utils/formatDate";
import FormatStrings from "../utils/formatStrings";
import DefaultController from "./DefaultController";
import GameRecurrence from "../services/gameRecurrence";

import moment from "moment-timezone";

export default class GameController extends DefaultController {

  /**
   * Debug - Get all users
   */
  async getAllGames() {
    const games = await Game.find();
    return games;
  }

   /**
   *  Get all games involving the user
   */
   async getAllGamesOfUser(id: string, friendGames: boolean) {
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
      return {status: 500, message: error.message};
    }
  }

  /**
   *  Format games
   */
  private async formatGames(games: Array<GameType>, userGame: boolean = false) {
    const gamesInfo = [];

    for (let game of games) {
      const {_id, name, location, host_ID, date} = game;

      if (await this.finishedGameLogic(game)) continue;

      if (!userGame && game.finished) continue;

      gamesInfo.push({
        _id, name, location, host_ID, hour: moment(date).format("HH:mm"), finished: game.finished
      });
    }

    return gamesInfo;
  }

  /**
   *  Get friends games
   */
  async getFriendsGames(id: string) {
    const friends = await Friends.find({user_ID: id, confirmed: true});
    const friends2 = await Friends.find({friend_ID: id, confirmed: true});
    const friendsGames = new Array();

    if (friends.length > 0) {
      for (const friend of friends) {
        const games = await Game.find({host_ID: friend.friend_ID});

        friendsGames.push(...games);
      }
    }

    if (friends2.length > 0) {
      for (const friend2 of friends2) {
        const games2 = await Game.find({host_ID: friend2.user_ID});

        friendsGames.push(...games2);
      }
    }

    return await this.formatGames(friendsGames);
  }

  /**
   * Get user games
   */
  async getUserGames(id: string, showFinished: boolean = true) {
    const userGames = await Game.find({host_ID: id});

    return await this.formatGames(userGames, showFinished);
  }

  /**
   * Get invited Games
   */
  async getInvitedGames(id: string) {
    const gameLists = await GameList.find({user_ID: id, confirmed: false});
    const invitedGames = new Array();

    for (const gameList of gameLists) {
      const games = await Game.find({_id: gameList.game_ID});

      invitedGames.push(...games);
    }

    return await this.formatGames(invitedGames);
  }

  /**
   * Save new game
   */
  async insertNewGame(gameInfo: GameType, userId: string) {

    try {
      const user = await User.findOne({_id: userId});
      const userGames = await Game.find({host_ID: userId});
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
        recurrence: recurrence
      });

      const nowDateString = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD[T]HH:mm");
      const gameDateString = moment(game.date).tz("America/Sao_Paulo").format("YYYY-MM-DD[T]HH:mm");
      const now = Number(new Date(nowDateString));
      const gameDate = Number(new Date(gameDateString));

      if (gameDate <= now) {
        return {status: 401, error: "The event date cannot be less than the current date"};
      }

      await game.save();
      //if it's a recurrence, call the service to the recurrence
      if(recurrence) {
        GameRecurrence(game);
      }

      return {game};
    } catch(error) {
      console.log('error: ' + error);
      return {status: 500, message: "Ops! Something went wrong"};
    }

  }

  /**
   * Get game by id
   */
  async getGameById(id: string) {
    try {
      let game = await Game.findOne({_id: id});

      if (!game || await this.finishedGameLogic(game)) {
        return {status: 404, message: "Game doesn't exist"};
      }

      const gameLists = await GameList.find({game_ID: game._id});

      const host = await User.findOne({_id: game.host_ID});
      const users = new Array();

      for (const gameList of gameLists) {
        if (!gameList.confirmed && game.finished) continue;

        const user = await User.findOne({_id: gameList.user_ID});
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
      return {status: 500, message: error.message};
    }
  }

  /**
   *  Delete game
   */
   async finishedGameLogic(game: GameType) {
    try{
      const nowDateString = moment().tz("America/Sao_Paulo").format("YYYY-MM-DD[T]HH:mm"),
            now = Number(new Date(nowDateString)),
            gameDateTime = moment(game.date).tz("America/Sao_Paulo"),
            gameDate = Number(new Date(gameDateTime.format("YYYY-MM-DD[T]HH:mm"))),
            gameDatePlusFiveDays = Number(new Date(gameDateTime.add(5, 'days').format("YYYY-MM-DD[T]HH:mm")));

      if (Number(new Date(gameDate)) <= now) {
        const confirmedGameLists = await GameList.find({game_ID: game._id, confirmed: true});
        game.finished = true;
        await game.save();

        if ((confirmedGameLists.length === 0) || (gameDatePlusFiveDays <= now)) {
          const gameLists = await GameList.find({game_ID: game._id});
          this.destroyObjectArray(gameLists);
          await game.delete();
          return true;
        }
      }

      return false;
    } catch(error) {
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }

  /**
   *  Delete game
   */
  async deleteGame(_id: string, host_ID: string) {
    try{
      const game = await Game.findOne({_id});
      const gameLists = await GameList.find({game_ID: _id});

      if (!game || game.host_ID !== host_ID) {
        return {status: 401, message: "Game doesn't exist or you are not the host"};
      }

      await game.delete();
      await this.destroyObjectArray(gameLists);

      return {message: "Game deleted successfully"};
    } catch(error) {
      return {status: 500, message: "Ops! Something went wrong"};
    }
  }
}