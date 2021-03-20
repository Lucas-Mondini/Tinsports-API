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
        let {_id} = req.params;
        const user = await User.findOne({_id});

        if(!user)
            return res.status(404).json({"error" : "usuario não existe"})

        await user.delete();
        res.send(user);
    },
    
    async update(req: Request, res: Response){
        let {_id, pass, newName, newEmail, newPass} = req.body;
        const user = await User.findOne({_id});
        if(!user)
            return res.status(404).json({"error" : "usuario não existe"})

        let r = await bcrypt.compare(pass, user.pass);

        if(!r)
            return res.status(401).json({"error" : "Senha incorreta"})
        
        let userUpdate = {
            "name"      : (newName)  ? newName : user.name,
            "email"     : (newEmail) ? newEmail : user.email,
            "pass"      : (newPass)  ? await bcrypt.hash(newPass, 10) : user.pass,
            "last_pass" : (newPass)  ? user.pass : null
        }

        res.send(await user.update(userUpdate));

    }
}