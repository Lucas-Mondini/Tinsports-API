import { Request, Response } from "express";
import Friends from "../model/FriendsListModel";
import User from "../model/UserModel";

export default class FriendListController {

  /**
   *  Get all friends relations
   * @param req Request
   * @param res Response
   */
  async index(req: Request, res: Response){
    try{
      let friend = await Friends.find();

      res.status(200).json(friend);
    } catch(error){
      res.status(500).json({message: 'Ops! Something went wrong!'})
    }
  }

  /**
   * Save new friend relation
   * @param req Request
   * @param res Response
   */
  async save(req: Request, res: Response){

    try{
      let {user_ID, friend_ID} = req.body;

      let friends = new Friends({
        user_ID, friend_ID, confirmed: false
      });

      await friends.save();

      res.status(200).send(friends);
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }

  }

  /**
   *  Get friend relation by id
   * @param req Request
   * @param res Response
   */
  async get(req: Request, res: Response){
    try{
      const {id} = req.params;
      const userInfoList = new Array();

      const friends = await Friends.find().or([
        {user_ID: id},
        {friend_ID: id}
      ]);

      if (friends.length > 0) {
        for (let friend of friends) {
          if (!friend.confirmed) break;

          let user;

          if (friend.user_ID === id) {
            user = await User.findOne({_id: friend.friend_ID});
          } else {
            user = await User.findOne({_id: friend.user_ID});
          }

          const responseUser  = {
            _id: friend._id,
            user_ID: user._id,
            name: user.name,
            email: user.email,
            reputation: user.reputation
          };

          if (user) userInfoList.push(responseUser);
        }
      }

      res.status(200).json({friends: userInfoList});
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }

  /**
   *  Confirm friend invitation
   * @param req Request
   * @param res Response
   */
   async confirm(req: Request, res: Response){
    try{
      const {_id} = req.params;

      const friendInvitation = await Friends.findOne({_id});

      if (!friendInvitation) return res.status(404).json({message: "Friend request doesn't exist"});

      friendInvitation.confirmed = true;
      friendInvitation.save();

      res.status(200).json(friendInvitation);
    } catch(error){
      res.status(500).json({message: "Ops! Something went wrong"});
    }
  }

  /**
   *  Delete friend relation
   * @param req Request
   * @param res Response
   */
  async destroy(req: Request, res: Response){
    try{
        let {_id} = req.params;

        const friend = await Friends.findOne({_id});

        if(!friend)
            return res.status(404).json({message : "Friend doesn't exist"});

        await friend.delete();
        return res.status(200).json({message:"Friends deleted successfully"});
        } catch (error) {
            return res.status(500).json({message:"Ops! Something went wrong"});
        }
    }
}