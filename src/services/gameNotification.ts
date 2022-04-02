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

        if (scheduleController) {
            await scheduleController.createSchedule(cronDate, async () => this.notify(game._id));
        }
    }

    /**
     * Send notification to invited users
     * @param id game identification
     */
    async notify(id: string)
    {
        await this.gameListController.notifyInvitedUsers(id);
    }
}