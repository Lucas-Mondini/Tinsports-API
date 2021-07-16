import User from "../model/UserModel";
import Game from "../model/GameModel";
import GameList from "../model/GameListModel";
import Friends from "../model/FriendsListModel";
import {Request, Response} from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DefaultController from "./DefaultController";

export default class UserController extends DefaultController {
    /**
     *  Method to get all users from database
     * @param req Request
     * @param res Response
     */
    async index(req : Request, res : Response) {
        const users = await User.find();

        res.json(users);
    }

    /**
     *  Get all users by name
     * @param req Request
     * @param res Response
     */
    async getByName(req : Request, res : Response) {
        try{
            let {name} = req.params;
            const user = await User.find({name: {$regex: '.*' + name + '.*'}});
            res.json(user);
        } catch (e) {
            res.status(500).json({message: "Ops! Something went wrong"});
        }
    }

    /**
     *  Get all users by id
     * @param req Request
     * @param res Response
     */
    async getById(req : Request, res : Response) {
        try{
            let {id} = req.params;
            const user = await User.findOne({_id: id});
            res.json(user);
        } catch (e) {
            res.status(500).json({message: "Ops! Something went wrong"});
        }
    }

    /**
     * Save a new user
     * @param req Request
     * @param res Response
     */
    async save(req : Request, res : Response) {
        try{
            let {name, email, pass, confPass} = req.body;
            let hash = null;

            const cmpEmail = await User.findOne({email});
            if(cmpEmail)
                return res.status(400).json({message: "Email already in use"})

            if(pass == confPass) {
                hash = await bcrypt.hash(pass, 10);
            }
            if(hash){
                const user = new User({name, email, pass: hash, reputation: null});

                let tokenSecret = String(process.env.TOKEN_SECRET);

                const token = jwt.sign({
                    _id: user._id
                }, tokenSecret);

                await user.save();

                return res.status(200).json({
                    name: user.name, _id: user._id, email: user.email, auth_token: token, reputation: user.reputation
                });
            }
        } catch (e) {
            res.status(500).json({message: "Ops! Something went wrong"});
        }
    }

    /**
     *  Delete user, his games, game lists and friends
     * @param req Request
     * @param res Response
     */
    async destroy(req: Request, res: Response){
        try{
            let {_id} = req.params;

            const user = await User.findOne({_id});
            const games = await Game.find({host_ID: _id});
            const invitations = await GameList.find({user_ID: _id});
            const friends = await Friends.find().or([
                {user_ID: _id},
                {friend_ID: _id}
            ]);
            const gameLists = [...invitations];

            if(!user)
                return res.status(404).json({message: "User doesn't exist"});

            for (const game of games) {
                const lists = await GameList.find({game_ID: game._id});
                gameLists.push(...lists);
            }

            await this.destroyObjectArray(gameLists);
            await this.destroyObjectArray(games);
            await this.destroyObjectArray(friends);

            await user.delete();
            return res.status(200).json({message: "User deleted successfully"});
        } catch (e) {
            return res.status(500).json({message: "Ops! Something went wrong"});
        }
    }

    async updateReputation(req: Request, res: Response) {
        try {
            const {paid, participated, user_ID} = req.body;

            const user = await this.updateReputationMethod(Boolean(paid), Boolean(participated), user_ID);

            if (!user) return res.status(404).json({message: "User not found"});

            res.status(200).json(user);
        } catch(error){
            return res.status(500).json({message : "Ops! Something went wrong"});
        }
    }

    /**
     *  Update user info
     * @param req Request
     * @param res Response
     */
    async update(req: Request, res: Response){
        try{

            let {pass, newName, newEmail, newPass} = req.body;
            let {_id} = req.params;
            const user = await User.findOne({_id});
            if(!user)
                return res.status(404).json({error : "User doesn't exist"});

            let r = await bcrypt.compare(pass, user.pass);

            if(!r)
                return res.status(401).json({error : "Email or password is incorrect"});

            let userUpdate = {
                name      : (newName)  ? newName : user.name,
                email     : (newEmail) ? newEmail : user.email,
                pass      : (newPass)  ? await bcrypt.hash(newPass, 10) : user.pass,
                last_pass : (newPass)  ? user.pass : null
            }

            await user.updateOne(userUpdate);
            await user.save();

            return res.status(200).json({message : "User update successfully"});

        } catch (e) {
            return res.status(500).json({message : "Ops! Something went wrong"});
        }

    }

    /**
     * Method that makes the login
     * @param req Request
     * @param res Response
     */
    async login(req : Request, res : Response){
        try{
            let {email, pass} = req.body;

            const user = await User.findOne({email});

            if(!user)
                return res.status(400).json({error : "User not found"});

            if(await bcrypt.compare(pass, user.pass)){
                let tokenSecret = String(process.env.TOKEN_SECRET);

                const token = jwt.sign({
                    _id: user._id
                }, tokenSecret);

                return res.status(200).json({
                    name: user.name, _id: user._id, email: user.email, auth_token: token, reputation: user.reputation
                });
            }
        } catch (e) {
            return res.status(401).json({message : "Email or password is incorrect"});
        }
    }

    async updateReputationMethod(paid: boolean, participated: boolean, user_ID: string) {
        const user = await User.findOne({_id: user_ID});

        if (!user) return null;

        let reputation = user.reputation || 50;

        (participated && !paid) ? reputation -= 5 : !participated ? reputation -= 3 : reputation += 5;

        if (reputation > 50) reputation = 50;
        if (reputation <= 0) reputation = 0;

        user.reputation = reputation;
        user.save();

        return user;
    }
}