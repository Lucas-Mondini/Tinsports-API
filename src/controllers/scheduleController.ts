import Schedule from "../model/scheduleModel";
import DefaultController from "./DefaultController";

import moment from "moment-timezone";

export default class ScheduleController extends DefaultController {

  /**
   * Get all listed schedules
   */

    scheduleStack = new Array(Object);

    constructor() {
        super();
    }

   async init() {
       this.updateStack();
   }

    async updateStack() {
        try {
            this.scheduleStack = await Schedule.find();
        } catch(error){
            console.log(error);
        }
    }

   async addToStack(what: Object, when: String) {
       let schedule =  new Schedule({what, when});
       schedule.save();
       this.scheduleStack.push(Schedule);
       
   }
}