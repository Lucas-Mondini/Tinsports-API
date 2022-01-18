const mongoose = require('mongoose');

export type ScheduleType = {
  _id: string;
  what: Object;
  when: string;
}

const Schedule = new mongoose.Schema({
  what:{
    type: Object,
    required: true
  },
  when:{
    type: String,
    required: true
  }
});

export default mongoose.model ("Schedule", Schedule);