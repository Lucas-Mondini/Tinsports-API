import { Request, Response } from "express";
import GameController from "../controllers/gameController";
import DefaultView from "./DefaultView";

export default class GameView extends DefaultView {

  private gameController: GameController;

  constructor()
  {
    super();
    this.gameController = new GameController();
  }

  index = async(req: Request, res: Response) =>
  {
    const response = await this.gameController.getAllGames();

    this.treatError(res, response);
  }

  getHome = async(req: Request, res: Response) =>
  {
    const _id = req.query._id ? req.query._id : req.user;
    const {friendGames} = req.query;

    const response = await this.gameController.getAllGamesOfUser(_id, !!friendGames);

    this.treatError(res, response);
  }

  save = async(req: Request, res: Response) =>
  {
    const {_id} = req.user;

    const response = await this.gameController.insertNewGame(req.body, _id);

    this.treatError(res, response);
  }

  update = async(req: Request, res: Response) =>
  {
    const {_id} = req.user;

    const response = await this.gameController.updateGame(req.body, _id);

    this.treatError(res, response);
  }

  get = async(req: Request, res: Response) =>
  {
    const {_id} = req.params;

    const response = await this.gameController.getGameById(_id);

    this.treatError(res, response);
  }

  destroy = async(req: Request, res: Response) =>
  {
    const {_id} = req.params;
    const host_ID = req.user._id;

    const response = await this.gameController.deleteGame(_id, host_ID);

    this.treatError(res, response);
  }

}