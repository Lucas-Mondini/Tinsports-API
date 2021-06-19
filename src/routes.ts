import { Router } from 'express';
import userController   from "./controllers/userController";
import gameController   from "./controllers/gameController";
import friendListController from "./controllers/friendListController";
import gameListController from "./controllers/gameListController";
import tokenValidation from './controllers/tokenValidation';

const routes = Router();

// Get all users, for Staff only
routes.get('/register/user', tokenValidation, userController.index);

// Find user by name
routes.get('/register/user/:name', tokenValidation, userController.getByName);

// Register user
routes.post('/register/user', userController.save);

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

// Get user invitations
routes.get('/games/invite/:userId', tokenValidation, gameController.getInvitations);

// Invite user to game
routes.post('/games/invite', tokenValidation, gameController.inviteUser);

// Invite user to game
routes.post('/games/invite-confirmation', tokenValidation, gameController.confirmInvitation);

// Delete game
routes.post('/games/:id/delete', tokenValidation, gameController.destroy);

// Get all friends, for Staff only
routes.get('/friend', tokenValidation, friendListController.index);

// Get friend by id
routes.get('/friend/:id', tokenValidation, friendListController.get);

// Register friend
routes.post('/friend', tokenValidation, friendListController.save);

// Delete friend
routes.delete('/friend/:_id', tokenValidation, friendListController.destroy);

// Get all game lists
routes.get('/game-list', tokenValidation, gameListController.index);

// Save game list
routes.post('/game-list', tokenValidation, gameListController.save);

// Get game list
routes.get('/game-list/:id', tokenValidation, gameListController.get);

export default routes;