import mongoose from 'mongoose';

export type GameListType = {
  game_ID: string;
  user_ID: string;
  confirmed: boolean;
}

const GameList = new mongoose.Schema({
  game_ID: {
    type: String,
    required: true,
    max: 24,
    min: 24
  },
  user_ID: {
    type: String,
    required: true,
    max: 24,
    min: 24
  },
  confirmed: {type: Boolean}
});

export default mongoose.model("GameList", GameList);