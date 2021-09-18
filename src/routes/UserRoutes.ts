import { Router } from 'express';
import tokenValidation from '../services/tokenValidation';
import UserView from '../views/UserView';

const userRoutes = Router();
const usersView = new UserView();

// Get all users, for Staff only
userRoutes.get('/register/user',                    tokenValidation, usersView.index);

// Find user by name
userRoutes.get('/register/user/:name',              tokenValidation, usersView.name);

// Find user by Id
userRoutes.get('/user/:id',                         tokenValidation, usersView.get);

// Register user
userRoutes.post('/register/user',                                    usersView.save);

// Delete user
userRoutes.delete('/register/user',                 tokenValidation, usersView.destroy);

// Update user
userRoutes.put('/register/user',                    tokenValidation, usersView.update);

// Update user
userRoutes.put('/register/photo',                   tokenValidation, usersView.photo);

// Update user
userRoutes.post('/register/user/update-reputation', tokenValidation, usersView.reputation);

// User Login
userRoutes.post('/login',                                            usersView.login);

export {
  userRoutes
}