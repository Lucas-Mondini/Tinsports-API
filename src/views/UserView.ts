import { Request, Response } from "express";
import UserController from "../controllers/userController";
import DefaultView from "./DefaultView";

export default class UserView extends DefaultView {

  private userController: UserController;

  constructor()
  {
    super();
    this.userController = new UserController();
  }

  index = async(req: Request, res: Response) =>
  {
    const response = await this.userController.getAllUsers();

    this.treatError(res, response);
  }

  name = async(req: Request, res: Response) =>
  {
    const {name} = req.params;
    const {_id} = req.user;
    const response = await this.userController.getUserByName(name, _id);

    this.treatError(res, response);
  }

  get = async(req: Request, res: Response) =>
  {
    const {id} = req.params;
    const response = await this.userController.getUserById(id);

    this.treatError(res, response);
  }

  save = async(req: Request, res: Response) =>
  {
    const response = await this.userController.createNewUser(req.body);

    this.treatError(res, response);
  }

  reputation = async(req: Request, res: Response) =>
  {
    const {paid, participated, user_ID} = req.body;

    const response = await this.userController.updateReputation(paid, participated, user_ID);

    this.treatError(res, response);
  }

  destroy = async(req: Request, res: Response) =>
  {
    const {_id} = req.user;

    const response = await this.userController.deleteUser(_id);

    this.treatError(res, response);
  }

  update = async(req: Request, res: Response) =>
  {
    const {_id} = req.user;

    const response = await this.userController.updateUser(req.body, _id);

    this.treatError(res, response);
  }

  photo = async(req: Request, res: Response) =>
  {
    const {_id} = req.user;
    const { photoUrl } = req.body;

    const response = await this.userController.updatePhoto(_id, photoUrl);

    this.treatError(res, response);
  }

  login = async(req: Request, res: Response) =>
  {
    const {email, pass} = req.body;

    const response = await this.userController.login(email, pass);

    this.treatError(res, response);
  }

  premium = async(req: Request, res: Response) =>
  {
    const {_id} = req.user;

    const response = await this.userController.updateUserToPremium(_id);

    this.treatError(res, response);
  }

  notPremium = async(req: Request, res: Response) =>
  {
    const {_id} = req.user;

    const response = await this.userController.updateUserToNotPremium(_id);

    this.treatError(res, response);
  }
}