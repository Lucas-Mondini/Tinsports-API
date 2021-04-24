import { Router } from 'express';
import userController   from "./DB/controllers/userController";
import gameController   from "./DB/controllers/gameController";
import friendListController from "./DB/controllers/friendListController";
import gameListController from "./DB/controllers/gameListController";
import tokenValidation from './DB/controllers/tokenValidation';

const routes = Router();

// Get all users, for Staff only
routes.get('/register/user', tokenValidation,     userController.index);

// Find user by name
routes.get('/register/user/:name', tokenValidation, userController.getByName);

// Register user
routes.post('/register/user',    userController.save);

// Delete user
routes.delete('/register/user/:_id', tokenValidation, userController.destroy);

// Update user
routes.put('/register/user/:_id', tokenValidation, userController.update);

// User Login
routes.post('/login', userController.Login);

// Get all games
routes.post("/games", tokenValidation, gameController.save);

// Register a new game
routes.get('/games', tokenValidation, gameController.index);

// Get game by id
routes.get('/games/:id', tokenValidation, gameController.get);


// Get all friends, for Staff only
routes.get('/friend', tokenValidation,           friendListController.index);

// Get friend by id
routes.get('/friend/:id', tokenValidation,      friendListController.index);

// Register friend
routes.post('/friend', tokenValidation,         friendListController.save);

// Delete friend
routes.delete('/friend/:_id', tokenValidation,  friendListController.destroy);

// Save game list
routes.post('/game-list', tokenValidation,      gameListController.save);

// Get game list
routes.get('/game-list/:id', tokenValidation,   gameListController.get)

export default routes;