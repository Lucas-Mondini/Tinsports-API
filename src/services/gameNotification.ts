import moment from "moment-timezone";

import { GameType }     from "../model/gameModel";
import GameListController from '../controllers/gameListController';
import ScheduleController from '../controllers/scheduleController';
import GameController from "../controllers/gameController";
import logger from "../utils/logger";

/**
 * Create a new game notification schedule
 */
export default class GameNotification {
    private gameListController = new GameListController();
    private gameController = new GameController();

    /**
     * Create a new game notification schedule
     * @param game game data
     */
    async createNewGameNotification(game: GameType) {
        const scheduleController = await ScheduleController.getInstance();
        const gameNotificationTime = moment(game.date).subtract(1, 'hour').format("YYYY-MM-DD[T]HH:mm");
        const gameDate = new Date(gameNotificationTime);

        const cronDate = `00 ${gameDate.getMinutes().toString()} ${gameDate.getHours().toString()} * * ${gameDate.getDay().toString()}`;
        const oldId = game._id;

        if (scheduleController) {
            scheduleController.setCallBack(() => this.notify(game));
            await scheduleController.createSchedule(cronDate);
        }
    }

    /**
     * Send notification to invited users
     * @param game game information
     */
    async notify(game: GameType)
    {
        await this.gameListController.notifyInvitedUsers(game);
    }
}