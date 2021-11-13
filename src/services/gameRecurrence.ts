import cron, { CronJob } from 'cron'
import { Number } from 'mongoose';

import Game, { GameType }     from "../model/gameModel";

async function createGame(game: GameType) {
    let new_date: Date = new Date();
    new_date.setDate(new_date.getDate() + 7);
    game.date = new_date.toString();

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

    return {game};
}

export default function GameRecurrence(game: GameType) {
    let date = new Date(game.date);
    let cronDate = `00 ${date.getMinutes().toString()} ${date.getHours().toString()} * * ${date.getDay().toString()}`;

    let cronJob: CronJob  = new cron.CronJob(cronDate, async ()=>{
        await createGame(game);
    }, null, false, 'America/Sao_Paulo')

    cronJob.start();
}