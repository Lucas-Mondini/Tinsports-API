import { Router } from 'express';
import registerController from "./DB/controllers/registerController";
import gameController from "./DB/controllers/gameController";

const routes = Router();

routes.get('/', (req, res) => {

  res.send("oi");
});

routes.get('/user',     registerController.index);
routes.get('/user/:name', registerController.getByName);
routes.post('/user',    registerController.save);

routes.post("/games", gameController.save);

export default routes;