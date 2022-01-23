import Schedule from "../model/scheduleModel";
import DefaultController from "./DefaultController";
import cron, { CronJob } from 'cron'

import moment from "moment-timezone";
import { ObjectId } from "mongoose";

export default class ScheduleController extends DefaultController {

    private static instance: ScheduleController;

    scheduleStack = new Array(Object);
    lastID = -1;

    constructor() {
        super();
    }

    public static async getInstance() {
        if(!ScheduleController.instance) {
            ScheduleController.instance = new ScheduleController();
            await ScheduleController.instance.updateStack();
        }
        return ScheduleController.instance;
    }

    static async loadAllSchedules() {
        const schedules = await Schedule.find();
        const nowDate = moment().tz('America/Sao_Paulo').toDate();
        const sc = ScheduleController.getInstance();
        for (let s of schedules) {
            //se o tempo da proxima execução ja passou
            if (s.nextDate < nowDate) {
                await Schedule.findById(s._id, (err: any, f: any)=>{
                    //executa a função que deveria ter sido executada
                    f.func();
                })
            }
            //carrega na memoria todas as recorrencias
            (await sc).createWeeklySchedule(s.what, s.when, s._id);
        }
    }

    private async updateStack() {
        try {
            this.scheduleStack = await Schedule.find();
            this.lastID = Schedule.find().sort({ createdAt: -1 }).limit(0).incrementID;
        } catch(error){
            console.log(error);
        }
    }

   private async addToStack(what: Function, when: String, nextExecution: Date) {
        this.lastID++;
        let id = this.lastID;
        let schedule =  new Schedule({id, what, when, nextExecution});
        schedule.save();
        this.scheduleStack.push(Schedule);
   }



   /**
    * 
    * @param what uma função de callback que tem que ser passada da maneira na qual vai ser executada (ja com os parametros); ex:
    * async ()=> { await foo(bar) }
    * @param when data
    */
   async createWeeklySchedule(what: Function, when: Date, id: String | null = null) {
        let cronDate = `00 ${when.getMinutes().toString()} ${when.getHours().toString()} * * ${when.getDay().toString()}`;

        let cronJob: CronJob  = new cron.CronJob(cronDate, async ()=>{
            await what();
        }, null, false, 'America/Sao_Paulo');

        cronJob.start();
        if(!id)
            this.addToStack(what, cronDate, cronJob.nextDate().toDate());
        else {
            let schedule = await Schedule.findById(id);
            //se existe um id atualiza a proxima execução
            schedule.nextExecution = cronJob.nextDate().toDate();
            schedule.save();
        } 
    }
}