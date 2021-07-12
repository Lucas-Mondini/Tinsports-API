const mongoose = require('mongoose');

export type UserType = {
  name: string;
  email: string;
  password: string;
  last_pass: string;
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
  }
});

export default mongoose.model ("User", User);