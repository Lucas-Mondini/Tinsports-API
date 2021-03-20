import mongoose from 'mongoose';

const Game = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 30,
    min: 5
  },
  type:{
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
  },
  description:{
    type: String,
    required: false,
    max: 120
  },
  value:{
    type: Number,
    required: false
  }

});

export default mongoose.model("Game", Game);