import DefaultController from "./DefaultController";
import cron, { CronJob } from 'cron'

import logger from "../utils/logger";

/**
 * Create a new generic Schedule
 */
export default class ScheduleController extends DefaultController {

    private static instance: ScheduleController;

    callback: Function;
    scheduleStack = new Array();

    constructor() {
        super();
    }

    /**
     * Function that create a ScheduleController class instance
     * @returns ScheduleController
     */
    public static async getInstance() {
        try {
            if (!ScheduleController.instance) {
                ScheduleController.instance = new ScheduleController();
            }

            await ScheduleController.instance.clearStack();
            return ScheduleController.instance;
        } catch (error) {
            logger.error(error)
        }
    }

    /**
     * Clear cron job stack
     * @returns void
     */
    async clearStack() {
        this.scheduleStack = new Array();
    }

    /**
     * Create a weekly schedule for the object that execute the callback function
     * @param when Date of job execution
     */
    async createWeeklySchedule(when: string) {
        try {
            let newId;

            let cronJob: CronJob  = new cron.CronJob(when, async ()=>{
                newId = await this.callback();
            }, null, false, 'America/Sao_Paulo');

            cronJob.start();

            const schedule = {when, nextExecution: cronJob.nextDate().toDate()};

            this.scheduleStack.push(schedule);
        } catch(error) {
            logger.error(error);
        }
    }

    /**
     * Sets callback function to scheduled job
     * @param callback Function executed by the job
     */
    setCallBack(callback: Function)
    {
        this.callback = callback
    }
}