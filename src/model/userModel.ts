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
  },
  last_pass: {
    type: String,
    required: false
  }
});

export default mongoose.model ("User", User);