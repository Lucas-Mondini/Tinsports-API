import mongoose from 'mongoose';

export type GameType = {
  _id: string;
  name: string;
  type: string;
  location: string;
  date: string;
  description: string;
  value: number;
  host_ID: string;
  hour: string;
  finished: boolean;
  recurrence: boolean;
  inviteId?: string;
  delete: () => void;
  save: () => void;
}

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
  },
  host_ID: {
    type: String,
    required: true,
    max: 24,
    min: 24
  },
  finished: {
    type: Boolean,
    required: true
  },
  recurrence: {
    type: Boolean,
    required: true
  }
});

export default mongoose.model("Game", Game);