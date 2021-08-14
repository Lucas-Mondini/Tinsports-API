import { Router } from 'express';
import tokenValidation from '../services/tokenValidation';
import GameView from '../views/GameView';

const gameRoutes = Router();
const gameView = new GameView();

// Debug - Get all games
gameRoutes.get("/games",            tokenValidation, gameView.index);

// Register a new game
//gameRoutes.post("/games",            tokenValidation, gameController.save);

// Get all games involving the user
gameRoutes.get('/games/home/:id',    tokenValidation, gameView.getHome);

// Get game by id
//gameRoutes.get('/games/:id',         tokenValidation, gameController.get);

// Delete game
//gameRoutes.post('/games/:id/delete', tokenValidation, gameController.destroy(req,res));

export {
  gameRoutes
}