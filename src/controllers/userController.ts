import User from "../model/userModel";
import {Request, Response} from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default {
    async index(req : Request, res : Response) {
        const users = await User.find();
        res.json(users);
    },

    async getByName(req : Request, res : Response) {
        try{
            let {name} = req.params;
            const user = await User.find({name: {$regex: '.*' + name + '.*'}});
            res.json(user);
        } catch (e) {
            console.log(e);
            res.status(500).json({message: "Ops! Something went wrong"});
        }
    },

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
                const user = new User({name, email, pass: hash});

                let tokenSecret = String(process.env.TOKEN_SECRET);

                const token = jwt.sign({
                    _id: user._id
                }, tokenSecret);

                await user.save();

                return res.status(200).json({
                    name: user.name, _id: user._id, email: user.email, auth_token: token,
                });
            }
        } catch (e) {
            res.status(500).json({message: "Ops! Something went wrong"});
        }
    },

    async destroy(req: Request, res: Response){
        try{
            let {_id} = req.params;

            const user = await User.findOne({_id});

            if(!user)
                return res.status(404).json({message: "User doesn't exist"});

            await user.delete();
            return res.status(200).json({message: "User deleted successfully"});
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: "Ops! Something went wrong"});
        }
    },

    async update(req: Request, res: Response){
        try{

            let {pass, newName, newEmail, newPass} = req.body;
            let {_id} = req.params;
            const user = await User.findOne({_id});
            if(!user)
                return res.status(404).json({"error" : "User doesn't exist"});

            let r = await bcrypt.compare(pass, user.pass);

            if(!r)
                return res.status(401).json({"error" : "Email or password is incorrect"});

            let userUpdate = {
                "name"      : (newName)  ? newName : user.name,
                "email"     : (newEmail) ? newEmail : user.email,
                "pass"      : (newPass)  ? await bcrypt.hash(newPass, 10) : user.pass,
                "last_pass" : (newPass)  ? user.pass : null
            }

            await user.update(userUpdate);

            return res.status(200).json({message : "User update successfully"});

        } catch (e) {
            console.log(e);
            return res.status(500).json({message : "Ops! Something went wrong"});
        }

    },

    async Login(req : Request, res : Response){
        try{
            let {email, pass} = req.body;

            const user = await User.findOne({email});

            if(!user)
                return res.status(400).json({"error" : "User not found"});

            if(await bcrypt.compare(pass, user.pass)){
                let tokenSecret = String(process.env.TOKEN_SECRET);

                const token = jwt.sign({
                    _id: user._id
                }, tokenSecret);

                return res.status(200).json({
                    name: user.name, _id: user._id, email: user.email, auth_token: token,
                });
            }
        } catch (e) {
            return res.status(401).json({message : "Email or password is incorrect"});
        }
    }
}