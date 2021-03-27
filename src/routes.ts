import { Router } from 'express';
import userController from "./DB/controllers/userController";
import gameController from "./DB/controllers/gameController";

const routes = Router();

// Get all users, for Staff only
routes.get('/register/user',     userController.index);

// Find user by name
routes.get('/register/user/:name', userController.getByName);

// Register user
routes.post('/register/user',    userController.save);

// Delete user
routes.delete('/register/user/:_id', userController.destroy);

// Update user
routes.put('/register/user/:_id', userController.update);

// User Login
routes.post('/login', userController.Login);

// Get all games
routes.post("/games", gameController.save);

// Register a new game
routes.get('/games', gameController.index);

// Get game by id
routes.get('/games/:id', gameController.get);

export default routes;