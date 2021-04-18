import { Request, Response } from "express";
import GameList from "../model/gameListModel";

export default {

  async index(req: Request, res: Response){
    try{
      let list = await GameList.find();

      res.status(200).json(list);
    } catch(error){
      console.log(error);
      res.status(500).json({message: 'Ops! Something went wrong!'})
    }
  },

  async save(req: Request, res: Response){

    try{
      let {user_ID, game_ID} = req.body;

      let gameList = new GameList({
        user_ID, game_ID
      });

      await gameList.save();

      res.status(200).send(gameList);
    } catch(error){
      console.log(error);
      res.status(500).json({message: "Ops! Something went wrong"});
    }

  },

  async get(req: Request, res: Response){
    try{
      let {id} = req.params;
      const gameList = await GameList.find({_id: id});
      res.json(gameList)
    } catch(error){
      console.log(error);
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  },

  async destroy(req: Request, res: Response){
    try{
        let {_id} = req.params;

        const Friend = await GameList.findOne({_id});

        if(!Friend)
            return res.status(404).json({"error" : "GameList doesn't exist"});

        await Friend.delete();
        return res.status(200).json({"message":"GameList deleted successfully"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({"message":"Ops! Something went wrong"});
        }
    }
  
}