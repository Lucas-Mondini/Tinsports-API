import User from "../model/userModel";
import {Request, Response} from 'express';
import bcrypt from "bcrypt";

export default {
    async Login(req : Request, res : Response){
        let {email, pass} = req.body
        const user = await User.findOne({email})
        if(!user)
            return res.status(400).json({"error" : "usuario não encontrado"})
        if(await bcrypt.compare(pass, user.pass)){
            return res.status(200).json({   "user._id": user._id,
                                            "user.name": user.name,
                                            "autenticado": true
                                        })
        }
        return res.status(401).json({"error" : "Senha incorreta"})
    }
}