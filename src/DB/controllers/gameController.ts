import { Request, Response } from "express";
import Game     from "../model/gameModel";
import GameList from "../model/gameListModel";

export default {

  async index(req: Request, res: Response){
    try{
      let games = await Game.find();

      res.status(200).json(games);
    } catch(error){
      console.log(error);
      res.status(500).json({message: 'Ops! Something went wrong!'})
    }
  },

  async save(req: Request, res: Response){

    try{
      let {name, type, location, description, value, host_ID} = req.body;

      let game = new Game({
        name, type, location, description, value, date: Date.now(), host_ID
      });
      
      console.log(host_ID)
      
      let gameList = new GameList({
        game_ID: game._id, user_ID: host_ID
      });

      game.gameList_ID = gameList._id;
      
      await game.save();
      await gameList.save();

      res.status(200).send({game, gameList});
    } catch(error){
      console.log(error);
      res.status(500).json({message: "Ops! Something went wrong"});
    }

  },

  async get(req: Request, res: Response){
    try{
      let {id} = req.params;
      const game = await Game.find({_id: id});
      res.json(game)
    } catch(error){
      console.log(error);
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }
  
}