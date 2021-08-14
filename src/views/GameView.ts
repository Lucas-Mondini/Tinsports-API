import { Request, Response } from "express";
import GameController from "../controllers/gameController";

export default class GameView {

  async index(req: Request, res: Response)
  {
    const games = await new GameController().index();

    res.status(200).json(games);
  }

  async getHome(req: Request, res: Response)
  {
    const {_id} = req.user || req.query;

    const {friendGames} = req.query;

    const response = await new GameController().gamesOfUser(_id, !!friendGames);

    res.status(200).json(response);
  }

}