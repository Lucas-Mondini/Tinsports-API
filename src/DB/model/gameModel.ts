import mongoose from 'mongoose';

const Game = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 30,
    min: 5
  },
  gameType:{
    type: String,
    required: true,
    max: 30,
    min: 5,
  },
  location: {
    type: String,
    required: true,
    max: 30,
    min: 5
  },
  date:{
    type: Date,
    required: true
  }
  /* hour:{
    type:
  } */

});

export default mongoose.model("Game", Game);