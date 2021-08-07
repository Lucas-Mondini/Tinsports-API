import { Router } from 'express';
import GameController from '../controllers/gameController';
import tokenValidation from '../services/tokenValidation';

const gameRoutes = Router();
const gameController = new GameController();

// Debug - Get all games
gameRoutes.get("/games",            tokenValidation, (req, res) => gameController.index(req, res));

// Register a new game
gameRoutes.post("/games",            tokenValidation, (req, res) => gameController.save(req, res));

// Get all games involving the user
gameRoutes.get('/games/home/:id',    tokenValidation, (req, res) => gameController.gamesOfUser(req, res));

// Get game by id
gameRoutes.get('/games/:id',         tokenValidation, (req, res) => gameController.get(req, res));

// Delete game
gameRoutes.post('/games/:id/delete', tokenValidation, (req, res) => gameController.destroy(req,res));

export {
  gameRoutes
}