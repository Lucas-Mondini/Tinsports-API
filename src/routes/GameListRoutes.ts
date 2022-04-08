import { Router } from 'express';
import tokenValidation from '../services/tokenValidation';
import GameListView from '../views/GameListView';

const gameListRoutes = Router();
const gameListController = new GameListView();

if (process.env.ENVIRONMENT !== 'production') {
  // Get all game lists
  gameListRoutes.get('/game-list',                      tokenValidation,  gameListController.index);
}

// Get user invitations
gameListRoutes.get('/game-list/invite',               tokenValidation,  gameListController.get);

// Invite user to game
gameListRoutes.post('/game-list',                     tokenValidation,  gameListController.save);

// Confirm invitation
gameListRoutes.post('/game-list/invite-confirmation', tokenValidation,  gameListController.confirm);

// Delete Game list
gameListRoutes.delete('/game-list/:_id',              tokenValidation,  gameListController.destroy);

export {
  gameListRoutes
}