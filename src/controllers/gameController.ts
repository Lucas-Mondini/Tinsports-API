import { Request, Response } from "express";
import Game     from "../model/gameModel";
import GameList from "../model/gameListModel";
import Friends from "../model/friendsListModel";
import User from "../model/userModel";
import FormatDate from "../utils/formatDate";
import FormatStrings from "../utils/formatStrings";
import gameListController from "./gameListController";

export default class GameController {

  static async index(req: Request, res: Response){
    const {id} = req.params;

    try{
      const friendsGames = await GameController.getFriendsGames(id);
      const invitedGames = await GameController.getInvitedGames(id);
      const userGames = await GameController.getUserGames(id);

      res.status(200).json({invitedGames, friendsGames, userGames});
    } catch(error){
      res.status(500).json({message: error.message});
    }
  }

  static async formatGames(games: Array<any>){
    const gamesInfo = [];

    for (let game of games) {
      const {_id, name, location, host_ID, date} = game;
      const fiveDays = 5 * 24 * 60 * 60 * 1000;
      let now = Number(Date.now());
      let gameDate = Number(new Date(date)) + fiveDays;

      if (gameDate < now) {
        game.delete();
        continue;
      }

      gamesInfo.push({
        _id, name, location, host_ID, hour: FormatDate.hourToString(date)
      });
    }

    return gamesInfo;
  }

  static async getFriendsGames(id: string) {
    const friends = await Friends.find({user_ID: id});
    const friends2 = await Friends.find({friend_ID: id});
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

    return GameController.formatGames(friendsGames);
  }

  static async getUserGames(id: string) {
    const userGames = await Game.find({host_ID: id});

    return GameController.formatGames(userGames);
  }

  static async getInvitedGames(id: string) {
    const gameLists = await GameList.find({user_ID: id});
    const invitedGames = new Array();

    for (const gameList of gameLists) {
      const games = await Game.find({_id: gameList.game_ID});

      invitedGames.push(...games);
    }

    return GameController.formatGames(invitedGames);
  }

  static async save(req: Request, res: Response){

    try{
      let {name, type, location, description, value, host_ID, date, hour} = req.body;
      let formatDate = FormatDate.dateToDatabase(date, hour);

      let game = new Game({
        name, type, location, description, value: FormatStrings.formatMoneyToDatabase(value), date: formatDate, host_ID, hour
      });

      let now = Number(Date.now());
      let gameDate = Number(new Date(date));

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

  static async get(req: Request, res: Response){
    try{
      let {id} = req.params;
      const game = await Game.findOne({_id: id});
      const gameLists = await GameList.find({game_ID: game._id});
      const users = new Array();

      for (const gameList of gameLists) {
        const user = await User.findOne({_id: gameList.user_ID});
        users.push({_id: gameList._id, user_ID: user._id, name: user.name, email: user.email, confirmed: gameList.confirmed});
      }

      const {_id, name, type, location, description, value, host_ID, date} = game;

      const gameInfo = {
        _id,
        name, type, location, description, value, host_ID,
        date: FormatDate.toDateString(date), hour: FormatDate.hourToString(date),
        gameList: users
      }

      res.status(200).json(gameInfo);
    } catch(error) {
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }

  static async inviteUser(req: Request, res: Response){
    try{
      let {user_ID, game_ID} = req.body;

      const gameList = new GameList({
        game_ID,
        user_ID,
        confirmed: false
      });

      gameList.save();

      res.status(200).json({gameList});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }

  static async confirmInvitation(req: Request, res: Response){
    try{
      let {_id, user_ID} = req.body;

      const gameList = await GameList.findOne({_id, user_ID});

      gameList.confirmed = true;

      gameList.save();

      res.status(200).json({gameList});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }

  static async getInvitations(req: Request, res: Response){
    try{
      let {userId} = req.params;

      const gameLists = await GameList.find({_id: userId});

      res.status(200).json(gameLists);
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }

  static async destroy(req: Request, res: Response){
    try{
      const {id} = req.params;
      const {host_ID} = req.body

      const game = await Game.findOne({_id: id});
      const gameLists = await GameList.find({game_ID: id});

      if (game.host_ID !== host_ID) {
        return res.status(401).json({message: "Only the event creator can delete it"});
      }

      await game.delete();
      await gameListController.destroyGameListArray(gameLists);

      res.status(200).json({message: "Game deleted successfully"});
    } catch(error) {
      console.log(error)
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }

  static async destroyGamesArray(games: Array<any>) {
    for (const game of games) {
      game.delete();
    }
  }
}