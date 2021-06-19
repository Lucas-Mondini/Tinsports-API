import { Request, Response } from "express";
import Game     from "../model/gameModel";
import GameList from "../model/gameListModel";
import User from "../model/userModel";
import FormatDate from "../utils/formatDate";
import FormatStrings from "../utils/formatStrings";

export default {

  async index(req: Request, res: Response){
    try{
      const games = await Game.find();
      const gamesInfo = [];

      for (let game in games) {
        const {_id, name, type, location, description, value, host_ID, gameList_ID, date} = games[game];
        const gameList = await GameList.findOne({_id: gameList_ID});

        const fiveDays = 5 * 24 * 60 * 60 * 1000;
        let now = Number(Date.now());
        let gameDate = Number(new Date(date)) + fiveDays;

        if (gameDate < now) {
          games[game].delete();
          gameList.delete();
          continue;
        }

        gamesInfo.push({
          _id, name, type, location, description, value: FormatStrings.formatMoneyToUser(value), host_ID,
          date: FormatDate.toDateString(date), hour: FormatDate.hourToString(date),
          gameList
        });
      }

      res.status(200).json(gamesInfo);
    } catch(error){
      res.status(500).json({message: error.message});
    }
  },

  async save(req: Request, res: Response){

    try{
      let {name, type, location, description, value, host_ID, date, hour} = req.body;
      let formatDate = FormatDate.dateToDatabase(date, hour);

      let game = new Game({
        name, type, location, description, value: FormatStrings.formatMoneyToDatabase(value), date: formatDate, host_ID, hour
      });

      let gameList = new GameList({
        game_ID: game._id, host_ID
      });

      game.gameList_ID = gameList._id;

      let now = Number(Date.now());
      let gameDate = Number(new Date(date));

      if (gameDate < now) {
        res.status(200).json({error: "The event date cannot be less than the current date"});
        return;
      }

      await game.save();
      await gameList.save();

      res.status(200).send({game, gameList});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }

  },

  async get(req: Request, res: Response){
    try{
      let {id} = req.params;
      const game = await Game.findOne({_id: id});
      const gameList = await GameList.findOne({_id: game.gameList_ID});
      const invitedUsers = new Array();

      for(let invited in gameList.invitedUsers){
        let user = await User.findOne({_id: gameList.invitedUsers[invited].user._id});

        const invitedUser = {
          _id: user._id,
          name: user.name,
          email: user.email,
          confirmed: gameList.invitedUsers[invited].user.confirmed
        }

        invitedUsers.push(invitedUser);
      }

      const {_id, name, type, location, description, value, host_ID, gameList_ID, date} = game;

      const gameInfo = {
        _id,
        name, type, location, description, value, host_ID, gameList_ID,
        date: FormatDate.toDateString(date), hour: FormatDate.hourToString(date),
        gameList: {
          invitedUsers: invitedUsers
        }
      }

      res.status(200).json(gameInfo);
    } catch(error) {
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  },

  async inviteUser(req: Request, res: Response){
    try{
      let {userId, gameListId} = req.body;

      const user = {
        user: {
          _id: userId,
          confirmed: false
        }
      }

      const gameList = await GameList.findOne({_id: gameListId});

      gameList.invitedUsers.push(user);
      gameList.save();

      res.status(200).json({gameList});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  },

  async confirmInvitation(req: Request, res: Response){
    try{
      let {inviteId, gameListId} = req.body;

      const gameList = await GameList.findOne({_id: gameListId});

      for (let invited in gameList.invitedUsers) {
        if(gameList.invitedUsers[invited]._id == inviteId){
          gameList.invitedUsers[invited].user.confirmed = true;
        }
      }

      gameList.save();

      res.status(200).json({gameList});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  },

  async getInvitations(req: Request, res: Response){
    try{
      let {userId} = req.params;

      const gameLists = await GameList.find();
      const invitations = new Array();

      for (let gameList in gameLists) {
        for (let invited in gameLists[gameList].invitedUsers) {
          if (gameLists[gameList].invitedUsers[invited].user._id == userId) {
            invitations.push(gameLists[gameList].invitedUsers[invited].user);
          }
        }
      }

      res.status(200).json({invitations});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  },

  async destroy(req: Request, res: Response){
    try{
      const {id} = req.params;
      const {host_ID} = req.body

      const game = await Game.findOne({_id: id});
      const gameList = await GameList.findOne({_id: game.gameList_ID});

      if (game.host_ID !== host_ID) {
        return res.status(401).json({message: "Only the event creator can delete it"});
      }

      game.delete();
      gameList.delete();

      res.status(200).json({message: "Game deleted successfully"});
    } catch(error) {
      console.log(error);
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }
}