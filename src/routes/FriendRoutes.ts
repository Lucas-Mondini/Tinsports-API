import { Router } from 'express';
import FriendListController from "../controllers/FriendListController";
import tokenValidation from '../services/tokenValidation';

const friendRoutes = Router();
const friendListController = new FriendListController();

// Get all friends, for Staff only
friendRoutes.get('/friend',         tokenValidation, (req, res) => friendListController.index(req, res));

// Get friend by the user id
friendRoutes.get('/friend/:id',     tokenValidation, (req, res) => friendListController.get(req, res));

// Register friend
friendRoutes.post('/friend',        tokenValidation, (req, res) => friendListController.save(req, res));

// Delete friend
friendRoutes.delete('/friend/:_id', tokenValidation, (req, res) => friendListController.destroy(req, res));

// Confirm friend invitation
friendRoutes.post('/friend/confirm/:_id', tokenValidation, (req, res) => friendListController.confirm(req, res));

export {
  friendRoutes
}