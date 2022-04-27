import cron, { CronJob } from "cron";
import moment from "moment-timezone";

import ScheduleController from "../controllers/scheduleController";
import Game from "../model/gameModel";
import GameRecurrence from "../services/gameRecurrence";
import GameNotification from "../services/gameNotification";
import logger from "./logger";

export default class Scheduler
{
  async retrieve()
  {
    await this.scheduleUpdate();
    await this.getGames();
  }

  async getGames()
  {
    const gameRecurrence = new GameRecurrence();
    const gameNotification = new GameNotification();
    const games = await Game.find({recurrence: true, finished: false});

    for (const game of games) {
      const now = moment().tz("America/Sao_Paulo").format('YYYY-MM-DD[T]HH:mm'),
            gameDate = moment(game.date).tz("America/Sao_Paulo").format('YYYY-MM-DD[T]HH:mm'),
            nowNumber = Number(new Date(now)),
            gameDateNumber = Number(new Date(gameDate));

      if (gameDateNumber > nowNumber) {
        await gameRecurrence.createNewGameRecurrence(game);
        await gameNotification.createNewGameNotification(game);
      }
    }
  }

  async scheduleUpdate()
  {
    let cronJob: CronJob  = new cron.CronJob("0 1 * * *", async () => {
      logger.info("Executed schedule update");
      await ScheduleController.getInstance(true);
      await this.retrieve();
    }, null, false, 'America/Sao_Paulo');

    cronJob.start();

    logger.info("Next Job execution: "+moment(cronJob.nextDate()).format('DD/MM/YYYY HH:mm'));
  }
}