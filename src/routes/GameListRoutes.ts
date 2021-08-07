import { Router } from 'express';
import GameListController from "../controllers/gameListController";
import tokenValidation from '../services/tokenValidation';

const gameListRoutes = Router();
const gameListController = new GameListController();

// Get all game lists
gameListRoutes.get('/game-list',                  tokenValidation, (req, res) => gameListController.index(req, res));

// Delete Game list
gameListRoutes.delete('/game-list/:_id/delete',   tokenValidation, (req, res) => gameListController.destroy(req, res));

// Get user invitations
gameListRoutes.get('/game-list/invite/:userId',       tokenValidation, (req, res) => gameListController.getInvitations(req, res));

// Invite user to game
gameListRoutes.post('/game-list/invite',              tokenValidation, (req, res) => gameListController.inviteUser(req, res));

// Confirm invitation
gameListRoutes.post('/game-list/invite-confirmation', tokenValidation, (req, res) => gameListController.confirmInvitation(req, res));

export {
  gameListRoutes
}