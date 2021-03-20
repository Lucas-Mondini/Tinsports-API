const mongoose = require('mongoose');

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
  }
});

export default mongoose.model ("User", User);