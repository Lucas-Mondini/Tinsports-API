import { Request, Response } from "express";
import Game from "../model/gameModel";

export default {

  save(req: Request, res: Response){

    let {name, type, location, date} = req.body;

    let game = new Game({
      name, type, location, date
    });

    res.send(game);

  }

}