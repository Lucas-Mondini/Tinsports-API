import mongoose from 'mongoose';

const GameList = new mongoose.Schema({
  user_ID: {
    type: String,
    required: true,
    max: 24,
    min: 24
  },
  game_ID: {
    type: String,
    required: true,
    max: 24,
    min: 24
  },

});

export default mongoose.model("Game", GameList);