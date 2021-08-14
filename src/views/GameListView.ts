import DefaultView from "./DefaultView";
import { Request, Response } from 'express';
import GameListController from "../controllers/gameListController";

export default class GameView extends DefaultView {

  private gameListController: GameListController;

  constructor() {
    super()
    this.gameListController = new GameListController();
  }

  index = async(req: Request, res: Response) =>
  {
    const response = await this.gameListController.getAllGameLists();

    this.treatError(res, response);
  }

  get = async(req: Request, res: Response) =>
  {
    const {_id} = req.user;
    const response = await this.gameListController.getInvitations(_id);

    this.treatError(res, response);
  }

  save = async(req: Request, res: Response) =>
  {
    const {user_ID, game_ID} = req.body;

    const response = await this.gameListController.inviteUser(user_ID, game_ID);

    this.treatError(res, response);
  }

  confirm = async(req: Request, res: Response) =>{
    const {_id} = req.body;
    const user_ID = req.user._id;

    const response = await this.gameListController.confirmInvitation(_id, user_ID);

    this.treatError(res, response);
  }

  destroy = async(req: Request, res: Response) =>
  {
    const {_id} = req.params;
    const response = await this.gameListController.deleteGameInvitation(_id);

    this.treatError(res, response);
  }

}