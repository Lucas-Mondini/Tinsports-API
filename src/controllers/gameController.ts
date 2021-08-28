import Game, { GameType }     from "../model/gameModel";
import GameList from "../model/gameListModel";
import Friends from "../model/friendsListModel";
import User from "../model/userModel";
import FormatDate from "../utils/formatDate";
import FormatStrings from "../utils/formatStrings";
import DefaultController from "./DefaultController";

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
    } catch(error) {
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
      let push = true;

      const fiveDays = 5 * 24 * 60 * 60 * 1000;
      let now = Number(Date.now()) - (Number(process.env.SERVER_TIME) || 0);
      let gameDate = Number(new Date(date));

      if (gameDate < now) {
        game.finished = true;
        await game.save();

        if (gameDate + fiveDays < now) {
          push = false;
          await game.delete();
        }

        if (!userGame && game.finished) break;
      }

      if (push) {
        gamesInfo.push({
          _id, name, location, host_ID, hour: FormatDate.hourToString(date), finished: game.finished
        });
      }
    }

    return gamesInfo;
  }

  /**
   *  Get friends games
   */
  async getFriendsGames(id: string) {
    const friends = await Friends.find({user_ID: id});
    const friends2 = await Friends.find({friend_ID: id});
    const friendsGames = new Array();

    if (friends.length > 0) {
      for (const friend of friends) {
        if (!friend.confirmed) break;

        const games = await Game.find({host_ID: friend.friend_ID});

        friendsGames.push(...games);
      }
    }

    if (friends2.length > 0) {
      for (const friend2 of friends2) {
        if (!friend2.confirmed) break;

        const games2 = await Game.find({host_ID: friend2.user_ID});
        friendsGames.push(...games2);
      }
    }

    return this.formatGames(friendsGames);
  }

  /**
   * Get user games
   */
  async getUserGames(id: string, showFinished: boolean = true) {
    const userGames = await Game.find({host_ID: id});

    return this.formatGames(userGames, showFinished);
  }

  /**
   * Get invited Games
   */
  async getInvitedGames(id: string) {
    const gameLists = await GameList.find({user_ID: id});
    const invitedGames = new Array();

    for (const gameList of gameLists) {
      const games = await Game.find({_id: gameList.game_ID});

      invitedGames.push(...games);
    }

    return this.formatGames(invitedGames);
  }

  /**
   * Save new game
   */
  async insertNewGame(gameInfo: GameType) {

    try {
      let {name, type, location, description, value, host_ID, date, hour} = gameInfo;

      let game = new Game({
        name, type, location, description,
        value: value ? FormatStrings.formatMoneyToDatabase(String(value)) : null,
        date: FormatDate.dateToDatabase(date, hour),
        host_ID, hour, finished: false
      });

      let now = Number(Date.now()) - (Number(process.env.SERVER_TIME) || 0);
      let gameDate = Number(new Date(FormatDate.dateToDatabase(date, hour)));

      if (gameDate < now) {
        return {status: 401, error: "The event date cannot be less than the current date"};
      }

      await game.save();

      return {game};
    } catch(error) {
      return {status: 500, message: "Ops! Something went wrong"};
    }

  }

  /**
   * Get game by id
   */
  async getGameById(id: string) {
    try {
      const game = await Game.findOne({_id: id});

      if (!game) {
        return {status: 404, message: "Game doesn't exist"};
      }

      const fiveDays = 5 * 24 * 60 * 60 * 1000;
      let now = Number(Date.now()) - (Number(process.env.SERVER_TIME) || 0);
      let gameDate = Number(new Date(game.date));

      if (gameDate < now) {
        game.finished = true;
        await game.save();

        if (gameDate + fiveDays < now) {
          await game.delete();
        }
      }

      const gameLists = game.finished
                          ? await GameList.find({game_ID: game._id, confirmed: true})
                          : await GameList.find({game_ID: game._id});
      const host = await User.findOne({_id: game.host_ID});
      const users = new Array();

      for (const gameList of gameLists) {
        const user = await User.findOne({_id: gameList.user_ID});
        users.push({
          _id: gameList._id,
          user_ID: user._id,
          name: user.name,
          email: user.email,
          confirmed: gameList.confirmed,
          reputation: user.reputation
        });
      }

      const {_id, name, type, location, description, value, host_ID, date, finished} = game;

      const gameInfo = {
        hostName: host.name,
        hostEmail: host.email,
        _id, host_ID, finished,
        name, type, location, description,
        value: FormatStrings.formatMoneyToUser(value),
        date: FormatDate.toDateString(date),
        hour: FormatDate.hourToString(date),
        gameList: users,
      }

      return gameInfo;
    } catch(error) {
      return {status: 500, message: error.message};
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