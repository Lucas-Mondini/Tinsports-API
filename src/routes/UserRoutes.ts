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

// Update user information
userRoutes.put('/register/user',                    tokenValidation, usersView.update);

// Update user photo
userRoutes.put('/register/photo',                   tokenValidation, usersView.photo);

// Update user reputation
userRoutes.post('/register/user/update-reputation', tokenValidation, usersView.reputation);

// User Login
userRoutes.post('/login',                                            usersView.login);

// Change user password
userRoutes.put('/change-pass',                                       usersView.changePass);

// Confirm user code
userRoutes.post('/code',                            tokenValidation, usersView.code);

// Confirm user code to change pass
userRoutes.post('/change-pass-code',                                 usersView.code);

// Confirm user code
userRoutes.post('/resend-code',                     tokenValidation, usersView.resendCode);

// Confirm user code
userRoutes.post('/forgot-pass',                                      usersView.forgotPass);

// Update user to premium
userRoutes.post('/premium',                         tokenValidation, usersView.premium);

// Update user to regular user
userRoutes.post('/not-premium',                     tokenValidation, usersView.notPremium);

export {
  userRoutes
}