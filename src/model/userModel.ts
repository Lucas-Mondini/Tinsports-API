const mongoose = require('mongoose');

export type UserType = {
  _id: string;
  name: string;
  email: string;
  pass: string;
  last_pass: string;
  reputation: number;
  confPass: string;
  newName: string;
  newPass: string;
  newEmail: string;
}

const User = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  pass:{
    type: String,
    required: true
  },
  last_pass: {
    type: String,
    required: false
  },
  reputation:{
    type: Number,
    required: false
  }
});

export default mongoose.model ("User", User);