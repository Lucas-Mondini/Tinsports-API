const mongoose = require('mongoose');
require('mongoose-function')(mongoose);

export type ScheduleType = {
  _id: string;
  incrementID: Number;
  what: Function;
  when: string;
  nextExecution: Date;
}

const Schedule = new mongoose.Schema({
  incrementID: {
    type: Number,
    required: true
  },
  what:{
    type: Function,
    required: true
  },
  when:{
    type: String,
    required: true
  },
  nextExecution:{
    type: Date,
    required: true
  }
});

export default mongoose.model ("Schedule", Schedule);