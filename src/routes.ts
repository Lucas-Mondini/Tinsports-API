import { Router } from 'express';
import registerController from "./DB/controllers/registerController";
import loginController from "./DB/controllers/loginController";
import gameController from "./DB/controllers/gameController";

const routes = Router();

routes.get('/', (req, res) => {

  res.send("oi");
});

//Registro
routes.get('/register/user',     registerController.index);
routes.get('/register/user/:name', registerController.getByName);
routes.post('/register/user',    registerController.save);
routes.delete('/register/user/:_id', registerController.destroy);
routes.put('/register/user/:_id', registerController.update);

//Login
routes.get('/login', loginController.Login);





//Jean
routes.post("/games", gameController.save);
routes.get('/games', gameController.index);

export default routes;