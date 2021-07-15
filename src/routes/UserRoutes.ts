import { Router } from 'express';
import UserController from '../controllers/UserController';
import tokenValidation from '../services/tokenValidation';

const userRoutes = Router();
const userController = new UserController();

// Get all users, for Staff only
userRoutes.get('/register/user',                       tokenValidation, (req, res) => userController.index(req, res));

// Find user by name
userRoutes.get('/register/user/:name',                 tokenValidation, (req, res) => userController.getByName(req, res));

// Find user by Id
userRoutes.get('/user/:id',                            tokenValidation, (req, res) => userController.getById(req, res));

// Register user
userRoutes.post('/register/user',                                       (req, res) => userController.save(req, res));

// Delete user
userRoutes.delete('/register/user/:_id',               tokenValidation, (req, res) => userController.destroy(req, res));

// Update user
userRoutes.put('/register/user/:_id',                  tokenValidation, (req, res) => userController.update(req, res));

// Update user
userRoutes.post('/register/user/update-reputation',    tokenValidation, (req, res) => userController.updateReputation(req, res));

// User Login
userRoutes.post('/login',                                               (req, res) => userController.login(req, res));

export {
  userRoutes
}