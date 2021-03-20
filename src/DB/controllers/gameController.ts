import { Request, Response } from "express";
import Game from "../model/gameModel";

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
      let now = Date.now();

      let {name, type, location, description, value} = req.body;

      let game = new Game({
        name, type, location, description, value, date: Date.now()
      });

      await game.save();

      res.status(200).send(game);
    } catch(error){
      console.log(error);
      res.status(500).send("Ops! Something went wrong");
    }

  },
  
}