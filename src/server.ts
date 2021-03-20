import express from 'express';
import routes from './routes';
import mongo from './DB/mongo';
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(routes);

mongo.connect();

app.listen(process.env.PORT, ()=> {
  console.log('Server Started');
});