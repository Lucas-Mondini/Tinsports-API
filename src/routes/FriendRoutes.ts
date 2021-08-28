import { Router } from 'express';
import tokenValidation from '../services/tokenValidation';
import FriendsView from '../views/FriendsView';

const friendRoutes = Router();
const friendView = new FriendsView();

// Get all friends, for Staff only
friendRoutes.get('/friends',                 tokenValidation, friendView.index);

// Get friend by the user id
friendRoutes.get('/friend',                  tokenValidation, friendView.get);

// Confirm friend invitation
friendRoutes.get('/friend/gameList/:gameId', tokenValidation, friendView.invite);

// Register friend
friendRoutes.post('/friend',                 tokenValidation, friendView.save);

// Delete friend
friendRoutes.delete('/friend/:_id',          tokenValidation, friendView.destroy);

// Confirm friend invitation
friendRoutes.post('/friend/confirm/:_id',    tokenValidation, friendView.confirm);

export {
  friendRoutes
}