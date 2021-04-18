import mongoose from 'mongoose';

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
      }
});

export default mongoose.model("Friends", Friends);