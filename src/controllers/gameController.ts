import { Request, Response } from "express";
import Game     from "../model/GameModel";
import GameList from "../model/GameListModel";
import Friends from "../model/FriendsListModel";
import User from "../model/UserModel";
import FormatDate from "../utils/formatDate";
import FormatStrings from "../utils/formatStrings";
import DefaultController from "./DefaultController";

export default class GameController extends DefaultController {

  /**
   * Debug - Get all users
   * @param req
   * @param res
   */
  async index(req: Request, res: Response) {
    const games = await Game.find();

    res.status(200).json(games);
  }

   /**
   *  Get all games involving the user
   * @param req Request
   * @param res Response
   */
   async gamesOfUser(req: Request, res: Response){
     try{
      const {id} = req.params;
      const {friendGames} = req.query;
      let friendsGames, invitedGames, userGames;

      if (!friendGames) {
        friendsGames   = await this.getFriendsGames(id);
        invitedGames   = await this.getInvitedGames(id);
        userGames      = await this.getUserGames(id);
      } else {userGames = await this.getUserGames(id, false)};

      const response = !friendGames ? {invitedGames, friendsGames, userGames} : {userGames};

      res.status(200).json(response);
    } catch(error){
      res.status(500).json({message: error.message});
    }
  }

  /**
   *  Format games
   * @param req Request
   * @param res Response
   */
  private async formatGames(games: Array<any>, userGame: boolean = false){
    const gamesInfo = [];

    for (let game of games) {
      const {_id, name, location, host_ID, date} = game;

      const fiveDays = 5 * 24 * 60 * 60 * 1000;
      let now = Number(Date.now());
      let gameDate = Number(new Date(date));

      if (gameDate < now) {
        game.finished = true;
        await game.save();

        if (gameDate + fiveDays < now) {
          await game.delete();
        }

        if (!userGame && game.finished) break;
      }

      gamesInfo.push({
        _id, name, location, host_ID, hour: FormatDate.hourToString(date), finished: game.finished
      });
    }

    return gamesInfo;
  }

  /**
   *  Get friends games
   * @param req Request
   * @param res Response
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
   * @param req Request
   * @param res Response
   */
  async getUserGames(id: string, showFinished: boolean = true) {
    const userGames = await Game.find({host_ID: id});

    return this.formatGames(userGames, showFinished);
  }

  /**
   * Get invited Games
   * @param req Request
   * @param res Response
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
   * @param req Request
   * @param res Response
   */
  async save(req: Request, res: Response){

    try{
      let {name, type, location, description, value, host_ID, date, hour} = req.body;

      let game = new Game({
        name, type, location, description,
        value: FormatStrings.formatMoneyToDatabase(value),
        date: FormatDate.dateToDatabase(date, hour),
        host_ID, hour, finished: false
      });

      let now = Number(Date.now());
      let gameDate = Number(new Date(FormatDate.dateToDatabase(date, hour)));

      if (gameDate < now) {
        res.status(200).json({error: "The event date cannot be less than the current date"});
        return;
      }

      await game.save();

      res.status(200).send(game);
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }

  }

  /**
   * Get game by id
   * @param req Request
   * @param res Response
   */
  async get(req: Request, res: Response){
    try{
      let {id} = req.params;
      const game = await Game.findOne({_id: id});

      if (!game) {
        return res.status(404).json({message: "Game doesn't exist"});
      }

      const gameLists = await GameList.find({game_ID: game._id});
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

      res.status(200).json(gameInfo);
    } catch(error) {
      res.status(500).json({message: error.message});
    }
  }

  /**
   *  Delete game
   * @param req Request
   * @param res Response
   */
  async destroy(req: Request, res: Response){
    try{
      const {id} = req.params;
      const {host_ID} = req.body

      const game = await Game.findOne({_id: id});
      const gameLists = await GameList.find({game_ID: id});

      if (!game || game.host_ID !== host_ID) {
        return res.status(401).json({message: "Game doesn't exist or you are not the host'"});
      }

      await game.delete();
      await this.destroyObjectArray(gameLists);

      res.status(200).json({message: "Game deleted successfully"});
    } catch(error) {
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }
}