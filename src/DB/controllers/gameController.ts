import { Request, Response } from "express";
import Game     from "../model/gameModel";
import GameList from "../model/gameListModel";
import User from "../model/userModel";

type Invite = {
  _id: string;
  user: {
    _id: string;
    confirmed: boolean;
  };
}

type User = {
  _id: string;
  name: string; 
  email: string;
  confirmed: boolean;
}

export default {

  async index(req: Request, res: Response){
    try{
      let games = await Game.find();
      
      res.status(200).json(games);
    } catch(error){
      res.status(500).json({message: 'Ops! Something went wrong!'})
    }
  },

  async save(req: Request, res: Response){

    try{
      let {name, type, location, description, value, host_ID} = req.body;

      let game = new Game({
        name, type, location, description, value, date: Date.now(), host_ID
      });
      
      let gameList = new GameList({
        game_ID: game._id, host_ID
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
      const game = await Game.findOne({_id: id});
      const gameList = await GameList.findOne({_id: game.gameList_ID});
      const invitedUsers = new Array<User>();

      for(let i = 0; i < gameList.invitedUsers.length; i++){
        let user = await User.findOne({_id: gameList.invitedUsers[i].user._id});
        
        const invitedUser: User = {
          _id: user._id,
          name: user.name,
          email: user.email,
          confirmed: gameList.invitedUsers[i].user.confirmed
        }
        
        invitedUsers.push(invitedUser);
      }

      res.status(200).json({game, gameList:{
        invitedUsers
      }});
    } catch(error){
      console.log(error);
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

      gameList.invitedUsers.forEach((user: Invite) => {
        if(user._id == inviteId){
          user.user.confirmed = true;
        }
      });
      
      gameList.save();
      
      res.status(200).json({gameList});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  },

  async getInvitations(req: Request, res: Response){
    try{
      let {userId} = req.params;

      const gameList = await GameList.find();
      const invitations = new Array<Invite>();

      for(let i = 0; i < gameList.length; i++){
        let userInvitations = gameList[i].invitedUsers.filter((user: Invite) => user.user._id == userId);
        invitations.push(userInvitations)
      }
      
      res.status(200).json({invitations});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  },

  async destroy(req: Request, res: Response){
    try{
      const {id} = req.params;

      const game = await Game.findOne({_id: id});
      const gameList = await GameList.findOne({_id: game.gameList_ID});

      game.delete();
      gameList.delete();

      res.status(200).json({message: "Game deleted successfully"});
    } catch(error){
      console.log(error);
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }
  
}