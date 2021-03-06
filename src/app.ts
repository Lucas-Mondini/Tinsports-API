import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import mongo from './DB/mongo';
import { friendRoutes } from './routes/FriendRoutes';
import { userRoutes } from './routes/UserRoutes';
import { gameRoutes } from './routes/GameRoutes';
import { gameListRoutes } from './routes/GameListRoutes';

const corsOptions = {
  origin: "*",
  optionSuccessStatus: 200
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(userRoutes);
app.use(gameRoutes);
app.use(friendRoutes);
app.use(gameListRoutes);

mongo.connect();

app.listen(process.env.PORT, () => {
  console.log('Server Started');
});