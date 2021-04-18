import { Request, Response } from "express";
import Friends from "../model/friendsListModel";

export default {

  async index(req: Request, res: Response){
    try{
      let friend = await Friends.find();

      res.status(200).json(friend);
    } catch(error){
      console.log(error);
      res.status(500).json({message: 'Ops! Something went wrong!'})
    }
  },

  async save(req: Request, res: Response){

    try{
      let {user_ID, friend_ID} = req.body;

      let friends = new Friends({
        user_ID, friend_ID
      });

      await friends.save();

      res.status(200).send(friends);
    } catch(error){
      console.log(error);
      res.status(500).json({message: "Ops! Something went wrong"});
    }

  },

  async get(req: Request, res: Response){
    try{
      let {id} = req.params;
      const friends = await Friends.find({_id: id});
      res.json(friends)
    } catch(error){
      console.log(error);
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  },

  async destroy(req: Request, res: Response){
    try{
        let {_id} = req.params;

        const Friend = await Friends.findOne({_id});

        if(!Friend)
            return res.status(404).json({"error" : "Friends doesn't exist"});

        await Friend.delete();
        return res.status(200).json({"message":"Friends deleted successfully"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({"message":"Ops! Something went wrong"});
        }
    }
  
}