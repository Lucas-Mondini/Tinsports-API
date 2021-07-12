import { Request, Response } from "express";
import GameList from "../model/GameListModel";
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

      const gameLists = await GameList.find({user_ID: userId});

      res.status(200).json(gameLists);
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
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

      if(!gameList) return res.status(404).json({"error" : "GameList doesn't exist"});

      await gameList.delete();

      return res.status(200).json({"message":"GameList deleted successfully"});
    } catch (error) {
      return res.status(500).json({"message":"Ops! Something went wrong"});
    }
  }
}