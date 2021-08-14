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

  index = (req: Request, res: Response) =>
  {
    const response = this.friendsController.getAllFriendsRelations();

    this.treatError(res, response);
  }

  get = (req: Request, res: Response) =>
  {
    const {_id} = req.params || req.user;
    const {friendsFriends} = req.query;

    const response = this.friendsController.getFriendById(_id, !!friendsFriends);

    this.treatError(res, response);
  }

  save = (req: Request, res: Response) =>
  {
    const {friend_ID} = req.body;
    const user_ID = req.user._id;

    const response = this.friendsController.sendFriendInvitation(user_ID, friend_ID);

    this.treatError(res, response);
  }

  confirm = (req: Request, res: Response) =>
  {
    const {_id} = req.params

    const response = this.friendsController.confirmFriendInvitation(_id);

    this.treatError(res, response);
  }

  destroy = (req: Request, res: Response) =>
  {
    const {_id} = req.params

    const response = this.friendsController.deleteFriend(_id);

    this.treatError(res, response);
  }

}