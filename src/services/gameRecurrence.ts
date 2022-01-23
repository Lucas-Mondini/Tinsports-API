import Game, { GameType }     from "../model/gameModel";

import gameListController from '../controllers/gameListController';
import ScheduleController from '../controllers/scheduleController';


const GLC = new gameListController();

async function createGame(game: GameType) {
    let new_date: Date = new Date();
    new_date.setDate(new_date.getDate() + 7);
    game.date = new_date.toString();
    const old_id = game._id;

    const {name, type, location, description, value, date, host_ID, recurrence} = game;
    game = new Game({
        name,
        type,
        location,
        description,
        value,
        date,
        host_ID,
        finished: false,
        recurrence
    })
    await game.save();
    console.log('jogo criado');

    await GLC.cloneGameListToNewGame(old_id, game._id);

    return {game};
}

export default class GameRecurrence {

    constructor(game: GameType) {
        this.createNewGameRecurrence(game);
    }

    async createNewGameRecurrence(game: GameType) {
        const sc = ScheduleController.getInstance();
        (await sc).createWeeklySchedule(async ()=>{
            await createGame(game);
        }, new Date(game.date));
    }
}