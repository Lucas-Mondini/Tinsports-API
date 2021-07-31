import { Request, Response } from "express";
import GameList from "../model/GameListModel";
import Game from "../model/GameModel";
import User from "../model/UserModel";
import FormatDate from "../utils/formatDate";
import DefaultController from "./DefaultController";

export default class GameListController extends DefaultController{

  /**
   * Get all game lists
   * @param req Request
   * @param res Response
   */
  async index(req: Request, res: Response){
    try{
      let list = await GameList.find();

      res.status(200).json(list);
    } catch(error){
      res.status(500).json({message: 'Ops! Something went wrong!'})
    }
  }

  /**
   *  Send a game invitation
   * @param req Request
   * @param res Response
   */
   async inviteUser(req: Request, res: Response){
    try{
      let {user_ID, game_ID} = req.body;

      const checkInvite = await GameList.find({game_ID, user_ID});

      if (checkInvite.length > 0) return res.status(200).json({message: "User already invited"});

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

  /**
   *  Confirma a game invitation
   * @param req Request
   * @param res Response
   */
  async confirmInvitation(req: Request, res: Response){
    try{
      let {_id, user_ID} = req.body;

      const gameList = await GameList.findOne({_id, user_ID});

      if (!gameList) return res.status(404).json({message: "Game List Not Found"});

      gameList.confirmed = true;
      gameList.save();

      res.status(200).json({gameList});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }

  /**
   *  Get all invitations of the user
   * @param req Request
   * @param res Response
   */
  async getInvitations(req: Request, res: Response){
    try{
      let {userId} = req.params;

      const inviteInfo = new Array();
      const gameLists = await GameList.find({user_ID: userId});

      for (const gameList of gameLists) {
        const game = await Game.findOne({_id: gameList.game_ID});
        const host = await User.findOne({_id: game.host_ID});

        if (!gameList.confirmed && game && host) {
          inviteInfo.push({
            _id: gameList._id,
            host_ID: host._id,
            game_ID: game._id,
            gameName: game.name,
            location: game.location,
            hostName: host.name,
            date: FormatDate.toDateString(game.date),
            hour: FormatDate.hourToString(game.date)
          });
        };

      }

      return res.status(200).json(inviteInfo);
    } catch(error){
      res.status(500).json({message: error.message});
    }
  }

  /**
   *  Delete game list
   * @param req Request
   * @param res Response
   */
  async destroy(req: Request, res: Response){
    try{
      let {_id} = req.params;

      const gameList = await GameList.findOne({_id});

      if(!gameList) return res.status(404).json({message: "Game doesn't exist"});

      await gameList.delete();

      return res.status(200).json({message: "GameList deleted successfully"});
    } catch (error) {
      return res.status(500).json({message: "Ops! Something went wrong"});
    }
  }
}