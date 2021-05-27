import mongoose from 'mongoose';

const GameList = new mongoose.Schema({
  game_ID: {
    type: String,
    required: true,
    max: 24,
    min: 24
  },
  host_ID: {
    type: String,
    required: true,
    max: 24,
    min: 24
  },
  invitedUsers: [
    {user: {
      _id: String,
      confirmed: Boolean,
    }}
  ]

});

export default mongoose.model("GameList", GameList);