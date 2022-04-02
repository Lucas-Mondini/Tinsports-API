import { GameType }     from "../model/gameModel";
import GameListController from '../controllers/gameListController';
import ScheduleController from '../controllers/scheduleController';
import GameController from "../controllers/gameController";

/**
 * Create a new game schedule
 */
export default class GameRecurrence {
    private gameListController = new GameListController();
    private gameController = new GameController();

    /**
     * Create a new game recurrence
     * @param game game data
     */
    async createNewGameRecurrence(game: GameType) {
        const scheduleController = await ScheduleController.getInstance();
        const gameDate = new Date(game.date);
        const cronDate = `00 ${gameDate.getMinutes().toString()} ${gameDate.getHours().toString()} * * ${gameDate.getDay().toString()}`;
        const oldId = game._id;

        if (scheduleController) {
            await scheduleController.createSchedule(cronDate, async () => this.cloneGameInfo(game, oldId));
        }
    }

    /**
     * Create a copy of all game info and game lists
     * @param game game information
     * @param oldId Original game id
     */
    async cloneGameInfo(game: GameType, oldId: string)
    {
        game = await this.gameController.copyGame(game);
        await this.gameListController.cloneGameListToNewGame(oldId, game._id);
    }
}