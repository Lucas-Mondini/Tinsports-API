import cron, { CronJob } from 'cron';

import logger from "../utils/logger";

/**
 * Create a new generic Schedule
 */
export default class ScheduleController {

    private static instance: ScheduleController;
    scheduleStack = new Array();

    /**
     * Function that create a ScheduleController class instance
     * @param clearStack determines whether will schedules stack be cleared
     * @return ScheduleController | void
     */
    public static async getInstance(clearStack: boolean = false): Promise<ScheduleController| void> {
        try {
            if (!ScheduleController.instance) {
                ScheduleController.instance = new ScheduleController();
            }

            if (clearStack) await ScheduleController.instance.clearStack();
            return ScheduleController.instance;
        } catch (error) {
            logger.error(error)
        }
    }

    /**
     * Clear cron job stack
     * @return void
     */
    async clearStack() {
        this.scheduleStack = new Array();
    }

    /**
     * Create a weekly schedule for the object that execute the callback function
     * @param when Date of job execution
     * @param callback Function that will be executed
     */
    async createSchedule(when: string, callback: Function) {
        try {
            let newId;

            let cronJob: CronJob  = new cron.CronJob(when, async ()=>{
                await callback();
            }, null, false, 'America/Sao_Paulo');

            cronJob.start();

            const schedule = {when, nextExecution: cronJob.nextDate().toDate()};

            this.scheduleStack.push({schedule, callback});
        } catch(error) {
            logger.error(error);
        }
    }
}