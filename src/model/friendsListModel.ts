import mongoose from 'mongoose';

export type FriendsType = {
  user_ID: string;
  friend_ID: string;
  confirmed: boolean;
}

const Friends = new mongoose.Schema({
    user_ID: {
        type: String,
        required: true,
        max: 24,
        min: 24
      },
    friend_ID: {
        type: String,
        required: true,
        max: 24,
        min: 24
      },
    confirmed: {
      type: Boolean,
    }
});

export default mongoose.model("Friends", Friends);