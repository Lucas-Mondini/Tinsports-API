import { Router } from 'express';
import tokenValidation from '../services/tokenValidation';
import GameView from '../views/GameView';

const gameRoutes = Router();
const gameView = new GameView();

// Debug - Get all games
gameRoutes.get("/games",         tokenValidation, gameView.index);

// Register a new game
gameRoutes.post("/games",        tokenValidation, gameView.save);

// Get all games involving the user
gameRoutes.get('/games/home',    tokenValidation, gameView.getHome);

// Get game by id
gameRoutes.get('/games/:_id',    tokenValidation, gameView.get);

// Delete game
gameRoutes.delete('/games/:_id', tokenValidation, gameView.destroy);

export {
  gameRoutes
}