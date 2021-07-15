import express from 'express';
import mongo from './DB/mongo';
import 'dotenv/config';

import { friendRoutes } from './routes/FriendRoutes';
import { userRoutes } from './routes/UserRoutes';
import { gameRoutes } from './routes/GameRoutes';
import { gameListRoutes } from './routes/GameListRoutes';

const app = express();

app.use(express.json());
app.use(userRoutes);
app.use(gameRoutes);
app.use(friendRoutes);
app.use(gameListRoutes);

mongo.connect();

app.listen(process.env.PORT, ()=> {
  console.log('Server Started');
});