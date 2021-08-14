const mongoose = require('mongoose');

export type UserType = {
  name: string;
  email: string;
  password: string;
  last_pass: string;
  reputation: number;
  confPassword: string;
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