import { Request, Response } from "express";
import UserController from "../controllers/userController";

export default class GameView {

  async index(req: Request, res: Response) {
    const users = await new UserController().index();

    res.status(200).json(users);
  }

  async getByName(req: Request, res: Response) {
    const {name} = req.params;
    const users = await new UserController().getByName(name);

    if(users) 
      res.status(200).json(users);
    else
      res.status(500).json({message: "Ops! Something went wrong"});
  }

  async getById(req : Request, res : Response) { 
    const {id} = req.params;
    const users = await new UserController().getById(id);

    if(users) 
      res.status(200).json(users);
    else
      res.status(500).json({message: "Ops! Something went wrong"});
  }

  async save(req : Request, res : Response) {
    const user = await new UserController().save(req.body);

    if(user) {
      if (!user.failed) {
        res.status(200).json(user)
      } 
      else 
        res.status(user.code).json(user.message);
      }
  }

  async getHome(req: Request, res: Response)
  {
    const {_id} = req.user || req.query;

    const {friendGames} = req.query;

    //const response = await new GameController().gamesOfUser(_id, !!friendGames);

    res.status(200).json(response);
  }

}