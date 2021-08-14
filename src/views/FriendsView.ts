import { Request, Response } from 'express';

import FriendListController from "../controllers/friendListController";
import DefaultView from "./DefaultView";

export default class FriendsView extends DefaultView {

  private friendsController: FriendListController;

  constructor()
  {
    super();
    this.friendsController = new FriendListController();
  }

  index = async(req: Request, res: Response) =>
  {
    const response = await this.friendsController.getAllFriendsRelations();

    this.treatError(res, response);
  }

  get = async(req: Request, res: Response) =>
  {
    const {_id} = req.params || req.user;
    const {friendsFriends} = req.query;

    const response = await this.friendsController.getFriendById(_id, !!friendsFriends);

    this.treatError(res, response);
  }

  save = async(req: Request, res: Response) =>
  {
    const {friend_ID} = req.body;
    const user_ID = req.user._id;

    const response = await await this.friendsController.sendFriendInvitation(user_ID, friend_ID);

    this.treatError(res, response);
  }

  confirm = async(req: Request, res: Response) =>
  {
    const {_id} = req.params

    const response = await this.friendsController.confirmFriendInvitation(_id);

    this.treatError(res, response);
  }

  destroy = async(req: Request, res: Response) =>
  {
    const {_id} = req.params

    const response = await this.friendsController.deleteFriend(_id);

    this.treatError(res, response);
  }

}