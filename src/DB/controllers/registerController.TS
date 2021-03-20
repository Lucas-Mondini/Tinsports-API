import User from "../model/userModel";
import {Request, Response} from 'express';
import bcrypt from "bcrypt";

export default {
    async index(req : Request, res : Response) {
        const user = await User.find()
        res.json(user)
    },

    async getByName(req : Request, res : Response) {
        let {name} = req.params;
        const user = await User.find({name})
        res.json(user)
    },

    async save(req : Request, res : Response) {
        let {name, email, pass, confpass} = req.body;
        let hash = null;

        const cmpEmail = await User.findOne({email});
        if(cmpEmail)
            return res.status(400).json({"error" : "esse email ja existe"})

        if(pass == confpass) {
            hash = await bcrypt.hash(pass, 10);
        }
        if(hash){
            const user = new User({name, email, pass: hash});
            await user.save()
            res.send(user);
        }
        else 
            res.send({});
    },
    
    async destroy(req: Request, res: Response){

    }
}